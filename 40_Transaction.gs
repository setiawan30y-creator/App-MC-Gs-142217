function getTransactions(){
  return {ok:true,data:rowsAsObjects_(getSS_().getSheetByName('41_transactions')).slice(-200).reverse()};
}
function saveTransaction(p){
  const customerId = p.customer_id || resolveCustomerId_(p.customer);
  if(!customerId) throw new Error('Nasabah wajib dipilih atau dibuat terlebih dahulu');
  const trxId=uuid_(), trxNo=sequence_('TRX','TRX');
  const items=Array.isArray(p.items)?p.items.map(x=>({
    side:x.side||'', currency_id:x.currency_id||x.currency||'', denomination:x.denomination||'',
    qty:Number(x.qty||1), rate:Number(String(x.rate||0).replace(/[^0-9.-]/g,'')),
    amount:Number(String(x.amount||x.subtotal||0).replace(/[^0-9.-]/g,'')), rate_snapshot_id:x.rate_snapshot_id||''
  })):[];
  const total=items.reduce((sum,x)=>sum+(Number(x.amount)||0),0);
  const trx={id:trxId,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,trx_no:trxNo,cart_id:p.cart_id||'',customer_id:customerId,status:String(p.status||'DRAFT').toUpperCase(),grand_total:total,currency_total:json_(items.map(x=>x.currency_id)),created_at:iso_(),updated_at:iso_()};
  appendObject_('41_transactions',trx);
  items.forEach(x=>appendObject_('42_transaction_items',{id:uuid_(),transaction_id:trxId,side:x.side,currency_id:x.currency_id,denomination:x.denomination,qty:x.qty,rate:x.rate,amount:x.amount,rate_snapshot_id:x.rate_snapshot_id}));
  audit_('CREATE','TRANSACTION',trxId,null,trx);
  return {ok:true,data:trx};
}
function resolveCustomerId_(name){
  if(!name) return '';
  const row=rowsAsObjects_(getSS_().getSheetByName('10_customers')).find(x=>String(x.name).trim().toLowerCase()===String(name).trim().toLowerCase());
  return row ? row.id : '';
}
