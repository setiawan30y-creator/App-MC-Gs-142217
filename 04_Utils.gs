function now_(){return new Date();}
function iso_(){return now_().toISOString();}
function uuid_(){return Utilities.getUuid();}
function json_(v){return JSON.stringify(v||{});}
function rowsAsObjects_(sh){
  const values=sh.getDataRange().getValues();
  if(!values.length)return [];
  const headers=values[0];
  return values.slice(1).filter(r=>r.some(x=>x!==''&&x!=null)).map(r=>{
    const o={}; headers.forEach((h,i)=>o[h]=r[i]); return o;
  });
}
function appendObject_(sheetName,obj){
  const sh=getSS_().getSheetByName(sheetName);
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  sh.appendRow(headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:''));
  return obj;
}
function findById_(sheetName,id){
  return rowsAsObjects_(getSS_().getSheetByName(sheetName)).find(r=>String(r.id)===String(id))||null;
}
function audit_(action,entityType,entityId,before,after){
  appendObject_('140_audit_logs',{id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,actor_id:'SYSTEM',action,entity_type:entityType,entity_id:entityId,before_json:json_(before),after_json:json_(after),created_at:iso_()});
}
function sequence_(key,prefix){
  const lock=LockService.getScriptLock(); lock.waitLock(30000);
  try{
    const sh=getSS_().getSheetByName('141_sequences');
    const dateKey=Utilities.formatDate(now_(),APP_CONFIG.TIMEZONE,'yyMMdd');
    const rows=rowsAsObjects_(sh);
    const row=rows.find(r=>r.key===key&&r.date_key===dateKey);
    let n=1;
    if(row){n=Number(row.last_number||0)+1; const all=sh.getDataRange().getValues(); const h=all[0]; const ri=all.findIndex(r=>r[0]===key&&String(r[2])===dateKey); sh.getRange(ri+1,h.indexOf('last_number')+1).setValue(n);}
    else sh.appendRow([key,prefix,dateKey,n]);
    return prefix+'-'+dateKey+'-'+String(n).padStart(4,'0');
  }finally{lock.releaseLock();}
}
