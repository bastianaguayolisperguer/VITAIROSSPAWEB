(function(){
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function whenVisible(element,task){if(!element||!('IntersectionObserver' in window)){task();return;}var observer=new IntersectionObserver(function(entries){if(entries.some(function(entry){return entry.isIntersecting;})){observer.disconnect();task();}},{threshold:.001});observer.observe(element);}
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
      if(close) window.requestAnimationFrame(function(){window.requestAnimationFrame(function(){close.focus({preventScroll:true});});});
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(function(button){
    button.addEventListener('click',function(){ closeModal(button.getAttribute('data-modal-close')); });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(modal){
    modal.addEventListener('click',function(event){ if(event.target === modal) closeModal(modal.id.replace('modal-','')); });
  });
  document.addEventListener('keydown',function(event){
    if(event.key === 'Tab' && openModalName){
      var openModal = document.getElementById('modal-'+openModalName);
      var focusable = openModal ? Array.prototype.slice.call(openModal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(function(item){return item.offsetParent!==null;}) : [];
      if(focusable.length){var first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
      return;
    }
    if(event.key !== 'Escape') return;
    if(openModalName) closeModal(openModalName); else if(hamburger && hamburger.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  var desktopMenu = window.matchMedia('(min-width: 1100px)');
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
    function initializeSphere(){
    if(sphereWrap.dataset.canvasInitialized==='true')return;sphereWrap.dataset.canvasInitialized='true';
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
    var operationalRoutes=[[4,8],[8,1],[1,9],[9,5],[5,2],[2,10]];

    var projectLinks=Array.prototype.slice.call(sphereWrap.querySelectorAll('.orbit-project'));
    var projectVertices=[4,8,1,9];
    var angleY=0,angleX=.24,targetX=.24,targetY=0,pointerInside=false,activeProject=-1,signalClock=0;
    var cssW=520,cssH=520,raf=0,isDocumentVisible=true,isStoryVisible=true,resizeFrame=0,lastFrame=0;
    function resize(){
      var ratio=window.innerWidth<=767?1:Math.min(window.devicePixelRatio||1,1.5);var rect=canvas.getBoundingClientRect();cssW=Math.max(220,Math.round(rect.width));cssH=Math.max(220,Math.round(rect.height));canvas.width=Math.round(cssW*ratio);canvas.height=Math.round(cssH*ratio);canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';
    }
    function draw(){
      var isMobile=window.innerWidth<=767,ratio=isMobile?1:Math.min(window.devicePixelRatio||1,1.5),motionStep=isMobile?2:1;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,cssW,cssH);
      angleX+=(targetX-angleX)*.035*motionStep;angleY+=(targetY-angleY)*.035*motionStep;if(!pointerInside) targetY+=(activeProject>=0?.00055:.00165)*motionStep;
      var profile=isMobile?{edgeStep:3,nodeStep:3,routeCount:2,radius:.31}:window.innerWidth<=1199?{edgeStep:2,nodeStep:2,routeCount:3,radius:.345}:{edgeStep:1,nodeStep:1,routeCount:5,radius:.37};
      var cx=cssW/2,cy=cssH/2,radius=Math.min(cssW,cssH)*profile.radius;
      var rotated=verts.map(function(vertex){return rotY(rotX(vertex,angleX),angleY);});
      var projected=rotated.map(function(vertex){var perspective=1+vertex[2]*.07;return [cx+vertex[0]*radius*perspective,cy-vertex[1]*radius*perspective];});
      var ordered=edges.map(function(edge){return {edge:edge,z:(rotated[edge[0]][2]+rotated[edge[1]][2])/2};}).sort(function(a,b){return a.z-b.z;});
      signalClock=(signalClock+.0024*motionStep)%1;

      projectLinks.forEach(function(link,index){var vertex=projectVertices[index],depth=(rotated[vertex][2]+1)/2;link.style.left=projected[vertex][0]+'px';link.style.top=projected[vertex][1]+'px';link.style.setProperty('--node-scale',(.78+depth*.28).toFixed(3));link.style.setProperty('--node-opacity',(.42+depth*.58).toFixed(3));link.style.zIndex=String(5+Math.round(depth*10));link.classList.toggle('is-behind',rotated[vertex][2]<-.2);});
      ordered.forEach(function(item,edgeIndex){var a=item.edge[0],b=item.edge[1],depth=(item.z+1)/2;var connected=activeProject>=0&&(a===projectVertices[activeProject]||b===projectVertices[activeProject]);if(depth<.08||(!connected&&edgeIndex%profile.edgeStep!==0))return;ctx.beginPath();ctx.moveTo(projected[a][0],projected[a][1]);ctx.lineTo(projected[b][0],projected[b][1]);ctx.strokeStyle=connected?'rgba(106,215,176,.9)':(item.z>0?'rgba(23,166,115,'+(.06+depth*.27)+')':'rgba(28,102,177,'+(.025+depth*.13)+')');ctx.lineWidth=connected?1.65:.72;ctx.stroke();});
      operationalRoutes.slice(0,profile.routeCount).forEach(function(route,index){var a=route[0],b=route[1],depth=((rotated[a][2]+rotated[b][2])/2+1)/2;if(depth<.12)return;ctx.beginPath();ctx.moveTo(projected[a][0],projected[a][1]);ctx.lineTo(projected[b][0],projected[b][1]);ctx.strokeStyle='rgba(106,215,176,'+(.08+depth*.3)+')';ctx.lineWidth=1.1;ctx.stroke();var progress=(signalClock+index/profile.routeCount)%1;var x=projected[a][0]+(projected[b][0]-projected[a][0])*progress,y=projected[a][1]+(projected[b][1]-projected[a][1])*progress;ctx.beginPath();ctx.arc(x,y,1.2+depth*1.2,0,Math.PI*2);ctx.fillStyle='rgba(191,244,224,'+(.25+depth*.65)+')';ctx.shadowColor='rgba(106,215,176,.82)';ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;});
      rotated.forEach(function(vertex,index){if(vertex[2]<-.08)return;var special=projectVertices.indexOf(index)>=0,hierarchy=index<12||index%29===0;if(!special&&!hierarchy&&index%profile.nodeStep!==0)return;var depth=(vertex[2]+1)/2,x=projected[index][0],y=projected[index][1],size=special?4+depth*2.8:(hierarchy?2+depth*1.7:.72+depth*.95);var glow=ctx.createRadialGradient(x,y,0,x,y,size*3.5);glow.addColorStop(0,'rgba(106,215,176,'+(depth*(hierarchy ? .72 : .4))+')');glow.addColorStop(1,'rgba(106,215,176,0)');ctx.beginPath();ctx.arc(x,y,size*3.5,0,Math.PI*2);ctx.fillStyle=glow;ctx.fill();ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fillStyle=special?'rgba(191,244,224,'+depth+')':(hierarchy?'rgba(106,215,176,'+(depth*.82)+')':'rgba(23,166,115,'+(depth*.48)+')');ctx.fill();});
      sphereWrap.classList.add('canvas-ready');sphereWrap.classList.remove('show-fallback');
    }
    function loop(timestamp){if(!(isDocumentVisible&&isStoryVisible)){raf=0;lastFrame=0;return;}if(window.innerWidth<=767&&lastFrame&&timestamp-lastFrame<32){raf=requestAnimationFrame(loop);return;}lastFrame=timestamp;draw();raf=requestAnimationFrame(loop);}
    function ensureLoop(){if(!raf&&isDocumentVisible&&isStoryVisible)raf=requestAnimationFrame(loop);}
    function scheduleResize(){if(resizeFrame)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(function(){resize();draw();});}
    sphereWrap.addEventListener('pointerenter',function(){pointerInside=true;});
    sphereWrap.addEventListener('pointermove',function(event){var rect=sphereWrap.getBoundingClientRect();var x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;targetX=.24-y*.34;targetY=angleY+x*.42;});
    sphereWrap.addEventListener('pointerleave',function(){pointerInside=false;activeProject=-1;projectLinks.forEach(function(link){link.classList.remove('is-active');});});
    projectLinks.forEach(function(link,index){['pointerenter','focus'].forEach(function(type){link.addEventListener(type,function(){activeProject=index;pointerInside=true;link.classList.add('is-active');});});['pointerleave','blur'].forEach(function(type){link.addEventListener(type,function(){activeProject=-1;pointerInside=false;link.classList.remove('is-active');});});});
    window.addEventListener('resize',scheduleResize,{passive:true});
    document.addEventListener('visibilitychange',function(){isDocumentVisible=!document.hidden;ensureLoop();});
    if('ResizeObserver' in window)new ResizeObserver(scheduleResize).observe(sphereWrap);
    var hero=document.getElementById('inicio');
    if('IntersectionObserver' in window&&hero){var visibilityObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){isStoryVisible=entry.isIntersecting;});ensureLoop();},{threshold:.01});visibilityObserver.observe(hero);}
    resize();draw();ensureLoop();
    }
    if(window.innerWidth<=767){
      var mobileStartEvents=['pointerdown','touchstart','keydown','scroll'];
      function startMobileSphere(){mobileStartEvents.forEach(function(type){window.removeEventListener(type,startMobileSphere);});setTimeout(initializeSphere,0);}
      mobileStartEvents.forEach(function(type){window.addEventListener(type,startMobileSphere,{passive:true,once:true});});
      return;
    }
    initializeSphere();
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
    process:{glyph:'FLUJO',signal:'Problema / Proceso',title:'Ordenar un flujo fragmentado.',description:'Mapeamos la fricción, reducimos pasos y automatizamos solo lo que debe repetirse.',result:'Resultado · un proceso conectado y más fácil de operar',core:'Proceso conectado',output:'Operación fluida',nodes:['Entrada','Revisión','Espera','Repetición']},
    information:{glyph:'DATOS',signal:'Problema / Información',title:'Convertir información dispersa en información utilizable.',description:'Conectamos datos y documentos, preservamos su contexto y les damos una estructura que el proceso puede aprovechar.',result:'Resultado · información estructurada, contextual y disponible',core:'Información estructurada',output:'Dato utilizable',nodes:['Documento','Señal','Fragmento','Registro']},
    decisions:{glyph:'CRITERIO',signal:'Problema / Decisiones',title:'Acercar claridad a una decisión.',description:'Organizamos las señales relevantes para apoyar decisiones humanas u operativas, sin delegar el criterio a una IA autónoma.',result:'Resultado · mejor soporte para decidir y actuar',core:'Señales organizadas',output:'Apoyo a decisión',nodes:['Contexto','Dato','Indicador','Restricción']},
    product:{glyph:'PRODUCTO',signal:'Problema / Producto',title:'Integrar inteligencia con una función concreta.',description:'Combinamos IA, datos, automatización y software dentro de un producto digital con propósito y controles definidos.',result:'Resultado · inteligencia integrada en un producto funcional',core:'Función inteligente',output:'Producto operando',nodes:['IA','Datos','Automatización','Software']}
  };
  var valueExperience=document.querySelector('.value-experience');
  function activateValue(key){
    if(!valueExperience||!valueData[key])return;valueExperience.dataset.valueActive=key;valueExperience.querySelectorAll('.value-option').forEach(function(button){var active=button.dataset.value===key;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    var data=valueData[key],visual=document.getElementById('valueVisual');
    document.getElementById('valueGlyph').textContent=data.glyph;document.getElementById('valueSignal').textContent=data.signal;document.getElementById('valueTitle').textContent=data.title;document.getElementById('valueDescription').textContent=data.description;document.getElementById('valueResult').textContent=data.result;document.getElementById('valueCoreLabel').textContent=data.core;document.getElementById('valueOutputLabel').textContent=data.output;['A','B','C','D'].forEach(function(letter,index){document.getElementById('valueNode'+letter).textContent=data.nodes[index];});
    if(visual&&!prefersReducedMotion){visual.classList.remove('is-switching');void visual.offsetWidth;visual.classList.add('is-switching');}
  }
  whenVisible(valueExperience,function(){
    var valueButtons=Array.prototype.slice.call(valueExperience.querySelectorAll('.value-option'));
    valueButtons.forEach(function(button,index){
      ['mouseenter','focus','click'].forEach(function(type){button.addEventListener(type,function(){activateValue(button.dataset.value);});});
      button.addEventListener('keydown',function(event){
        var direction=(event.key==='ArrowRight'||event.key==='ArrowDown')?1:(event.key==='ArrowLeft'||event.key==='ArrowUp')?-1:0;
        if(!direction)return;
        event.preventDefault();
        var next=(index+direction+valueButtons.length)%valueButtons.length;
        valueButtons[next].focus();
        activateValue(valueButtons[next].dataset.value);
      });
    });
  });

  /* Technology integration: capability -> VITAIROS -> operational application */
  whenVisible(document.getElementById('brecha'),function(){
    var story=document.querySelector('[data-integration-story]');if(!story)return;var components=Array.prototype.slice.call(story.querySelectorAll('[data-integration-key]'));
    var integrationData={
      ia:{title:'IA',output:'decisions',application:'Decisiones',copy:'Aplicamos modelos cuando cumplen una función concreta dentro del proceso o producto.'},
      software:{title:'Software',output:'product',application:'Producto digital',copy:'Construimos la capa digital que incorpora la solución dentro de la operación.'},
      data:{title:'Datos',output:'information',application:'Información',copy:'Organizamos e integramos información para que pueda utilizarse dentro del flujo.'},
      automation:{title:'Automatización',output:'process',application:'Proceso',copy:'Conectamos pasos repetitivos cuando existe una lógica clara y controlable.'},
      integrations:{title:'Integraciones',output:'product',application:'Producto digital',copy:'Conectamos sistemas y fuentes para evitar soluciones aisladas.'}
    };
    function connect(){story.classList.add('is-connected');}
    function activate(key){if(!integrationData[key])return;var data=integrationData[key];story.dataset.integrationActive=key;story.dataset.integrationOutput=data.output;components.forEach(function(component){var active=component.dataset.integrationKey===key;component.classList.toggle('is-active',active);component.setAttribute('aria-selected',String(active));component.tabIndex=active?0:-1;});story.querySelectorAll('[data-integration-output-key]').forEach(function(output){output.classList.toggle('is-active',output.dataset.integrationOutputKey===data.output);});document.getElementById('integrationDetailTitle').textContent=data.title;document.getElementById('integrationDetailCopy').textContent=data.copy;document.getElementById('integrationApplicationLabel').textContent=data.application;if(!prefersReducedMotion){story.classList.remove('is-routing');void story.offsetWidth;story.classList.add('is-routing');}}
    components.forEach(function(component,index){['pointerenter','focus','click'].forEach(function(type){component.addEventListener(type,function(){activate(component.dataset.integrationKey);});});component.addEventListener('keydown',function(event){var direction=(event.key==='ArrowRight'||event.key==='ArrowDown')?1:(event.key==='ArrowLeft'||event.key==='ArrowUp')?-1:0;if(!direction)return;event.preventDefault();var next=(index+direction+components.length)%components.length;components[next].focus();activate(components[next].dataset.integrationKey);});});activate('ia');
    if(prefersReducedMotion||!('IntersectionObserver' in window)){connect();return;}
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){connect();observer.disconnect();}});},{threshold:.34});observer.observe(story);
  });

  /* Method: one stable route, readable at rest and interactive by stage */
  whenVisible(document.getElementById('metodo'),function(){
    var network=document.getElementById('methodNetwork');if(!network)return;var nodes=Array.prototype.slice.call(network.querySelectorAll('.method-node')),buttons=nodes.map(function(node){return node.querySelector('.method-node__button');}),frame=0,lastScrollStep=-1,manualLockUntil=0,isNearViewport=!('IntersectionObserver' in window);
    function select(index,manual){index=Math.max(0,Math.min(nodes.length-1,index));if(manual)manualLockUntil=Date.now()+900;network.dataset.currentStep=String(index+1);nodes.forEach(function(node,nodeIndex){var current=nodeIndex===index;node.classList.toggle('is-current',current);buttons[nodeIndex].setAttribute('aria-pressed',String(current));});}
    buttons.forEach(function(button,index){['pointerenter','focus','click'].forEach(function(type){button.addEventListener(type,function(){select(index,true);});});button.addEventListener('keydown',function(event){if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft'&&event.key!=='ArrowDown'&&event.key!=='ArrowUp')return;event.preventDefault();var next=(event.key==='ArrowRight'||event.key==='ArrowDown')?Math.min(buttons.length-1,index+1):Math.max(0,index-1);buttons[next].focus();select(next,true);});});
    function update(){frame=0;var rect=network.getBoundingClientRect();var entry=window.innerHeight*.75;var progress=Math.max(0,Math.min(1,(entry-rect.top)/Math.max(rect.height*.72,1)));network.style.setProperty('--method-progress',String(progress));network.style.setProperty('--method-position',(2+progress*96).toFixed(2)+'%');if(network.parentElement)network.parentElement.style.setProperty('--method-progress',String(progress));var activeCount=progress<=.02?0:Math.min(nodes.length,Math.ceil(progress*nodes.length));network.dataset.activeStep=String(activeCount);network.classList.toggle('is-complete',progress>.92);nodes.forEach(function(node,index){node.classList.toggle('is-active',index<activeCount);});if(Date.now()>=manualLockUntil&&activeCount>0&&activeCount!==lastScrollStep){lastScrollStep=activeCount;select(activeCount-1,false);}}
    function schedule(){if(isNearViewport&&!frame)frame=requestAnimationFrame(update);}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});if('IntersectionObserver' in window){new IntersectionObserver(function(entries){entries.forEach(function(entry){isNearViewport=entry.isIntersecting;if(isNearViewport)schedule();});},{rootMargin:'35% 0px 35% 0px'}).observe(network);}else{update();}
  });

  /* Ecosystem: four distinct transformation narratives in one stable instrument */
  var ecosystemData={
    m:{sector:'Salud mental digital',name:'VITAIROS-M',labels:['Persona','Contexto','Profesional','Continuidad'],headline:'Continuidad entre la persona y la atención profesional.',copy:'Una capa de continuidad entre la persona y la atención profesional.'},
    industrial:{sector:'Industria y minería',name:'Industrial AI',labels:['Información operativa','Estructura','Indicadores','Proceso'],headline:'Información operativa convertida en datos utilizables.',copy:'Estructuramos información operativa para incorporarla a indicadores y procesos.'},
    agro:{sector:'Agricultura',name:'Agro Intelligence',labels:['Campo','Datos','Información','Decisión'],headline:'Datos del campo convertidos en información para decidir.',copy:'IA y datos aplicados donde existe una decisión productiva concreta.'},
    conecta:{sector:'Educación y adopción digital',name:'VITAIROS Conecta',labels:['Persona','Aprendizaje','Práctica','Adopción'],headline:'Conocimiento convertido en adopción digital responsable.',copy:'Aprendizaje y práctica para una adopción responsable de tecnología e IA.'}
  };
  var ecosystem=document.getElementById('ecosystemExperience');
  function activateEcosystem(key){
    if(!ecosystem||!ecosystemData[key])return;var data=ecosystemData[key];ecosystem.dataset.activeProject=key;ecosystem.querySelectorAll('.ecosystem-item').forEach(function(item){var active=item.dataset.ecosystemItem===key;item.classList.toggle('is-active',active);item.querySelector('button').setAttribute('aria-expanded',String(active));});
    document.getElementById('ecosystemPreviewSector').textContent=data.sector;document.getElementById('ecosystemPreviewName').textContent=data.name;document.getElementById('ecosystemPreviewHeadline').textContent=data.headline;document.getElementById('ecosystemPreviewCopy').textContent=data.copy;['A','B','C','D'].forEach(function(letter,index){document.getElementById('ecosystemLabel'+letter).textContent=data.labels[index];});if(!prefersReducedMotion){ecosystem.classList.remove('is-transitioning');void ecosystem.offsetWidth;ecosystem.classList.add('is-transitioning');}
  }
  whenVisible(document.getElementById('ecosistema'),function(){if(ecosystem){var ecosystemItems=Array.prototype.slice.call(ecosystem.querySelectorAll('.ecosystem-item'));ecosystemItems.forEach(function(item,index){var button=item.querySelector('button');['pointerenter','focusin'].forEach(function(type){item.addEventListener(type,function(){activateEcosystem(item.dataset.ecosystemItem);});});button.addEventListener('click',function(){activateEcosystem(item.dataset.ecosystemItem);if(window.innerWidth<=820)document.getElementById('ecosystemPreview').scrollIntoView({behavior:prefersReducedMotion?'auto':'smooth',block:'nearest'});});button.addEventListener('keydown',function(event){var direction=(event.key==='ArrowRight'||event.key==='ArrowDown')?1:(event.key==='ArrowLeft'||event.key==='ArrowUp')?-1:0;if(!direction)return;event.preventDefault();var next=(index+direction+ecosystemItems.length)%ecosystemItems.length;var nextButton=ecosystemItems[next].querySelector('button');nextButton.focus();activateEcosystem(ecosystemItems[next].dataset.ecosystemItem);});});}});

  /* Principles: one restrained pulse advances through the four criteria */
  whenVisible(document.getElementById('nosotros'),function(){
    var list=document.querySelector('[data-principles]'),progress=document.querySelector('[data-principles-progress]');if(!list||!progress)return;var items=Array.prototype.slice.call(list.children),frame=0,isNearViewport=!('IntersectionObserver' in window);
    function update(){frame=0;var rect=list.getBoundingClientRect();var amount=Math.max(0,Math.min(1,(window.innerHeight*.78-rect.top)/Math.max(rect.height*.82,1)));var activeCount=prefersReducedMotion?items.length:(amount<=.01?0:Math.min(items.length,Math.ceil(amount*items.length)));progress.style.setProperty('--principles-progress',String(prefersReducedMotion?1:amount));items.forEach(function(item,index){item.classList.toggle('is-scroll-active',index<activeCount);});}
    function schedule(){if(isNearViewport&&!frame)frame=requestAnimationFrame(update);}window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});if('IntersectionObserver' in window){new IntersectionObserver(function(entries){entries.forEach(function(entry){isNearViewport=entry.isIntersecting;if(isNearViewport)schedule();});},{rootMargin:'35% 0px 35% 0px'}).observe(list);}else{update();}
  });

  /* Ambient continuity: low-energy motion that sleeps outside the viewport */
  whenVisible(document.getElementById('nosotros'),function(){
    var networks=Array.prototype.slice.call(document.querySelectorAll('[data-ambient-network]'));if(!networks.length||prefersReducedMotion)return;
    var finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;var visible=new WeakMap();var scrollFrame=0;
    function sync(network){network.classList.toggle('is-ambient-active',Boolean(visible.get(network))&&!document.hidden);}
    if('IntersectionObserver' in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){visible.set(entry.target,entry.isIntersecting);sync(entry.target);});},{threshold:.04,rootMargin:'8% 0px 8% 0px'});networks.forEach(function(network){visible.set(network,false);observer.observe(network);});}else{networks.forEach(function(network){visible.set(network,true);sync(network);});}
    if(finePointer)networks.forEach(function(network){var section=network.parentElement;if(!section)return;section.addEventListener('pointermove',function(event){if(!visible.get(network))return;var rect=section.getBoundingClientRect();var x=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*8;var y=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*6;network.style.setProperty('--ambient-shift-x',x.toFixed(2)+'px');network.style.setProperty('--ambient-shift-y',y.toFixed(2)+'px');},{passive:true});section.addEventListener('pointerleave',function(){network.style.setProperty('--ambient-shift-x','0px');network.style.setProperty('--ambient-shift-y','0px');});});
    function updateScrollDepth(){scrollFrame=0;networks.forEach(function(network){if(!visible.get(network)||finePointer)return;var rect=network.parentElement.getBoundingClientRect();var progress=(window.innerHeight*.5-(rect.top+rect.height*.5))/Math.max(window.innerHeight,1);network.style.setProperty('--ambient-shift-y',(Math.max(-1,Math.min(1,progress))*5).toFixed(2)+'px');});}
    function scheduleScrollDepth(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScrollDepth);}window.addEventListener('scroll',scheduleScrollDepth,{passive:true});window.addEventListener('resize',scheduleScrollDepth,{passive:true});document.addEventListener('visibilitychange',function(){networks.forEach(sync);});updateScrollDepth();
  });

  /* Compact project signature below the VITAIROS principles */
  (function(){
    var signature=document.getElementById('ecosystemSignature');if(!signature)return;var links=Array.prototype.slice.call(signature.querySelectorAll('[data-signature-project]'));
    function activate(link){signature.dataset.activeProject=link?link.dataset.signatureProject:'';}
    links.forEach(function(link){link.addEventListener('pointerenter',function(){activate(link);});link.addEventListener('pointerleave',function(){activate(null);});link.addEventListener('focus',function(){activate(link);});link.addEventListener('blur',function(){activate(null);});});
  })();

  /* Evidence: only two verified stories, rendered without weak photography */
  function buildNewsCard(item,index){
    var card=document.createElement('a');card.className='news-card';card.href=item.link;card.setAttribute('data-analytics-event','news_click');if(/^https?:\/\//.test(item.link)){card.target='_blank';card.rel='noopener noreferrer';}
    var visual=document.createElement('span');visual.className='news-card__visual '+(index===0?'news-card__visual--industrial':'news-card__visual--compute');visual.setAttribute('aria-hidden','true');for(var visualIndex=0;visualIndex<5;visualIndex+=1){var visualNode=document.createElement('i');visualNode.className='news-visual-node';visual.appendChild(visualNode);}
    var body=document.createElement('span');body.className='news-card__body';var meta=document.createElement('span');meta.className='news-card__meta';var category=document.createElement('span');category.textContent=item.category;var date=document.createElement('time');date.dateTime=item.dateISO||'';date.textContent=item.date;meta.append(category,date);
    var title=document.createElement('h3');title.textContent=item.title;var summary=document.createElement('p');summary.textContent=item.summary;var link=document.createElement('span');link.className='news-card__link';link.textContent=item.linkLabel||'Ver evidencia ↗';body.append(meta,title,summary,link);card.append(visual,body);return card;
  }
  var newsSection=document.querySelector('[data-news-section]'),newsGrid=document.getElementById('newsGrid');
  whenVisible(document.getElementById('ecosistema'),function(){if(newsSection&&newsGrid){fetch('/data/news.json',{credentials:'same-origin'}).then(function(response){if(!response.ok)throw new Error('news');return response.json();}).then(function(items){var verified=Array.isArray(items)?items.filter(function(item){return item&&item.verified===true&&item.link;}).slice(0,2):[];if(!verified.length)return;verified.forEach(function(item,index){newsGrid.appendChild(buildNewsCard(item,index));});newsSection.hidden=false;}).catch(function(){newsSection.hidden=true;});}});

  /* Guided qualification, editable and keyboard-native */
  whenVisible(document.getElementById('diagnostico'),function(){
    var form=document.getElementById('diagnosticForm');if(!form)return;var steps=Array.prototype.slice.call(form.querySelectorAll('.diagnostic-step'));var current=1;var label=document.getElementById('diagnosticStepLabel'),bar=document.getElementById('diagnosticProgressBar'),progressNodes=Array.prototype.slice.call(document.querySelectorAll('[data-progress-node]'));var contextInput=document.getElementById('contexto'),contextFeedback=document.getElementById('contextFeedback'),contextStep=form.querySelector('[data-step="2"]'),stageStep=form.querySelector('[data-step="3"]'),subject=document.getElementById('diagnosticSubject'),leadType=document.getElementById('diagnosticLeadType');
    function isCareerPath(){var selected=form.querySelector('input[name="oportunidad"]:checked');return selected&&selected.value==='Trabaja con nosotros';}
    function syncIntent(){var career=isCareerPath();if(contextStep){contextStep.querySelector('legend').textContent=career?'¿Cómo te gustaría colaborar?':'¿Qué ocurre hoy?';contextStep.querySelector('p').textContent=career?'Cuéntanos brevemente tu interés o experiencia.':'Una descripción breve es suficiente.';}if(contextInput)contextInput.placeholder=career?'Comparte tu experiencia, área de interés o forma de colaboración.':'Describe el proceso, la decisión o el flujo que quieres mejorar.';if(stageStep)stageStep.disabled=career;if(subject)subject.value=career?'Interés laboral o de colaboración VITAIROS':'Nuevo diagnóstico de oportunidad VITAIROS';if(leadType)leadType.value=career?'careers':'commercial';}
    function showStep(step,moveFocus){current=Math.max(1,Math.min(steps.length,step));steps.forEach(function(fieldset,index){var active=index===current-1;fieldset.hidden=!active;fieldset.classList.toggle('is-active',active);});if(label)label.textContent='Paso '+current+' de '+steps.length;if(bar)bar.style.width=(current/steps.length*100)+'%';progressNodes.forEach(function(node,index){node.classList.toggle('is-complete',index<current-1);node.classList.toggle('is-active',index===current-1);});if(moveFocus){var legend=steps[current-1].querySelector('legend');if(legend){legend.setAttribute('tabindex','-1');legend.focus();}}}
    function validateCurrent(){var invalid=steps[current-1].querySelector(':invalid');if(invalid){invalid.reportValidity();invalid.focus();return false;}return true;}
    form.querySelectorAll('input[name="oportunidad"]').forEach(function(input){input.addEventListener('change',syncIntent);});form.querySelectorAll('[data-next-step]').forEach(function(button){button.addEventListener('click',function(){if(!validateCurrent())return;syncIntent();showStep(isCareerPath()&&current===2?4:current+1,true);});});form.querySelectorAll('[data-previous-step]').forEach(function(button){button.addEventListener('click',function(){showStep(isCareerPath()&&current===4?2:current-1,true);});});
    function updateContextFeedback(){if(contextInput&&contextFeedback){contextFeedback.textContent=contextInput.value.length+' / '+contextInput.maxLength;contextFeedback.classList.toggle('has-content',contextInput.value.length>0);}}if(contextInput){contextInput.addEventListener('input',updateContextFeedback);updateContextFeedback();}
    document.querySelectorAll('[data-diagnostic-careers]').forEach(function(link){link.addEventListener('click',function(){var careerOption=form.querySelector('input[name="oportunidad"][value="Trabaja con nosotros"]');if(careerOption){careerOption.checked=true;syncIntent();showStep(1,false);}});});
    var started=false;form.addEventListener('focusin',function(){if(started)return;started=true;document.dispatchEvent(new CustomEvent('vitairos:analytics',{detail:{event:'diagnostic_start'}}));});form.addEventListener('submit',function(event){
      if(!form.checkValidity())return;
      event.preventDefault();
      document.dispatchEvent(new CustomEvent('vitairos:analytics',{detail:{event:'diagnostic_submit'}}));
      syncIntent();
      var submitButton=form.querySelector('button[type="submit"]'),status=document.getElementById('diagnosticFormStatus'),thanks=document.getElementById('gracias');
      var endpoint=form.action.replace('https://formsubmit.co/','https://formsubmit.co/ajax/'),payload={};
      new FormData(form).forEach(function(value,name){payload[name]=value;});delete payload._next;
      if(status){status.hidden=true;status.textContent='';}
      if(submitButton){submitButton.disabled=true;submitButton.setAttribute('aria-busy','true');}
      fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)}).then(function(response){return response.json().then(function(data){if(!response.ok||(data.success!==true&&data.success!=='true'))throw new Error(data.message||'FormSubmit rejected the request');return data;});}).then(function(){
        form.hidden=true;if(thanks){thanks.style.display='block';thanks.focus({preventScroll:true});}
      }).catch(function(){
        if(status){status.textContent='No pudimos completar el envío. Inténtalo nuevamente en unos minutos.';status.hidden=false;}
      }).then(function(){if(submitButton){submitButton.disabled=false;submitButton.removeAttribute('aria-busy');}});
    });showStep(1,false);
    var params=new URLSearchParams(window.location.search);if(params.get('sent')==='1'){form.hidden=true;var thanks=document.getElementById('gracias');if(thanks){thanks.style.display='block';setTimeout(function(){thanks.focus();},50);}}
  });

  /* Progressive reveal with robust fallback */
  if('IntersectionObserver' in window&&!prefersReducedMotion){
    var revealItems=document.querySelectorAll('.section-intro,.value-experience,.capability-note,.method-shell,.ecosystem-experience,.news-card,.principles-grid li,.about-note,.diagnostic-intro,.diagnostic-card');
    var revealObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}});},{threshold:.06,rootMargin:'0px 0px -3% 0px'});
    revealItems.forEach(function(element,index){element.classList.add('reveal');element.style.setProperty('--reveal-delay',Math.min(index%3,2)*70+'ms');revealObserver.observe(element);});
  }

  document.addEventListener('click',function(event){var target=event.target.closest('[data-analytics-event]');if(!target||target.tagName==='FORM')return;document.dispatchEvent(new CustomEvent('vitairos:analytics',{detail:{event:target.getAttribute('data-analytics-event'),label:target.getAttribute('data-project')||target.textContent.trim().slice(0,80)}}));});

  /* Brand signature is shown once per session and resolves into the already-rendered hero */
  (function(){
    var loader=document.getElementById('introLoader');
    var enabled=document.documentElement.classList.contains('intro-enabled');
    function hide(immediate){
      if(!loader)return;
      loader.classList.add('is-hidden');document.body.classList.remove('loader-active');document.documentElement.classList.remove('intro-enabled');
      setTimeout(function(){if(loader&&loader.parentNode)loader.parentNode.removeChild(loader);},immediate?0:80);
    }
    if(prefersReducedMotion||!enabled){hide(true);return;}
    document.body.classList.add('loader-active');loader.classList.add('is-running');
    try{sessionStorage.setItem('vitairos_intro_seen','1');}catch(error){}
    var introDuration=window.innerWidth<=820?720:1320;
    setTimeout(function(){document.body.classList.add('intro-resolving');},Math.round(introDuration*.68));
    setTimeout(function(){document.body.classList.remove('intro-resolving');hide(false);},introDuration);
  })();
})();
