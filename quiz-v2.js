(function(){
'use strict';
var PHONE='2348158357418';
var questions=[
  {
    label:'Start here',emoji:'🔎',context:'Think about what normally happens—not what should happen.',
    question:'A serious buyer needs something your company provides. What is most likely to happen?',
    options:[
      {path:'visibility',icon:'🌍',title:'They may not discover us in the first place',desc:'Our useful expertise is not consistently visible when people search or ask AI tools.',insight:'Buyers cannot learn from expertise they never discover. The useful answer may need a stronger public home.'},
      {path:'clarity',icon:'💬',title:'They find us but contact us to ask basic questions',desc:'The conversation begins with information the website should probably provide.',insight:'Repeated basic questions are useful content signals. The answer may need a permanent place in the customer journey.'},
      {path:'decision',icon:'⚖️',title:'They understand the product but struggle to compare it',desc:'They need help judging fit, difference, evidence or risk.',insight:'Product information explains what exists. Decision content helps a buyer understand the trade-offs.'},
      {path:'person',icon:'🗣️',title:'They need someone from the company to explain everything',desc:'The strongest explanation depends on the founder, salesperson or another experienced team member.',insight:'The company may have the knowledge already. The buyer journey may not own it yet.'},
      {path:'customer',icon:'🧭',title:'They buy but still need considerable help afterwards',desc:'Onboarding, implementation or effective use requires repeated explanation.',insight:'Education does not end at the sale. Unanswered questions can slow progress after the decision too.'}
    ]
  },
  {
    label:'What buyers say',emoji:'💭',context:'Choose the sentence that would concern you most.',
    question:'Which sentence would concern you most?',
    options:[
      {path:'visibility',icon:'🔍',title:'“I searched for this, but your company never appeared.”',desc:'',insight:'If an important answer is not clearly published, search engines and AI tools have less useful material to retrieve, interpret or reference.'},
      {path:'clarity',icon:'❓',title:'“I found you, but I still don’t understand exactly what you do.”',desc:'',insight:'Being visible and being understood are different jobs. Discovery only helps when the explanation is clear.'},
      {path:'decision',icon:'🤔',title:'“I understand the product, but I can’t see why I should choose it.”',desc:'',insight:'A buyer can understand a product and still lack the evidence or comparison needed to make a decision.'},
      {path:'person',icon:'☎️',title:'“I need someone to walk me through all of this.”',desc:'',insight:'A call should add judgment—not repeatedly rebuild information the buyer could have learned earlier.'},
      {path:'customer',icon:'🛠️',title:'“We bought it, but we’re still unsure how to get the full value.”',desc:'',insight:'Customer questions can reveal missing education just as clearly as sales questions do.'}
    ]
  },
  {
    label:'Where the answer lives',emoji:'🗂️',context:'The company may know more than its public content shows.',
    question:'Where does your clearest expertise currently live?',
    options:[
      {path:'neutral',icon:'🏠',title:'On useful website pages that buyers can discover',desc:'The strongest answers have a clear public home.',insight:'Publishing is the beginning. The next question is whether the content answers what buyers are actually trying to learn.'},
      {path:'visibility',icon:'📚',title:'Across social posts, PDFs, presentations and old documents',desc:'Useful ideas exist, but they are spread across different places.',insight:'Useful ideas can exist publicly and still be difficult to discover when they are scattered across posts, PDFs and disconnected pages.'},
      {path:'person',icon:'👥',title:'With sales, product, support or another internal team',desc:'The answers appear when the right colleague becomes involved.',insight:'Internal expertise does not become discoverable until it is turned into clear, useful customer material.'},
      {path:'person',icon:'🧠',title:'Mostly in the founder’s or leadership team’s head',desc:'The strongest explanation usually appears in a conversation.',insight:'Founder dependence can be a content problem in disguise: the answer exists, but access to it does not scale.'},
      {path:'visibility',icon:'📝',title:'It has not been clearly published yet',desc:'The expertise exists, but customers cannot reliably access it.',insight:'Search engines and AI tools can only work with what the company makes available in a clear, usable form.'}
    ]
  },
  {
    label:'What should become easier',emoji:'✨',context:'Choose the change that would matter most.',
    question:'If one thing became easier for buyers, which would matter most?',
    options:[
      {path:'visibility',icon:'🌐',title:'Discovering the company through search and AI tools',desc:'Being present when the right person starts researching.',insight:'Useful visibility begins with publishing answers that match real buyer questions—not with producing more generic content.'},
      {path:'clarity',icon:'💡',title:'Finding a clear answer after they reach the website',desc:'Understanding the product, service and next step.',insight:'Clear content reduces the distance between arriving on a page and understanding why it matters.'},
      {path:'decision',icon:'✅',title:'Understanding why the company is different',desc:'Evaluating fit, alternatives, evidence and risk.',insight:'The best decision content helps buyers think—not merely agree with a claim.'},
      {path:'person',icon:'🤝',title:'Feeling confident without needing every answer live',desc:'Using content for the basics and people for judgment.',insight:'Good education does not replace the human conversation. It makes the conversation more useful.'},
      {path:'customer',icon:'🚀',title:'Getting value after they become a customer',desc:'Improving onboarding, implementation, use or self-service.',insight:'Customer education can connect the promise made before purchase with the experience delivered afterwards.'}
    ]
  }
];
var results={
  visibility:{
    slug:'discovery-visibility',emoji:'🔎',title:'Your useful expertise may not be visible when buyers begin looking.',
    summary:'Your choices suggest that the company may know important things buyers need, but those answers are not consistently available when people search on Google or ask tools such as ChatGPT, Perplexity and Claude.',
    interesting:'A visibility problem can sometimes look like a demand problem. The right people may be looking for an answer, but the company has not published enough useful material for them—or the systems they use—to find and understand it.',
    actionTitle:'Try a simple discovery exercise.',
    action:'Write down five questions a serious buyer may ask before choosing your product or service. Search each question on Google, then ask ChatGPT, Perplexity or Claude. Look at the answers and sources that appear.',
    prompt:'Does your company publish a page that deserves to be found, understood and used as a source?',
    extra:'<strong>Look for:</strong><ul><li>Whether the company appears</li><li>Whether the description is accurate</li><li>Whether your own answer is specific and useful</li><li>Whether the answer includes evidence others can check</li></ul><p>This is a research exercise, not a visibility score or audit. Results vary by query, location, account, system and time.</p>',
    content:['Search-informed buyer-question pages','Product, service and category explainers','Comparison and decision pages','Evidence-backed expert articles'],
    commercial:'Better public answers can support pipeline by helping the right people discover the company, understand what it sells and arrive at a conversation with more context. Visibility alone is not the goal.',
    invitation:'Want to make the useful answers easier to find?'
  },
  clarity:{
    slug:'answer-clarity',emoji:'💡',title:'Your buyers may need a clearer answer earlier.',
    summary:'Your choices suggest that people may be doing too much work to understand what the company sells, who it is for or what they should do next.',
    interesting:'When buyers repeatedly ask a basic question, the problem may not be awareness. The answer may simply be missing, scattered or difficult to understand.',
    actionTitle:'Read the website as if you had never heard of the company.',
    action:'Start with the homepage and the most important product or service page. Do not fill in missing context from memory.',
    prompt:'Can a first-time visitor explain what the company sells, who it helps and why they should continue within one minute?',
    extra:'',
    content:['Clearer product or service pages','Buyer-question articles','Website FAQs','Search-ready explainers'],
    commercial:'Clearer answers can help relevant buyers understand the business before they contact the company, making the next conversation more informed.',
    invitation:'Want to make the important answer clearer?'
  },
  decision:{
    slug:'decision-clarity',emoji:'⚖️',title:'Buyers may understand the product without understanding the decision.',
    summary:'Your choices suggest that people can recognise what the company sells but still need help comparing fit, alternatives, evidence, cost or risk.',
    interesting:'More product information does not always make a decision easier. Buyers often need help understanding the trade-offs.',
    actionTitle:'Listen to the explanation that appears after “Why should we choose this?”',
    action:'Review recent sales conversations, proposals or follow-up messages. Find the explanation your strongest salesperson gives when a serious buyer starts comparing options.',
    prompt:'Is that explanation available before the buyer has to ask someone for it?',
    extra:'',
    content:['Comparison pages','Decision and suitability guides','Evidence pages','Sales follow-up education'],
    commercial:'Decision content can help buyers evaluate fit and prepare internal conversations without turning every early question into another sales meeting.',
    invitation:'Want to make the buying decision easier to understand?'
  },
  person:{
    slug:'knowledge-access',emoji:'🗣️',title:'Your strongest explanation may still depend on someone being in the room.',
    summary:'Your choices suggest that useful knowledge exists, but buyers may only receive it after reaching the founder, salesperson or another experienced team member.',
    interesting:'The company may not have a knowledge problem. It may have a knowledge-access problem.',
    actionTitle:'Find the explanations the business repeatedly rebuilds.',
    action:'Write down the five questions leadership, sales or another experienced team member answers most often during serious customer conversations.',
    prompt:'If your strongest explainer was unavailable for one week, which buyer questions would become difficult to answer well?',
    extra:'',
    content:['Founder or executive explanations','Sales education','Buyer guides','Website decision pages and LinkedIn content'],
    commercial:'Turning repeated explanations into useful customer education can preserve human judgment for the conversations where it adds the most value.',
    invitation:'Want to make the strongest explanations easier to access?'
  },
  customer:{
    slug:'customer-learning',emoji:'🧭',title:'The customer may still be learning after the sale.',
    summary:'Your choices suggest that understanding the product is only the beginning. Customers may need clearer support for onboarding, implementation, use or self-service.',
    interesting:'Education is not only an acquisition tool. The same unanswered questions that slow a sale can also slow adoption after purchase.',
    actionTitle:'Look at the first questions customers ask after buying.',
    action:'Review onboarding calls, support messages and implementation conversations. Find the questions that appear repeatedly during the first stage of the customer relationship.',
    prompt:'Which customer question could have been answered before—or immediately after—the decision?',
    extra:'',
    content:['Onboarding content','Implementation guides','Customer learning material','Support and journey FAQs'],
    commercial:'Clearer customer learning can support onboarding, implementation and self-service by making important answers available when customers need them.',
    invitation:'Want to extend education beyond the sale?'
  }
};
var state={step:0,answers:[]};
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return Array.prototype.slice.call(document.querySelectorAll(sel))}
function track(name,data){if(typeof window.kryssenTrack==='function')return window.kryssenTrack(name,Object.assign({page:'quiz-v2'},data||{}));return false}
function escapeText(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function renderProgress(){var h='';for(var i=0;i<questions.length;i++)h+='<i class="'+(i<state.step?'done':i===state.step?'current':'')+'"></i>';qs('#progressTrack').innerHTML=h}
function renderQuestion(){
  var q=questions[state.step],selected=state.answers[state.step];
  qs('#stepCount').textContent=state.step+1;qs('#questionEmoji').textContent=q.emoji;qs('#questionLabel').textContent=q.label;qs('#questionContext').textContent=q.context;qs('#questionText').textContent=q.question;
  qs('#answerList').innerHTML=q.options.map(function(o,i){return '<button type="button" class="answer'+(selected===i?' selected':'')+'" data-answer="'+i+'" aria-pressed="'+(selected===i?'true':'false')+'"><span class="answer-icon" aria-hidden="true">'+o.icon+'</span><span><b>'+escapeText(o.title)+'</b>'+(o.desc?'<small>'+escapeText(o.desc)+'</small>':'')+'</span><em aria-hidden="true">✓</em></button>'}).join('');
  var insight=qs('#answerInsight');if(typeof selected==='number'){qs('#insightText').textContent=q.options[selected].insight;insight.hidden=false}else insight.hidden=true;
  qs('#continueButton').disabled=typeof selected!=='number';qs('#continueButton').innerHTML=state.step===questions.length-1?'Show me what this may mean <span aria-hidden="true">→</span>':'Next question <span aria-hidden="true">→</span>';
  renderProgress();track('quiz_step_view',{step:state.step+1,label:q.label});
}
function chooseResult(){
  var scores={visibility:0,clarity:0,decision:0,person:0,customer:0};
  state.answers.forEach(function(answer,i){var path=questions[i].options[answer].path;if(scores[path]!==undefined)scores[path]++});
  var preferred=questions[3].options[state.answers[3]].path;var winner=preferred;
  Object.keys(scores).forEach(function(path){if(scores[path]>scores[winner])winner=path});
  return winner;
}
function resultReasons(path){
  var matches=[];state.answers.forEach(function(answer,i){var option=questions[i].options[answer];if(option.path===path)matches.push(option.title)});
  if(matches.length<2){state.answers.forEach(function(answer,i){var title=questions[i].options[answer].title;if(matches.indexOf(title)===-1&&matches.length<2)matches.push(title)})}
  return matches.slice(0,2).map(function(x){return '“'+x+'”'}).join(' and ')+'.';
}
function showResult(){
  var path=chooseResult(),r=results[path];qs('#quizStage').hidden=true;qs('#quizResult').hidden=false;
  qs('#resultEmoji').textContent=r.emoji;qs('#resultTitle').textContent=r.title;qs('#resultSummary').textContent=r.summary;qs('#resultWhy').textContent='Your choices included '+resultReasons(path);
  qs('#resultInteresting').textContent=r.interesting;qs('#resultActionTitle').textContent=r.actionTitle;qs('#resultAction').textContent=r.action;qs('#resultPrompt').textContent=r.prompt;
  var extra=qs('#resultExtra');if(r.extra){extra.innerHTML=r.extra;extra.hidden=false}else{extra.innerHTML='';extra.hidden=true}
  qs('#resultContentList').innerHTML=r.content.map(function(x){return '<li>'+escapeText(x)+'</li>'}).join('');qs('#resultCommercial').textContent=r.commercial;qs('#resultInvitation').textContent=r.invitation;
  var apply=new URL('apply.html',location.href);apply.searchParams.set('opportunity',r.slug);apply.searchParams.set('utm_source','quiz');apply.searchParams.set('utm_medium','result');apply.searchParams.set('utm_content',r.slug);qs('#bookConversation').href=apply.toString();
  var msg='Hi Kryssen — I completed the buyer understanding quiz. My result was: '+r.title+' I would like to explore what this means for our content.';qs('#quizWhatsApp').href='https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg);
  qs('#quizResult').focus();window.scrollTo({top:0,behavior:'smooth'});track('quiz_completed',{result:path,opportunity:r.slug});track('quiz_result_view',{result:path});
}
function moveToQuestion(){var stage=qs('#quizStage'),heading=qs('#questionText');stage.scrollIntoView({behavior:'smooth',block:'start'});if(heading&&heading.focus){try{heading.focus({preventScroll:true})}catch(e){heading.focus()}}}
function startQuiz(){state={step:0,answers:[]};qs('#quizIntro').hidden=true;qs('#quizResult').hidden=true;qs('#quizStage').hidden=false;renderQuestion();moveToQuestion();track('quiz_started')}
qs('#startQuiz').addEventListener('click',startQuiz);
qs('#answerList').addEventListener('click',function(e){var button=e.target.closest('.answer');if(!button)return;state.answers[state.step]=Number(button.dataset.answer);renderQuestion();track('quiz_answer_selected',{step:state.step+1,path:questions[state.step].options[state.answers[state.step]].path})});
qs('#continueButton').addEventListener('click',function(){if(typeof state.answers[state.step]!=='number')return;if(state.step<questions.length-1){state.step++;renderQuestion();moveToQuestion()}else showResult()});
qs('#backButton').addEventListener('click',function(){if(state.step===0){qs('#quizStage').hidden=true;qs('#quizIntro').hidden=false;window.scrollTo({top:0,behavior:'smooth'});track('quiz_back_to_intro')}else{state.step--;renderQuestion();moveToQuestion();track('quiz_back',{step:state.step+1})}});
qs('#retakeQuiz').addEventListener('click',function(){track('quiz_retake');startQuiz()});
qs('#bookConversation').addEventListener('click',function(){track('quiz_apply_click',{result:chooseResult()})});
qs('#quizWhatsApp').addEventListener('click',function(){track('quiz_whatsapp_click',{result:chooseResult()})});
track('quiz_view');
})();
