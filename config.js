(function(){
  // Priority order to resolve API_BASE:
  // 1) URL param ?api=... (useful to override from Pages or file://)
  // 2) Predefined global window.API_BASE
  // 3) If running under http/https, use same-origin (works on Render)
  // 4) If on GitHub Pages domain, default to your Render URL
  // 5) Fallback to local dev server

  try {
    var params = new URLSearchParams(location.search || '');
    var apiParam = params.get('api');
    if (apiParam) {
      window.API_BASE = apiParam;
      return;
    }
  } catch(_) {}

  if (window.API_BASE) return;

  try {
    var origin = location.origin || '';
    if (origin.startsWith('http')) {
      // If served via http(s), default to same origin
      window.API_BASE = origin;
      // If it's GitHub Pages, override to your Render service
      if (/\.github\.io$/i.test(location.hostname)) {
        window.API_BASE = 'https://trabajoconect-api.onrender.com';
      }
    } else {
      // file:// or unknown
      window.API_BASE = 'http://localhost:3000';
    }
  } catch (e) {
    window.API_BASE = 'http://localhost:3000';
  }
})();
