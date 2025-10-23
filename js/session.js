// Actualiza el texto del enlace de autenticación en el menú
(function(){
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(() => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
      const link = document.getElementById('menu-auth-link');
      if (!link) return;
      if (usuario) {
        link.textContent = 'Mi cuenta';
        link.setAttribute('href', 'cuenta.html');
      } else {
        link.textContent = 'Iniciar sesión';
        link.setAttribute('href', 'login.html');
      }
    } catch (_) { /* ignoramos errores de parseo */ }
  });
})();
