/* ============================================================
   Kryssen site behaviour layer.
   Analytics and consent are initialised by analytics.js using the
   live GTM container (GTM-NGKZZ88T) and consent mode defaults.
   ============================================================ */
var K2D_CONFIG = {
  FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycbxA8YxTnHsyzo1GR6No0dC0YhpGdPR9i2OImTpUbSkDqleDi3fqqzzscgQxWGtXUidx/exec",
  TURNSTILE_SITE_KEY: "0x4AAAAAAEUupCPuitD89Z6_",
  WORKSHOP_TURNSTILE_ACTION: "elg-masterclass",
  WHATSAPP: "2348158357418"
};

/* ---------- consent-aware measurement ---------- */
function track(name, payload){
  if(typeof window.kryssenTrack==='function') return window.kryssenTrack(name,payload);
  return false;
}

/* ---------- validation helper ---------- */
function stepValid(container){
  var ok=true;
  container.querySelectorAll('input,select,textarea').forEach(function(el){
    if(el.offsetParent!==null && !el.checkValidity()){ok=false; if(el.reportValidity) el.reportValidity();}
  });
  return ok;
}

function postForm(form, kind){
  if(!K2D_CONFIG.FORM_ENDPOINT) return;
  var data={kind:kind};
  form.querySelectorAll('input,select,textarea').forEach(function(el){
    if(el.name || el.id) data[el.name||el.id]= (el.type==='radio'? (el.checked?el.value:'') : el.value);
  });
  fetch(K2D_CONFIG.FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .catch(function(err){ console.warn('[K2D] form post failed', err); });
}

/* ---------- site chrome: WhatsApp float + sticky mobile CTA + cookie consent ---------- */
function injectChrome(){
  var body=document.body;
  var page=body.dataset.page||'';

  /* WhatsApp floating button — NOT on the homepage, the diagnostic, or the quiz (owner ban) */
  var noWA=(page==='home'||page==='check'||page==='quiz'||page==='privacy'||page==='apply-v1');
  var msg = body.dataset.wamsg || "Hi Kryssen — I would like to discuss whether Education-Led Growth™ could fit my business.";
  var industry = body.dataset.industry || '';
  var intentMap = {
    about:'operator',founders:'founder',business:'connected-teams',industries:'industry',
    manifesto:'manifesto',workshops:'masterclass',notfound:'site-help'
  };
  var intent = industry ? 'industry' : (intentMap[page] || 'education-led-growth');
  var wa=document.createElement('a');
  wa.className='wa-float';
  if(noWA)wa.style.display='none';
  wa.href='https://wa.me/'+K2D_CONFIG.WHATSAPP+'?text='+encodeURIComponent(msg);
  wa.target='_blank'; wa.rel='noopener noreferrer';
  wa.setAttribute('aria-label','Chat with Kryssen on WhatsApp');
  wa.title='Chat with Kryssen on WhatsApp';
  wa.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" fill="#06281a" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span>Chat with Kryssen</span>';
  wa.addEventListener('click', function(){ track('whatsapp_click',{location:'floating',intent:intent,sector:industry||undefined}); });
  body.appendChild(wa);

  /* Sticky mobile CTA bar — pages that set data-ctahref */
  var href=body.dataset.ctahref, txt=body.dataset.ctatext;
  if(href && txt){
    var bar=document.createElement('div');
    bar.className='stickybar'; bar.id='stickybar';
    var a=document.createElement('a');
    a.className='btn'; a.href=href; a.textContent=txt;
    a.addEventListener('click', function(){ track('stickybar_click'); });
    bar.appendChild(a);
    body.appendChild(bar);

    var typing=false;
    document.addEventListener('focusin', function(e){ typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName); sync(); });
    document.addEventListener('focusout', function(){ setTimeout(function(){typing=false; sync();},100); });
    function sync(){
      var show = window.scrollY>400 && !typing;
      bar.classList.toggle('show', show);
    }
    window.addEventListener('scroll', sync, {passive:true});
    sync();
  }
}

/* ---------- Free Visibility Check form ---------- */
function initCheck(){
  var form=document.getElementById('checkForm');
  if(!form)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!stepValid(form))return;
    postForm(form,'visibility_check');
    track('check_submitted');
    var name=(document.getElementById('bizName').value||'').trim();
    document.getElementById('scoreFor').textContent=name?('for '+name):'';
    document.getElementById('checkFormWrap').classList.remove('on');
    document.getElementById('checkDone').classList.add('on');
    window.scrollTo({top:document.getElementById('checkDone').offsetTop-120,behavior:'smooth'});
  });
}

/* ---------- Machine application: 2-step conditional wizard ---------- */
function initApply(){
  var form=document.getElementById('applyForm');
  if(!form)return;
  var step1=document.getElementById('step1'),
      step2=document.getElementById('step2'),
      notYet=document.getElementById('notYet'),
      done=document.getElementById('applyDone'),
      s1=document.getElementById('dot1'),
      s2=document.getElementById('dot2');

  form.addEventListener('submit',function(e){
    e.preventDefault();

    if(step1.style.display!=='none'){
      if(!stepValid(step1))return;
      var have=document.querySelector('input[name=have]:checked');
      if(have && have.value==='notyet'){
        step1.style.display='none';
        notYet.style.display='block';
        s1.classList.remove('on');
        track('apply_not_yet');
        window.scrollTo({top:form.offsetTop-120,behavior:'smooth'});
        return;
      }
      step1.style.display='none';
      step2.style.display='block';
      s1.classList.remove('on');s2.classList.add('on');
      track('apply_step1_done');
      window.scrollTo({top:form.offsetTop-120,behavior:'smooth'});
      return;
    }

    if(!stepValid(step2))return;
    postForm(form,'machine_application');
    var company=(document.getElementById('coName').value||'').trim();
    document.getElementById('doneCo').textContent=company||'your company';
    step2.style.display='none';
    done.style.display='block';
    track('apply_submitted');
    window.scrollTo({top:form.offsetTop-120,behavior:'smooth'});
  });
}

/* ---------- hero rotor: rotating AI platforms with logos ---------- */
function initRotor(){
  var r=document.getElementById('rotor');
  if(!r)return;
  var items=[
    {n:'Google', c:'#5f6368', svg:'<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.3c3.4 0 6.4 1.2 8.8 3.4l6.5-6.5C35.4 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.6 5.9C12.1 13.2 17.6 9.3 24 9.3z"/><path fill="#4285F4" d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.9c-.6 3-2.3 5.5-4.8 7.2l7.4 5.8c4.4-4 7.4-10 7.4-17.5z"/><path fill="#FBBC05" d="M10.2 28.9c-.5-1.5-.8-3.2-.8-4.9s.3-3.4.8-4.9l-7.6-5.9C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l7.6-5.9z"/><path fill="#34A853" d="M24 48c6.1 0 11.3-2 15.5-5.9l-7.4-5.8c-2.1 1.4-4.8 2.3-8.1 2.3-6.4 0-11.9-3.9-13.8-9.7l-7.6 5.9C6.5 42.6 14.6 48 24 48z"/></svg>'},
    {n:'ChatGPT', c:'#111111', img:'assets/rotor-chatgpt.png'},
    {n:'Claude', c:'#d97757', img:'assets/rotor-claude.png'},
    {n:'Perplexity', c:'#202020', img:'assets/rotor-perplexity.png'},
    {n:'Grok', c:'#111111', img:'assets/rotor-grok.png'},
    {n:'DeepSeek', c:'#4d6bfe', img:'assets/rotor-deepseek.png'}
  ];
  var i=0, busy=false;
  function render(it){
    var mark=it.img?'<img src="'+it.img+'" alt="" aria-hidden="true">':it.svg;
    r.innerHTML=mark+'<span style="color:'+it.c+'">'+it.n+'</span>';
  }
  render(items[0]);
  setInterval(function(){
    if(busy)return; busy=true;
    r.classList.add('fade');
    setTimeout(function(){
      i=(i+1)%items.length;
      render(items[i]);
      r.classList.remove('fade');
      busy=false;
    },350);
  },3800);
}

/* ---------- Workshop priority-list form ---------- */
function k2dNonce(){
  if(window.crypto&&window.crypto.randomUUID)return window.crypto.randomUUID().replace(/-/g,'');
  var a=new Uint8Array(16);if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(a);
  return Array.prototype.map.call(a,function(x){return x.toString(16).padStart(2,'0')}).join('')||String(Date.now())+String(Math.random()).replace(/\D/g,'');
}
function initWorkshop(){
  var form=document.getElementById('workshopForm');
  if(!form)return;
  var status=document.getElementById('workshopStatus');
  var turnstileStatus=document.getElementById('workshopTurnstileStatus');
  var token='';var widgetId=null;var draftKey='kryssen-masterclass-draft-v1';
  var params=new URLSearchParams(location.search);
  var websiteInput=form.querySelector('[name="website"]');
  function normalizeWebsite(){var value=websiteInput.value.trim();if(value&&!/^https?:\/\//i.test(value))websiteInput.value='https://'+value}
  websiteInput.addEventListener('blur',normalizeWebsite);
  function set(id,value){var el=document.getElementById(id);if(el)el.value=value||''}
  function cleanUrl(){var u=new URL(location.href);['submission','reference','message','field'].forEach(function(k){u.searchParams.delete(k)});history.replaceState({},'',u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():''))}
  function setupFields(){
    var base=location.origin+location.pathname;
    set('wsSourceUrl',location.href.slice(0,800));set('wsUtmSource',params.get('utm_source')||'');set('wsUtmMedium',params.get('utm_medium')||'');set('wsUtmContent',params.get('utm_content')||'');
    set('wsSuccessUrl',base);set('wsFailureUrl',base);set('wsFormStartedAt',String(Date.now()));set('wsSubmissionNonce',k2dNonce());
  }
  function saveDraft(){var d={};form.querySelectorAll('input,select,textarea').forEach(function(el){if(!el.name||el.type==='hidden'||el.name==='cf-turnstile-response'||el.name==='kryssen_guard_field')return;d[el.name]=el.type==='checkbox'?el.checked:el.value});try{sessionStorage.setItem(draftKey,JSON.stringify(d))}catch(e){}}
  function restoreDraft(){var d=null;try{d=JSON.parse(sessionStorage.getItem(draftKey)||'null')}catch(e){}if(!d)return;form.querySelectorAll('input,select,textarea').forEach(function(el){if(!el.name||!Object.prototype.hasOwnProperty.call(d,el.name))return;if(el.type==='checkbox')el.checked=Boolean(d[el.name]);else el.value=d[el.name]})}
  function clearDraft(){try{sessionStorage.removeItem(draftKey)}catch(e){}}
  function showSuccess(reference){
    var name=(document.getElementById('wsName').value||'').trim();var done=document.getElementById('workshopDone');
    if(name){var who=document.getElementById('wsWho');if(who)who.textContent=', '+name.split(' ')[0]}
    form.hidden=true;if(done){done.hidden=false;var p=done.querySelector('p');if(p)p.textContent='Your priority-list interest was received. This does not confirm a seat or a date. Reference: '+(reference||'Recorded');window.scrollTo({top:done.offsetTop-120,behavior:'smooth'})}
    clearDraft();cleanUrl();track('workshop_priority_list_submitted',{offer:'elg-manifesto-masterclass',reference:reference||'recorded'});
  }
  function handleReturn(){var state=params.get('submission');if(state==='success'){showSuccess(params.get('reference'));return}if(state==='received'){restoreDraft();if(status)status.textContent='Your entry could not be confirmed. Please submit again with browser autofill disabled.';cleanUrl();return}if(state==='failed'){restoreDraft();if(status)status.textContent=params.get('message')||'We could not store your priority-list entry. Review the form and try again.';cleanUrl()}}
  function setupTurnstile(){var started=Date.now();function attempt(){if(window.turnstile&&window.turnstile.render){if(!K2D_CONFIG.TURNSTILE_SITE_KEY){turnstileStatus.textContent='Security is not configured.';return}widgetId=window.turnstile.render('#workshopTurnstile',{sitekey:K2D_CONFIG.TURNSTILE_SITE_KEY,action:K2D_CONFIG.WORKSHOP_TURNSTILE_ACTION||'elg-masterclass',callback:function(v){token=v;turnstileStatus.textContent='Security check complete.'},'expired-callback':function(){token='';turnstileStatus.textContent='Security check expired. Complete it again.'},'error-callback':function(){token='';turnstileStatus.textContent='Security check could not load. Refresh to retry.'}});return}if(Date.now()-started>12000){turnstileStatus.textContent='Security check took too long to load. Refresh to retry.';return}setTimeout(attempt,100)}attempt()}
  setupFields();restoreDraft();setupTurnstile();handleReturn();
  form.addEventListener('focusin',function(){if(!form.dataset.started){form.dataset.started='true';track('workshop_form_started',{offer:'elg-manifesto-masterclass'})}});
  form.addEventListener('submit',function(e){
    e.preventDefault();normalizeWebsite();if(!stepValid(form))return;
    if(form.dataset.requiresEndpoint==='true'&&!K2D_CONFIG.FORM_ENDPOINT){if(status)status.textContent='Submission is not connected. Contact info@kryssengrowth.com.';return}
    if(!token){if(status)status.textContent='Complete the security check before submitting.';return}
    saveDraft();form.action=K2D_CONFIG.FORM_ENDPOINT;form.method='post';var button=form.querySelector('button[type=submit]');if(button){button.disabled=true;button.textContent='Submitting securely…'}track('workshop_submit_started',{offer:'elg-manifesto-masterclass'});form.submit();
  });
}

document.addEventListener('DOMContentLoaded',function(){
  track('page_view');
  injectChrome();
  initCheck();
  initApply();
  initWorkshop();
  initRotor();
  /* site-wide composed entrances */
  var rvEls=[].slice.call(document.querySelectorAll('main section, main .band, main .hero .wrap > *, main .steps, main .form-card'))
    .filter(function(el){ return !el.closest('#system'); });
  if(rvEls.length){
    rvEls.forEach(function(el){ el.classList.add('r-in'); });
    if('IntersectionObserver' in window){
      var ro=new IntersectionObserver(function(es){
        es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('inview'); ro.unobserve(x.target); } });
      },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
      rvEls.forEach(function(el){ ro.observe(el); });
    } else { rvEls.forEach(function(el){ el.classList.add('inview'); }); }
  }
  /* THE SHIFT — scroll-triggered choreography */
  var sys=document.getElementById('system');
  if(sys){
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(x){ if(x.isIntersecting){ sys.classList.add('play'); io.disconnect(); } });
      },{threshold:.05,rootMargin:"0px 0px -60px 0px"});
      io.observe(sys);
    } else { sys.classList.add('play'); }
  }
  /* CTA click tracking via delegation */
  document.addEventListener('click',function(e){
    var t=e.target.closest('.js-apply,.js-sample,.js-cta');
    if(!t)return;
    if(t.classList.contains('js-apply'))track('machine_apply_click');
    if(t.classList.contains('js-sample'))track('sample_scorecard_open');
    if(t.classList.contains('js-cta')){
      var ctaLocation = t.dataset.trackLocation || 'unknown';
      var pageName = document.body.dataset.page || 'unknown';
      var isIndustry = pageName.indexOf('industry-') === 0 || pageName === 'industries';
      var ctaEvent = pageName === 'founders' ? 'founders_cta_click' : (pageName === 'business' ? 'business_cta_click' : (isIndustry ? 'industry_cta_click' : 'hero_cta_click'));
      var ctaContent = pageName === 'founders' ? 'founder-leverage' : (pageName === 'business' ? 'connected-system' : (isIndustry ? 'category-leadership' : 'elg-hero'));
      track(ctaEvent, {location: ctaLocation, content: ctaContent});
      try{ sessionStorage.setItem('kryssen_apply_source', ctaLocation); }catch(err){}
    }
  });
});

/* ---------- v0.18 · comprehension diagnostics ----------
   Fires `section_view` (once per section, >=35% visible) so GA4
   shows WHERE readers stop: drop-off between #system and #days
   means the mechanism isn't landing; between #fee and #closing
   means risk reversal isn't convincing. */
document.addEventListener('DOMContentLoaded', function(){
  if(!('IntersectionObserver' in window)) return;
  var seen = {};
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var id = en.target.id;
      if(seen[id]) return;
      seen[id] = 1;
      track('section_view', {section: id});
      io.unobserve(en.target);
    });
  }, {threshold: 0.35});
  var nodes = document.querySelectorAll('#hero, section[id]');
  for(var i = 0; i < nodes.length; i++) io.observe(nodes[i]);
});

document.addEventListener('click', function(e){
  var a = e.target.closest ? e.target.closest('a') : null;
  if(!a) return;
  var href = a.getAttribute('href') || '';
  var location = a.dataset.trackLocation || 'unknown';
  if(!a.classList.contains('wa-float') && (href.indexOf('wa.me/') === 0 || href.indexOf('https://wa.me/') === 0)) track('whatsapp_click', {location: location, topic: 'education-led-growth'});
  if(a.classList.contains('js-quizhook')) track('quiz_started', {location: location, quiz: 'elg'});
  if(a.classList.contains('js-founder-service')) track('founder_service_click', {service: a.dataset.service || 'unknown', location: 'service-router'});
  if(a.classList.contains('js-business-service')) track('business_service_click', {service: a.dataset.service || 'unknown', location: 'service-router'});
});

/* v0.24 · founder conversion funnel: record each Apply CTA exposure once. */
document.addEventListener('DOMContentLoaded', function(){
  if(document.body.dataset.page !== 'founders' || !('IntersectionObserver' in window)) return;
  var founderCtas = document.querySelectorAll('main .js-cta');
  var founderCtaObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      track('founders_cta_view', {location: entry.target.dataset.trackLocation || 'unknown'});
      founderCtaObserver.unobserve(entry.target);
    });
  }, {threshold:0.65});
  founderCtas.forEach(function(cta){ founderCtaObserver.observe(cta); });
});

/* v0.37 · growing-business opportunity-to-fit-review funnel. */
document.addEventListener('click', function(e){
  var card = e.target.closest ? e.target.closest('.js-business-opportunity') : null;
  if(!card) return;
  var opportunity = card.dataset.opportunity || 'unknown';
  document.querySelectorAll('.js-business-opportunity').forEach(function(item){
    item.setAttribute('aria-pressed', item === card ? 'true' : 'false');
  });
  var apply = document.getElementById('businessOpportunityApply');
  if(apply){
    try{
      var url = new URL(apply.href);
      url.searchParams.set('opportunity', opportunity);
      url.searchParams.set('utm_content', opportunity);
      apply.href = url.toString();
    }catch(err){}
  }
  var choice = document.getElementById('businessOpportunityChoice');
  if(choice){
    var titles = {
      'knowledge-fragmentation':'Shared explanation selected.',
      'sales-education':'Sales and buyer education selected.',
      'commercial-connection':'Commercial connection selected.',
      'market-moment':'Market education selected.'
    };
    choice.textContent = (titles[opportunity] || 'Opportunity selected.') + ' This context will carry into your application.';
  }
  track('business_opportunity_selected', {
    opportunity: opportunity,
    audience: 'growing-business',
    location: 'business-opportunity-selector'
  });
});
document.addEventListener('DOMContentLoaded', function(){
  if(document.body.dataset.page !== 'business' || !('IntersectionObserver' in window)) return;
  var businessCtas = document.querySelectorAll('main .js-cta');
  var businessCtaObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      track('business_cta_view', {location: entry.target.dataset.trackLocation || 'unknown'});
      businessCtaObserver.unobserve(entry.target);
    });
  }, {threshold:0.65});
  businessCtas.forEach(function(cta){ businessCtaObserver.observe(cta); });

  [
    {selector:'#business-opportunities', event:'business_opportunity_view'}
  ].forEach(function(item){
    var node = document.querySelector(item.selector);
    if(!node) return;
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        track(item.event, {location:item.selector.slice(1)});
        observer.disconnect();
      });
    }, {threshold:0.35});
    observer.observe(node);
  });
});

/* v0.40 · sector opportunity, lane and application-context funnel. */
document.addEventListener('click', function(e){
  var opportunityCard = e.target.closest ? e.target.closest('.js-sector-opportunity') : null;
  if(opportunityCard){
    var opportunity = opportunityCard.dataset.opportunity || 'unknown';
    var sector = opportunityCard.dataset.sector || document.body.dataset.industry || 'other';
    document.querySelectorAll('.js-sector-opportunity').forEach(function(item){ item.setAttribute('aria-pressed', item === opportunityCard ? 'true' : 'false'); });
    document.querySelectorAll('a[href*="apply.html"]').forEach(function(apply){
      try{ var url = new URL(apply.href); url.searchParams.set('sector', sector); url.searchParams.set('opportunity', opportunity); if(apply.id === 'sectorOpportunityApply') url.searchParams.set('utm_content', opportunity); apply.href = url.toString(); }catch(err){}
    });
    var choice = document.getElementById('sectorOpportunityChoice');
    if(choice){
      var labels = {'discovery-answers':'Discovery and buyer answers selected.','decision-clarity':'Decision clarity selected.','implementation-adoption':'Implementation and adoption selected.','market-authority':'Market authority selected.'};
      choice.textContent = (labels[opportunity] || 'Opportunity selected.') + ' This context will carry into your application.';
    }
    track('industry_opportunity_selected', {sector:sector, opportunity:opportunity, location:'industry-opportunity-selector'});
    return;
  }
  var laneCard = e.target.closest ? e.target.closest('.js-sector-lane') : null;
  if(!laneCard) return;
  document.querySelectorAll('.js-sector-lane').forEach(function(item){ item.setAttribute('aria-pressed', item === laneCard ? 'true' : 'false'); });
  var title = document.getElementById('sectorLaneTitle');
  var decision = document.getElementById('sectorLaneDecision');
  var assets = document.getElementById('sectorLaneAssets');
  var signal = document.getElementById('sectorLaneSignal');
  if(title) title.textContent = laneCard.textContent.replace(/^\s*\d+\s*/, '').trim();
  if(decision) decision.textContent = laneCard.dataset.decision || '';
  if(assets) assets.textContent = laneCard.dataset.assets || '';
  if(signal) signal.textContent = laneCard.dataset.signal || '';
  document.querySelectorAll('a[href*="apply.html"]').forEach(function(applyLink){
    try{ var applyUrl = new URL(applyLink.href); applyUrl.searchParams.set('lane', laneCard.dataset.lane || ''); applyLink.href = applyUrl.toString(); }catch(err){}
  });
  track('industry_lane_selected', {sector:laneCard.dataset.sector || 'unknown', lane:laneCard.dataset.lane || 'unknown'});
});
document.addEventListener('DOMContentLoaded', function(){
  var page = document.body.dataset.page || '';
  var isIndustryPage = page.indexOf('industry-') === 0 || page === 'industries';
  if(!isIndustryPage || !('IntersectionObserver' in window)) return;
  var sector = document.body.dataset.industry || (page === 'industries' ? 'hub' : page.replace('industry-',''));
  var ctaObserver = new IntersectionObserver(function(entries){ entries.forEach(function(entry){ if(!entry.isIntersecting) return; track('industry_cta_view', {sector:sector, location:entry.target.dataset.trackLocation || 'unknown'}); ctaObserver.unobserve(entry.target); }); }, {threshold:0.65});
  document.querySelectorAll('main .js-cta').forEach(function(cta){ ctaObserver.observe(cta); });
  [{selector:'#industry-opportunities',event:'industry_opportunity_view'},{selector:'#industry-deliverables',event:'industry_deliverables_view'}].forEach(function(item){
    var node = document.querySelector(item.selector); if(!node) return;
    var observer = new IntersectionObserver(function(entries){ entries.forEach(function(entry){ if(!entry.isIntersecting) return; track(item.event,{sector:sector}); observer.disconnect(); }); },{threshold:0.35});
    observer.observe(node);
  });
});

/* v0.28 · testimonial measurement; placeholders never enter analytics. */
document.addEventListener('DOMContentLoaded', function(){
  if(document.body.dataset.page !== 'home' || !('IntersectionObserver' in window)) return;
  var quotes = document.querySelectorAll('.hp-testimonial:not([data-placeholder="true"])');
  var quoteObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      track('testimonial_view', {testimonial_id: entry.target.dataset.testimonialId || 'unknown', placement:'home-proof'});
      quoteObserver.unobserve(entry.target);
    });
  }, {threshold:0.6});
  quotes.forEach(function(quote){ quoteObserver.observe(quote); });
});
document.addEventListener('click', function(e){
  var link = e.target.closest ? e.target.closest('.js-testimonial-case') : null;
  if(!link) return;
  track('testimonial_case_click', {testimonial_id: link.dataset.testimonialId || 'unknown', placement:'home-proof'});
});

/* v0.22 · hero funnel: record meaningful CTA exposure once. */
document.addEventListener('DOMContentLoaded', function(){
  var cta = document.querySelector('#hero .js-cta');
  if(!cta) return;
  if(!('IntersectionObserver' in window)){
    track('hero_cta_view', {location:'hero', content:'elg-hero'});
    return;
  }
  var ctaObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      track('hero_cta_view', {location:'hero', content:'elg-hero'});
      ctaObserver.disconnect();
    });
  }, {threshold:0.65});
  ctaObserver.observe(cta);
});

/* v0.33 · Founder opportunity-to-fit-review funnel. */
document.addEventListener('click', function(e){
  var link = e.target.closest ? e.target.closest('.js-founder-opportunity') : null;
  if(!link) return;
  var opportunity = link.dataset.opportunity || 'unknown';
  document.querySelectorAll('.js-founder-opportunity').forEach(function(item){
    item.setAttribute('aria-pressed', item === link ? 'true' : 'false');
  });
  var apply = document.getElementById('founderOpportunityApply');
  if(apply){
    try{
      var url = new URL(apply.href);
      url.searchParams.set('opportunity', opportunity);
      url.searchParams.set('utm_content', opportunity);
      apply.href = url.toString();
    }catch(err){}
  }
  var choice = document.getElementById('founderOpportunityChoice');
  if(choice){
    var titles = {
      'founder-dependency':'Buyer education and founder leverage selected.',
      'executive-visibility':'Executive visibility selected.',
      'market-moment':'Market education selected.',
      'continued-operation':'Continued ELG operation selected.'
    };
    choice.textContent = (titles[opportunity] || 'Opportunity selected.') + ' This context will carry into your application.';
  }
  track('founder_opportunity_selected', {
    opportunity: opportunity,
    location: 'founder-opportunity-selector'
  });
});
document.addEventListener('DOMContentLoaded', function(){
  if(document.body.dataset.page !== 'founders' || !('IntersectionObserver' in window)) return;
  var targets = [
    {selector:'#founder-opportunities', event:'founder_opportunity_view'}
  ];
  targets.forEach(function(item){
    var node = document.querySelector(item.selector);
    if(!node) return;
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        track(item.event, {location:item.selector.slice(1)});
        observer.disconnect();
      });
    }, {threshold:0.35});
    observer.observe(node);
  });
});
