// Maneja el formulario de registro y llama a la API
(function(){
  const form = document.getElementById('registro-form');
  const msg = document.getElementById('registro-msg');
  if (!form) return;

  function setMsg(text, type) {
    msg.textContent = text || '';
    msg.className = `msg ${type || ''}`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setMsg('Procesando...', '');

    const data = Object.fromEntries(new FormData(form).entries());

    // Validaciones rápidas del lado del cliente para mejor UX
    if (!data.nombre || data.nombre.trim().length < 2) {
      return setMsg('Nombre debe tener al menos 2 caracteres.', 'error');
    }
    if (!data.email && !data.telefono) {
      return setMsg('Debes ingresar correo o teléfono.', 'error');
    }
    if (data.password !== data.confirmar) {
      return setMsg('Las contraseñas no coinciden.', 'error');
    }

    try {
      const usuario = await API.post('/api/auth/register', {
        nombre: data.nombre.trim(),
        email: data.email?.trim() || '',
        telefono: data.telefono?.trim() || '',
        ubicacion: data.ubicacion?.trim() || '',
        password: data.password,
        confirmar: data.confirmar,
      });
      // Guardamos el usuario en localStorage para simular "sesión"
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setMsg('Cuenta creada. Redirigiendo...', 'success');
      setTimeout(() => { window.location.href = 'inicio.html'; }, 800);
    } catch (err) {
      setMsg(err.message || 'Error al registrar.', 'error');
    }
  });
})();
