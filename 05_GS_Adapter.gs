function clientBootstrap(){ return {ok:true,app:APP_CONFIG,context:getCurrentContext(),db:installDatabase()}; }
function getCollection_(name){ const sh=getSS_().getSheetByName(name); return sh ? rowsAsObjects_(sh) : []; }
function service_(resource,payload){ payload=payload||{}; if(resource==='dashboard') return getDashboard(payload); if(resource==='customers') return getCustomers(payload); if(resource==='transactions') return getTransactions(payload); throw new Error('Service resource tidak tersedia: '+resource); }

function scalarWorkValue_(v){
  if(v instanceof Date) return Utilities.formatDate(v,APP_CONFIG.TIMEZONE,'yyyy-MM-dd HH:mm:ss');
  if(v===null||v===undefined) return '';
  return v;
}
function smartDealUrl_(url){return String(url||['https://','www.','smartdeal.co.id/'].join('')).trim()||['https://','www.','smartdeal.co.id/'].join('');}
function parseSmartDeal_(html){
  const text=String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim();
  const stamp=(text.match(/(?:Last Update Rates|Kurs diperbarui)\s*:?\s*(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2})/i)||[])[1]||'';
  const items={};const re=/([A-Z]{3})\s+\|\s+([^|]*)\s+\|\s+([0-9.,-]+)\s+\|\s+([0-9.,-]+)/g;let m;
  const num=s=>{s=String(s||'').replace(/\s/g,'');if(s.indexOf(',')>=0){const p=s.split(','),d=p.pop();s=p.join('').replace(/\./g,'')+'.'+d}else{s=s.replace(/\./g,'')}const n=Number(s);return isFinite(n)?n:null};
  while((m=re.exec(text))){const buy=num(m[3]),sell=num(m[4]);if(buy!==null&&sell!==null)items[m[1]]={code:m[1],denomination:m[2].trim(),buy,sell};}
  if(!Object.keys(items).length)throw new Error('Format kurs sumber tidak ditemukan.');
  return {items,source_updated_at:stamp};
}
function fetchSmartDeal_(url){
  const endpoint=smartDealUrl_(url),cache=CacheService.getScriptCache(),key='MC_SD_'+Utilities.base64EncodeWebSafe(endpoint).slice(0,70),cached=cache.get(key);
  if(cached){try{return JSON.parse(cached)}catch(e){}}
  const res=UrlFetchApp.fetch(endpoint,{muteHttpExceptions:true,followRedirects:true});
  if(res.getResponseCode()<200||res.getResponseCode()>=300)throw new Error('HTTP '+res.getResponseCode());
  const p=parseSmartDeal_(res.getContentText()),out={ok:true,url:endpoint,fetched_at:new Date().toISOString(),source_updated_at:p.source_updated_at,items:p.items};
  cache.put(key,JSON.stringify(out),8);return out;
}
function updateRowById_(sheetName,id,patch){
  const sh=getSS_().getSheetByName(sheetName);if(!sh)return;const v=sh.getDataRange().getValues();if(v.length<2)return;const h=v[0].map(String),idc=h.indexOf('id');if(idc<0)return;
  for(let i=1;i<v.length;i++)if(String(v[i][idc])===String(id)){Object.keys(patch).forEach(k=>{const col=h.indexOf(k);if(col>=0)v[i][col]=patch[k]});sh.getRange(i+1,1,1,h.length).setValues([v[i]]);return;}
}
function refreshSmartDealRates_(){
  const currencies=getCollection_('20_currencies'),rates=getCollection_('31_rates'),sources=getCollection_('30_rate_sources'),sm={};sources.forEach(s=>sm[String(s.id)]=s);
  const ids={};currencies.forEach(c=>{const rr=rates.filter(r=>String(r.currency_id)===String(c.id)).sort((a,b)=>new Date(b.effective_at||0)-new Date(a.effective_at||0)),r=rr[0],s=r&&sm[String(r.source_id)];if(s&&s.endpoint)ids[String(s.id)]=s;});
  Object.keys(ids).forEach(sid=>{const s=ids[sid];try{const d=fetchSmartDeal_(s.endpoint);updateRowById_('30_rate_sources',sid,{status:'OK',last_success_at:new Date(),last_fetch_at:new Date(),last_error:'',source_updated_at:d.source_updated_at});currencies.forEach(c=>{const rr=rates.filter(r=>String(r.currency_id)===String(c.id)&&String(r.source_id)===sid).sort((a,b)=>new Date(b.effective_at||0)-new Date(a.effective_at||0)),r=rr[0],x=d.items[String(c.code||'').toUpperCase()];if(!r||!x)return;updateRowById_('31_rates',r.id,{reference_buy:x.buy,reference_sell:x.sell,reference_rate:(x.buy+x.sell)/2,buy:x.buy+Number(r.buy_spread||0),sell:x.sell+Number(r.sell_spread||0),source_status:'online',source_updated_at:d.source_updated_at,last_fetch_at:new Date(),source_denomination:x.denomination});});}catch(e){updateRowById_('30_rate_sources',sid,{status:'ERROR',last_fetch_at:new Date(),last_error:String(e&&e.message||e)});}});
}
function getCurrencyRateSourcePreview_(p){
  p=p||{};const code=String(p.code||'').toUpperCase(),url=smartDealUrl_(p.url);if(!code)throw new Error('Pilih kode valuta.');
  try{const d=fetchSmartDeal_(url),x=d.items[code];if(!x)throw new Error('Kode '+code+' tidak ditemukan pada sumber.');return {ok:true,code,buy:x.buy,sell:x.sell,denomination:x.denomination,source_updated_at:d.source_updated_at,fetched_at:d.fetched_at,status:'online'};}catch(e){return {ok:false,code,status:'offline',error:String(e&&e.message||e)};}
}
function getCurrencyRateWork_(){
  try{refreshSmartDealRates_()}catch(e){}
  const currencies=getCollection_('20_currencies'),denoms=getCollection_('21_denominations'),rates=getCollection_('31_rates'),sources=getCollection_('30_rate_sources'),stock=getCollection_('50_stock');
  const sourceMap={},sourceMeta={};sources.forEach(r=>{sourceMap[String(r.id)]=String(r.name||r.type||r.id||'—');sourceMeta[String(r.id)]=r;});
  const denomMap={},stockMap={};denoms.forEach(r=>{const k=String(r.currency_id);(denomMap[k]||(denomMap[k]=[])).push(Number(r.value||0));});stock.forEach(r=>{const k=String(r.currency_id);stockMap[k]=(stockMap[k]||0)+Number(r.available_qty||0);});
  const rateMap={};rates.forEach(r=>{const k=String(r.currency_id),d=new Date(r.effective_at||0);if(!rateMap[k]||d>=new Date(rateMap[k].effective_at||0))rateMap[k]=r;});
  const items=currencies.map(c=>{const k=String(c.id),r=rateMap[k]||{},s=sourceMeta[String(r.source_id)]||{},rb=Number(r.reference_buy||r.reference_rate||0),rs=Number(r.reference_sell||r.reference_rate||0),ds=(denomMap[k]||[]).sort((a,b)=>a-b);return {id:String(c.id||''),code:String(c.code||''),name:String(c.name||''),country:String(c.country||''),denominations:ds.join(', ')||'—',reference_buy:rb,reference_sell:rs,reference:(rb+rs)/2,buy:Number(r.buy||0),sell:Number(r.sell||0),buy_spread:Number(r.buy_spread||0),sell_spread:Number(r.sell_spread||0),source:sourceMap[String(r.source_id)]||'Manual',source_url:String(s.endpoint||''),source_status:String(r.source_status||'manual').toLowerCase(),source_error:String(s.last_error||''),source_updated_at:scalarWorkValue_(r.source_updated_at||s.source_updated_at||''),last_fetch_at:scalarWorkValue_(r.last_fetch_at||s.last_fetch_at||''),effective_at:scalarWorkValue_(r.effective_at),status:String(c.status||r.status||'aktif').toLowerCase(),flag:String(c.flag||'')||'🌐',stock_available:stockMap[k]||0,rate_id:String(r.id||'')};});
  return {ok:true,items,refresh_interval:10,server_time:iso()};
}
function ensureCurrencyRateSchema_(){
  ensureSheet_('20_currencies',['id','code','numeric_code','name','country','country_code','flag','status']);
  ensureSheet_('21_denominations',['id','currency_id','value','type','status']);
  ensureSheet_('30_rate_sources',['id','name','type','endpoint','status','refresh_interval','last_success_at','last_fetch_at','last_error','source_updated_at']);
  ensureSheet_('31_rates',['id','currency_id','reference_rate','reference_buy','reference_sell','buy','sell','buy_spread','sell_spread','source_id','source_status','source_updated_at','last_fetch_at','source_denomination','status','approved_by','approved_at','published_at','effective_at']);
}
function saveCurrencyMaster(p){
  ensureCurrencyRateSchema_();p=p||{};const code=String(p.code||'').trim().toUpperCase();if(!/^[A-Z]{3}$/.test(code))throw new Error('Kode mata uang harus 3 huruf ISO 4217.');
  const currencies=getCollection_('20_currencies');if(currencies.some(r=>String(r.code||'').toUpperCase()===code))throw new Error('Kode '+code+' sudah terdaftar.');
  const id=uuid_(),now=iso_(),currency={id,code,numeric_code:String(p.numeric_code||''),name:String(p.name||code),country:String(p.country||''),country_code:String(p.country_code||''),flag:String(p.flag||'🌐'),status:String(p.status||'aktif')};
  const csh=getSS_().getSheetByName('20_currencies'),ch=csh.getRange(1,1,1,csh.getLastColumn()).getValues()[0];csh.appendRow(ch.map(h=>Object.prototype.hasOwnProperty.call(currency,h)?currency[h]:''));
  const denoms=String(p.denominations||'').split(',').map(x=>Number(String(x).trim())).filter(x=>isFinite(x)&&x>0);if(denoms.length){const dsh=getSS_().getSheetByName('21_denominations'),dh=dsh.getRange(1,1,1,dsh.getLastColumn()).getValues()[0];denoms.forEach(v=>{const o={id:uuid_(),currency_id:id,value:v,type:'NOTE',status:'aktif'};dsh.appendRow(dh.map(h=>Object.prototype.hasOwnProperty.call(o,h)?o[h]:''));});}
  const url=String(p.source_url||'').trim(),sourceId=url?('SRC-SOURCE-'+Utilities.base64EncodeWebSafe(url).slice(0,24)):'SRC-MANUAL';
  if(url){const sh=getSS_().getSheetByName('30_rate_sources'),src=getCollection_('30_rate_sources');if(!src.some(r=>String(r.id)===sourceId)){const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],o={id:sourceId,name:'Website Reference',type:'WEBSITE',endpoint:url,status:'aktif',refresh_interval:10,last_success_at:'',last_fetch_at:'',last_error:'',source_updated_at:''};sh.appendRow(h.map(x=>Object.prototype.hasOwnProperty.call(o,x)?o[x]:''));}}
  const source=url?(()=>{try{return fetchSmartDeal_(url)}catch(e){return {ok:false,error:String(e&&e.message||e)}}})():null,x=source&&source.items?source.items[code]:null,rb=x?x.buy:Number(p.reference_buy||0),rs=x?x.sell:Number(p.reference_sell||0),bs=Number(p.buy_spread||0),ss=Number(p.sell_spread||0),buy=rb+bs,sell=rs+ss;
  const rate={id:uuid_(),currency_id:id,reference_rate:(rb+rs)/2,reference_buy:rb,reference_sell:rs,buy,sell,buy_spread:bs,sell_spread:ss,source_id:sourceId,source_status:source&&source.ok?'online':(url?'offline':'manual'),source_updated_at:source&&source.source_updated_at||'',last_fetch_at:source&&source.fetched_at||now,source_denomination:x&&x.denomination||'',status:'published',approved_by:'SYSTEM',approved_at:now,published_at:now,effective_at:p.effective_at?new Date(p.effective_at):new Date()};
  const rsh=getSS_().getSheetByName('31_rates'),rh=rsh.getRange(1,1,1,rsh.getLastColumn()).getValues()[0];rsh.appendRow(rh.map(h=>Object.prototype.hasOwnProperty.call(rate,h)?rate[h]:''));audit_('CREATE','CURRENCY',id,null,{currency,rate});return {ok:true,currency,rate};
}
function getCollectionWork(name){
  if(name==='currencies') return getCurrencyRateWork_();
  const map={bookings:'100_bookings',pickups:'102_pickups',documents:'120_documents',bank_mutations:'63_bank_movements',expenses:'142_system_logs',adjustments:'142_system_logs',closings:'70_closings',old_money:'142_system_logs',hris:'110_employees',messages:'132_chat_messages',reports:'94_regulatory_reports'};
  const sheet=map[name]; const rows=sheet?getCollection_(sheet):[];
  return {ok:true,items:rows.map(r=>({id:r.id||r.booking_no||r.reference_no||r.code||r.journal_no||r.report_type||'',title:r.name||r.customer_id||r.description||r.bank_name||r.report_type||'',detail:r.status||r.amount||r.value||r.period||'',status:String(r.status||'aktif').toLowerCase(),createdAt:scalarWorkValue_(r.created_at||r.date||new Date())}))};
}

function saveCollectionWork(name,p){ const map={bookings:'100_bookings',pickups:'102_pickups',expenses:'142_system_logs',adjustments:'142_system_logs',old_money:'142_system_logs',messages:'132_chat_messages'}; const sheet=map[name]; if(!sheet) throw new Error('Workspace '+name+' belum mendukung input pada foundation'); const obj={id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,description:p.title||'',name:p.title||'',status:p.status||'aktif',created_at:iso_(),amount:p.detail||''}; const sh=getSS_().getSheetByName(sheet); const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; sh.appendRow(headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'')); audit_('CREATE','WORKSPACE_'+name,obj.id,null,obj); return {ok:true,item:{id:obj.id,title:obj.name||obj.description,detail:obj.amount,status:obj.status,createdAt:obj.created_at}}; }
