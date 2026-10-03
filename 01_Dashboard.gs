function getDashboard(){
  const customers=getCustomers({}).data||[];
  const transactions=getTransactions({}).data||[];
  const audit=rowsAsObjects_(getSS_().getSheetByName('140_audit_logs')).slice(-100).reverse();
  return {ok:true,customers,transactions:transactions.map(t=>({
    id:t.trx_no||t.id,customer:t.customer_id||'',type:t.status||'',items:[],
    payment:'—',total:Number(t.grand_total||0),status:String(t.status||'draft').toLowerCase(),createdAt:t.created_at
  })),audit};
}
function bootstrap(){
  installDatabase();
  return {ok:true,app:APP_CONFIG,db:installDatabase(),dashboard:getDashboard()};
}
