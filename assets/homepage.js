document.documentElement.classList.add('js');
var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

(function(){
  var year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  var openModals = ['privacidad','terminos'];
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  var reduceMotion = prefersReducedMotion;
  var lastDialogTrigger = null;

  function syncBodyState(){
    var hasOpenModal = document.querySelector('.modal-overlay.open');
    var menuOpen = mobileMenu && mobileMenu.classList.contains('open');
    document.body.classList.toggle('menu-open', !!hasOpenModal || !!menuOpen);
  }

  window.openModal = function(id){
    var el = document.getElementById('modal-'+id);
    if(el){
      lastDialogTrigger = document.activeElement;
      el.classList.add('open');
      el.setAttribute('aria-hidden', 'false');
      syncBodyState();
      var closeButton = el.querySelector('.modal-close');
      if(closeButton) closeButton.focus();
    }
  };

  window.closeModal = function(id){
    var el = document.getElementById('modal-'+id);
    if(el){
      var shouldRestore = el.contains(document.activeElement);
      el.classList.remove('open');
      el.setAttribute('aria-hidden', 'true');
      syncBodyState();
      if(shouldRestore && lastDialogTrigger && lastDialogTrigger.focus) lastDialogTrigger.focus();
    }
  };

  window.closeModalOutside = function(e,id){
    if(e.target===document.getElementById('modal-'+id)) window.closeModal(id);
  };

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      openModals.forEach(function(id){ window.closeModal(id); });
      closeMenu(true);
    }
  });

  if(hamburger && mobileMenu){
    hamburger.addEventListener('click', function(){
      var isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      syncBodyState();
      if(isOpen){
        var firstMenuLink = mobileMenu.querySelector('a');
        if(firstMenuLink) firstMenuLink.focus();
      }
    });
  }

  window.closeMenu = closeMenu;
  function closeMenu(restoreFocus){
    if(hamburger){
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Abrir menú');
    }
    if(mobileMenu) mobileMenu.classList.remove('open');
    syncBodyState();
    if(restoreFocus && hamburger) hamburger.focus();
  }

  var desktopMenu = window.matchMedia('(min-width: 1081px)');
  function syncResponsiveMenu(event){ if(event.matches) closeMenu(false); }
  if(desktopMenu.addEventListener) desktopMenu.addEventListener('change', syncResponsiveMenu);

  var params = new URLSearchParams(window.location.search);
  if(params.get('sent') === '1'){
    var thanks = document.getElementById('gracias');
    if(thanks) thanks.style.display = 'block';
  }

  (function(){
    var canvas = document.getElementById('vitairos-geo');
    var sphereWrap = document.getElementById('hbSphereWrap');
    var fallback = document.getElementById('vitairosGeoFallback');
    var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if(!canvas || reduceMotion){
      if(sphereWrap) sphereWrap.classList.add('fallback-only');
      return;
    }
    var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if(!ctx){
      if(sphereWrap) sphereWrap.classList.add('fallback-only');
      return;
    }

    function norm(v){
      var l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
      return [v[0]/l, v[1]/l, v[2]/l];
    }
    function mid(a,b){ return norm([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]); }

    var phi = (1+Math.sqrt(5))/2;
    var verts = [
      [0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],
      [1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],
      [phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]
    ].map(norm);
    var faces = [
      [0,1,8],[0,8,4],[0,4,5],[0,5,9],[0,9,1],
      [1,6,8],[8,6,10],[8,10,4],[4,10,2],[4,2,5],
      [5,2,11],[5,11,9],[9,11,7],[9,7,1],[1,7,6],
      [3,6,7],[3,7,11],[3,11,2],[3,2,10],[3,10,6]
    ];

    function subdivide(vs,fs){
      var nf = [], cache = {};
      function gm(i,j){
        var k = Math.min(i,j)+'_'+Math.max(i,j);
        if(cache[k] !== undefined) return cache[k];
        var idx = vs.length; vs.push(mid(vs[i],vs[j]));
        cache[k] = idx; return idx;
      }
      for(var f=0; f<fs.length; f++){
        var a=fs[f][0], b=fs[f][1], c=fs[f][2];
        var ab=gm(a,b), bc=gm(b,c), ac=gm(a,c);
        nf.push([a,ab,ac],[b,bc,ab],[c,ac,bc],[ab,bc,ac]);
      }
      return {verts:vs, faces:nf};
    }

    var geo = subdivide(verts.slice(), faces.slice());
    geo = subdivide(geo.verts, geo.faces);
    verts = geo.verts; faces = geo.faces;

    var edgeSet = {}, edges = [];
    for(var f=0; f<faces.length; f++){
      var tri = faces[f];
      [[tri[0],tri[1]],[tri[1],tri[2]],[tri[0],tri[2]]].forEach(function(p){
        var ek = Math.min(p[0],p[1])+'_'+Math.max(p[0],p[1]);
        if(!edgeSet[ek]){ edgeSet[ek] = 1; edges.push(p); }
      });
    }

    var projectLinks = sphereWrap ? Array.prototype.slice.call(sphereWrap.querySelectorAll('.orbit-project')) : [];
    var projectVertexIndexes = [4,8,1,9];
    var projectNodeSet = new Set(projectVertexIndexes);
    var featuredNodes = new Set([0,1,4,5,8,9,12,18,24,30,38]);
    var angleY = 0, angleX = 0.25;
    var cssW = 340, cssH = 340;
    var rafId = null;
    var isVisible = true;
    var heroVisible = true;
    var framesDrawn = 0;
    var fallbackTimer = null;
    var resizeRaf = null;
    var spherePaused = false;

    function rotX(v,a){ var c=Math.cos(a), s=Math.sin(a); return [v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c]; }
    function rotY(v,a){ var c=Math.cos(a), s=Math.sin(a); return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c]; }

    function setFallback(state){
      if(!sphereWrap) return;
      sphereWrap.classList.toggle('show-fallback', !!state);
    }

    function markCanvasReady(){
      if(!sphereWrap) return;
      sphereWrap.classList.add('canvas-ready');
      sphereWrap.classList.remove('fallback-only');
      setFallback(false);
      if(fallbackTimer){ clearTimeout(fallbackTimer); fallbackTimer = null; }
    }

    function resize(){
      var dpr = Math.min(window.devicePixelRatio || 1, isiOS ? 1.25 : 1.5);
      var rect = canvas.getBoundingClientRect();
      cssW = Math.max(Math.round(rect.width), isiOS ? 190 : 170) || 340;
      cssH = Math.max(Math.round(rect.height), isiOS ? 190 : 170) || 340;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
    }

    function scheduleResize(){
      if(resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function(){
        resize();
        draw();
      });
    }

    function draw(){
      var dpr = Math.min(window.devicePixelRatio || 1, isiOS ? 1.25 : 1.5);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,cssW,cssH);

      var cx = cssW/2, cy = cssH/2, R = cssW*0.36;
      var rot = verts.map(function(v){ return rotY(rotX(v, angleX), angleY); });
      var prj = rot.map(function(v){ return [cx+v[0]*R, cy-v[1]*R]; });
      var edgeList = edges.map(function(e){ return {e:e, z:(rot[e[0]][2]+rot[e[1]][2])/2}; });
      edgeList.sort(function(a,b){ return a.z-b.z; });

      for(var p=0; p<projectLinks.length; p++){
        var projectVertex = projectVertexIndexes[p];
        var projectDepth = (rot[projectVertex][2]+1)/2;
        projectLinks[p].style.left = prj[projectVertex][0]+'px';
        projectLinks[p].style.top = prj[projectVertex][1]+'px';
        projectLinks[p].style.setProperty('--node-scale',(0.78+projectDepth*0.28).toFixed(3));
        projectLinks[p].style.setProperty('--node-opacity',(0.48+projectDepth*0.52).toFixed(3));
        projectLinks[p].style.zIndex = String(5+Math.round(projectDepth*10));
        projectLinks[p].classList.toggle('is-behind',rot[projectVertex][2]<0);
      }

      for(var i=0; i<edgeList.length; i++){
        var ii=edgeList[i].e[0], jj=edgeList[i].e[1];
        var tz=(edgeList[i].z+1)/2;
        if(tz<0.08) continue;
        var alpha=0.05+tz*0.30;
        var front=rot[ii][2]>0||rot[jj][2]>0;
        ctx.beginPath();
        ctx.moveTo(prj[ii][0],prj[ii][1]);
        ctx.lineTo(prj[jj][0],prj[jj][1]);
        ctx.strokeStyle=front?'rgba(23,166,115,'+alpha+')':'rgba(28,102,177,'+(alpha*0.5)+')';
        ctx.lineWidth=0.8;
        ctx.stroke();
      }

      for(var n=0; n<verts.length; n++){
        var z=rot[n][2];
        if(z<-0.05) continue;
        var px=prj[n][0], py=prj[n][1];
        var zt=(z+1)/2;
        var isProjectNode=projectNodeSet.has(n);
        var isKey=n<12;

        if(isKey){
          var gs=(isProjectNode?4.5:3)+zt*3;
          var ga=ctx.createRadialGradient(px,py,0,px,py,gs*3);
          ga.addColorStop(0,'rgba(23,166,115,'+(0.85*zt)+')');
          ga.addColorStop(0.5,'rgba(23,166,115,'+(0.2*zt)+')');
          ga.addColorStop(1,'rgba(23,166,115,0)');
          ctx.beginPath(); ctx.arc(px,py,gs*3,0,Math.PI*2); ctx.fillStyle=ga; ctx.fill();
          ctx.beginPath(); ctx.arc(px,py,gs,0,Math.PI*2); ctx.strokeStyle='rgba(23,166,115,'+(0.75*zt)+')'; ctx.lineWidth=1; ctx.stroke();
          ctx.beginPath(); ctx.arc(px,py,gs*0.35,0,Math.PI*2); ctx.fillStyle='rgba(23,166,115,'+zt+')'; ctx.fill();
        } else if(featuredNodes.has(n)){
          var ms=1.8+zt;
          ctx.beginPath(); ctx.arc(px,py,ms,0,Math.PI*2); ctx.strokeStyle='rgba(23,166,115,'+(0.4*zt)+')'; ctx.lineWidth=0.7; ctx.stroke();
        } else if(zt>0.55){
          ctx.beginPath(); ctx.arc(px,py,0.8,0,Math.PI*2); ctx.fillStyle='rgba(23,166,115,'+(0.2*zt)+')'; ctx.fill();
        }
      }

      var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.5);
      cg.addColorStop(0,'rgba(23,166,115,0.025)');
      cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx,cy,R*0.5,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();
      if(!spherePaused) angleY += 0.0022;
      framesDrawn += 1;
      if(framesDrawn === 2) markCanvasReady();
    }

    function tick(){
      if(!(isVisible && heroVisible)){
        rafId = null;
        return;
      }
      draw();
      rafId = requestAnimationFrame(tick);
    }

    function ensureLoop(){
      if(!rafId && isVisible && heroVisible) rafId = requestAnimationFrame(tick);
    }

    setFallback(true);
    scheduleResize();
    if(isiOS){
      fallbackTimer = setTimeout(function(){
        if(framesDrawn < 2 && sphereWrap) sphereWrap.classList.add('fallback-only');
      }, 1600);
    }

    window.addEventListener('resize', scheduleResize, { passive:true });
    window.addEventListener('orientationchange', function(){ setTimeout(scheduleResize, 180); }, { passive:true });
    window.addEventListener('load', function(){ setTimeout(scheduleResize, 120); setTimeout(scheduleResize, 420); }, { once:true });
    window.addEventListener('pageshow', function(){ setTimeout(scheduleResize, 60); }, { passive:true });
    if('ResizeObserver' in window && sphereWrap){ new ResizeObserver(scheduleResize).observe(sphereWrap); }
    if(sphereWrap){
      sphereWrap.addEventListener('pointerenter', function(){ spherePaused = true; });
      sphereWrap.addEventListener('pointerleave', function(){ spherePaused = false; });
      sphereWrap.addEventListener('focusin', function(){ spherePaused = true; });
      sphereWrap.addEventListener('focusout', function(){ spherePaused = false; });
    }
    document.addEventListener('visibilitychange', function(){
      isVisible = !document.hidden;
      if(isVisible) scheduleResize();
      ensureLoop();
    });

    var heroSection = document.getElementById('inicio');
    if('IntersectionObserver' in window && heroSection){
      new IntersectionObserver(function(entries){
        heroVisible = !!entries[0] && entries[0].isIntersecting;
        ensureLoop();
      }, { threshold: 0.05 }).observe(heroSection);
    }

    ensureLoop();
  })();

  if('IntersectionObserver' in window && !reduceMotion){
    var revealItems = document.querySelectorAll('.chapter-heading,.breach-system,.value-row,.capability-rail,.method-track li,.brand-architecture,.project-card,.company-statement,.why-list article,.careers-band,.form-card,.contact-brief');
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    revealItems.forEach(function(el, index){
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', Math.min(index % 4, 3) * 70 + 'ms');
      observer.observe(el);
    });

    function revealVisibleItems(){
      revealItems.forEach(function(el){
        var rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight * 0.96 && rect.bottom > 0) el.classList.add('is-visible');
      });
    }
    window.addEventListener('hashchange', function(){ requestAnimationFrame(revealVisibleItems); });
    window.addEventListener('scroll', revealVisibleItems, { passive:true });
    requestAnimationFrame(revealVisibleItems);
    setTimeout(function(){ revealItems.forEach(function(el){ el.classList.add('is-visible'); }); }, 1800);
  }
})();

(function(){
  function buildNewsCard(item){
    var card = document.createElement('a');
    card.className = 'news-card is-visible';
    card.href = item.link;
    card.setAttribute('data-analytics-event', 'news_click');
    if(/^https?:\/\//.test(item.link)){
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    var media = document.createElement('span');
    media.className = 'news-card__media';
    var image = document.createElement('img');
    image.src = item.image;
    image.alt = item.alt || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    if(item.width) image.width = item.width;
    if(item.height) image.height = item.height;
    if(item.imagePosition) image.style.objectPosition = item.imagePosition;
    media.appendChild(image);

    var body = document.createElement('span');
    body.className = 'news-card__body';
    var meta = document.createElement('span');
    meta.className = 'news-card__meta';
    var category = document.createElement('span');
    category.textContent = item.category;
    var date = document.createElement('time');
    date.dateTime = item.dateISO || '';
    date.textContent = item.date;
    meta.append(category, date);
    var title = document.createElement('h3');
    title.textContent = item.title;
    var summary = document.createElement('p');
    summary.textContent = item.summary;
    var link = document.createElement('span');
    link.className = 'news-card__link';
    link.textContent = item.linkLabel || 'Leer fuente ↗';
    body.append(meta, title, summary, link);
    card.append(media, body);
    return card;
  }

  var newsSection = document.querySelector('[data-news-section]');
  var newsGrid = document.getElementById('newsGrid');
  if(newsSection && newsGrid){
    fetch('/data/news.json', { credentials:'same-origin' })
      .then(function(response){ if(!response.ok) throw new Error('news'); return response.json(); })
      .then(function(items){
        var verified = Array.isArray(items) ? items.filter(function(item){ return item && item.verified === true; }).slice(0,3) : [];
        if(!verified.length) return;
        verified.forEach(function(item){ newsGrid.appendChild(buildNewsCard(item)); });
        newsSection.hidden = false;
      })
      .catch(function(){ newsSection.hidden = true; });
  }

  var jobsList = document.getElementById('jobsList');
  if(jobsList){
    fetch('/data/jobs.json', { credentials:'same-origin' })
      .then(function(response){ if(!response.ok) throw new Error('jobs'); return response.json(); })
      .then(function(items){
        var openings = Array.isArray(items) ? items.filter(function(item){ return item && item.status === 'open'; }) : [];
        if(!openings.length) return;
        jobsList.replaceChildren();
        openings.forEach(function(item){
          var opening = document.createElement('article');
          opening.className = 'job-opening';
          var title = document.createElement('strong');
          title.textContent = item.title;
          var meta = document.createElement('span');
          meta.textContent = [item.type,item.location].filter(Boolean).join(' · ');
          var description = document.createElement('span');
          description.textContent = item.description;
          var link = document.createElement('a');
          link.href = item.link;
          link.textContent = 'Ver oportunidad ↗';
          link.setAttribute('data-analytics-event','careers_click');
          opening.append(title, meta, description, link);
          jobsList.appendChild(opening);
        });
      })
      .catch(function(){ /* Keep the explicit no-openings state. */ });
  }

  function emitSemanticEvent(name, element){
    document.dispatchEvent(new CustomEvent('vitairos:analytics', {
      detail: {
        event: name,
        label: element && (element.getAttribute('data-project') || element.textContent.trim().slice(0,80))
      }
    }));
  }

  document.addEventListener('click', function(event){
    var target = event.target.closest('[data-analytics-event]');
    if(target && target.tagName !== 'FORM') emitSemanticEvent(target.getAttribute('data-analytics-event'), target);
  });

  var contactForm = document.getElementById('contactForm');
  if(contactForm){
    var contactStarted = false;
    contactForm.addEventListener('focusin', function(){
      if(contactStarted) return;
      contactStarted = true;
      emitSemanticEvent('contact_start', contactForm);
    });
    contactForm.addEventListener('submit', function(){ emitSemanticEvent('contact_submit', contactForm); });
  }
})();

(function(){
  var progress = document.getElementById('scrollProgress');
  if(!progress) return;
  var progressFrame = 0;
  function updateProgress(){
    var maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var ratio = Math.max(0, Math.min(1, window.scrollY / maximum));
    progress.style.transform = 'scaleX(' + ratio + ')';
    progressFrame = 0;
  }
  function scheduleProgress(){
    if(!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  }
  window.addEventListener('scroll', scheduleProgress, { passive:true });
  window.addEventListener('resize', scheduleProgress, { passive:true });
  updateProgress();
})();

(function(){
  var loader = document.getElementById('introLoader');
  var introSeen = false;
  try { introSeen = sessionStorage.getItem('vitairos_intro_seen') === '1'; } catch(error) { introSeen = false; }
  function hideLoader(){
    if(!loader) return;
    loader.classList.add('is-hidden');
    document.body.classList.remove('loader-active');
    setTimeout(function(){
      if(loader && loader.parentNode){ loader.parentNode.removeChild(loader); }
    }, 700);
  }
  if(prefersReducedMotion || introSeen){ hideLoader(); return; }
  document.body.classList.add('loader-active');
  try { sessionStorage.setItem('vitairos_intro_seen', '1'); } catch(error) { /* Storage can be unavailable. */ }
  window.addEventListener('load', function(){
    setTimeout(hideLoader, 1450);
  }, { once:true });
  setTimeout(hideLoader, 1900);
})();
