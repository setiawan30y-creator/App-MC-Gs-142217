function getCustomers(){
  const rows=rowsAsObjects_(getSS_().getSheetByName('10_customers'));
  return {ok:true,data:rows};
}
function saveCustomer(p){
  if(!p.name) throw new Error('Nama nasabah wajib diisi');
  const id=uuid_();
  const obj={id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,customer_code:sequence_('CUSTOMER','CUS'),name:p.name,birth_place:p.birth_place||'',birth_date:p.birth_date||'',address:p.address||'',nationality:p.nationality||'Indonesia',gender:p.gender||'',occupation:p.occupation||'',phone:p.phone||'',account_no:p.account_no||'',id_type:p.id_type||'KTP',ktp_no:p.ktp_no||'',other_id:p.other_id||'',cif:p.cif||'',npwp:p.npwp||'',local_id:p.local_id||'',registered_at:iso_(),id_image_url:p.id_image_url||'',created_at:iso_(),updated_at:iso_()};
  appendObject_('10_customers',obj); audit_('CREATE','CUSTOMER',id,null,obj); return {ok:true,data:obj};
}
