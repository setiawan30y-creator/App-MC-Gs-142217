function getCustomerKyc(p){
  p=p||{}; const id=String(p.customer_id||'');
  if(!id) throw new Error('customer_id wajib');
  const row=rowsAsObjects_(getSS_().getSheetByName('12_customer_kyc')).find(x=>String(x.customer_id)===id);
  return {ok:true,data:row||null};
}
function saveCustomerKyc(p){
  p=p||{}; const id=String(p.customer_id||''); if(!id) throw new Error('customer_id wajib');
  p.status=String(p.status||'review').toLowerCase();
  const sh=getSS_().getSheetByName('12_customer_kyc'); const rows=rowsAsObjects_(sh);
  const now=iso_(); const obj={id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,customer_id:id,status:String(p.status||'review').toLowerCase(),risk_level:String(p.risk_level||'low').toLowerCase(),verified_at:p.status==='verified'?now:'',verified_by:p.verified_by||'SYSTEM',notes:p.notes||''};
  const old=rows.find(x=>String(x.customer_id)===id);
  if(old){const rowIndex=rows.indexOf(old)+2; const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String); sh.getRange(rowIndex,1,1,headers.length).setValues([headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:old[h]||'')]); obj.id=old.id; audit_('UPDATE','CUSTOMER_KYC',id,old,obj);}
  else {appendObject_('12_customer_kyc',obj);audit_('CREATE','CUSTOMER_KYC',id,null,obj);}
  return {ok:true,data:obj};
}
function getCustomer360(p){
  p=p||{}; const id=String(p.customer_id||''); if(!id) throw new Error('customer_id wajib');
  const customer=(getCustomers({}).data||[]).find(x=>String(x.id)===id)||null;
  const kyc=getCustomerKyc({customer_id:id}).data;
  const docs=rowsAsObjects_(getSS_().getSheetByName('11_customer_documents')).filter(x=>String(x.customer_id)===id);
  const trx=rowsAsObjects_(getSS_().getSheetByName('41_transactions')).filter(x=>String(x.customer_id)===id).slice(-100).reverse();
  const usage=rowsAsObjects_(getSS_().getSheetByName('91_threshold_usage')).filter(x=>String(x.customer_id)===id).slice(-12).reverse();
  const cases=rowsAsObjects_(getSS_().getSheetByName('92_compliance_cases')).filter(x=>String(x.customer_id)===id).slice(-50).reverse();
  return {ok:true,data:{customer,kyc,documents:docs,transactions:trx,threshold_usage:usage,compliance_cases:cases}};
}
