/* Kryssen consent and measurement layer · aligned to the live GTM setup */
(function(){
  'use strict';
  var GTM_ID='GTM-NGKZZ88T';
  var CONSENT_KEY='kryssen-consent-v1';
  var consent={analytics:false,marketing:false,decided:false};
  var pageViewSent=false;
  var conversionEvents=['form_submit','generate_lead','call_booked'];

  window.dataLayer=window.dataLayer||[];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('consent','default',{
    analytics_storage:'denied',
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied',
    wait_for_update:500
  });

  function loadGTM(){
    if(!/^GTM-[A-Z0-9]+$/i.test(GTM_ID)||document.querySelector('[data-kryssen-gtm]'))return;
    window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
    var script=document.createElement('script');
    script.async=true;
    script.dataset.kryssenGtm='';
    script.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(GTM_ID);
    document.head.appendChild(script);
  }

  function cleanPayload(payload){
    var clean={};
    Object.keys(payload||{}).forEach(function(key){
      var value=payload[key];
      if(value!==undefined&&value!==null&&value!=='')clean[key]=value;
    });
    return clean;
  }

  function track(name,payload){
    if(!name)return false;
    if(name==='page_view'&&pageViewSent)return false;
    if(conversionEvents.indexOf(name)===-1&&!consent.analytics)return false;
    var event=Object.assign({event:name,page:(document.body&&document.body.dataset.page)||'unknown'},cleanPayload(payload));
    window.dataLayer.push(event);
    if(name==='page_view')pageViewSent=true;
    return true;
  }
  window.kryssenTrack=track;
  window.KryssenAnalytics={track:track,getConsent:function(){return Object.assign({},consent);}};

  function applyConsent(choice){
    consent={analytics:Boolean(choice.analytics),marketing:Boolean(choice.marketing),decided:true};
    gtag('consent','update',{
      analytics_storage:consent.analytics?'granted':'denied',
      ad_storage:consent.marketing?'granted':'denied',
      ad_user_data:consent.marketing?'granted':'denied',
      ad_personalization:consent.marketing?'granted':'denied'
    });
    window.dataLayer.push({
      event:'kryssen_consent_update',
      consent_analytics:consent.analytics?'granted':'denied',
      consent_marketing:consent.marketing?'granted':'denied'
    });
    if(consent.analytics)track('page_view',{consent_state:'granted'});
  }

  function addSettingsButton(open){
    if(document.querySelector('[data-privacy-settings]'))return;
    var button=document.createElement('button');
    button.type='button';
    button.className='privacy-settings';
    button.dataset.privacySettings='';
    button.textContent='Cookies';
    button.addEventListener('click',open);
    document.body.appendChild(button);
  }

  function initConsent(){
    var saved=null;
    try{saved=JSON.parse(localStorage.getItem(CONSENT_KEY)||'null');}catch(e){saved=null;}

    function showPanel(current,isSettings){
      var existing=document.querySelector('[data-consent-layer]');
      if(existing)existing.remove();
      var bar=document.createElement('div');
      bar.className='consent';
      bar.dataset.consentLayer='';
      bar.setAttribute('aria-label','Cookie consent');
      bar.innerHTML='<div class="consent-box"><p>We use optional analytics only with your permission. <a href="privacy.html">Privacy policy</a></p><span><button class="btn ghost" data-consent-reject type="button">Decline</button><button class="btn" data-consent-accept type="button">Accept</button></span></div>';
      document.body.appendChild(bar);
      document.body.classList.add('consent-open');
      function save(choice){
        try{localStorage.setItem(CONSENT_KEY,JSON.stringify(Object.assign({},choice,{recordedAt:new Date().toISOString()})));}catch(e){}
        bar.remove();
        document.body.classList.remove('consent-open');
        applyConsent(choice);
        addSettingsButton(function(){showPanel(choice,true);});
        document.dispatchEvent(new CustomEvent('kryssen:consent-ready'));
      }
      bar.querySelector('[data-consent-reject]').addEventListener('click',function(){save({analytics:false,marketing:false});});
      bar.querySelector('[data-consent-accept]').addEventListener('click',function(){save({analytics:true,marketing:true});});
    }

    if(saved&&typeof saved.analytics==='boolean'&&typeof saved.marketing==='boolean'){
      applyConsent(saved);
      addSettingsButton(function(){showPanel(saved,true);});
    }else{
      showPanel({analytics:false,marketing:false},false);
    }
  }

  loadGTM();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initConsent);
  else initConsent();
})();
