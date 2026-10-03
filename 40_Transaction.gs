function getTransactions(){
  return {ok:true,data:rowsAsObjects_(getSS_().getSheetByName('41_transactions')).slice(-200).reverse()};
}
function saveTransaction(p){
  if(!p.customer_id) throw new Error('Nasabah wajib dipilih');
  const trxId=uuid_(), trxNo=sequence_('TRX','TRX');
  const items=Array.isArray(p.items)?p.items:[];
  const total=items.reduce((s,x)=>s+(Number(x.amount)||0),0);
  const trx={id:trxId,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,trx_no:trxNo,cart_id:p.cart_id||'',customer_id:p.customer_id,status:p.status||'DRAFT',grand_total:total,currency_total:json_(items.map(x=>x.currency_id||'')),created_at:iso_(),updated_at:iso_()};
  appendObject_('41_transactions',trx);
  items.forEach(x=>appendObject_('42_transaction_items',{id:uuid_(),transaction_id:trxId,side:x.side||'',currency_id:x.currency_id||'',denomination:x.denomination||'',qty:x.qty||0,rate:x.rate||0,amount:x.amount||0,rate_snapshot_id:x.rate_snapshot_id||''}));
  audit_('CREATE','TRANSACTION',trxId,null,trx);
  return {ok:true,data:trx};
}
