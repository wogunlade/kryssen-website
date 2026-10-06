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
    /* Do not request GTM until the visitor accepts an optional category. */
    if(consent.analytics||consent.marketing)loadGTM();
    if(consent.analytics)track('page_view',{consent_state:'granted'});
  }

  function installConsentStyles(){
    if(document.querySelector('[data-kryssen-consent-styles]'))return;
    var style=document.createElement('style');
    style.dataset.kryssenConsentStyles='';
    style.textContent='\
[data-consent-layer].consent{position:fixed;z-index:10000;inset:auto 18px 18px;display:flex;justify-content:center;pointer-events:none}\
.consent-box{display:flex;align-items:center;justify-content:space-between;gap:24px;width:min(100%,920px);padding:18px 20px;background:#071611;color:#fff;border:1px solid rgba(255,255,255,.2);border-top:4px solid #c85236;box-shadow:0 22px 60px rgba(7,22,17,.3);pointer-events:auto}\
.consent-box p{margin:0;color:#d4ded9;font:500 12px/1.55 Inter,Arial,sans-serif}\
.consent-box p a{color:#bbe182;text-underline-offset:4px}\
.consent-box>span{display:flex;align-items:center;gap:9px;flex:none}\
.consent-box button{min-height:42px;padding:0 17px;border:1px solid #c85236;background:#c85236;color:#fff;font:800 10px/1 Inter,Arial,sans-serif;cursor:pointer}\
.consent-box button:hover{background:#a9442d;border-color:#a9442d}\
.consent-box button.ghost{background:transparent;border-color:rgba(255,255,255,.45);color:#fff}\
.consent-box button.ghost:hover{background:#fff;color:#0e231e;border-color:#fff}\
.consent-box button:focus-visible,.privacy-settings:focus-visible{outline:3px solid #bbe182;outline-offset:3px}\
.privacy-settings{position:fixed;z-index:9998;right:14px;bottom:14px;min-height:35px;padding:0 12px;border:1px solid rgba(255,255,255,.35);background:#0e231e;color:#fff;font:800 9px/1 Inter,Arial,sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 24px rgba(7,22,17,.2)}\
.privacy-settings:hover{background:#c85236;border-color:#c85236}\
.consent-open .privacy-settings{display:none}\
@media(max-width:640px){[data-consent-layer].consent{inset:auto 10px 10px}.consent-box{align-items:stretch;flex-direction:column;gap:15px;padding:17px}.consent-box>span{width:100%}.consent-box button{flex:1}.privacy-settings{right:10px;bottom:10px}}';
    document.head.appendChild(style);
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
    installConsentStyles();
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

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initConsent);
  else initConsent();
})();
