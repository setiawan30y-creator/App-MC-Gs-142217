function getTransactions(){
  return {ok:true,data:rowsAsObjects_(getSS_().getSheetByName('41_transactions')).slice(-200).reverse()};
}

function saveTransaction(p){
  p=p||{};
  const customerId=p.customer_id||resolveCustomerId_(p.customer);
  if(!customerId) throw new Error('Nasabah wajib dipilih atau dibuat terlebih dahulu');

  const items=Array.isArray(p.items)?p.items.map(x=>({
    side:String(x.side||p.type||'').toUpperCase(),
    currency_id:x.currency_id||x.currency||'',
    denomination:x.denomination||'',
    qty:Number(x.qty||1),
    rate:Number(String(x.rate||0).replace(/[^0-9.-]/g,'')),
    amount:Number(String(x.amount||x.subtotal||0).replace(/[^0-9.-]/g,'')),
    rate_snapshot_id:x.rate_snapshot_id||''
  })):[];
  if(!items.length) throw new Error('Item transaksi wajib diisi.');
  if(items.some(x=>!x.currency_id||x.qty<=0||x.amount<0)) throw new Error('Item transaksi tidak valid.');

  const trxId=uuid_(), trxNo=sequence_('TRX','TRX'), now=iso_();
  const total=items.reduce((sum,x)=>sum+(Number(x.amount)||0),0);
  const status=String(p.status||'DRAFT').toUpperCase();
  const trx={
    id:trxId,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:p.branch_id||APP_CONFIG.DEFAULT_BRANCH_ID,
    trx_no:trxNo,cart_id:p.cart_id||'',customer_id:customerId,status,grand_total:total,
    currency_total:json_(items.map(x=>x.currency_id)),created_at:now,updated_at:now
  };

  appendObject_('41_transactions',trx);
  items.forEach(x=>appendObject_('42_transaction_items',{
    id:uuid_(),transaction_id:trxId,side:x.side,currency_id:x.currency_id,
    denomination:x.denomination,qty:x.qty,rate:x.rate,amount:x.amount,rate_snapshot_id:x.rate_snapshot_id
  }));

  let posting=null;
  if(['PAID','SETTLED','COMPLETED'].indexOf(status)>=0){
    posting=postTransaction_(trx,items,p.payments,p);
  }

  audit_('CREATE','TRANSACTION',trxId,null,{transaction:trx,posting});
  return {ok:true,data:{transaction:trx,posting}};
}

function resolveCustomerId_(name){
  if(!name) return '';
  const row=rowsAsObjects_(getSS_().getSheetByName('10_customers')).find(x=>String(x.name).trim().toLowerCase()===String(name).trim().toLowerCase());
  return row ? row.id : '';
}
