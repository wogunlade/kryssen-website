(function(){
'use strict';
var PHONE='2348158357418';
var state={audience:'',sector:'',opportunity:'',maturity:'',sectorRisk:'',whyNow:'',commercial:'',readiness:[]};
var step=0;
var totalQuestions=6;
var sectors=[
  ['fintech','Fintech and payments'],['banking-insurance','Banking and insurance'],['professional-services','Professional services'],['healthcare','Private healthcare'],['real-estate','Real estate'],['education','Private education'],['energy-solar','Energy and solar'],['saas-b2b','SaaS and B2B technology'],['other','Another industry']
];
var audiences=[['founder','Founder-led','The founder remains close to serious opportunities.'],['growing-business','Growing business','Knowledge is distributed across several teams.'],['both','Both','The founder is central and several teams hold useful knowledge.'],['other','Another structure','None of these descriptions is quite right.']];
var opportunities={
  'discovery-answers':{title:'Find and understand',result:'Make the business easier to find and understand.',text:'Buyers need clearer public answers before they can recognise the fit or explain the business.',assets:['Conversion-focused website copy','Buyer-question blog posts','FAQs and product or service explainers','SEO, AEO and GEO pages']},
  'decision-clarity':{title:'Compare and decide',result:'Make the buying decision easier to evaluate.',text:'Buyers need better material for comparing fit, trust, cost, evidence and alternatives.',assets:['Decision and suitability guides','Comparison pages','Buyer FAQs','Conversion-focused website copy','Sales follow-up education']},
  'implementation-adoption':{title:'Implement and use',result:'Make implementation, onboarding and use easier to understand.',text:'The offer may be understood, but buyers or customers still need direct support to implement, onboard or reach value.',assets:['Implementation documentation','Onboarding curriculum','Customer learning system','Support and self-service knowledge','Journey FAQs']},
  'market-authority':{title:'Lead the market',result:'Give the market a stronger reason to learn from the business.',text:'A launch, category position or original insight needs substantive education and authority—not visibility alone.',assets:['Original industry report','PR narrative and supporting assets','Executive education','Campaign and report landing page','Search and AI citation structure']}
};
var maturity={
  public:{title:'Public and organised',desc:'Useful, current pages, documentation or learning already exist.'},
  scattered:{title:'Useful but scattered',desc:'Answers exist across articles, decks, documents and internal systems.'},
  teams:{title:'Held across teams',desc:'Sales, product, support or operations know the answers, but they are not connected.'},
  founder:{title:'Founder-dependent',desc:'The strongest explanations still live mainly with the founder or leadership.'},
  little:{title:'Little has been organised',desc:'Expertise exists, but very little current buyer education is usable.'}
};
var whyOptions={
  repeated:{title:'Buyers keep asking the same questions',desc:'Important answers are repeatedly rebuilt in calls and follow-up.'},
  sales:{title:'Sales spends too much time educating',desc:'Conversations that should be about judgment are still covering the basics.'},
  launch:{title:'We are launching or entering a market',desc:'A product, service, facility, programme or partnership needs context.'},
  executive:{title:'Leadership needs a stronger public voice',desc:'Useful founder or executive expertise is not reaching the market consistently.'},
  data:{title:'We have original data or market insight',desc:'The business can teach the market something substantive.'},
  onboarding:{title:'Customer learning needs improvement',desc:'Implementation, onboarding, use or self-service creates friction.'},
  rhythm:{title:'Publishing lacks an operating rhythm',desc:'Useful work exists, but research, publishing and distribution are disconnected.'},
  visibility:{title:'Search and AI visibility need strengthening',desc:'Buyers and answer systems cannot reliably find the useful expertise.'}
};
var commercialOptions={
  'qualified-opportunities':'More qualified opportunities','opportunity-progression':'Faster opportunity progression','completed-enquiries':'More completed enquiries or applications','activated-accounts':'More activated accounts or customers','usage-self-service':'Better onboarding or self-service','launch-entry':'A stronger launch or market entry','category-visibility':'Greater category or executive visibility','other':'Another observable event'
};
var readinessOptions={owner:'A named operating owner',sponsor:'An executive sponsor',experts:'Access to relevant experts',evidence:'Usable evidence or documentation',approvals:'Prompt review and approval capacity',unconfirmed:'None of these are confirmed yet'};
var sectorQuestions={
  fintech:['Which decision creates the most hesitation?',['Fees and pricing','Settlement','Integration','Reliability','Disputes','Risk or compliance confidence','Cross-border complexity']],
  'banking-insurance':['Which financial decision needs clearer education?',['Eligibility','Fees','Risk and returns','Claims or redemption','Onboarding','Product comparison']],
  'professional-services':['What must buyers understand before they shortlist the firm?',['Problem understanding','Differentiated judgment','Method','Relevant experience','Senior involvement','Commercial value']],
  healthcare:['Which part of the care journey needs clearer education?',['Service fit','Care pathway','Preparation','Cost or coverage','Provider credibility','Follow-up']],
  'real-estate':['Which risk most often slows the property decision?',['Title and verification','Project credibility','Pricing and payment','Transaction process','Distance or site access','Handover and aftercare']],
  education:['Which enrolment decision needs clearer education?',['Programme fit','Curriculum','Fees and payment','Admissions','Learner support','Progression']],
  'energy-solar':['Which assumption is hardest for buyers to evaluate?',['Load and sizing','Component quality','Installation','Financing','Payback scenario','Maintenance and warranty']],
  'saas-b2b':['Which part of the buying decision needs more clarity?',['Use case and fit','Technical review','Integration','Implementation','Security','Pricing','Time to first value']],
  other:['Which part of the decision needs clearer education?',['Fit','Trust and evidence','Pricing','Implementation','Internal approval','Comparison with alternatives','Customer use']]
};
var serviceLabels={'45-day-elg-build':'45-day Education-Led Growth build','monthly-elg-operation':'Monthly ELG operation','linkedin-os':'LinkedIn OS™','pr-launch':'PR Launch','state-of-industry-report':'State of Your Industry Report'};
var sectorPages={fintech:'industry-fintech.html','banking-insurance':'industry-banking-insurance.html','professional-services':'industry-professional-services.html',healthcare:'industry-healthcare.html','real-estate':'industry-real-estate.html',education:'industry-education.html','energy-solar':'industry-energy-solar.html','saas-b2b':'industry-saas-b2b-technology.html'};
function qs(s){return document.querySelector(s)}
function track(name,data){if(typeof window.kryssenTrack==='function')return window.kryssenTrack(name,Object.assign({page:'quiz'},data||{}));return false}
function slug(v){return (v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}
function answerButton(field,value,title,desc,selected,multi){return '<button type="button" class="qf-answer'+(selected?' is-selected':'')+'" data-field="'+field+'" data-value="'+value+'" aria-pressed="'+(selected?'true':'false')+'"><i aria-hidden="true"></i><span><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</span>'+(multi?'<em>✓</em>':'')+'</button>'}
function setHeader(label,count,dimension,question,help){var stepLabel=qs('#qfStepLabel');if(stepLabel)stepLabel.textContent=label;qs('#qfStepCount').textContent=count;qs('#qfDimension').textContent=dimension;qs('#qfQuestion').textContent=question;qs('#qfHelp').textContent=help||''}
function renderSegments(){var h='';for(var i=0;i<7;i++)h+='<i class="'+(i<step?'is-done':(i===step?'is-current':''))+'"></i>';qs('#qfSegments').innerHTML=h}
function render(){
  renderSegments();var box=qs('#qfAnswers'),h='';box.className='qf-answers';
  if(step===0){
    setHeader('Context','Take the ELG™ Quiz','Your business context','Tell us where to begin.','Choose one operating context and one sector.');
    h='<div class="qf-context-group"><h3>Which description is closest to the business?</h3><div class="qf-answer-grid">';
    audiences.forEach(function(a){h+=answerButton('audience',a[0],a[1],a[2],state.audience===a[0],false)});h+='</div></div><div class="qf-context-group"><h3>Which market is closest?</h3><div class="qf-sector-grid">';
    sectors.forEach(function(a){h+=answerButton('sector',a[0],a[1],'',state.sector===a[0],false)});h+='</div></div>';
  }else if(step===1){
    setHeader('Question 1 of 6','01 / 06','Buyer opportunity','Where does the buyer journey need the most help?','Choose the point where clearer education would be most useful.');
    box.classList.add('qf-answer-grid');Object.keys(opportunities).forEach(function(k){var o=opportunities[k];h+=answerButton('opportunity',k,o.title,o.text,state.opportunity===k,false)});
  }else if(step===2){
    setHeader('Question 2 of 6','02 / 06','Knowledge and assets','Which statement best describes what the business has today?','This helps distinguish building a foundation from operating one that already exists.');
    Object.keys(maturity).forEach(function(k){var o=maturity[k];h+=answerButton('maturity',k,o.title,o.desc,state.maturity===k,false)});
  }else if(step===3){
    var sq=sectorQuestions[state.sector]||sectorQuestions.other;setHeader('Question 3 of 6','03 / 06','Sector decision',sq[0],'Choose the decision that most often needs direct explanation.');box.classList.add('qf-answer-grid');
    sq[1].forEach(function(v){var k=slug(v);h+=answerButton('sectorRisk',k,v,'',state.sectorRisk===k,false)});
  }else if(step===4){
    setHeader('Question 4 of 6','04 / 06','Why now','What makes this opportunity important now?','This helps identify whether a focused supporting service is relevant.');box.classList.add('qf-answer-grid');
    Object.keys(whyOptions).forEach(function(k){var o=whyOptions[k];h+=answerButton('whyNow',k,o.title,o.desc,state.whyNow===k,false)});
  }else if(step===5){
    setHeader('Question 5 of 6','05 / 06','Commercial movement','What would useful progress support?','This is a candidate signal—not a promised outcome.');box.classList.add('qf-answer-grid');
    Object.keys(commercialOptions).forEach(function(k){h+=answerButton('commercial',k,commercialOptions[k],'',state.commercial===k,false)});
  }else{
    setHeader('Question 6 of 6','06 / 06','Operating readiness','Do you have a dedicated person who can work with us?','Choose the support already available. Select up to three.');box.classList.add('qf-answer-grid');
    Object.keys(readinessOptions).forEach(function(k){h+=answerButton('readiness',k,readinessOptions[k],'',state.readiness.indexOf(k)>-1,true)});
  }
  box.innerHTML=h;updateContinue();qs('#qfBack').textContent=step===0?'← Exit':'← Back';qs('#qfContinue').textContent=step===6?'See my result →':'Continue →';
  track('quiz_step_view',{step:step,dimension:qs('#qfDimension').textContent});
}
function updateContinue(){var ready=false;if(step===0)ready=!!state.audience&&!!state.sector;else if(step===1)ready=!!state.opportunity;else if(step===2)ready=!!state.maturity;else if(step===3)ready=!!state.sectorRisk;else if(step===4)ready=!!state.whyNow;else if(step===5)ready=!!state.commercial;else ready=state.readiness.length>0;qs('#qfContinue').disabled=!ready}
function recommend(){
  var primary='45-day-elg-build',support='',reason='Build the buyer-education foundation around the decision selected.';
  if(state.whyNow==='launch'){primary='pr-launch';support='45-day-elg-build';reason='A market moment needs disciplined claims and supporting buyer education.'}
  else if(state.whyNow==='data'&&state.opportunity==='market-authority'){primary='state-of-industry-report';support='pr-launch';reason='Original insight can become a substantive market reference and a focused PR story.'}
  else if(state.whyNow==='executive'){
    if(state.maturity==='public'||state.maturity==='scattered'){primary='linkedin-os';support='monthly-elg-operation';reason='Leadership expertise can lead distribution while the wider education system continues operating.'}
    else{primary='45-day-elg-build';support='linkedin-os';reason='The business needs an owned education foundation and a consistent leadership voice.'}
  }else if(state.whyNow==='rhythm'&&(state.maturity==='public'||state.maturity==='scattered')){primary='monthly-elg-operation';reason='Useful assets already exist; the larger need is a connected research, publishing and distribution rhythm.'}
  else if(state.opportunity==='implementation-adoption'){primary='45-day-elg-build';support=(state.maturity==='public'||state.maturity==='scattered')?'monthly-elg-operation':'';reason='Documentation and customer learning should be built around implementation, onboarding and use.'}
  else if(state.maturity==='founder'){primary='45-day-elg-build';support='linkedin-os';reason='Founder expertise needs to become owned buyer education and a sustainable public voice.'}
  return {primary:primary,support:support,reason:reason};
}
function showResult(){
  var opp=opportunities[state.opportunity],rec=recommend();
  qs('#qfStage').hidden=true;qs('#qfResult').hidden=false;document.body.classList.remove('qf-active');document.body.classList.add('qf-result-mode');
  qs('#qfResultOpportunity').textContent=opp.result;qs('#qfResultOpportunityText').textContent=opp.text;
  var risk=(sectorQuestions[state.sector]||sectorQuestions.other)[1].filter(function(v){return slug(v)===state.sectorRisk})[0]||state.sectorRisk.replace(/-/g,' ');
  qs('#qfResultDecision').textContent='Decision to clarify: '+risk+'. Candidate signal: '+commercialOptions[state.commercial]+'.';
  qs('#qfPrimaryService').textContent=serviceLabels[rec.primary];qs('#qfPrimaryReason').textContent=rec.reason;
  qs('#qfSupportService').innerHTML=rec.support?'<span>Optional supporting service</span><strong>'+serviceLabels[rec.support]+'</strong>':'';
  qs('#qfAssets').innerHTML=opp.assets.map(function(x){return '<li>'+x+'</li>'}).join('');
  var readinessNote=state.readiness.indexOf('unconfirmed')>-1?'Operating ownership and approval capacity still need to be confirmed in the Fit Review.':state.readiness.indexOf('owner')>-1?'A named operating owner is available; the Fit Review will still test access, evidence and approval capacity.':'Some operating support is available, but a day-to-day owner still needs to be confirmed.';
  var why=[opportunities[state.opportunity].title+' is the selected buyer-journey opportunity.',maturity[state.maturity].title+': '+maturity[state.maturity].desc,whyOptions[state.whyNow].title+'.',readinessNote];
  qs('#qfWhy').innerHTML=why.map(function(x){return '<li>'+x+'</li>'}).join('');
  var u=new URL('apply.html',location.href);if(state.audience==='founder'||state.audience==='growing-business')u.searchParams.set('audience',state.audience);u.searchParams.set('sector',state.sector);u.searchParams.set('opportunity',state.opportunity);u.searchParams.set('service_route',rec.primary);if(rec.support)u.searchParams.set('support_route',rec.support);u.searchParams.set('utm_source','quiz');u.searchParams.set('utm_medium','result');u.searchParams.set('utm_content',state.opportunity);qs('#qfApply').href=u.toString();
  var msg='Hi Kryssen — I completed the Education Opportunity Finder. My suggested starting opportunity was '+opp.title+', with '+serviceLabels[rec.primary]+' as the primary service'+(rec.support?' and '+serviceLabels[rec.support]+' as optional support':'')+'. I would like to discuss the result.';qs('#qfWhatsApp').href='https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg);
  var contextHref='business.html',contextText='See the Growing Businesses page →';if(state.audience==='founder'){contextHref='founders.html';contextText='See the For Founders page →'}else if(sectorPages[state.sector]){contextHref=sectorPages[state.sector];contextText='See the relevant sector page →'}qs('#qfContextLink').href=contextHref+'?utm_source=quiz&utm_medium=result&utm_content='+state.opportunity;qs('#qfContextLink').textContent=contextText;
  track('quiz_completed',{audience:state.audience,sector:state.sector,opportunity:state.opportunity,service_route:rec.primary,support_route:rec.support||'none'});track('quiz_result_view',{opportunity:state.opportunity,service_route:rec.primary});window.scrollTo({top:0,behavior:'smooth'});
}
function start(){step=0;qs('#qfResult').hidden=true;qs('#qfStage').hidden=false;document.body.classList.add('qf-active');document.body.classList.remove('qf-result-mode');track('quiz_started');render();window.scrollTo({top:0,behavior:'smooth'})}
document.addEventListener('click',function(e){
  var a=e.target.closest?e.target.closest('.qf-answer'):null;if(a){var f=a.dataset.field,v=a.dataset.value;if(f==='readiness'){if(v==='unconfirmed'){state.readiness=state.readiness.indexOf('unconfirmed')>-1?[]:['unconfirmed']}else{state.readiness=state.readiness.filter(function(x){return x!=='unconfirmed'});var i=state.readiness.indexOf(v);if(i>-1)state.readiness.splice(i,1);else if(state.readiness.length<3)state.readiness.push(v);else{qs('#qfHelp').textContent='Choose up to three. Remove one selection before adding another.';track('quiz_answer_limit',{step:step,question:f,limit:3});return}}}else{if(f==='sector'&&state.sector!==v)state.sectorRisk='';state[f]=v}track('quiz_answer_selected',{step:step,question:f,answer:v});render();return}
  if(e.target.closest&&e.target.closest('#qfContinue')){if(qs('#qfContinue').disabled)return;if(step<6){step++;render();window.scrollTo({top:0,behavior:'smooth'})}else showResult();return}
  if(e.target.closest&&e.target.closest('#qfBack')){if(step===0){track('quiz_exit',{step:0});location.href='index.html';return}else{step--;render()}track('quiz_back',{step:step});return}
  if(e.target.closest&&e.target.closest('#qfRetake')){state={audience:'',sector:'',opportunity:'',maturity:'',sectorRisk:'',whyNow:'',commercial:'',readiness:[]};track('quiz_retake');start();return}
  if(e.target.closest&&e.target.closest('#qfApply'))track('quiz_apply_click',{opportunity:state.opportunity,service_route:recommend().primary});
  if(e.target.closest&&e.target.closest('#qfWhatsApp'))track('quiz_whatsapp_click',{opportunity:state.opportunity,service_route:recommend().primary});
});
track('quiz_view');
start();
})();
