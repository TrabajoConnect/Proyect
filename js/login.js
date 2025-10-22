// Maneja el formulario de login y llama a la API
(function(){
  const form = document.getElementById('login-form');
  const msg = document.getElementById('login-msg');
  if (!form) return;

  function setMsg(text, type) {
    msg.textContent = text || '';
    msg.className = `msg ${type || ''}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg('Verificando...', '');

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const usuario = await API.post('/api/auth/login', {
        identificador: (data.identificador || '').trim(),
        password: data.password || '',
      });
      // Guardamos el usuario en localStorage para simular "sesión"
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setMsg('Listo. Redirigiendo...', 'success');
      setTimeout(() => { window.location.href = 'inicio.html'; }, 500);
    } catch (err) {
      setMsg(err.message || 'No fue posible iniciar sesión.', 'error');
    }
  });
})();
