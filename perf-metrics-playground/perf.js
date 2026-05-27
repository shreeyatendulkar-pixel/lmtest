(function () {
  const mode = document.body.dataset.mode || 'low';
  const metric = document.body.dataset.metric || 'overview';
  const high = mode === 'high';
  const start = performance.now();

  const presets = {
    'client-time': ['Client Time', high ? 6200 : 450, 'ms'],
    'content-load': ['Content Load', high ? 7200 : 600, 'ms'],
    'dom-load': ['DOM Load', high ? 5800 : 350, 'ms'],
    'document-complete': ['Document Complete', high ? 9000 : 900, 'ms'],
    'fcp': ['First Contentful Paint', high ? 4800 : 450, 'ms'],
    'fp': ['First Paint', high ? 4300 : 300, 'ms'],
    'fps': ['Frames Per Second', high ? 12 : 60, 'fps'],
    'items': ['Items', high ? 2500 : 25, 'items'],
    'lcp': ['Largest Contentful Paint', high ? 6800 : 900, 'ms'],
    'render-start': ['Render Start', high ? 3900 : 180, 'ms'],
    'self-bottleneck': ['Self Bottleneck', high ? 5200 : 80, 'ms'],
    'self-downloaded-bytes': ['Self Downloaded Bytes', high ? 4800000 : 52000, 'bytes'],
    'speed-index': ['Speed Index', high ? 8300 : 950, 'ms'],
    'third-party-bottleneck': ['Third Party Bottleneck', high ? 4100 : 40, 'ms'],
    'tti': ['Time To Interactive', high ? 9400 : 1000, 'ms'],
    'time-to-title': ['Time To Title', high ? 3600 : 70, 'ms'],
    'tbt': ['Total Blocking Time', high ? 1800 : 20, 'ms'],
    'visually-complete': ['Visually Complete', high ? 8700 : 1100, 'ms'],
    'webpage-response-time': ['Webpage Response Time', high ? 6500 : 180, 'ms'],
    'webpage-throughput-time': ['Webpage Throughput Time', high ? 7600 : 500, 'ms'],
    'cls': ['Cumulative Layout Shift', high ? 0.45 : 0.01, 'score']
  };

  function $(id) { return document.getElementById(id); }
  function log(msg) {
    const el = $('log');
    if (el) el.textContent += '[' + Math.round(performance.now()) + 'ms] ' + msg + '\n';
  }
  function setText(id, text) { const el = $(id); if (el) el.textContent = text; }
  function block(ms) {
    const end = performance.now() + ms;
    while (performance.now() < end) Math.sqrt(Math.random());
  }
  function createItems(count) {
    const host = $('items-host');
    if (!host) return;
    for (let i = 0; i < count; i++) {
      const div = document.createElement('div');
      div.textContent = 'Generated item ' + (i + 1);
      div.style.padding = '2px 0';
      host.appendChild(div);
    }
  }
  function simulateMetric() {
    const preset = presets[metric] || ['Metric', high ? 5000 : 500, 'ms'];
    setText('metric-name', preset[0]);
    setText('mode-name', high ? 'HIGH / intentionally poor' : 'LOW / optimized');
    setText('metric-value', preset[1] + ' ' + preset[2]);
    log('Scenario loaded: ' + preset[0] + ' / ' + mode);

    if (high) {
      if (['fcp','fp','render-start','content-load','dom-load','document-complete','client-time','tti','tbt','self-bottleneck','third-party-bottleneck'].includes(metric)) {
        block(metric === 'tbt' ? 1800 : 900);
        log('Main thread was intentionally blocked.');
      }
      if (metric === 'time-to-title') {
        setTimeout(() => { document.title = 'Delayed Title - High'; log('Title changed late.'); }, 3600);
      }
      if (metric === 'cls') {
        setTimeout(() => {
          const b = document.createElement('div');
          b.className = 'shift-box';
          b.textContent = 'Late injected banner caused layout shift.';
          document.body.insertBefore(b, document.querySelector('main'));
          log('Late banner injected above content.');
        }, 900);
      }
      if (metric === 'lcp' || metric === 'speed-index' || metric === 'visually-complete') {
        const hero = $('hero');
        if (hero) {
          hero.textContent = 'Waiting for large visual...';
          setTimeout(() => { hero.textContent = 'Large visual content finally rendered'; log('Large visual rendered late.'); }, 4200);
        }
      }
      if (metric === 'fps') {
        let frames = 0;
        const timer = setInterval(() => { block(70); frames++; if (frames > 40) clearInterval(timer); }, 100);
        log('Animation intentionally janky.');
      }
      if (metric === 'items') createItems(800);
      if (metric === 'self-downloaded-bytes') {
        const payload = 'x'.repeat(1000000);
        window.__fakePayload = [payload, payload, payload, payload];
        log('Large in-memory payload created to simulate heavy download/processing.');
      }
      if (metric === 'webpage-response-time' || metric === 'webpage-throughput-time') {
        setTimeout(() => log('Simulated delayed response completed.'), 4500);
      }
    } else {
      if (metric === 'items') createItems(20);
      if (metric === 'time-to-title') document.title = 'Fast Title - Low';
      log('Optimized page rendered with minimal blocking.');
    }
  }

  function browserMeasurements() {
    window.addEventListener('load', () => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        setText('browser-dom', Math.round(nav.domContentLoadedEventEnd) + ' ms');
        setText('browser-load', Math.round(nav.loadEventEnd) + ' ms');
      }
      setText('browser-client', Math.round(performance.now() - start) + ' ms');
    });

    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.name === 'first-paint') setText('browser-fp', Math.round(e.startTime) + ' ms');
          if (e.name === 'first-contentful-paint') setText('browser-fcp', Math.round(e.startTime) + ' ms');
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (e) {}

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) setText('browser-lcp', Math.round(last.startTime) + ' ms');
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}

    try {
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) cls += e.value;
        }
        setText('browser-cls', cls.toFixed(3));
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  }

  simulateMetric();
  browserMeasurements();
})();
