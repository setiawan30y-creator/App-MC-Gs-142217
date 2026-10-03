function uuid_(){return Utilities.getUuid();}
function iso_(){return new Date().toISOString();}
function json_(v){try{return JSON.stringify(v==null?null:v);}catch(e){return '{}';}}
function rowsAsObjects_(sh){
  if(!sh || sh.getLastRow()<2 || sh.getLastColumn()<1) return [];
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  return sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues().map(row=>{
    const o={}; headers.forEach((h,i)=>o[h]=row[i]); return o;
  });
}
function appendObject_(sheetName,obj){
  const sh=getSS_().getSheetByName(sheetName); if(!sh) throw new Error('Sheet tidak ditemukan: '+sheetName);
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  sh.appendRow(headers.map(h=>Object.prototype.hasOwnProperty.call(obj,h)?obj[h]:''));
}
function sequence_(key,prefix){
  const sh=ensureSheet_('141_sequences',['key','prefix','date_key','last_number']);
  const dateKey=Utilities.formatDate(new Date(),APP_CONFIG.TIMEZONE,'yyyyMMdd');
  const rows=rowsAsObjects_(sh);
  const found=rows.find(r=>String(r.key)===String(key)&&String(r.date_key)===dateKey);
  const next=found?Number(found.last_number||0)+1:1;
  if(found){
    const rowIndex=rows.indexOf(found)+2;
    sh.getRange(rowIndex,4).setValue(next);
  }else sh.appendRow([key,prefix,dateKey,next]);
  return String(prefix)+'-'+dateKey.slice(2)+'-'+String(next).padStart(4,'0');
}
function audit_(action,entityType,entityId,beforeObj,afterObj){
  try{
    appendObject_('140_audit_logs',{
      id:uuid_(),tenant_id:APP_CONFIG.DEFAULT_TENANT_ID,branch_id:APP_CONFIG.DEFAULT_BRANCH_ID,
      actor_id:'SYSTEM',action,entity_type:entityType,entity_id:entityId||'',
      before_json:json_(beforeObj),after_json:json_(afterObj),created_at:iso_()
    });
  }catch(e){}
}
function bootstrap(){installDatabase();return {ok:true,app:APP_CONFIG,context:getCurrentContext(),db:installDatabase()};}
