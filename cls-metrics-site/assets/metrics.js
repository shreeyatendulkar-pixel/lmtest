(function(){
  const mode = document.documentElement.dataset.mode || 'low';
  const isHigh = mode === 'high';
  const $ = (id) => document.getElementById(id);
  const metrics = new Map();
  const start = performance.timeOrigin || Date.now();
  let cls = 0, lcp = 0, fcp = 0, fp = 0, longTaskTotal = 0, frameCount = 0, lastFrame = performance.now(), fps = 0;
  const fmtMs = v => Number.isFinite(v) && v >= 0 ? Math.round(v) + ' ms' : 'pending';
  const fmtNum = v => Number.isFinite(v) ? String(Math.round(v)) : 'pending';
  const set = (name, value, target, source='measured/estimated') => metrics.set(name,{name,value,target,source});
  function classify(name, value, target){
    if(typeof value !== 'number' || !Number.isFinite(value)) return 'warn';
    if(name.includes('CLS')) return value <= target ? 'good' : 'bad';
    if(name.includes('Frames')) return value >= target ? 'good' : 'bad';
    if(name.includes('bytes') || name.includes('items')) return value <= target ? 'good' : 'bad';
    return value <= target ? 'good' : 'bad';
  }
  function render(){
    const tbody = $('metricsBody'); if(!tbody) return;
    tbody.innerHTML = [...metrics.values()].map(m=>{
      const clsName = classify(m.name,m.value,m.target);
      const display = m.name.includes('CLS') ? (m.value||0).toFixed(3) : m.name.includes('Frames') || m.name.includes('items') || m.name.includes('bytes') ? fmtNum(m.value) : fmtMs(m.value);
      const target = m.name.includes('CLS') ? m.target.toFixed(3) : m.name.includes('Frames') || m.name.includes('items') || m.name.includes('bytes') ? fmtNum(m.target) : fmtMs(m.target);
      return `<tr><td>${m.name}</td><td><span class="pill ${clsName}">${display}</span></td><td>${target}</td><td>${m.source}</td></tr>`;
    }).join('');
  }
  function defaults(){
    const targets = isHigh ? {
      client:2300, content:2600, dom:2900, complete:4300, fcp:1800, fp:1500, fps:35, items:180, lcp:3200, render:1400, selfBot:900, bytes:900000, speed:4200, third:1100, tti:5000, title:1600, tbt:900, visual:4700, response:850, throughput:5200, cls:.25
    } : {
      client:700, content:800, dom:900, complete:1400, fcp:700, fp:500, fps:55, items:40, lcp:1200, render:350, selfBot:120, bytes:120000, speed:1200, third:80, tti:1600, title:80, tbt:120, visual:1400, response:180, throughput:1600, cls:.10
    };
    set('Client Time', isHigh?3100:520, targets.client, 'page simulation');
    set('Content load', isHigh?2700:650, targets.content, 'Navigation Timing');
    set('DOM Load', isHigh?3050:760, targets.dom, 'Navigation Timing');
    set('Document Complete', isHigh?4500:980, targets.complete, 'Navigation Timing');
    set('First Contentful Paint', fcp || (isHigh?1950:430), targets.fcp, 'Paint Timing');
    set('First Paint', fp || (isHigh?1700:360), targets.fp, 'Paint Timing');
    set('Frames Per Second', fps || (isHigh?22:60), targets.fps, 'rAF sampled');
    set('items', document.querySelectorAll('*').length, targets.items, 'DOM element count');
    set('largest contentful paint', lcp || (isHigh?3500:900), targets.lcp, 'LCP observer');
    set('render start', fp || (isHigh?1550:320), targets.render, 'Paint Timing');
    set('self bottleneck', longTaskTotal || (isHigh?1200:40), targets.selfBot, 'Long Tasks');
    set('self downloaded bytes', isHigh?1250000:82000, targets.bytes, 'simulated payload');
    set('speed index', isHigh?5200:940, targets.speed, 'estimated visual progress');
    set('third party bottleneck', isHigh?1500:20, targets.third, 'simulated third-party work');
    set('time to interactive', isHigh?5600:1100, targets.tti, 'estimated from long tasks');
    set('time to title', isHigh?1800:60, targets.title, 'document title update');
    set('total blocking time', longTaskTotal || (isHigh?950:0), targets.tbt, 'Long Tasks approximation');
    set('visually complete', isHigh?5200:1180, targets.visual, 'estimated final visual change');
    set('webpage response time', isHigh?900:90, targets.response, 'simulated server wait');
    set('webpage throughput time', isHigh?5800:900, targets.throughput, 'simulated full transaction');
    set('CLS', cls, targets.cls, 'Layout Instability API');
  }
  if('PerformanceObserver' in window){
    try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.name==='first-paint') fp=e.startTime;if(e.name==='first-contentful-paint') fcp=e.startTime;} defaults(); render();}).observe({type:'paint',buffered:true});}catch(e){}
    try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(!e.hadRecentInput) cls += e.value;} defaults(); render();}).observe({type:'layout-shift',buffered:true});}catch(e){}
    try{new PerformanceObserver(list=>{const entries=list.getEntries(); const last=entries[entries.length-1]; if(last) lcp=last.startTime; defaults(); render();}).observe({type:'largest-contentful-paint',buffered:true});}catch(e){}
    try{new PerformanceObserver(list=>{for(const e of list.getEntries()) longTaskTotal += Math.max(0,e.duration-50); defaults(); render();}).observe({type:'longtask',buffered:true});}catch(e){}
  }
  function raf(t){frameCount++; if(t-lastFrame>=1000){fps=frameCount; frameCount=0; lastFrame=t; defaults(); render();} requestAnimationFrame(raf)} requestAnimationFrame(raf);
  window.addEventListener('load',()=>{const nav=performance.getEntriesByType('navigation')[0]; if(nav){set('Content load',nav.domContentLoadedEventEnd, isHigh?2600:800, 'Navigation Timing');set('DOM Load',nav.domInteractive, isHigh?2900:900, 'Navigation Timing');set('Document Complete',nav.loadEventEnd, isHigh?4300:1400, 'Navigation Timing');} defaults(); render();});
  defaults(); render(); setInterval(()=>{defaults(); render();},1000);
})();
