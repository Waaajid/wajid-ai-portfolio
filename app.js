'use strict';
const canvas=document.querySelector('#system'),ctx=canvas.getContext('2d');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,angle=.4,paused=reduced.matches,hoverX=0,hoverY=0,active=true,lastTime=0;
const motion=document.querySelector('#motion');
function motionText(){motion.textContent=paused?'RESUME MOTION ▷':'PAUSE MOTION Ⅱ';motion.setAttribute('aria-pressed',String(paused));}motionText();
motion.addEventListener('click',()=>{paused=!paused;motionText();});
reduced.addEventListener('change',e=>{paused=e.matches;motionText();});
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
new ResizeObserver(resize).observe(canvas);
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();hoverX=(e.clientX-r.left)/r.width-.5;hoverY=(e.clientY-r.top)/r.height-.5;});canvas.addEventListener('pointerleave',()=>{hoverX=hoverY=0;});
new IntersectionObserver(([e])=>{active=e.isIntersecting;},{threshold:0}).observe(canvas);
const points=[];const count=230;for(let i=0;i<count;i++){const y=1-i/(count-1)*2,r=Math.sqrt(1-y*y),theta=i*Math.PI*(3-Math.sqrt(5));points.push([Math.cos(theta)*r,y,Math.sin(theta)*r]);}
const edges=[];for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){const p=points[i],q=points[j];if((p[0]-q[0])**2+(p[1]-q[1])**2+(p[2]-q[2])**2<.105)edges.push([i,j]);}
function project(p,rotation){const a=rotation+hoverX*.35,b=-.26+hoverY*.25;const x=p[0]*Math.cos(a)+p[2]*Math.sin(a),z=-p[0]*Math.sin(a)+p[2]*Math.cos(a),y=p[1]*Math.cos(b)-z*Math.sin(b),z2=p[1]*Math.sin(b)+z*Math.cos(b);const scale=Math.min(width*.30,height*.31),perspective=3.8/(3.8+z2);return{x:width*.51+x*scale*perspective,y:height*.49+y*scale*perspective,z:z2,s:perspective};}
function draw(time){requestAnimationFrame(draw);if(!active||!ctx)return;const delta=Math.min((time-lastTime)||16,40);lastTime=time;if(!paused)angle+=delta*.000065;ctx.clearRect(0,0,width,height);const coords=points.map(p=>project(p,angle));
for(let ring=0;ring<3;ring++){ctx.beginPath();for(let i=0;i<=160;i++){const t=i/160*Math.PI*2;let p=ring===0?[Math.cos(t)*1.45,Math.sin(t)*.37,Math.sin(t)*1.23]:ring===1?[Math.cos(t)*.5,Math.sin(t)*1.3,Math.cos(t)*1.25]:[Math.cos(t)*1.22,Math.sin(t)*1.1,Math.cos(t)*.5];const q=project(p,angle*.6);if(i===0)ctx.moveTo(q.x,q.y);else ctx.lineTo(q.x,q.y);}ctx.strokeStyle=ring===0?'rgba(136,249,192,.36)':'rgba(255,255,255,.15)';ctx.lineWidth=.7;ctx.stroke();}
for(const [i,j] of edges){const a=coords[i],b=coords[j],opacity=Math.max(.045,(1-(a.z+b.z)/4)*.25);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(255,255,255,${opacity})`;ctx.lineWidth=.65;ctx.stroke();}
coords.sort((a,b)=>b.z-a.z).forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.5,p.s*1.2),0,Math.PI*2);ctx.fillStyle=`rgba(136,249,192,${.3+(1-p.z)*.24})`;ctx.fill();});
for(let i=0;i<5;i++){const t=angle*.7+i*Math.PI*.4,p=project([Math.cos(t)*1.45,Math.sin(t)*.37,Math.sin(t)*1.23],angle*.6);ctx.fillStyle='#01010D';ctx.strokeStyle='#88F9C0';ctx.lineWidth=.8;ctx.beginPath();ctx.rect(p.x-5*p.s,p.y-5*p.s,10*p.s,10*p.s);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fillStyle='#88F9C0';ctx.fill();}}
requestAnimationFrame(draw);
const layers={context:{number:'01',diagram:'RELEVANT CONTEXT',title:'Give the model what matters.',description:'A persona, a conversation and a task need different context. I work on what to include, what to retain, and how to keep the response relevant as the interaction grows.',question:'What does the system need to know right now?'},orchestration:{number:'02',diagram:'MODELS + TOOLS + STATE',title:'Make the pieces work together.',description:'A useful workflow may need text, images, voice and external tools. My work involves defining how those capabilities fit together, what each step needs, and what the user sees along the way.',question:'What should happen next, and why?'},guardrails:{number:'03',diagram:'CHECKS + LIMITS + FEEDBACK',title:'Define what good looks like.',description:'A convincing demo is only a start. I work on quality checks, usage limits and failure behaviour so we can assess the output and make sensible trade-offs between quality, cost and experience.',question:'How will we know this is good enough to ship?'}};
const tabs=[...document.querySelectorAll('[data-layer]')];
function selectLayer(tab){tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});const l=layers[tab.dataset.layer];document.querySelector('#layer-panel').setAttribute('aria-labelledby',tab.id);document.querySelector('#layer-number').textContent=l.number;document.querySelector('#diagram-centre').textContent=l.diagram;document.querySelector('#layer-title').textContent=l.title;document.querySelector('#layer-description').textContent=l.description;document.querySelector('#layer-question span').textContent=l.question;}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectLayer(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectLayer(tabs[n]);tabs[n].focus();}});});
const projects={
  "authoring": {
    "meta": "01 / AGENTIC WORKFLOWS",
    "title": "Turn intent into a useful workflow.",
    "sections": [
      [
        "The problem",
        "A model response is only one step. A useful product needs to understand the task, choose the right capability and return something the user can review."
      ],
      [
        "The system design",
        "Define specialist agent responsibilities, model routing, input context and output schemas. Make the contract between each step explicit so engineering can implement and test it."
      ],
      [
        "The product decisions",
        "Decide where autonomy is useful, when a user should review an action, and how failure is communicated. Consider the full path to a usable result rather than the quality of a single response."
      ],
      [
        "What I work on",
        "Requirements, routing logic, structured outputs, quality checks and iteration with engineering."
      ]
    ]
  },
  "agents": {
    "meta": "02 / CONTEXT & STATE",
    "title": "Consistent behaviour needs a system.",
    "sections": [
      [
        "The problem",
        "Long conversations need more than a static prompt. Relevant information changes, state evolves, and previous decisions may need to persist."
      ],
      [
        "The system design",
        "Define explicit state models, data structures and response logic. Separate durable information from task context and transient conversation detail."
      ],
      [
        "The trade-offs",
        "More context can improve relevance but increases cost and introduces stale or conflicting information. Define what should be retained, updated or excluded."
      ],
      [
        "What I work on",
        "State models, context selection, engineering contracts and testable behaviour across extended interactions."
      ]
    ]
  },
  "reliability": {
    "meta": "03 / QUALITY, RELEASES & AI ECONOMICS",
    "title": "Make quality and cost product decisions.",
    "sections": [
      [
        "THE PRODUCT PROBLEM",
        "A successful demo does not establish production quality. AI outputs can fail, conversations can become expensive and text, images and audio consume different resources."
      ],
      [
        "MY OWNERSHIP",
        "I set business acceptance criteria and release quality gates, including evaluation sets for accuracy, bias and failure modes, versioned prompts and strict JSON-schema output contracts. I also work on usage economics and model-selection decisions."
      ],
      [
        "HOW I MAKE DECISIONS",
        "I use evaluation results, customer feedback, usage patterns and performance testing to prioritise changes and weigh quality, latency, operating cost and user experience."
      ],
      [
        "THE ECONOMIC DETAIL",
        "I have worked with token-based LLM usage, image-generation counts and generated audio minutes. The relevant usage unit depends on the feature and the experience it supports."
      ]
    ]
  },
  "product": {
    "meta": "EXPERTISE / PRODUCT STRATEGY & DELIVERY",
    "title": "Find the problem. Own the path to launch.",
    "sections": [
      [
        "What I do",
        "Connect discovery, roadmap prioritisation, requirements, success criteria and release decisions. Work closely with engineering to turn an ambiguous problem into a clear product scope."
      ],
      [
        "The decision work",
        "Translate customer evidence into priorities. Define what the first release must prove, what can wait and how feedback should shape the next iteration."
      ],
      [
        "The technical bridge",
        "Make system behaviour explicit through workflow diagrams, data contracts, acceptance criteria and failure cases."
      ]
    ]
  },
  "orchestration": {
    "meta": "EXPERTISE / LLMs & AGENT ORCHESTRATION",
    "title": "Design the workflow around the model.",
    "sections": [
      [
        "WHAT I DO",
        "Define model routing, specialist-agent responsibilities, tool contracts, input and output schemas, and the hand-offs between steps in an AI workflow."
      ],
      [
        "Technical focus",
        "Context-aware routing to specialist agents and models, with reusable MCP, A2A and API integrations for shared capabilities."
      ],
      [
        "THE DECISION WORK",
        "Work out which capability each task needs, the context and permissions it requires, and how the workflow should respond when a step fails. Balance quality, latency and cost."
      ],
      [
        "WHAT THIS DEMONSTRATES",
        "Technical product judgement and the ability to turn an AI capability into an engineering contract and a usable workflow."
      ]
    ]
  },
  "context": {
    "meta": "EXPERTISE / CONTEXT ENGINEERING",
    "title": "Decide what the system needs to know.",
    "sections": [
      [
        "WHAT I DO",
        "Define how user intent, scenario context, persona information and structured state should inform a response. Use explicit data structures and schemas to make behaviour easier to reason about."
      ],
      [
        "Technical focus",
        "Context-aware routing, structured state, appraisal and response logic. Define what information each step requires and how it changes through the workflow."
      ],
      [
        "THE DECISION WORK",
        "Separate information that should persist from information needed only for the current task. Consider relevance, consistency and the cost of growing conversations."
      ],
      [
        "WHAT THIS DEMONSTRATES",
        "System thinking beyond prompt wording: context selection, state design, engineering interfaces and testable behaviour."
      ]
    ]
  },
  "evaluation": {
    "meta": "EXPERTISE / EVALUATION & GUARDRAILS",
    "title": "Define a quality bar before release.",
    "sections": [
      [
        "WHAT I DO",
        "Set business acceptance criteria, version prompts, define strict JSON-schema output contracts and run evaluation sets for accuracy, bias and failure modes."
      ],
      [
        "Technical focus",
        "Business acceptance testing and LLM evaluation, using accuracy, bias and failure cases to inform release decisions."
      ],
      [
        "THE DECISION WORK",
        "Use evaluation and performance evidence alongside customer feedback to identify failure patterns, prioritise fixes and decide when a feature is ready to ship."
      ],
      [
        "WHAT THIS DEMONSTRATES",
        "An evidence-based approach to AI quality. Guardrails reduce specific failure modes; they are not a promise that a model cannot fail."
      ]
    ]
  },
  "multimodal": {
    "meta": "EXPERTISE / MULTIMODAL AI & ECONOMICS",
    "title": "One experience. Several AI capabilities.",
    "sections": [
      [
        "WHAT I DO",
        "Work across LLM text, generated images and synthetic voice, defining how those capabilities fit into the user workflow and how their usage should be measured."
      ],
      [
        "Technical focus",
        "Content generation workflows, voice and image model choices, and usage controls across tokens, image counts and audio minutes."
      ],
      [
        "THE DECISION WORK",
        "Assess quality, latency and cost for the actual use case. Account for long conversations, retries and image remixes when understanding consumption and defining limits."
      ]
    ]
  },
  "responsible": {
    "meta": "EXPERTISE / RESPONSIBLE AI & RISK",
    "title": "Turn risk into product requirements.",
    "sections": [
      [
        "MY PRACTICAL FOCUS",
        "Bias evaluation, failure-mode testing, structured output contracts, usage controls and release acceptance criteria. These make responsible AI considerations part of day-to-day product decisions."
      ],
      [
        "Technical focus",
        "Evaluation sets for accuracy, bias and failure modes, versioned prompts, strict JSON schemas and business acceptance checks."
      ],
      [
        "HOW I APPROACH COMPLIANCE",
        "Treat privacy, permitted data use and misuse concerns as requirements to clarify with the right engineering, security and legal stakeholders. Translate agreed constraints into product behaviour and acceptance checks."
      ],
      [
        "Working with specialists",
        "Partner with engineering, security and legal stakeholders to define and review controls. Keep product requirements traceable to the risks they address."
      ]
    ]
  }
};
const dialog=document.querySelector('#project-dialog');let opener;
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{opener=button;const p=projects[button.dataset.project];document.querySelector('#dialog-meta').textContent=p.meta;document.querySelector('#dialog-title').textContent=p.title;const content=document.querySelector('#dialog-content');content.replaceChildren(...p.sections.map(([title,body])=>{const s=document.createElement('section'),h=document.createElement('h3'),paragraph=document.createElement('p');h.textContent=title;paragraph.textContent=body;s.append(h,paragraph);return s;}));dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');}));
document.querySelectorAll('.dialog-close,.dialog-done').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});document.querySelector('#year').textContent=new Date().getFullYear();

// Reveal only when supported; all content remains readable without JavaScript.
const revealTargets=document.querySelectorAll('.project,.section-heading,.thinking-grid,.about-grid');
if(!reduced.matches&&'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.08});
 revealTargets.forEach(el=>{el.classList.add('reveal');observer.observe(el);});
 const statement=document.querySelector('.statement-copy');
 statement.innerHTML=statement.innerHTML.split(/(<br>)/).map(part=>part==='<br>'?part:part.trim().split(/\s+/).map(word=>'<span>'+word+'</span>').join(' ')).join('');
 const words=[...statement.querySelectorAll('span')];
 const wordObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('lit');wordObserver.unobserve(entry.target);}}),{rootMargin:'0px 0px -12% 0px'});
 words.forEach((word,i)=>{word.style.transitionDelay=(i*45)+'ms';wordObserver.observe(word);});
}
const navigation=[...document.querySelectorAll('nav a')];
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)navigation.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}),{rootMargin:'-15% 0px -55% 0px'});
navigation.forEach(link=>{const target=document.querySelector(link.hash);if(target)sectionObserver.observe(target);});

sectionObserver.observe(document.querySelector("#home"));
