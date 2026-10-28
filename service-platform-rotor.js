(function(){
  'use strict';
  var rotor=document.getElementById('servicePlatformRotor');
  if(!rotor)return;
  var platforms=[
    {name:'Google'},
    {name:'ChatGPT'},
    {name:'Perplexity'},
    {name:'Claude'}
  ];
  var index=0;
  function draw(item){
    rotor.innerHTML='<strong>'+item.name+'</strong>';
    rotor.setAttribute('aria-label',item.name);
  }
  draw(platforms[0]);
  if(!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
    window.setInterval(function(){
      rotor.classList.add('is-changing');
      window.setTimeout(function(){
        index=(index+1)%platforms.length;
        draw(platforms[index]);
        rotor.classList.remove('is-changing');
      },220);
    },3000);
  }
}());
