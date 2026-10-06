(function(){
'use strict';
var config=window.KRYSSEN_APPLY_V2_CONFIG||{};
var form=document.getElementById('strategyForm');
var params=new URLSearchParams(location.search);
var turnstileToken='';
var draftKey='kryssen-strategy-conversation-v2-1';
var serviceLabels={'content-sprint':'Content Sprint','monthly-retainer':'Monthly Retainer','project-based':'Project-Based','not-sure':'I’m not sure yet'};
var legacyServiceMap={
  'sprint':'content-sprint',
  'content-sprint':'content-sprint',
  '45-day-elg-build':'content-sprint',
  'monthly-retainer':'monthly-retainer',
  'monthly-elg-operation':'monthly-retainer',
  'project-based':'project-based',
  'linkedin-os':'project-based',
  'pr-launch':'project-based',
  'state-of-industry-report':'project-based',
  'not-sure':'not-sure'
};
var needCopy={
  'content-sprint':{
    q:'What buyer or customer decision should the 45-day Sprint clarify?',
    h:'Tell us what people need to understand and any related content assets you think may be useful.',
    p:'Describe the decision, the people involved and what currently makes it difficult.'
  },
  'monthly-retainer':{
    q:'What ongoing content work should Kryssen help your company own each month?',
    h:'Include the customer journey, content priorities or distribution routes that matter.',
    p:'Describe the recurring content need and where the work should be used.'
  },
  'project-based':{
    q:'What specific content project do you need?',
    h:'Describe the expected deliverable and what it should help the business accomplish.',
    p:'Describe the project, intended audience and business purpose.'
  },
  'not-sure':{
    q:'What are you trying to help buyers or customers understand or do?',
    h:'Describe the business need in your own words. You do not need to diagnose the content solution.',
    p:'Tell us what needs to change and why it matters now.'
  }
};
function qs(sel,root){return (root||document).querySelector(sel)}
function qsa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
function track(name,data){if(typeof window.kryssenTrack==='function')return window.kryssenTrack(name,Object.assign({page:'apply-v2'},data||{}));return false}
function selected(name){var el=qs('[name="'+name+'"]:checked',form);return el?el.value:''}
function setHidden(id,value){var el=document.getElementById(id);if(el)el.value=value||''}
function syncSubmitState(){
  var consent=qs('[name="consent"]',form),submit=qs('button[type="submit"]',form);
  if(!consent||!submit)return;
  var securityReady=Boolean(config.PREVIEW_MODE||turnstileToken);
  var ready=Boolean(consent.checked&&securityReady);
  submit.disabled=!ready;
  submit.setAttribute('aria-disabled',ready?'false':'true');
}
function createNonce(){
  if(window.crypto&&window.crypto.randomUUID)return window.crypto.randomUUID().replace(/-/g,'');
  var a=new Uint8Array(16);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(a);
  return Array.prototype.map.call(a,function(x){return x.toString(16).padStart(2,'0')}).join('')||String(Date.now())+String(Math.random()).replace(/\D/g,'');
}
function cleanReturnUrl(){
  var u=new URL(location.href);['submission','reference','message','field'].forEach(function(k){u.searchParams.delete(k)});
  history.replaceState({},'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():''));
}
function normalizeService(value){return legacyServiceMap[String(value||'').toLowerCase()]||''}
function syncNeedCopy(){
  var value=selected('service_interest')||'not-sure';var copy=needCopy[value]||needCopy['not-sure'];
  document.getElementById('needQuestion').textContent=copy.q;
  document.getElementById('needHelper').textContent=copy.h;
  qs('[name="engagement_need"]',form).placeholder=copy.p;
}
function prefillContext(){
  var source=new URL(location.href);['submission','reference','message','field'].forEach(function(k){source.searchParams.delete(k)});setHidden('sourceUrl',source.toString().slice(0,800));
  ['utm_source','utm_medium','utm_content'].forEach(function(k){setHidden(k.replace(/_([a-z])/g,function(_,c){return c.toUpperCase()}),params.get(k)||'')});
  setHidden('audienceSource',params.get('audience')||'');
  setHidden('sectorSource',params.get('sector')||'');
  setHidden('opportunitySource',params.get('opportunity')||'');
  setHidden('laneSource',params.get('lane')||'');
  setHidden('serviceRouteSource',params.get('service_route')||'');
  setHidden('supportRouteSource',params.get('support_route')||'');
  setHidden('serviceSource',params.get('service')||'');
  var raw=params.get('service')||params.get('service_route')||'';
  var normalized=normalizeService(raw);
  if(normalized){
    var input=qs('[name="service_interest"][value="'+normalized+'"]',form);if(input&&!selected('service_interest'))input.checked=true;
    var note=document.getElementById('routeNotice');note.hidden=false;note.textContent='You arrived from the '+serviceLabels[normalized]+' option. It is shown below, but you can choose another way to work.';
  }
  syncNeedCopy();
}
function setupSubmissionFields(){
  var cleanUrl=location.origin+location.pathname;
  setHidden('successUrl',cleanUrl);setHidden('failureUrl',cleanUrl);
  setHidden('formStartedAt',String(Date.now()));setHidden('submissionNonce',createNonce());
}
function normalizeWebsite(){var el=qs('[name="website"]',form);var v=el.value.trim();if(v&&!/^https?:\/\//i.test(v))el.value='https://'+v}
function clearInvalid(){qsa('.is-invalid',form).forEach(function(el){el.classList.remove('is-invalid');el.removeAttribute('aria-invalid')});qsa('.field-error',form).forEach(function(x){x.textContent=''})}
function validateForm(){
  clearInvalid();var ok=true;
  qsa('input,select,textarea',form).forEach(function(el){if(el.disabled||el.type==='hidden'||el.classList.contains('hp'))return;if(!el.checkValidity()){el.classList.add('is-invalid');el.setAttribute('aria-invalid','true');ok=false}});
  var readiness=qsa('[name="work_readiness"]:checked',form).length;
  if(!readiness){qs('[data-error="work_readiness"]',form).textContent='Choose at least one.';ok=false}
  if(!ok){var first=qs('.is-invalid',form)||qs('.field-error:not(:empty)',form);if(first)first.scrollIntoView({behavior:'smooth',block:'center'})}
  return ok
}
function saveDraft(){
  var draft={};qsa('input,textarea',form).forEach(function(el){
    if(!el.name||el.type==='hidden'||el.name==='kryssen_guard_field')return;
    if(el.type==='checkbox'||el.type==='radio'){if(!draft[el.name])draft[el.name]=[];if(el.checked)draft[el.name].push(el.value||'on')}else draft[el.name]=el.value;
  });
  try{sessionStorage.setItem(draftKey,JSON.stringify(draft))}catch(e){}
}
function restoreDraft(){
  var draft=null;try{draft=JSON.parse(sessionStorage.getItem(draftKey)||'null')}catch(e){}
  if(!draft)return;
  qsa('input,textarea',form).forEach(function(el){
    if(!el.name||!Object.prototype.hasOwnProperty.call(draft,el.name))return;
    if(el.type==='checkbox'||el.type==='radio')el.checked=(draft[el.name]||[]).indexOf(el.value||'on')!==-1;
    else if(el.type!=='hidden')el.value=draft[el.name];
  });
}
function clearDraft(){try{sessionStorage.removeItem(draftKey)}catch(e){}}
function setupTurnstile(){
  var status=document.getElementById('turnstileStatus');var started=Date.now();
  function attempt(){
    if(window.turnstile&&window.turnstile.render){
      if(!config.TURNSTILE_SITE_KEY){status.textContent='Security is not configured.';return}
      window.turnstile.render('#applyTurnstile',{sitekey:config.TURNSTILE_SITE_KEY,action:config.TURNSTILE_ACTION||'strategy-conversation',callback:function(token){turnstileToken=token;status.textContent='Security check complete. You can submit after accepting the review terms.';syncSubmitState()},'expired-callback':function(){turnstileToken='';status.textContent='Security check expired. Complete it again.';syncSubmitState()},'error-callback':function(){turnstileToken='';status.textContent='Security check could not load. Refresh to retry.';syncSubmitState()}});return
    }
    if(Date.now()-started>12000){status.textContent='Security check took too long to load. Refresh to retry.';return}
    setTimeout(attempt,100)
  }
  attempt();
}
function showSuccess(reference,preview){
  form.hidden=true;var success=document.getElementById('success');success.hidden=false;
  if(preview){document.getElementById('successEyebrow').textContent='Preview completed';document.getElementById('successTitle').textContent='Your answers stayed in this browser.';document.getElementById('successIntro').textContent='Nothing was sent to Kryssen because production submission is not connected in preview mode.';document.getElementById('successBoundary').textContent='Connect and verify the production submission workflow before publishing.'}
  if(reference){document.getElementById('referenceValue').textContent=String(reference);document.getElementById('successReference').hidden=false}
  success.focus();success.scrollIntoView({behavior:'smooth'});clearDraft();track(preview?'strategy_conversation_preview_completed':'strategy_conversation_submitted',{service_interest:selected('service_interest')||'return'});if(!preview)track('generate_lead',{form:'strategy_conversation',service_interest:selected('service_interest')||'return'});
}
function showFieldError(field){
  if(!field)return;var error=document.getElementById('submitError');
  if(field==='turnstile'){document.getElementById('turnstileStatus').textContent='Complete the security check and submit again.';return}
  var el=form.querySelector('[name="'+CSS.escape(field)+'"]');
  if(el){el.classList.add('is-invalid');el.setAttribute('aria-invalid','true');el.focus();el.scrollIntoView({behavior:'smooth',block:'center'})}
  else if(field==='form')error.focus();
}
function handleReturnStatus(){
  var state=params.get('submission');if(!state)return false;
  if(state==='success'){showSuccess(params.get('reference')||'',false);cleanReturnUrl();return true}
  if(state==='received'||state==='failed'){
    document.getElementById('submitError').textContent=params.get('message')||'We could not confirm your request. Review the form and submit again.';showFieldError(params.get('field')||'');cleanReturnUrl();return false
  }
  return false;
}
form.addEventListener('change',function(e){
  if(e.target.name==='consent')syncSubmitState();
  if(e.target.name==='service_interest')syncNeedCopy();
  if(e.target.name==='work_readiness'&&e.target.checked){
    if(e.target.value==='organising')qsa('[name="work_readiness"]',form).forEach(function(x){if(x!==e.target)x.checked=false});
    else{var organising=qs('[name="work_readiness"][value="organising"]',form);if(organising)organising.checked=false}
    var readinessError=qs('[data-error="work_readiness"]',form);if(readinessError)readinessError.textContent='';
  }
  if(e.target.classList.contains('is-invalid')){e.target.classList.remove('is-invalid');e.target.removeAttribute('aria-invalid')}
});
form.addEventListener('input',function(e){if(e.target.name==='engagement_need'){var c=qs('[data-count="engagement_need"]');if(c)c.textContent=e.target.value.length}if(e.target.classList.contains('is-invalid')){e.target.classList.remove('is-invalid');e.target.removeAttribute('aria-invalid')}});
form.addEventListener('submit',function(e){
  e.preventDefault();normalizeWebsite();if(!validateForm())return;
  var submit=qs('button[type="submit"]',form);var error=document.getElementById('submitError');error.textContent='';
  if(config.PREVIEW_MODE){submit.disabled=true;submit.textContent='Completing preview…';setTimeout(function(){submit.disabled=false;submit.textContent='Book My Strategy Conversation';showSuccess('',true)},450);return}
  if(!config.FORM_ENDPOINT){error.textContent='Submission is not connected. Contact info@kryssengrowth.com.';return}
  if(!turnstileToken){error.textContent='Complete the security check before submitting.';return}
  saveDraft();form.action=config.FORM_ENDPOINT;form.method='post';submit.disabled=true;submit.textContent='Submitting securely…';track('strategy_conversation_submit_started',{service_interest:selected('service_interest'),preferred_start:selected('preferred_start')});form.submit();
});
qs('[name="website"]',form).addEventListener('blur',normalizeWebsite);
var interacted=false;form.addEventListener('focusin',function(){if(interacted)return;interacted=true;track('strategy_conversation_first_interaction',{service_source:params.get('service')||params.get('service_route')||'',utm_source:params.get('utm_source')||'direct'})});
restoreDraft();prefillContext();setupSubmissionFields();syncSubmitState();
var restoredNeed=qs('[name="engagement_need"]',form);var restoredCount=qs('[data-count="engagement_need"]');if(restoredNeed&&restoredCount)restoredCount.textContent=restoredNeed.value.length;
if(config.PREVIEW_MODE||config.STAGING_MODE)document.getElementById('previewFlag').hidden=false;
var returned=handleReturnStatus();if(!returned)setupTurnstile();
track('strategy_conversation_started',{service_source:params.get('service')||params.get('service_route')||'',utm_source:params.get('utm_source')||''});
})();
