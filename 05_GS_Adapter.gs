function clientBootstrap(){ return {ok:true,app:APP_CONFIG,context:getCurrentContext(),db:installDatabase()}; }
function getCollection_(name){ const sh=getSS_().getSheetByName(name); return sh ? rowsAsObjects_(sh) : []; }
function service_(resource,payload){ payload=payload||{}; if(resource==='dashboard') return getDashboard(payload); if(resource==='customers') return getCustomers(payload); if(resource==='transactions') return getTransactions(payload); throw new Error('Service resource tidak tersedia: '+resource); }
