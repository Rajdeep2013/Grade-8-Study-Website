/* Visionary Analytics event adapter. No note contents or personal identifiers. */
(()=>{'use strict';const site=document.currentScript?.dataset.site||'unknown';
const allowed=new Set(['page_view','study_opened','quiz_started','quiz_completed','note_opened','note_saved','note_created']);
const endpoint=window.VISIONARY_ANALYTICS_ENDPOINT;
function track(event){if(!allowed.has(event)||navigator.doNotTrack==='1'||!endpoint)return false;
try{const url=new URL(endpoint);if(url.protocol!=='https:')return false;
const body=JSON.stringify({site,event,at:new Date().toISOString()});
if(navigator.sendBeacon){navigator.sendBeacon(url,new Blob([body],{type:'text/plain'}));return true}
fetch(url,{method:'POST',body,mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'}}).catch(()=>{});return true}catch{return false}}
window.visionaryTrack=track;track('page_view');
})();