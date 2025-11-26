// Runtime API config. This runs in the browser before the app bootstraps.
// Use localhost backend in dev; use Railway in prod.
(function(){
  try {
    var host = window.location.hostname || '';
    var isLocal = /^(localhost|127\.0\.0\.1)$/i.test(host);
    window.__API_BASE_URL__ = isLocal
      ? 'http://localhost:5000'
      : 'https://api.lotliterealestate.com';
  } catch (e) {
    window.__API_BASE_URL__ = 'https://api.lotliterealestate.com';
  }
})();


