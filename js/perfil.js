(function(){
  function qs(name){ const p = new URLSearchParams(window.location.search); return p.get(name); }
  function show(el, v){ el.style.display = v ? '' : 'none'; }

  async function cargarPerfil() {
    const id = Number(qs('id'));
    const $cargando = document.getElementById('perfil-cargando');
    const $error = document.getElementById('perfil-error');
    const $contenido = document.getElementById('perfil-contenido');

    if (!id) {
      $error.textContent = 'Id de perfil inválido.';
      show($error, true); show($cargando, false); show($contenido, false);
      return;
    }

    try {
      const p = await API.get(`/api/profesionales/${id}`);
      document.getElementById('perfil-nombre').textContent = p.nombre || 'Sin nombre';
      document.getElementById('perfil-servicio').textContent = p.servicio || '-';
      document.getElementById('perfil-experiencia').textContent = p.experiencia || '-';
      document.getElementById('perfil-ubicacion').textContent = p.ubicacion || '-';
      document.getElementById('perfil-horario').textContent = p.horario || '-';
      document.getElementById('perfil-cedula').textContent = p.cedula || '-';
      const img = document.getElementById('perfil-imagen');
      img.src = p.imagen || 'https://via.placeholder.com/320x200?text=Profesional';
      img.alt = p.servicio || 'Servicio';

      // Contacto
      const tel = (p.telefono || '').trim();
      const email = (p.email || '').trim();
      const telLink = document.getElementById('perfil-telefono');
      const emailLink = document.getElementById('perfil-email');
      const btnTel = document.getElementById('btn-llamar');
      const btnEmail = document.getElementById('btn-email');
      if (tel) {
        telLink.textContent = tel;
        telLink.href = `tel:${tel}`;
        btnTel.href = `tel:${tel}`;
      } else {
        telLink.textContent = '-';
        telLink.removeAttribute('href');
        btnTel.setAttribute('disabled', 'true');
      }
      if (email) {
        emailLink.textContent = email;
        emailLink.href = `mailto:${email}`;
        btnEmail.href = `mailto:${email}`;
      } else {
        emailLink.textContent = '-';
        emailLink.removeAttribute('href');
        btnEmail.setAttribute('disabled', 'true');
      }

      show($contenido, true); show($cargando, false); show($error, false);

      // Modo desarrollador: clic derecho en la ficha para eliminar esta publicación
      if ($contenido && !$contenido.dataset.devctx) {
        const devEnabled = (() => {
          const url = new URL(window.location.href);
          if (url.searchParams.get('dev') === '1') { try { localStorage.setItem('devMode','1'); } catch(_) {} return true; }
          try { return localStorage.getItem('devMode') === '1'; } catch(_) { return false; }
        })();
        if (devEnabled) {
          $contenido.addEventListener('contextmenu', async (e) => {
            const within = e.target.closest('#perfil-contenido');
            if (!within) return;
            e.preventDefault();
            if (!confirm(`[DEV] Eliminar publicación #${id}?`)) return;
            try {
              await API.delete(`/api/profesionales/${id}`);
              alert('Publicación eliminada');
              window.location.href = 'servicios.html';
            } catch (err) { alert(err.message); }
          });
          $contenido.dataset.devctx = '1';
          console.info('[DEV] Clic derecho para eliminar esta publicación activado.');
        }
      }
    } catch (e) {
      $error.textContent = e.message || 'No se pudo cargar el perfil.';
      show($error, true); show($cargando, false); show($contenido, false);
    }
  }

  if (document.readyState !== 'loading') cargarPerfil();
  else document.addEventListener('DOMContentLoaded', cargarPerfil);
})();
