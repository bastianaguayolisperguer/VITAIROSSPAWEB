(function(){
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.getElementById('siteHeader');
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var year = document.getElementById('year');
  if(year) year.textContent = String(new Date().getFullYear());

  /* Header, mobile navigation and legal dialogs */
  function closeMenu(restoreFocus){
    if(!hamburger || !mobileMenu) return;
    hamburger.setAttribute('aria-expanded','false');
    hamburger.setAttribute('aria-label','Abrir menú');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden','true');
    document.body.classList.remove('menu-open');
    if(restoreFocus) hamburger.focus();
  }
  function openMenu(){
    if(!hamburger || !mobileMenu) return;
    hamburger.setAttribute('aria-expanded','true');
    hamburger.setAttribute('aria-label','Cerrar menú');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden','false');
    document.body.classList.add('menu-open');
    var firstLink = mobileMenu.querySelector('a');
    if(firstLink) firstLink.focus();
  }
  if(hamburger){
    hamburger.addEventListener('click',function(){
      if(hamburger.getAttribute('aria-expanded') === 'true') closeMenu(false); else openMenu();
    });
  }
  if(mobileMenu){ mobileMenu.querySelectorAll('a').forEach(function(link){ link.addEventListener('click',function(){ closeMenu(false); }); }); }

  var openModalName = null;
  var modalReturnFocus = null;
  function closeModal(name){
    var modal = document.getElementById('modal-'+name);
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
    openModalName = null;
    if(modalReturnFocus) modalReturnFocus.focus();
  }
  document.querySelectorAll('[data-modal-open]').forEach(function(button){
    button.addEventListener('click',function(){
      var name = button.getAttribute('data-modal-open');
      var modal = document.getElementById('modal-'+name);
      if(!modal) return;
      modalReturnFocus = button;
      openModalName = name;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.classList.add('modal-open');
      var close = modal.querySelector('[data-modal-close]');
      if(close) close.focus();
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(function(button){
    button.addEventListener('click',function(){ closeModal(button.getAttribute('data-modal-close')); });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(modal){
    modal.addEventListener('click',function(event){ if(event.target === modal) closeModal(modal.id.replace('modal-','')); });
  });
  document.addEventListener('keydown',function(event){
    if(event.key !== 'Escape') return;
    if(openModalName) closeModal(openModalName); else if(hamburger && hamburger.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  var desktopMenu = window.matchMedia('(min-width: 1101px)');
  function syncResponsiveMenu(event){ if(event.matches) closeMenu(false); }
  if(desktopMenu.addEventListener) desktopMenu.addEventListener('change',syncResponsiveMenu);

  var chromeFrame = 0;
  var scrollProgress = document.getElementById('scrollProgress');
  function updateChrome(){
    chromeFrame = 0;
    if(header) header.classList.toggle('is-scrolled',window.scrollY > 32);
    if(scrollProgress){
      var maximum = Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      scrollProgress.style.transform = 'scaleX('+Math.max(0,Math.min(1,window.scrollY/maximum))+')';
    }
  }
  function scheduleChrome(){ if(!chromeFrame) chromeFrame = requestAnimationFrame(updateChrome); }
  window.addEventListener('scroll',scheduleChrome,{passive:true});
  window.addEventListener('resize',scheduleChrome,{passive:true});
  updateChrome();

  /* Brand sphere: canvas network, pointer response, connected project nodes */
  (function(){
    var canvas = document.getElementById('vitairos-geo');
    var sphereWrap = document.getElementById('hbSphereWrap');
    if(!canvas || !sphereWrap || prefersReducedMotion){ sphereWrap && sphereWrap.classList.add('fallback-only'); return; }
    var ctx = canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(!ctx){ sphereWrap.classList.add('fallback-only'); return; }

    function norm(v){ var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); return [v[0]/l,v[1]/l,v[2]/l]; }
    function mid(a,b){ return norm([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); }
    function rotX(v,a){ var c=Math.cos(a),s=Math.sin(a); return [v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]; }
    function rotY(v,a){ var c=Math.cos(a),s=Math.sin(a); return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]; }

    var phi=(1+Math.sqrt(5))/2;
    var verts=[[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]].map(norm);
    var faces=[[0,1,8],[0,8,4],[0,4,5],[0,5,9],[0,9,1],[1,6,8],[8,6,10],[8,10,4],[4,10,2],[4,2,5],[5,2,11],[5,11,9],[9,11,7],[9,7,1],[1,7,6],[3,6,7],[3,7,11],[3,11,2],[3,2,10],[3,10,6]];
    function subdivide(vs,fs){
      var next=[],cache={};
      function midpoint(i,j){ var key=Math.min(i,j)+'_'+Math.max(i,j); if(cache[key]!==undefined) return cache[key]; var index=vs.length;vs.push(mid(vs[i],vs[j]));cache[key]=index;return index; }
      fs.forEach(function(face){ var a=face[0],b=face[1],c=face[2],ab=midpoint(a,b),bc=midpoint(b,c),ac=midpoint(a,c);next.push([a,ab,ac],[b,bc,ab],[c,ac,bc],[ab,bc,ac]); });
      return {verts:vs,faces:next};
    }
    var geo=subdivide(verts.slice(),faces.slice());geo=subdivide(geo.verts,geo.faces);verts=geo.verts;faces=geo.faces;
    var edgeMap={},edges=[];
    faces.forEach(function(face){ [[face[0],face[1]],[face[1],face[2]],[face[0],face[2]]].forEach(function(edge){ var key=Math.min(edge[0],edge[1])+'_'+Math.max(edge[0],edge[1]);if(!edgeMap[key]){edgeMap[key]=true;edges.push(edge);} }); });

    var projectLinks=Array.prototype.slice.call(sphereWrap.querySelectorAll('.orbit-project'));
    var projectVertices=[4,8,1,9];
    var angleY=0,angleX=.24,targetX=.24,targetY=0,pointerInside=false,activeProject=-1;
    var cssW=520,cssH=520,raf=0,isDocumentVisible=true,isStoryVisible=true,resizeFrame=0;
    function resize(){
      var ratio=Math.min(window.devicePixelRatio||1,1.5);var rect=canvas.getBoundingClientRect();cssW=Math.max(220,Math.round(rect.width));cssH=Math.max(220,Math.round(rect.height));canvas.width=Math.round(cssW*ratio);canvas.height=Math.round(cssH*ratio);canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';
    }
    function draw(){
      var ratio=Math.min(window.devicePixelRatio||1,1.5);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,cssW,cssH);
      angleX+=(targetX-angleX)*.035;angleY+=(targetY-angleY)*.035;if(!pointerInside) targetY+=activeProject>=0?.0007:.0024;
      var cx=cssW/2,cy=cssH/2,radius=Math.min(cssW,cssH)*.37;
      var rotated=verts.map(function(vertex){return rotY(rotX(vertex,angleX),angleY);});
      var projected=rotated.map(function(vertex){var perspective=1+vertex[2]*.07;return [cx+vertex[0]*radius*perspective,cy-vertex[1]*radius*perspective];});
      var ordered=edges.map(function(edge){return {edge:edge,z:(rotated[edge[0]][2]+rotated[edge[1]][2])/2};}).sort(function(a,b){return a.z-b.z;});

      projectLinks.forEach(function(link,index){var vertex=projectVertices[index],depth=(rotated[vertex][2]+1)/2;link.style.left=projected[vertex][0]+'px';link.style.top=projected[vertex][1]+'px';link.style.setProperty('--node-scale',(.78+depth*.28).toFixed(3));link.style.setProperty('--node-opacity',(.42+depth*.58).toFixed(3));link.style.zIndex=String(5+Math.round(depth*10));link.classList.toggle('is-behind',rotated[vertex][2]<-.2);});
      ordered.forEach(function(item){var a=item.edge[0],b=item.edge[1],depth=(item.z+1)/2;if(depth<.08)return;var connected=activeProject>=0&&(a===projectVertices[activeProject]||b===projectVertices[activeProject]);ctx.beginPath();ctx.moveTo(projected[a][0],projected[a][1]);ctx.lineTo(projected[b][0],projected[b][1]);ctx.strokeStyle=connected?'rgba(106,215,176,.9)':(item.z>0?'rgba(23,166,115,'+(.07+depth*.34)+')':'rgba(28,102,177,'+(.03+depth*.17)+')');ctx.lineWidth=connected?1.8:.8;ctx.stroke();});
      rotated.forEach(function(vertex,index){if(vertex[2]<-.08)return;var depth=(vertex[2]+1)/2,x=projected[index][0],y=projected[index][1],special=projectVertices.indexOf(index)>=0,size=special?3.8+depth*3:1+depth*1.5;var glow=ctx.createRadialGradient(x,y,0,x,y,size*4);glow.addColorStop(0,'rgba(106,215,176,'+(depth*.8)+')');glow.addColorStop(1,'rgba(106,215,176,0)');ctx.beginPath();ctx.arc(x,y,size*4,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fillStyle=special?'rgba(106,215,176,'+depth+')':'rgba(23,166,115,'+(depth*.72)+')';ctx.fill();});
      sphereWrap.classList.add('canvas-ready');sphereWrap.classList.remove('show-fallback');
    }
    function loop(){if(!(isDocumentVisible&&isStoryVisible)){raf=0;return;}draw();raf=requestAnimationFrame(loop);}
    function ensureLoop(){if(!raf&&isDocumentVisible&&isStoryVisible)raf=requestAnimationFrame(loop);}
    function scheduleResize(){if(resizeFrame)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(function(){resize();draw();});}
    sphereWrap.addEventListener('pointerenter',function(){pointerInside=true;});
    sphereWrap.addEventListener('pointermove',function(event){var rect=sphereWrap.getBoundingClientRect();var x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;targetX=.24-y*.34;targetY=angleY+x*.42;});
    sphereWrap.addEventListener('pointerleave',function(){pointerInside=false;activeProject=-1;projectLinks.forEach(function(link){link.classList.remove('is-active');});});
    projectLinks.forEach(function(link,index){['pointerenter','focus'].forEach(function(type){link.addEventListener(type,function(){activeProject=index;pointerInside=true;link.classList.add('is-active');});});['pointerleave','blur'].forEach(function(type){link.addEventListener(type,function(){activeProject=-1;pointerInside=false;link.classList.remove('is-active');});});});
    window.addEventListener('resize',scheduleResize,{passive:true});
    document.addEventListener('visibilitychange',function(){isDocumentVisible=!document.hidden;ensureLoop();});
    if('ResizeObserver' in window)new ResizeObserver(scheduleResize).observe(sphereWrap);
    var hero=document.getElementById('inicio'),breach=document.getElementById('brecha');
    if('IntersectionObserver' in window&&hero){var visibleMap=new Map();var visibilityObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){visibleMap.set(entry.target,entry.isIntersecting);});isStoryVisible=Array.from(visibleMap.values()).some(Boolean);ensureLoop();},{threshold:.01});visibilityObserver.observe(hero);visibleMap.set(hero,true);if(breach){visibilityObserver.observe(breach);visibleMap.set(breach,false);}}
    resize();draw();ensureLoop();
  })();

  /* Sphere continuity into the breach */
  (function(){
    var sphere=document.getElementById('hbSphereWrap'),hero=document.getElementById('inicio'),breach=document.getElementById('brecha');
    if(!sphere||!hero||!breach)return;var frame=0;
    function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
    function update(){frame=0;if(window.innerWidth<=1100||prefersReducedMotion){sphere.classList.remove('is-story-active','is-story-past');sphere.style.removeProperty('--sphere-opacity');return;}
      var heroBottom=hero.offsetTop+hero.offsetHeight;var start=hero.offsetTop+hero.offsetHeight*.38;var end=breach.offsetTop+breach.offsetHeight*.68;var y=window.scrollY;var active=y>start&&y<end;var passed=y>=end;sphere.classList.toggle('is-story-active',active);sphere.classList.toggle('is-story-past',passed);var progress=clamp((y-start)/Math.max(1,end-start),0,1);sphere.style.setProperty('--sphere-opacity',active?String(1-clamp((progress-.65)/.35,0,.82)):'1');}
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});update();
  })();

  /* Value stage */
  var valueData={
    process:{signal:'Intervención / 01',title:'Simplificar antes de automatizar.',description:'Mapeamos la fricción, reducimos pasos y automatizamos solo lo que debe repetirse.',result:'Resultado posible · simplificación / automatización'},
    information:{signal:'Intervención / 02',title:'Dar estructura al contexto.',description:'Conectamos datos y documentos para que la información conserve origen, contexto y trazabilidad.',result:'Resultado posible · estructura / contexto / trazabilidad'},
    decisions:{signal:'Intervención / 03',title:'Hacer utilizable la información.',description:'Diseñamos una capa de apoyo que acerca la información relevante a la decisión, sin reemplazar el criterio humano.',result:'Resultado posible · mejor soporte para decidir'},
    product:{signal:'Intervención / 04',title:'Integrar inteligencia en la experiencia.',description:'Incorporamos IA dentro de un producto digital con un propósito, un flujo y controles definidos.',result:'Resultado posible · IA integrada en una experiencia útil'}
  };
  var valueExperience=document.querySelector('.value-experience');
  function activateValue(key){
    if(!valueExperience||!valueData[key])return;valueExperience.dataset.valueActive=key;valueExperience.querySelectorAll('.value-option').forEach(function(button){var active=button.dataset.value===key;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
    document.getElementById('valueSignal').textContent=valueData[key].signal;document.getElementById('valueTitle').textContent=valueData[key].title;document.getElementById('valueDescription').textContent=valueData[key].description;document.getElementById('valueResult').textContent=valueData[key].result;
  }
  if(valueExperience)valueExperience.querySelectorAll('.value-option').forEach(function(button){['mouseenter','focus','click'].forEach(function(type){button.addEventListener(type,function(){activateValue(button.dataset.value);});});});

  /* Method network grows with scroll */
  (function(){
    var network=document.getElementById('methodNetwork');if(!network)return;var nodes=Array.prototype.slice.call(network.querySelectorAll('.method-node')),frame=0;
    function update(){frame=0;var rect=network.getBoundingClientRect();var entry=window.innerHeight*.75;var progress=Math.max(0,Math.min(1,(entry-rect.top)/Math.max(rect.height*.72,1)));network.style.setProperty('--method-progress',String(progress));var activeCount=Math.max(1,Math.ceil(progress*nodes.length));nodes.forEach(function(node,index){node.classList.toggle('is-active',index<activeCount);});}
    function schedule(){if(!frame)frame=requestAnimationFrame(update);}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});update();
  })();

  /* Ecosystem as one reactive instrument */
  var ecosystemData={
    m:{sector:'Salud digital',name:'VITAIROS-M',labels:['Persona','Contexto','Profesional','Continuidad'],copy:'Continuidad entre la persona y la atención profesional.'},
    industrial:{sector:'Industria y minería',name:'Industrial AI',labels:['Documentos','Datos','Operación','Trazabilidad'],copy:'Información operacional conectada con trazabilidad.'},
    agro:{sector:'Agricultura',name:'Agro Intelligence',labels:['Datos','Operación','Territorio','Decisión'],copy:'Datos del territorio convertidos en soporte para decidir.'},
    conecta:{sector:'Educación',name:'VITAIROS Conecta',labels:['Personas','Conocimiento','Red','Oportunidad'],copy:'Personas y conocimiento conectados con oportunidades.'}
  };
  var ecosystem=document.getElementById('ecosystemExperience');
  function activateEcosystem(key){
    if(!ecosystem||!ecosystemData[key])return;var data=ecosystemData[key];ecosystem.dataset.activeProject=key;ecosystem.querySelectorAll('.ecosystem-item').forEach(function(item){var active=item.dataset.ecosystemItem===key;item.classList.toggle('is-active',active);item.querySelector('button').setAttribute('aria-expanded',String(active));});
    document.getElementById('ecosystemPreviewSector').textContent=data.sector;document.getElementById('ecosystemPreviewName').textContent=data.name;document.getElementById('ecosystemPreviewCopy').textContent=data.copy;['A','B','C','D'].forEach(function(letter,index){document.getElementById('ecosystemLabel'+letter).textContent=data.labels[index];});
  }
  if(ecosystem)ecosystem.querySelectorAll('.ecosystem-item').forEach(function(item){var button=item.querySelector('button');['mouseenter','focusin'].forEach(function(type){item.addEventListener(type,function(){activateEcosystem(item.dataset.ecosystemItem);});});button.addEventListener('click',function(){activateEcosystem(item.dataset.ecosystemItem);if(window.innerWidth<=820)document.getElementById('ecosystemPreview').scrollIntoView({behavior:prefersReducedMotion?'auto':'smooth',block:'nearest'});});});

  /* Evidence: only two verified stories, rendered without weak photography */
  function buildNewsCard(item){
    var card=document.createElement('a');card.className='news-card';card.href=item.link;card.setAttribute('data-analytics-event','news_click');if(/^https?:\/\//.test(item.link)){card.target='_blank';card.rel='noopener noreferrer';}
    var visual=document.createElement('span');visual.className='news-card__visual';visual.setAttribute('aria-hidden','true');
    var body=document.createElement('span');body.className='news-card__body';var meta=document.createElement('span');meta.className='news-card__meta';var category=document.createElement('span');category.textContent=item.category;var date=document.createElement('time');date.dateTime=item.dateISO||'';date.textContent=item.date;meta.append(category,date);
    var title=document.createElement('h3');title.textContent=item.title;var summary=document.createElement('p');summary.textContent=item.summary;var link=document.createElement('span');link.className='news-card__link';link.textContent=item.linkLabel||'Ver evidencia ↗';body.append(meta,title,summary,link);card.append(visual,body);return card;
  }
  var newsSection=document.querySelector('[data-news-section]'),newsGrid=document.getElementById('newsGrid');
  if(newsSection&&newsGrid){fetch('/data/news.json',{credentials:'same-origin'}).then(function(response){if(!response.ok)throw new Error('news');return response.json();}).then(function(items){var verified=Array.isArray(items)?items.filter(function(item){return item&&item.verified===true&&item.link;}).slice(0,2):[];if(!verified.length)return;verified.forEach(function(item){newsGrid.appendChild(buildNewsCard(item));});newsSection.hidden=false;}).catch(function(){newsSection.hidden=true;});}

  /* Guided qualification, editable and keyboard-native */
  (function(){
    var form=document.getElementById('diagnosticForm');if(!form)return;var steps=Array.prototype.slice.call(form.querySelectorAll('.diagnostic-step'));var current=1;var label=document.getElementById('diagnosticStepLabel'),bar=document.getElementById('diagnosticProgressBar');
    function showStep(step,moveFocus){current=Math.max(1,Math.min(steps.length,step));steps.forEach(function(fieldset,index){var active=index===current-1;fieldset.hidden=!active;fieldset.classList.toggle('is-active',active);});if(label)label.textContent='Paso '+current+' de '+steps.length;if(bar)bar.style.width=(current/steps.length*100)+'%';if(moveFocus){var legend=steps[current-1].querySelector('legend');if(legend){legend.setAttribute('tabindex','-1');legend.focus();}}}
    function validateCurrent(){var invalid=steps[current-1].querySelector(':invalid');if(invalid){invalid.reportValidity();invalid.focus();return false;}return true;}
    form.querySelectorAll('[data-next-step]').forEach(function(button){button.addEventListener('click',function(){if(validateCurrent())showStep(current+1,true);});});form.querySelectorAll('[data-previous-step]').forEach(function(button){button.addEventListener('click',function(){showStep(current-1,true);});});
    var started=false;form.addEventListener('focusin',function(){if(started)return;started=true;document.dispatchEvent(new CustomEvent('vitairos:analytics',{detail:{event:'diagnostic_start'}}));});form.addEventListener('submit',function(){document.dispatchEvent(new CustomEvent('vitairos:analytics',{detail:{event:'diagnostic_submit'}}));});showStep(1,false);
    var params=new URLSearchParams(window.location.search);if(params.get('sent')==='1'){form.hidden=true;var thanks=document.getElementById('gracias');if(thanks){thanks.style.display='block';setTimeout(function(){thanks.focus();},50);}}
  })();

  /* Progressive reveal with robust fallback */
  if('IntersectionObserver' in window&&!prefersReducedMotion){
    var revealItems=document.querySelectorAll('.section-intro,.value-experience,.capability-note,.method-shell,.ecosystem-experience,.news-card,.principles-grid li,.about-note,.diagnostic-intro,.diagnostic-card');
    var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -3% 0px'});
    revealItems.forEach(function(element,index){element.classList.add('reveal');element.style.setProperty('--reveal-delay',Math.min(index%3,2)*70+'ms');revealObserver.observe(element);});
    function revealVisibleItems(){revealItems.forEach(function(element){var rect=element.getBoundingClientRect();if(rect.top<window.innerHeight*.98&&rect.bottom>0)element.classList.add('is-visible');});}
    window.addEventListener('scroll',revealVisibleItems,{passive:true});requestAnimationFrame(revealVisibleItems);setTimeout(function(){revealItems.forEach(function(element){element.classList.add('is-visible');});},1800);
  }

  document.addEventListener('click',function(event){var target=event.target.closest('[data-analytics-event]');if(!target||target.tagName==='FORM')return;document.dispatchEvent(new CustomEvent('vitairos:analytics',{detail:{event:target.getAttribute('data-analytics-event'),label:target.getAttribute('data-project')||target.textContent.trim().slice(0,80)}}));});

  /* Intro is shown once per browsing session and resolves into the already-rendered hero */
  (function(){
    var loader=document.getElementById('introLoader'),seen=false;try{seen=sessionStorage.getItem('vitairos_intro_seen')==='1';}catch(error){seen=false;}
    function hide(){if(!loader)return;loader.classList.add('is-hidden');document.body.classList.remove('loader-active');setTimeout(function(){if(loader&&loader.parentNode)loader.parentNode.removeChild(loader);},760);}
    if(prefersReducedMotion||seen){hide();return;}document.body.classList.add('loader-active');try{sessionStorage.setItem('vitairos_intro_seen','1');}catch(error){}
    window.addEventListener('load',function(){setTimeout(hide,1450);},{once:true});setTimeout(hide,1850);
  })();
})();
