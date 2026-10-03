function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP_CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
function ping() {
  return { ok: true, app: APP_CONFIG.APP_NAME, version: APP_CONFIG.VERSION, ts: new Date().toISOString() };
}
function apiGet(resource, payload) {\n  try { ensureCustomerSchema_(); } catch(e) {}
  payload = payload || {};
  const handlers = {
    dashboard: getDashboard,
    customers: getCustomers,
    transactions: getTransactions,
    bootstrap: bootstrap
  };
  if (String(resource).indexOf('collection:')===0) return getCollectionWork(String(resource).slice(11));
  if (!handlers[resource]) throw new Error('Resource tidak dikenal: ' + resource);
  return handlers[resource](payload);
}
function apiPost(resource, payload) {
  payload = payload || {};
  const handlers = {
    customers: saveCustomer,
    transactions: saveTransaction
  };
  if (String(resource).indexOf('collection:')===0) return saveCollectionWork(String(resource).slice(11),payload);
  if (!handlers[resource]) throw new Error('POST resource tidak dikenal: ' + resource);
  return handlers[resource](payload);
}
