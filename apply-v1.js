(function(){
'use strict';
var config=window.KRYSSEN_APPLY_V1_CONFIG||{};
var form=document.getElementById('fitForm');
var currentStep=1;
var maxStep=1;
var params=new URLSearchParams(location.search);
var turnstileToken='';
var turnstileWidgetId=null;
var draftKey='kryssen-elg-application-draft-v1';
var labels={
  audience:{founder:'Founder-led','growing-business':'Growing business'},
  revenue_motion:{'sales-led':'Sales-led','product-led':'Product-led',hybrid:'Hybrid: product signal plus sales'},
  traction:{'paying-customers':'Paying customers','recurring-usage':'Recurring usage',both:'Paying customers and recurring usage','not-yet':'No paying customers or recurring usage'},
  commercial_signal:{'qualified-opportunities':'More qualified opportunities','opportunity-progression':'Faster opportunity progression','activated-accounts':'More activated accounts','product-qualified':'More product-qualified accounts','usage-self-service':'Stronger usage or self-service','launch-entry':'A stronger launch or market entry','category-visibility':'More executive or category visibility',other:'Another observable event'},
  sector:{fintech:'Fintech & payments','banking-insurance':'Banking, insurance & asset management','professional-services':'Professional services',healthcare:'Private healthcare','real-estate':'Real estate',education:'Private education','energy-solar':'Energy & solar','saas-b2b':'SaaS & B2B technology',other:'Another industry'},
  opportunity:{'founder-dependency':'Buyer education and founder leverage','executive-visibility':'Executive visibility','market-moment':'Launch or market entry','category-authority':'Category authority','continued-operation':'Continued ELG operation','knowledge-fragmentation':'Shared business explanation','sales-education':'Sales and buyer education','commercial-connection':'Commercial connection','discovery-answers':'Discovery and buyer answers','decision-clarity':'Decision clarity','implementation-adoption':'Implementation and adoption','market-authority':'Market authority'},
  service_route:{'45-day-elg-build':'45-day Education-Led Growth build','monthly-elg-operation':'Monthly ELG operation','linkedin-os':'LinkedIn OS™','pr-launch':'PR Launch','state-of-industry-report':'State of Your Industry Report'}
};
var sectorQuestions={
  fintech:{q:'Which decision risk creates the most hesitation?',o:['Integration','Settlement','Fees','Reliability and uptime','Compliance','Fraud or disputes','Cross-border complexity']},
  'banking-insurance':{q:'Which decision requires the most education?',o:['Eligibility','Risk and returns','Pricing or fees','Claims or redemption','Onboarding','Regulatory confidence','Product comparison']},
  'professional-services':{q:'What must buyers believe before they shortlist the firm?',o:['We understand the problem','Our judgment is differentiated','Our process reduces risk','We have relevant experience','Senior people will remain involved','The commercial value is clear']},
  healthcare:{q:'Which decision needs clearer, responsible education?',o:['Service fit','Care pathway','Pricing','Provider credibility','Employer or payer approval','Preparation and follow-up']},
  'real-estate':{q:'Which risk most often slows the property decision?',o:['Title and verification','Project credibility','Pricing and payment','Transaction process','Distance or site access','Handover and aftercare']},
  education:{q:'Which enrolment decision needs clearer education?',o:['Programme fit','Curriculum','Fees and payment','Admissions','Learner support','Outcomes and progression']},
  'energy-solar':{q:'Which assumption is hardest for buyers to evaluate?',o:['Load and sizing','Component quality','Installation','Financing','Payback scenarios','Maintenance and warranty']},
  'saas-b2b':{q:'Which part of the buying decision needs more clarity?',o:['Use case and fit','Technical review','Integration','Implementation','Security and compliance','Pricing','Time to first value']},
  other:{q:'Which decision risk creates the most hesitation?',o:['Fit','Trust and evidence','Pricing','Implementation','Internal approval','Comparison with alternatives','Another risk']}
};
function track(name,data){if(typeof window.kryssenTrack==='function')return window.kryssenTrack(name,Object.assign({page:'apply-v1'},data||{}));return false}
function qs(sel,root){return (root||document).querySelector(sel)}
function qsa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
function selected(name){var el=qs('[name="'+name+'"]:checked',form);return el?el.value:''}
function values(name){return qsa('[name="'+name+'"]:checked',form).map(function(x){return x.value})}
function selectText(name){var el=qs('[name="'+name+'"]',form);return el&&el.selectedIndex>=0?el.options[el.selectedIndex].text:''}
function setHidden(id,value){var el=document.getElementById(id);if(el)el.value=value||''}
function prefillContext(){
  setHidden('sourceUrl',document.referrer||'direct');
  ['utm_source','utm_medium','utm_content'].forEach(function(k){setHidden(k.replace(/_([a-z])/g,function(_,c){return c.toUpperCase()}),params.get(k)||'')});
  var audience=params.get('audience')||'';
  var sector=params.get('sector')||'';
  var opportunity=params.get('opportunity')||'';
  var lane=params.get('lane')||'';
  var serviceRoute=params.get('service_route')||'';
  var supportRoute=params.get('support_route')||'';
  setHidden('audienceSource',audience);setHidden('sectorSource',sector);setHidden('opportunitySource',opportunity);setHidden('laneSource',lane);setHidden('serviceRouteSource',serviceRoute);setHidden('supportRouteSource',supportRoute);
  var audienceEl=audience?qs('[name="audience"][value="'+CSS.escape(audience)+'"]',form):null;
  if(audienceEl)audienceEl.checked=true;
  var sectorEl=document.getElementById('sector');
  if(sector&&qsa('option',sectorEl).some(function(o){return o.value===sector}))sectorEl.value=sector;
  var intro=document.getElementById('routeIntro');
  if(audience==='founder')intro.textContent='Let’s see where your expertise is still carrying too much of the sale—and what buyers could understand before they need you.';
  else if(audience==='growing-business')intro.textContent='Let’s see where knowledge is fragmenting across the business and where one education system could improve the buyer journey.';
  else if(sector)intro.textContent='Let’s identify what buyers in '+(labels.sector[sector]||'your market')+' must understand before they can choose you.';
}
function showStep(n){
  qsa('.form-step').forEach(function(s){var on=Number(s.dataset.step)===n;s.hidden=!on;s.classList.toggle('is-active',on)});
  qsa('.progress-step').forEach(function(b){var x=Number(b.dataset.go);b.classList.toggle('is-active',x===n);b.classList.toggle('is-done',x<n);b.disabled=x>maxStep;b.removeAttribute('aria-current');if(x===n)b.setAttribute('aria-current','step')});
  currentStep=n;track('apply_step_view',{step:n});
  document.querySelector('.apply-shell').scrollIntoView({behavior:'smooth',block:'start'});
}
function invalidate(el,msg){el.classList.add('is-invalid');el.setAttribute('aria-invalid','true');if(!el.dataset.originalTitle)el.dataset.originalTitle=el.title||'';el.title=msg||'Complete this field.'}
function clearInvalid(step){qsa('.is-invalid',step).forEach(function(el){el.classList.remove('is-invalid');el.removeAttribute('aria-invalid');el.title=el.dataset.originalTitle||''});qsa('.field-error',step).forEach(function(x){x.textContent=''})}
function validateCheckboxGroup(step,name,min,max){
  var boxes=qsa('[name="'+name+'"]',step);if(!boxes.length)return true;
  var count=boxes.filter(function(x){return x.checked}).length;
  if(count<(min||0)||max&&count>max){var e=qs('[data-error="'+name+'"]',step);if(e)e.textContent=max&&count>max?'Choose no more than '+max+'.':'Choose at least one.';return false}return true
}
function validateStep(n){
  var step=qs('.form-step[data-step="'+n+'"]');clearInvalid(step);var ok=true;
  qsa('input,select,textarea',step).forEach(function(el){if(el.disabled||el.closest('[hidden]'))return;if(!el.checkValidity()){invalidate(el,el.validationMessage);ok=false}});
  if(n===2){if(!validateCheckboxGroup(step,'education_gap',1,2))ok=false;if(!validateCheckboxGroup(step,'evidence',1))ok=false}
  if(n===3&&selected('audience')==='growing-business'){if(!validateCheckboxGroup(step,'knowledge_teams',1))ok=false}
  if(!ok){var first=qs('.is-invalid',step)||qs('.field-error:not(:empty)',step);if(first)first.scrollIntoView({behavior:'smooth',block:'center'})}
  return ok
}
function setBranchRequirements(){
  var a=selected('audience');var founder=document.getElementById('founderBranch');var business=document.getElementById('businessBranch');
  founder.hidden=a!=='founder';business.hidden=a!=='growing-business';
  qsa('select,input',founder).forEach(function(x){x.required=a==='founder'});qsa('select',business).forEach(function(x){x.required=a==='growing-business'});
  buildSectorQuestion();
}
function buildSectorQuestion(){
  var sector=qs('[name="sector"]',form).value||'other';var spec=sectorQuestions[sector]||sectorQuestions.other;
  var label=document.getElementById('sectorQuestionLabel');var sel=document.getElementById('sectorRisk');
  label.childNodes[0].nodeValue=spec.q;sel.innerHTML='';var first=document.createElement('option');first.value='';first.textContent='Choose one';sel.appendChild(first);
  spec.o.forEach(function(v){var o=document.createElement('option');o.value=v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');o.textContent=v;sel.appendChild(o)});
}
function labelFor(name,value){return labels[name]&&labels[name][value]?labels[name][value]:value}
function truncate(v,n){v=(v||'').trim();return v.length>n?v.slice(0,n-1)+'…':v}
function addSnapshotCard(parent,k,v){var a=document.createElement('article');var s=document.createElement('span');var b=document.createElement('strong');s.textContent=k;b.textContent=v||'Not supplied';a.appendChild(s);a.appendChild(b);parent.appendChild(a)}
function buildSnapshot(target){
  target=target||document.getElementById('snapshot');target.innerHTML='';
  addSnapshotCard(target,'Operating context',labelFor('audience',selected('audience'))+' · '+selectText('sector'));
  var opportunity=params.get('opportunity')||'';
  var lane=params.get('lane')||'';
  if(opportunity)addSnapshotCard(target,'Opportunity selected before applying',labelFor('opportunity',opportunity));
  if(lane)addSnapshotCard(target,'Sector context selected',lane.replace(/-/g,' '));
  var serviceRoute=params.get('service_route')||'';var supportRoute=params.get('support_route')||'';
  if(serviceRoute)addSnapshotCard(target,'Finder-suggested starting service',labelFor('service_route',serviceRoute));
  if(supportRoute)addSnapshotCard(target,'Finder-suggested optional support',labelFor('service_route',supportRoute));
  addSnapshotCard(target,'What buyers must understand',truncate(qs('[name="buyer_understanding"]',form).value,180));
  addSnapshotCard(target,'Education gap',values('education_gap').map(function(v){return v.replace(/-/g,' ')}).join(' · '));
  addSnapshotCard(target,'Available evidence',values('evidence').map(function(v){return v.replace(/-/g,' ')}).join(' · '));
  addSnapshotCard(target,'Commercial signal',selectText('commercial_signal'));
  var owner=selected('audience')==='founder'?selectText('founder_owner'):selectText('executive_sponsor');
  addSnapshotCard(target,'Internal ownership',owner);
  addSnapshotCard(target,'Industry decision risk',selectText('sector_risk'));
  addSnapshotCard(target,'Publishing readiness',selected('publish_readiness')==='yes'?'Ready with an approval process':'Internal concerns need resolution');
}
function formPayload(){
  var fd=new FormData(form),out={};fd.forEach(function(v,k){if(k==='kryssen_guard_field')return;if(Object.prototype.hasOwnProperty.call(out,k)){if(!Array.isArray(out[k]))out[k]=[out[k]];out[k].push(v)}else out[k]=v});
  out.schema_version='apply-v1.0';out.submitted_at=new Date().toISOString();out.page_url=location.href;return out
}
function createNonce(){
  if(window.crypto&&window.crypto.randomUUID)return window.crypto.randomUUID().replace(/-/g,'');
  var a=new Uint8Array(16);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(a);
  return Array.prototype.map.call(a,function(x){return x.toString(16).padStart(2,'0')}).join('')||String(Date.now())+String(Math.random()).replace(/\D/g,'');
}
function setupSubmissionFields(){
  var cleanUrl=location.origin+location.pathname;
  setHidden('successUrl',cleanUrl);setHidden('failureUrl',cleanUrl);
  setHidden('formStartedAt',String(Date.now()));setHidden('submissionNonce',createNonce());
}
function saveDraft(){
  var draft={};qsa('input,select,textarea',form).forEach(function(el){
    if(!el.name||el.name==='cf-turnstile-response'||el.name==='submission_nonce'||el.name==='form_started_at')return;
    if(el.type==='checkbox'||el.type==='radio'){if(!draft[el.name])draft[el.name]=[];if(el.checked)draft[el.name].push(el.value||'on');}
    else draft[el.name]=el.value;
  });
  try{sessionStorage.setItem(draftKey,JSON.stringify(draft));}catch(e){}
}
function restoreDraft(){
  var draft=null;try{draft=JSON.parse(sessionStorage.getItem(draftKey)||'null')}catch(e){}
  if(!draft)return false;
  qsa('input,select,textarea',form).forEach(function(el){
    if(!el.name||!Object.prototype.hasOwnProperty.call(draft,el.name))return;
    if(el.type==='checkbox'||el.type==='radio')el.checked=(draft[el.name]||[]).indexOf(el.value||'on')!==-1;
    else if(el.type!=='hidden'||['source_url','audience_source','sector_source','opportunity_source','lane_source','service_route_source','support_route_source','utm_source','utm_medium','utm_content'].indexOf(el.name)===-1)el.value=draft[el.name];
  });
  return true;
}
function clearDraft(){try{sessionStorage.removeItem(draftKey)}catch(e){}}
function setupTurnstile(){
  var status=document.getElementById('turnstileStatus');var started=Date.now();
  function attempt(){
    if(window.turnstile&&window.turnstile.render){
      if(!config.TURNSTILE_SITE_KEY){status.textContent='Security is not configured.';return}
      turnstileWidgetId=window.turnstile.render('#applyTurnstile',{sitekey:config.TURNSTILE_SITE_KEY,action:config.TURNSTILE_ACTION||'elg-fit-review',callback:function(token){turnstileToken=token;status.textContent='Security check complete.'},'expired-callback':function(){turnstileToken='';status.textContent='Security check expired. Complete it again.'},'error-callback':function(){turnstileToken='';status.textContent='Security check could not load. Refresh to retry.'}});return
    }
    if(Date.now()-started>12000){status.textContent='Security check took too long to load. Refresh to retry.';return}
    setTimeout(attempt,100)
  }
  attempt()
}
function cleanReturnUrl(){
  var u=new URL(location.href);['submission','reference','message','field'].forEach(function(k){u.searchParams.delete(k)});history.replaceState({},'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():''));
}
function showReturnSuccess(reference){
  form.hidden=true;document.querySelector('.progress').hidden=true;var success=document.getElementById('success');success.hidden=false;
  document.getElementById('successEyebrow').textContent='Application received';document.getElementById('successTitle').textContent='Your fit-review application is in.';
  document.getElementById('successIntro').textContent='Kryssen received your application. This confirms receipt; it does not confirm fit, scope or a call.';
  var prep=document.getElementById('successPrep');prep.innerHTML='<strong>Application reference</strong><p>'+String(reference||'Recorded')+'</p>';
  document.querySelector('.success-grid>div').innerHTML='<h3>What happens next</h3><ol><li>Wole reviews the buyer decision, evidence and operating ownership supplied.</li><li>Kryssen decides whether a conversation would be useful.</li><li>You receive a confirmation email for your records.</li></ol>';
  document.getElementById('successSnapshot').hidden=true;document.getElementById('receiptNote').textContent='Keep the application reference above. Reply to the confirmation email if you need to add context.';
  success.focus();success.scrollIntoView({behavior:'smooth'});track('apply_submitted',{reference:reference||'recorded'});clearDraft();cleanReturnUrl();
}
function handleReturnStatus(){
  var state=params.get('submission');if(!state)return false;
  if(state==='success'){showReturnSuccess(params.get('reference')||'Recorded');return true}
  if(state==='received'){restoreDraft();maxStep=4;setBranchRequirements();restoreDraft();showStep(4);document.getElementById('submitError').textContent='Your submission could not be confirmed. Please submit again with browser autofill disabled.';cleanReturnUrl();return true}
  if(state==='failed'){
    maxStep=4;setBranchRequirements();restoreDraft();showStep(4);
    document.getElementById('submitError').textContent=params.get('message')||'We could not store your application. Review your answers and try again.';
    cleanReturnUrl();return true
  }
  return false
}
function showNotReady(){form.hidden=true;document.querySelector('.progress').hidden=true;var gate=document.getElementById('notReady');gate.hidden=false;gate.scrollIntoView({behavior:'smooth'});track('apply_not_ready')}
function showSuccess(){form.hidden=true;document.querySelector('.progress').hidden=true;var success=document.getElementById('success');success.hidden=false;if(config.PREVIEW_MODE){document.getElementById('successEyebrow').textContent='Preview mode';document.getElementById('successTitle').textContent='Preview completed—not submitted.';document.getElementById('successIntro').textContent='Your answers stayed in this browser. Nothing was sent to Kryssen because production submission is not connected.';document.getElementById('receiptNote').textContent='Connect the production endpoint, security layer, storage, routing and applicant receipt before publishing this form.';}else{document.getElementById('successEyebrow').textContent='Application received';document.getElementById('successTitle').textContent='Your fit review is in.';}var audience=selected('audience');var prep=document.getElementById('successPrep');prep.innerHTML='';var strong=document.createElement('strong');var p=document.createElement('p');strong.textContent='Who should join if we invite a call';p.textContent=audience==='founder'?'Bring the person who repeatedly explains or closes serious opportunities—and the person who can coordinate evidence and approvals.':'Bring the executive sponsor and the person who can coordinate knowledge from sales, product, support or marketing.';prep.appendChild(strong);prep.appendChild(p);buildSnapshot(document.getElementById('successSnapshot'));success.focus();success.scrollIntoView({behavior:'smooth'});track(config.PREVIEW_MODE?'apply_preview_completed':'apply_submitted',{audience:audience,sector:qs('[name="sector"]',form).value})}
qsa('[data-next]').forEach(function(btn){btn.addEventListener('click',function(){var n=Number(btn.dataset.next);if(!validateStep(currentStep))return;if(currentStep===1&&selected('traction')==='not-yet'){showNotReady();return}if(n===3)setBranchRequirements();if(n===4)buildSnapshot();maxStep=Math.max(maxStep,n);showStep(n)})});
qsa('[data-back]').forEach(function(btn){btn.addEventListener('click',function(){showStep(Number(btn.dataset.back))})});
qsa('.progress-step').forEach(function(btn){btn.addEventListener('click',function(){var n=Number(btn.dataset.go);if(n>maxStep)return;if(n===3)setBranchRequirements();if(n===4)buildSnapshot();showStep(n)})});
document.getElementById('returnFromGate').addEventListener('click',function(){document.getElementById('notReady').hidden=true;form.hidden=false;document.querySelector('.progress').hidden=false;showStep(1)});
qsa('textarea[maxlength]').forEach(function(t){var c=qs('[data-count="'+t.name+'"]');function sync(){if(c)c.textContent=t.value.length}t.addEventListener('input',sync);sync()});
qsa('fieldset[data-limit]').forEach(function(fs){fs.addEventListener('change',function(e){var max=Number(fs.dataset.limit);var checked=qsa('input[type=checkbox]:checked',fs);if(checked.length>max){e.target.checked=false;var err=qs('.field-error',fs);if(err)err.textContent='Choose no more than '+max+'.'}})});
form.addEventListener('submit',function(e){e.preventDefault();if(!validateStep(4))return;var error=document.getElementById('submitError');error.textContent='';var submit=qs('button[type=submit]',form);
  if(config.PREVIEW_MODE){submit.disabled=true;submit.textContent='Completing preview…';setTimeout(function(){submit.disabled=false;submit.textContent='Apply for a fit review →';showSuccess()},500);return}
  if(!config.FORM_ENDPOINT){error.textContent='Submission is not connected. Contact info@kryssengrowth.com.';return}
  if(!turnstileToken){error.textContent='Complete the security check before submitting.';return}
  saveDraft();form.action=config.FORM_ENDPOINT;form.method='post';submit.disabled=true;submit.textContent='Submitting securely…';track('apply_submit_started',{audience:selected('audience'),sector:qs('[name="sector"]',form).value});form.submit()
});
form.addEventListener('input',function(e){if(e.target.classList.contains('is-invalid')){e.target.classList.remove('is-invalid');e.target.removeAttribute('aria-invalid')}});
var websiteInput=qs('[name="website"]',form);function normalizeWebsite(){var v=websiteInput.value.trim();if(v&&!/^https?:\/\//i.test(v))websiteInput.value='https://'+v}websiteInput.addEventListener('blur',normalizeWebsite);form.addEventListener('submit',normalizeWebsite,true);
form.addEventListener('change',function(e){if(e.target.name==='audience'&&maxStep>=3)setBranchRequirements();if(e.target.name==='sector'&&maxStep>=3)buildSectorQuestion()});
prefillContext();restoreDraft();buildSectorQuestion();setupSubmissionFields();setupTurnstile();if(config.PREVIEW_MODE||config.STAGING_MODE)document.getElementById('previewFlag').hidden=false;handleReturnStatus();track('apply_started',{audience_source:params.get('audience')||'',sector_source:params.get('sector')||'',opportunity_source:params.get('opportunity')||'',lane_source:params.get('lane')||'',service_route_source:params.get('service_route')||'',support_route_source:params.get('support_route')||'',utm_source:params.get('utm_source')||''});
})();
