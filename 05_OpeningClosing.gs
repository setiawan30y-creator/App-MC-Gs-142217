function getDailySession(p){
  p=p||{};
  const date=String(p.date||Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Jakarta','yyyy-MM-dd'));
  const branchId=String(p.branch_id||APP_CONFIG.DEFAULT_BRANCH_ID);
  const openings=rowsAsObjects_(getSS_().getSheetByName('65_openings'));
  const opening=openings.find(x=>String(x.date)===date&&String(x.branch_id)===branchId);
  if(!opening) return {ok:true,data:null};
  const balances=rowsAsObjects_(getSS_().getSheetByName('66_opening_balances')).filter(x=>String(x.opening_id)===String(opening.id));
  return {ok:true,data:{opening,balances,summary:openingSummary_(opening,balances)}};
}
function saveDailyOpening(p){
  p=p||{};
  const date=String(p.date||Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Jakarta','yyyy-MM-dd'));
  const branchId=String(p.branch_id||APP_CONFIG.DEFAULT_BRANCH_ID);
  const sh=getSS_().getSheetByName('65_openings');
  const old=rowsAsObjects_(sh).find(x=>String(x.date)===date&&String(x.branch_id)===branchId&&String(x.status).toLowerCase()!=='cancelled');
  if(old) throw new Error('Saldo awal untuk tanggal '+date+' sudah dibuka.');
  const id=uuid_(), now=iso_();
  const opening={id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:branchId,date,shift_id:p.shift_id||'',status:'OPEN',opened_by:p.opened_by||'SYSTEM',opened_at:now,closed_at:'',notes:p.notes||''};
  appendObject_('65_openings',opening);
  const balances=Array.isArray(p.balances)?p.balances:[];
  balances.forEach(x=>appendObject_('66_opening_balances',{id:uuid_(),opening_id:id,account_type:String(x.account_type||'cash').toLowerCase(),account_id:x.account_id||'',currency:String(x.currency||'IDR').toUpperCase(),denomination:x.denomination||'',qty:Number(x.qty||0),amount:Number(x.amount||0),notes:x.notes||''}));
  audit_('OPEN','DAILY_OPENING',id,null,{opening,balances});
  return {ok:true,data:{opening,balances,summary:openingSummary_(opening,balances)}};
}
function openingSummary_(opening,balances){
  const cash=balances.filter(x=>x.account_type==='cash').reduce((s,x)=>s+Number(x.amount||0),0);
  const bank=balances.filter(x=>x.account_type==='bank').reduce((s,x)=>s+Number(x.amount||0),0);
  const stock=balances.filter(x=>x.account_type==='stock').reduce((s,x)=>s+Number(x.amount||0),0);
  return {date:opening.date,status:opening.status,cash_opening:cash,bank_opening:bank,stock_opening:stock,total_opening:cash+bank+stock};
}
function closeDailySession(p){
  p=p||{};
  const date=String(p.date||Utilities.formatDate(new Date(),Session.getScriptTimeZone()||'Asia/Jakarta','yyyy-MM-dd'));
  const branchId=String(p.branch_id||APP_CONFIG.DEFAULT_BRANCH_ID);
  const sh=getSS_().getSheetByName('65_openings');
  const openings=rowsAsObjects_(sh);
  const opening=openings.find(x=>String(x.date)===date&&String(x.branch_id)===branchId&&String(x.status)==='OPEN');
  if(!opening) throw new Error('Saldo awal/sesi harian belum dibuka untuk '+date+'.');
  const balances=rowsAsObjects_(getSS_().getSheetByName('66_opening_balances')).filter(x=>String(x.opening_id)===String(opening.id));
  const cashOpening=balances.filter(x=>x.account_type==='cash').reduce((s,x)=>s+Number(x.amount||0),0);
  const movements=rowsAsObjects_(getSS_().getSheetByName('61_cash_movements')).filter(x=>String(x.cash_account_id||'')&&String(x.created_at||'').slice(0,10)===date);
  const cashMovement=movements.reduce((s,x)=>s+(String(x.movement_type).toLowerCase().includes('out')?-1:1)*Number(x.amount||0),0);
  const expectedCash=cashOpening+cashMovement;
  const physical=Number(p.physical_cash||0);
  const gantungan=rowsAsObjects_(getSS_().getSheetByName('72_gantungan')).filter(x=>String(x.branch_id)===branchId&&String(x.date)===date&&String(x.status).toLowerCase()==='outstanding').reduce((s,x)=>s+Number(x.amount||0),0);
  const adjustedPhysical=physical+gantungan;
  const difference=adjustedPhysical-expectedCash;
  const closingId=uuid_();
  const closing={id:closingId,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:branchId,date,status:Math.abs(difference)<0.005?'BALANCED':'DIFFERENCE',expected_cash:expectedCash,physical_cash:physical,difference,approved_by:p.approved_by||'',created_at:iso_()};
  appendObject_('70_closings',closing);
  appendObject_('71_reconciliations',{id:uuid_(),closing_id:closingId,type:'CASH',expected:expectedCash,actual:adjustedPhysical,difference,status:Math.abs(difference)<0.005?'MATCH':'DIFFERENCE',notes:'Physical Cash + Gantungan Outstanding'});
  const rowIndex=openings.indexOf(opening)+2;
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  opening.status='CLOSED';opening.closed_at=iso_();
  sh.getRange(rowIndex,1,1,headers.length).setValues([headers.map(h=>opening[h]||'')]);
  audit_('CLOSE','DAILY_CLOSING',closingId,null,{closing,gantungan_outstanding:gantungan});
  return {ok:true,data:{closing,gantungan_outstanding:gantungan,reconciliation:{expected_cash:expectedCash,physical_cash:physical,adjusted_physical:adjustedPhysical,difference}}};
}
