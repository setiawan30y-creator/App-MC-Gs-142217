function clientBootstrap(){ return {ok:true,app:APP_CONFIG,context:getCurrentContext(),db:installDatabase()}; }
function getCollection_(name){ const sh=getSS_().getSheetByName(name); return sh ? rowsAsObjects_(sh) : []; }
function service_(resource,payload){ payload=payload||{}; if(resource==='dashboard') return getDashboard(payload); if(resource==='customers') return getCustomers(payload); if(resource==='transactions') return getTransactions(payload); throw new Error('Service resource tidak tersedia: '+resource); }

function scalarWorkValue_(v){
  if(v instanceof Date) return Utilities.formatDate(v,APP_CONFIG.TIMEZONE,'yyyy-MM-dd HH:mm:ss');
  if(v===null||v===undefined) return '';
  return v;
}
function getCurrencyRateWork_(){
  const currencies=getCollection_('20_currencies');
  const denoms=getCollection_('21_denominations');
  const rates=getCollection_('31_rates');
  const sources=getCollection_('30_rate_sources');
  const stock=getCollection_('50_stock');
  const sourceMap={}; sources.forEach(r=>sourceMap[String(r.id)]=String(r.name||r.type||r.id||'—'));
  const denomMap={}; denoms.forEach(r=>{const key=String(r.currency_id);(denomMap[key]||(denomMap[key]=[])).push(Number(r.value||0));});
  const stockMap={}; stock.forEach(r=>{const key=String(r.currency_id);stockMap[key]=(stockMap[key]||0)+Number(r.available_qty||0);});
  const rateMap={};
  rates.forEach(r=>{
    const key=String(r.currency_id);
    const effective=r.effective_at instanceof Date?r.effective_at:new Date(r.effective_at||0);
    const current=rateMap[key];
    const currentDate=current&&current.effective_at?new Date(current.effective_at):new Date(0);
    if(!current||effective.getTime()>=currentDate.getTime()) rateMap[key]=r;
  });
  const items=currencies.map(c=>{
    const key=String(c.id), r=rateMap[key]||{};
    const buy=Number(r.buy||0), sell=Number(r.sell||0);
    const reference=Number(r.reference_rate||0)||((buy&&sell)?(buy+sell)/2:0);
    const buySpread=Number(r.buy_spread||0)||(reference&&buy?buy-reference:0);
    const sellSpread=Number(r.sell_spread||0)||(reference&&sell?sell-reference:0);
    const ds=(denomMap[key]||[]).filter(Boolean).sort((a,b)=>a-b);
    return {
      id:String(c.id||''),code:String(c.code||''),name:String(c.name||''),country:String(c.country||''),
      denominations:ds.map(v=>v.toLocaleString('id-ID',{maximumFractionDigits:6})).join(', ')||'—',
      denomination_count:ds.length,reference,buy,sell,buy_spread:buySpread,sell_spread:sellSpread,
      spread:sell-buy,source:sourceMap[String(r.source_id)]||'Manual',source_id:String(r.source_id||''),
      effective_at:scalarWorkValue_(r.effective_at),status:String(c.status||r.status||'aktif').toLowerCase(),
      stock_available:stockMap[key]||0,rate_id:String(r.id||''),created_at:scalarWorkValue_(r.effective_at||'')
    };
  });
  return {ok:true,items};
}
function getCollectionWork(name){
  if(name==='currencies') return getCurrencyRateWork_();
  const map={bookings:'100_bookings',pickups:'102_pickups',documents:'120_documents',bank_mutations:'63_bank_movements',expenses:'142_system_logs',adjustments:'142_system_logs',closings:'70_closings',old_money:'142_system_logs',hris:'110_employees',messages:'132_chat_messages',reports:'94_regulatory_reports'};
  const sheet=map[name]; const rows=sheet?getCollection_(sheet):[];
  return {ok:true,items:rows.map(r=>({id:r.id||r.booking_no||r.reference_no||r.code||r.journal_no||r.report_type||'',title:r.name||r.customer_id||r.description||r.bank_name||r.report_type||'',detail:r.status||r.amount||r.value||r.period||'',status:String(r.status||'aktif').toLowerCase(),createdAt:scalarWorkValue_(r.created_at||r.date||new Date())}))};
}

function saveCollectionWork(name,p){ const map={bookings:'100_bookings',pickups:'102_pickups',expenses:'142_system_logs',adjustments:'142_system_logs',old_money:'142_system_logs',messages:'132_chat_messages'}; const sheet=map[name]; if(!sheet) throw new Error('Workspace '+name+' belum mendukung input pada foundation'); const obj={id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,description:p.title||'',name:p.title||'',status:p.status||'aktif',created_at:iso_(),amount:p.detail||''}; const sh=getSS_().getSheetByName(sheet); const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; sh.appendRow(headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:'')); audit_('CREATE','WORKSPACE_'+name,obj.id,null,obj); return {ok:true,item:{id:obj.id,title:obj.name||obj.description,detail:obj.amount,status:obj.status,createdAt:obj.created_at}}; }


function ensureCurrencyRateSchema_(){
  ensureSheet_('20_currencies',['id','code','numeric_code','name','country','country_code','flag','status']);
  ensureSheet_('21_denominations',['id','currency_id','value','type','status']);
  ensureSheet_('30_rate_sources',['id','name','type','endpoint','status']);
  ensureSheet_('31_rates',['id','currency_id','reference_rate','buy','sell','buy_spread','sell_spread','source_id','status','approved_by','approved_at','published_at','effective_at']);
}
function saveCurrencyMaster(p){
  ensureCurrencyRateSchema_();
  p=p||{};
  const code=String(p.code||'').trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(code)) throw new Error('Kode mata uang harus 3 huruf ISO 4217.');
  const currencies=getCollection_('20_currencies');
  if(currencies.some(r=>String(r.code||'').toUpperCase()===code)) throw new Error('Kode '+code+' sudah terdaftar di Master Valuta.');
  const id=uuid_(), now=iso_();
  const currency={id,code,numeric_code:String(p.numeric_code||''),name:String(p.name||code),country:String(p.country||''),country_code:String(p.country_code||''),flag:String(p.flag||'🌐'),status:String(p.status||'aktif')};
  const csh=getSS_().getSheetByName('20_currencies'),ch=csh.getRange(1,1,1,csh.getLastColumn()).getValues()[0];
  csh.appendRow(ch.map(h=>Object.prototype.hasOwnProperty.call(currency,h)?currency[h]:''));
  const denoms=String(p.denominations||'').split(',').map(x=>Number(String(x).trim())).filter(x=>isFinite(x)&&x>0);
  if(denoms.length){
    const dsh=getSS_().getSheetByName('21_denominations'),dh=dsh.getRange(1,1,1,dsh.getLastColumn()).getValues()[0];
    denoms.forEach(v=>{const obj={id:uuid_(),currency_id:id,value:v,type:'NOTE',status:'aktif'};dsh.appendRow(dh.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:''));});
  }
  const ref=Number(p.reference_rate||0), buy=Number(p.buy||0), sell=Number(p.sell||0), sourceType=String(p.source_type||'MANUAL'), sourceId='SRC-'+sourceType;
  const sources=getCollection_('30_rate_sources'),ssh=getSS_().getSheetByName('30_rate_sources');
  if(!sources.some(r=>String(r.id)===sourceId)){
    const shh=ssh.getRange(1,1,1,ssh.getLastColumn()).getValues()[0];
    const sobj={id:sourceId,name:sourceType==='BI_REFERENCE'?'BI Reference':sourceType,type:sourceType,endpoint:'',status:'aktif'};
    ssh.appendRow(shh.map(h=>Object.prototype.hasOwnProperty.call(sobj,h)?sobj[h]:''));
  }
  const rate={id:uuid_(),currency_id:id,reference_rate:ref,buy,sell,buy_spread:Number(p.buy_spread||0),sell_spread:Number(p.sell_spread||0),source_id:sourceId,status:'published',approved_by:'SYSTEM',approved_at:now,published_at:now,effective_at:p.effective_at?new Date(p.effective_at):new Date()};
  const rsh=getSS_().getSheetByName('31_rates'),rh=rsh.getRange(1,1,1,rsh.getLastColumn()).getValues()[0];
  rsh.appendRow(rh.map(h=>Object.prototype.hasOwnProperty.call(rate,h)?rate[h]:''));
  audit_('CREATE','CURRENCY',id,null,{currency,rate});
  return {ok:true,currency,rate};
}
