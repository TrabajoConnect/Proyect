(function(){
  // Default API_BASE resolution:
  // - If already set (e.g., page added a specific URL), respect it
  // - Else, if running under http/https, use same-origin (works on Render)
  // - Else (file:// or unknown), fall back to local dev server
  if (window.API_BASE) return;
  try {
    var origin = location.origin || '';
    if (origin.startsWith('http')) {
      window.API_BASE = origin;
    } else {
      window.API_BASE = 'http://localhost:3000';
    }
  } catch (e) {
    window.API_BASE = 'http://localhost:3000';
  }
})();
