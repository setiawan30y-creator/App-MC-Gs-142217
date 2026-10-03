function customerHeaders_(){return ['id','tenant_id','branch_id','customer_code','id_pjk','name','birth_place','birth_date','address','nationality','gender','occupation','phone','account_no','id_type','ktp_no','other_id','cif','npwp','local_id','registered_at','id_image_url','created_at','updated_at'];}
function ensureCustomerSchema_(){
  const sh=getSS_().getSheetByName('10_customers');
  const want=customerHeaders_(), current=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0].map(String);
  if(current.join('|')!==want.join('|')) sh.getRange(1,1,1,want.length).setValues([want]);
  return sh;
}
function getCustomers(payload){
  ensureCustomerSchema_();
  const rows=rowsAsObjects_(getSS_().getSheetByName('10_customers'));
  return {ok:true,data:rows.map(customerView_)};
}
function customerView_(r){
  return {id:r.id,customer_code:r.customer_code,id_pjk:r.id_pjk,name:r.name,birth_place:r.birth_place,birth_date:r.birth_date,address:r.address,nationality:r.nationality,gender:r.gender,occupation:r.occupation,phone:r.phone,account_no:r.account_no,id_type:r.id_type,ktp_no:r.ktp_no,other_id:r.other_id,cif:r.cif,npwp:r.npwp,local_id:r.local_id,registered_at:r.registered_at,id_image_url:r.id_image_url,kyc:'review',risk:'low',tenant_id:r.tenant_id,branch_id:r.branch_id};
}
function saveCustomer(p){
  ensureCustomerSchema_();
  p=p||{};
  if(!String(p.name||'').trim()) throw new Error('Nama nasabah wajib diisi');
  const sh=getSS_().getSheetByName('10_customers');
  const code=sequence_('CUS','CUS'), now=iso_(), id=uuid_();
  const obj={id:id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,customer_code:code,id_pjk:p.id_pjk||'',name:String(p.name).trim(),birth_place:p.birth_place||'',birth_date:p.birth_date||'',address:p.address||'',nationality:p.nationality||'Indonesia',gender:p.gender||'',occupation:p.occupation||'',phone:p.phone||'',account_no:p.account_no||'',id_type:p.id_type||'',ktp_no:p.ktp_no||'',other_id:p.other_id||'',cif:p.cif||'',npwp:p.npwp||'',local_id:p.local_id||'',registered_at:p.registered_at||now,id_image_url:p.id_image_url||'',created_at:now,updated_at:now};
  const dup=rowsAsObjects_(sh).find(r=>(obj.ktp_no && String(r.ktp_no)===String(obj.ktp_no)) || (obj.phone && String(r.phone)===String(obj.phone) && obj.name.toLowerCase()===String(r.name).toLowerCase()));
  if(dup) throw new Error('Nasabah terindikasi duplikat: '+dup.customer_code);
  appendObject_('10_customers',obj);
  audit_('CREATE','CUSTOMER',id,null,obj);
  return {ok:true,customer:customerView_(obj)};
}
