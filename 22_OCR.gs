function getOcrStatus(){
  const key=PropertiesService.getScriptProperties().getProperty('GOOGLE_VISION_API_KEY')||'';
  return {ok:true,configured:!!key,provider:'Google Vision OCR'};
}
function processOcr(p){
  p=p||{};
  const key=PropertiesService.getScriptProperties().getProperty('GOOGLE_VISION_API_KEY')||'';
  if(!key) throw new Error('Google Vision OCR belum dikonfigurasi. Isi Script Property GOOGLE_VISION_API_KEY.');
  if(!p.image_base64) throw new Error('image_base64 wajib diisi');
  const body={requests:[{image:{content:String(p.image_base64).replace(/^data:[^;]+;base64,/,'')},features:[{type:'TEXT_DETECTION'}]}]};
  const res=UrlFetchApp.fetch('https://vision.googleapis.com/v1/images:annotate?key='+encodeURIComponent(key),{method:'post',contentType:'application/json',payload:JSON.stringify(body),muteHttpExceptions:true});
  const code=res.getResponseCode(), json=JSON.parse(res.getContentText()||'{}');
  if(code<200||code>=300) throw new Error('Google Vision HTTP '+code+': '+String(json.error&&json.error.message||'OCR gagal'));
  const annotation=((json.responses||[])[0]||{}).fullTextAnnotation||{};
  return {ok:true,text:annotation.text||'',provider:'Google Vision OCR',raw:(json.responses||[])[0]||{}};
}
