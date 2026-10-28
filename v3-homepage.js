(function(){
  'use strict';

  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var capabilityRotor=document.getElementById('heroCapabilityRotor');
  if(capabilityRotor&&!reduceMotion){
    var capabilities=['content marketing','PR & Storytelling','product marketing','growth strategy'];
    var capabilityIndex=0;
    window.setInterval(function(){
      capabilityRotor.classList.add('is-leaving');
      window.setTimeout(function(){
        capabilityIndex=(capabilityIndex+1)%capabilities.length;
        capabilityRotor.textContent=capabilities[capabilityIndex];
        capabilityRotor.classList.remove('is-leaving');
        capabilityRotor.classList.add('is-entering');
        window.requestAnimationFrame(function(){
          window.requestAnimationFrame(function(){capabilityRotor.classList.remove('is-entering');});
        });
      },300);
    },3600);
  }

  var rotor=document.getElementById('v3Rotor');
  if(rotor){
    var googleMark='<span class="platform-mark google-mark" aria-hidden="true">G</span>';
    var sources=[
      {name:'Google',mark:googleMark},
      {name:'ChatGPT',image:'assets/rotor-chatgpt.png'},
      {name:'Perplexity',image:'assets/rotor-perplexity.png'},
      {name:'Grok',image:'assets/rotor-grok.png'},
      {name:'Claude',image:'assets/rotor-claude.png'}
    ];
    var index=0;
    function draw(item){
      var mark=item.image?'<img src="'+item.image+'" alt="" aria-hidden="true">':item.mark;
      rotor.innerHTML=mark+'<strong>'+item.name+'</strong>';
      rotor.setAttribute('aria-label',item.name);
    }
    draw(sources[0]);
    if(!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
      window.setInterval(function(){
        rotor.classList.add('changing');
        window.setTimeout(function(){
          index=(index+1)%sources.length;
          draw(sources[index]);
          rotor.classList.remove('changing');
        },300);
      },3800);
    }
  }

  function track(name,payload){
    if(typeof window.kryssenTrack==='function')window.kryssenTrack(name,payload||{});
  }

  document.querySelectorAll('.expandable-scopes details').forEach(function(scope){
    scope.addEventListener('toggle',function(){
      if(scope.open){
        var heading=scope.querySelector('h3');
        track('v3_scope_open',{scope_name:heading?heading.textContent.trim():'unknown'});
      }
    });
  });

  document.querySelectorAll('a[href]').forEach(function(link){
    link.addEventListener('click',function(){
      var href=link.getAttribute('href')||'';
      var label=link.textContent.replace(/\s+/g,' ').trim();
      if(href.indexOf('apply.html')!==-1){
        var query=href.split('?')[1]||'';
        var params=new URLSearchParams(query.replace(/&amp;/g,'&'));
        var medium=params.get('utm_medium')||'unknown';
        var content=params.get('utm_content')||'unknown';
        if(label.indexOf('Talk to us')!==-1){
          track('v3_primary_cta_click',{cta_location:medium,cta_content:content});
        }else if(medium==='service-card'){
          track('v3_service_route_click',{service_route:content,cta_label:label});
        }else if(medium==='product-journey'){
          track('v3_product_journey_cta_click',{service_route:content,cta_label:label});
        }else if(medium==='ways-to-work'||medium==='engagement-option'){
          track('v3_engagement_format_click',{engagement_format:content,cta_label:label});
        }
      }else if(href.indexOf('industry-')!==-1){
        track('v3_industry_click',{destination:href.split('?')[0],cta_label:label});
      }else if(href.indexOf('manifesto.html')!==-1){
        track('v3_manifesto_click',{cta_label:label});
      }else if(href.indexOf('linkedin.com')!==-1){
        track('v3_linkedin_click',{cta_label:label});
      }else if(href.indexOf('wa.me')!==-1){
        track('v3_whatsapp_click',{cta_label:label});
      }
    });
  });

  document.querySelectorAll('.mobile-menu a[href^="#"]').forEach(function(link){
    link.addEventListener('click',function(){
      var menu=link.closest('details');
      if(menu)menu.open=false;
    });
  });
}());

(function(){
  'use strict';
  document.querySelectorAll('[data-testimonial-slider]').forEach(function(slider){
    var track=slider.querySelector('.testimonial-track');
    var slides=Array.prototype.slice.call(slider.querySelectorAll('.testimonial-slide'));
    var dotGroup=slider.querySelector('.testimonial-dots');
    var dots=slides.map(function(slide,i){
      var dot=document.createElement('button');
      dot.type='button';
      dot.setAttribute('aria-label','Show testimonial '+(i+1));
      dotGroup.appendChild(dot);
      return dot;
    });
    var status=slider.querySelector('.testimonial-status');
    var index=0;
    var touchStartX=0;
    function show(next){
      index=(next+slides.length)%slides.length;
      track.style.transform='translate3d(-'+(index*100)+'%,0,0)';
      slides.forEach(function(slide,i){slide.setAttribute('aria-hidden',i===index?'false':'true');});
      dots.forEach(function(dot,i){
        dot.classList.toggle('is-active',i===index);
        if(i===index)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');
      });
      status.textContent=(index+1)+' / '+slides.length;
    }
    slider.querySelector('.testimonial-prev').addEventListener('click',function(){show(index-1);});
    slider.querySelector('.testimonial-next').addEventListener('click',function(){show(index+1);});
    dots.forEach(function(dot,i){dot.addEventListener('click',function(){show(i);});});
    slider.addEventListener('keydown',function(event){
      if(event.key==='ArrowLeft')show(index-1);
      if(event.key==='ArrowRight')show(index+1);
    });
    slider.addEventListener('touchstart',function(event){touchStartX=event.changedTouches[0].clientX;},{passive:true});
    slider.addEventListener('touchend',function(event){
      var distance=event.changedTouches[0].clientX-touchStartX;
      if(Math.abs(distance)>45)show(distance>0?index-1:index+1);
    },{passive:true});
    show(0);
  });
}());
