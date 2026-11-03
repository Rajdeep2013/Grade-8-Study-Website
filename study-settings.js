/* Visionary Study sidebar, accessible controls, and saved preferences. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const root=document.documentElement;
const profile=localStorage.getItem('v8profile')||'local';
const storage='visionary-study:preferences:v1:'+profile;
const presets={
  blue:{color:'#6486ff',rgb:'100,134,255'},
  violet:{color:'#9873ee',rgb:'152,115,238'},
  teal:{color:'#008c89',rgb:'0,140,137'},
  coral:{color:'#d65b42',rgb:'214,91,66'},
  gold:{color:'#ab7700',rgb:'171,119,0'}
};
const defaults={theme:'dark',accent:'blue',font:'normal',compact:false,motion:false};
let prefs={...defaults};
try{const stored=JSON.parse(localStorage.getItem(storage)||'null');if(stored&&typeof stored==='object'&&!Array.isArray(stored))prefs={...defaults,...stored}}catch{}
for(const key of ['theme','accent','font']){
 const allowed={theme:['dark','light','system'],accent:Object.keys(presets),font:['small','normal','large']};
 if(!allowed[key].includes(prefs[key]))prefs[key]=defaults[key];
}
prefs.compact=prefs.compact===true;prefs.motion=prefs.motion===true;
const systemMedia=window.matchMedia?.('(prefers-color-scheme: dark)');
function resolvedTheme(){return prefs.theme==='system'?(systemMedia?.matches?'dark':'light'):prefs.theme}
function apply(){
 root.dataset.studyTheme=resolvedTheme();
 root.dataset.studyFont=prefs.font;
 root.dataset.studyCompact=String(prefs.compact);
 root.dataset.studyMotion=prefs.motion?'reduce':'normal';
 root.style.setProperty('--study-accent',presets[prefs.accent].color);
 root.style.setProperty('--study-accent-rgb',presets[prefs.accent].rgb);
 const workspace=$('studyWorkspace');
 if(workspace)workspace.classList.toggle('ws-light',resolvedTheme()==='light');
 document.querySelectorAll('[data-pref-option]').forEach(button=>{
  const [key,value]=button.dataset.prefOption.split(':');
  button.setAttribute('aria-pressed',String(prefs[key]===value));
 });
 for(const name of ['compact','motion']){const input=$('study-'+name);if(input)input.checked=prefs[name]}
 const status=$('studyPrefStatus');if(status)status.textContent='Your preferences are saved on this device.';
}
function save(){try{localStorage.setItem(storage,JSON.stringify(prefs))}catch{const status=$('studyPrefStatus');if(status)status.textContent='Unable to save settings. Check your browser storage.'}}
document.querySelectorAll('[data-pref-option]').forEach(button=>button.addEventListener('click',()=>{
 const [key,value]=button.dataset.prefOption.split(':');
 prefs[key]=value;save();apply();
}));
for(const name of ['compact','motion']){
 $('study-'+name)?.addEventListener('change',event=>{prefs[name]=event.currentTarget.checked;save();apply()});
}
$('resetStudyPrefs')?.addEventListener('click',()=>{prefs={...defaults};save();apply()});
systemMedia?.addEventListener?.('change',()=>{if(prefs.theme==='system')apply()});
apply();
function closeSidebar(){
 document.body.classList.remove('study-sidebar-open');
 $('sidebarToggle')?.setAttribute('aria-expanded','false');
}
function setCurrent(which){
 document.querySelectorAll('[data-study-nav]').forEach(button=>{
  if(button.dataset.studyNav===which)button.setAttribute('aria-current','page');
  else button.removeAttribute('aria-current');
 });
}
window.studySetCurrentNav=setCurrent;
function openView(view){
 closeSidebar();
 const workspace=$('studyWorkspace');
 if(view==='home'||view==='subjects'){
  if(workspace)workspace.classList.add('hidden');
  if(typeof window.goHome==='function')window.goHome();
  else if(typeof window.show==='function')window.show('home');
  setCurrent(view==='subjects'?'subjects':'home');
  if(view==='subjects')requestAnimationFrame(()=>{$('subjects')?.scrollIntoView({behavior:prefs.motion?'auto':'smooth',block:'start'})});
 }else if(view==='settings'){
  if(workspace)workspace.classList.add('hidden');
  if(typeof window.show==='function')window.show('settingsPanel');
  setCurrent('settings');
 }else if(view==='notes'){
  if(typeof window.show==='function')window.show('home');
  if(window.StudyWorkspace?.open)window.StudyWorkspace.open();
  setCurrent('notes');
 }
}
document.querySelectorAll('[data-study-nav]').forEach(button=>{
 button.addEventListener('click',event=>{
  const view=button.dataset.studyNav;
  if(view==='timetable')return;
  event.preventDefault();
  if(view==='logout'){window.logoutStudy?.();return}
  openView(view);
 })
});
$('sidebarToggle')?.addEventListener('click',()=>{
 const open=document.body.classList.toggle('study-sidebar-open');
 $('sidebarToggle').setAttribute('aria-expanded',String(open));
});
$('studyOverlay')?.addEventListener('click',closeSidebar);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSidebar()});
const sideProfile=$('sideProfileName');
if(sideProfile)sideProfile.textContent=profile.startsWith('google:')?'Google account':profile;
if(profile.startsWith('google:')){
  import('https://esm.sh/@supabase/supabase-js@2.49.10').then(async sdk=>{
    const client=sdk.createClient('https://hnsjeoauzresxkbfrodu.supabase.co','sb_publishable_0D0se4u5F0n6z9Xgx3sUQg_o96wTS58');
    const {data,error}=await client.auth.getSession();
    if(error||!data.session?.user||'google:'+data.session.user.id!==profile)return;
    const user=data.session.user, metadata=user.user_metadata||{};
    const name=String(metadata.full_name||metadata.name||metadata.given_name||user.email?.split('@')[0]||'Learner').trim().slice(0,60);
    if(localStorage.getItem('v8profile')!==profile)return;
    if(sideProfile)sideProfile.textContent=name;
    const headerName=$('profileName');
    if(headerName)headerName.textContent='👤 '+name;
  }).catch(()=>{/* Keep the neutral Google account label if offline. */});
}
window.addEventListener('storage',event=>{if(event.key===storage){try{const next=JSON.parse(event.newValue||'null');if(next)prefs={...defaults,...next};else prefs={...defaults};if(!presets[prefs.accent])prefs.accent='blue';apply()}catch{}}});
})();
