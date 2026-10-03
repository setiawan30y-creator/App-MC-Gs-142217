function getDashboard(){
  const customers=rowsAsObjects_(getSS_().getSheetByName('10_customers'));
  const transactions=rowsAsObjects_(getSS_().getSheetByName('41_transactions'));
  const banks=rowsAsObjects_(getSS_().getSheetByName('62_bank_accounts'));
  return {ok:true,cards:{customers:customers.length,transactions:transactions.length,bank_balance:banks.reduce((s,r)=>s+(Number(r.balance)||0),0)},recent_transactions:transactions.slice(-10).reverse()};
}
function bootstrap(){return {ok:true,app:APP_CONFIG,db:installDatabase(),dashboard:getDashboard()};}
