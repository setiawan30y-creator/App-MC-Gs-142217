function customerHeaders_(){return ['id','tenant_id','branch_id','customer_code','id_pjk','name','birth_place','birth_date','address','nationality','gender','occupation','phone','account_no','id_type','ktp_no','other_id','cif','npwp','local_id','registered_at','id_image_url','created_at','updated_at','customer_type'];}
function ensureCustomerSchema_(){
  const sh=getSS_().getSheetByName('10_customers');
  const want=customerHeaders_(), current=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getValues()[0].map(String);
  if(current.join('|')!==want.join('|')) sh.getRange(1,1,1,want.length).setValues([want]);
  return sh;
}
function getCustomers(payload){
  ensureCustomerSchema_();
  const rows=rowsAsObjects_(getSS_().getSheetByName('10_customers'));
  const kycRows=rowsAsObjects_(getSS_().getSheetByName('12_customer_kyc'));
  const kycMap={}; kycRows.forEach(k=>kycMap[String(k.customer_id)]=k);
  return {ok:true,data:rows.map(r=>customerView_(r,kycMap[String(r.id)]||null))};
}
function customerValue_(v){
  if(v instanceof Date) return v.toISOString();
  if(v===null||v===undefined) return '';
  return v;
}
function customerView_(r,k){
  return {id:String(r.id||''),customer_code:String(r.customer_code||''),customer_type:String(r.customer_type||'perorangan'),id_pjk:customerValue_(r.id_pjk),name:String(r.name||''),birth_place:customerValue_(r.birth_place),birth_date:customerValue_(r.birth_date),address:customerValue_(r.address),nationality:customerValue_(r.nationality),gender:customerValue_(r.gender),occupation:customerValue_(r.occupation),phone:customerValue_(r.phone),account_no:customerValue_(r.account_no),id_type:customerValue_(r.id_type),ktp_no:customerValue_(r.ktp_no),other_id:customerValue_(r.other_id),no_selain_ktp:customerValue_(r.other_id),cif:customerValue_(r.cif),npwp:customerValue_(r.npwp),local_id:customerValue_(r.local_id),registered_at:customerValue_(r.registered_at),id_image_url:customerValue_(r.id_image_url),kyc:String(k&&k.status||'review').toLowerCase(),risk:String(k&&k.risk_level||'low').toLowerCase(),kyc_verified_at:customerValue_(k&&k.verified_at),kyc_verified_by:customerValue_(k&&k.verified_by),kyc_notes:customerValue_(k&&k.notes),tenant_id:customerValue_(r.tenant_id),branch_id:customerValue_(r.branch_id)};
}
function saveCustomer(p){
  ensureCustomerSchema_();
  p=p||{};
  if(!String(p.name||'').trim()) throw new Error('Nama nasabah wajib diisi');
  const customerType=String(p.customer_type||'perorangan').toLowerCase();
  const idType=String(p.id_type||'').toLowerCase();
  const individualIds=['ktp','sim','pasport'];
  const corporateIds=['certificate','izin_usaha','bi'];
  if(customerType!=='perorangan'&&customerType!=='corporate') throw new Error('Jenis nasabah tidak valid');
  if(!(customerType==='perorangan'?individualIds:corporateIds).includes(idType)) throw new Error('Jenis ID tidak sesuai dengan jenis nasabah');
  const identity=String(p.identity_number||'').trim();
  if(identity){if(customerType==='perorangan'&&idType==='ktp'){p.ktp_no=identity;p.other_id='';}else{p.ktp_no='';p.other_id=identity;}}
  const sh=getSS_().getSheetByName('10_customers');
  const code=sequence_('CUS','CUS'), now=iso_(), id=uuid_();
  const obj={id:id,tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,customer_code:code,customer_type:String(p.customer_type||'perorangan').toLowerCase(),id_pjk:p.id_pjk||'',name:String(p.name).trim(),birth_place:p.birth_place||'',birth_date:p.birth_date||'',address:p.address||'',nationality:p.nationality||'Indonesia',gender:p.gender||'',occupation:p.occupation||'',phone:p.phone||'',account_no:p.account_no||'',id_type:p.id_type||'',ktp_no:p.ktp_no||'',other_id:p.other_id||'',cif:p.cif||'',npwp:p.npwp||'',local_id:p.local_id||'',registered_at:p.registered_at||now,id_image_url:p.id_image_url||'',created_at:now,updated_at:now};
  const dup=rowsAsObjects_(sh).find(r=>(obj.ktp_no && String(r.ktp_no)===String(obj.ktp_no)) || (obj.phone && String(r.phone)===String(obj.phone) && obj.name.toLowerCase()===String(r.name).toLowerCase()));
  if(dup) throw new Error('Nasabah terindikasi duplikat: '+dup.customer_code);
  appendObject_('10_customers',obj);
  let document=null;
  if(p.id_image_base64){
    document=saveCustomerIdentityDocument_(id,p);
    obj.id_image_url=document.file_url||obj.id_image_url;
    const sh2=getSS_().getSheetByName('10_customers');
    const headers=sh2.getRange(1,1,1,sh2.getLastColumn()).getValues()[0].map(String);
    const rowIndex=sh2.getLastRow();
    sh2.getRange(rowIndex,1,1,headers.length).setValues([headers.map(h=>h==='id_image_url'?(obj.id_image_url||''):obj[h]||'')]);
  }
  audit_('CREATE','CUSTOMER',id,null,obj);
  return {ok:true,customer:customerView_(obj),document:document};
}

function saveCustomerIdentityDocument_(customerId,p){
  const data=String(p.id_image_base64||'').replace(/^data:[^;]+;base64,/,'');
  const mime=String(p.id_image_mime||'application/octet-stream');
  const name=String(p.id_image_name||('identity-'+customerId+'.bin')).replace(/[\\/:*?"<>|]+/g,'_');
  const bytes=Utilities.base64Decode(data);
  const blob=Utilities.newBlob(bytes,mime,name);
  const folders=DriveApp.getFoldersByName('MC-Almara Documents');
  const folder=folders.hasNext()?folders.next():DriveApp.createFolder('MC-Almara Documents');
  const file=folder.createFile(blob);
  const doc={id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,customer_id:customerId,type:'identity',file_id:file.getId(),file_url:file.getUrl(),status:'active',created_at:iso_()};
  appendObject_('11_customer_documents',doc);
  audit_('CREATE','CUSTOMER_DOCUMENT',doc.id,null,doc);
  return doc;
}
