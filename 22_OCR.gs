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
  const text=annotation.text||'';
  return {ok:true,text:text,provider:'Google Vision OCR',fields:extractIdentityFields_(text,String(p.id_type||'').toLowerCase())};
}
function extractIdentityFields_(text,idType){
  const s=String(text||'').replace(/\r/g,'');
  const out={};
  const nik=(s.match(/\b\d{16}\b/)||[])[0]||'';
  if(idType==='ktp'&&nik) out.identity_number=nik;
  if(idType==='pasport'){
    const m=s.match(/(?:PASPOR|PASSPORT|NO[\s.]*PASPOR|NO[\s.]*PASSPORT)[\s:.-]*([A-Z0-9]{6,12})/i);
    if(m) out.identity_number=m[1].toUpperCase();
  }
  const birth=s.match(/(?:TEMPAT|TMPT)[\s\/]*TGL[\s\/]*LAHIR\s*[:.-]?\s*([^\n,]+?)[,\s]+(\d{1,2}[\s\/-](?:\d{1,2}|[A-Za-z]+)[\s\/-]\d{2,4})/i);
  if(birth){out.birth_place=birth[1].trim();out.birth_date_raw=birth[2].trim();}
  const npwp=s.match(/\b\d{2}[. -]?\d{3}[. -]?\d{3}[. -]?\d[ -]?\d{3}[. -]?\d{3}\b/);
  if(npwp) out.npwp=npwp[0].replace(/[^0-9]/g,'');
  return out;
}
