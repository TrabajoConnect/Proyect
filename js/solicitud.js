// Carga el detalle de una solicitud por id y lo muestra con el mismo layout que el perfil
(function(){
  function qs(name){ const p = new URLSearchParams(window.location.search); return p.get(name); }
  function show(el, v){ if (!el) return; el.style.display = v ? '' : 'none'; }

  async function cargarSolicitud() {
    const id = Number(qs('id'));
    const $cargando = document.getElementById('solicitud-cargando');
    const $error = document.getElementById('solicitud-error');
    const $contenido = document.getElementById('solicitud-contenido');

    if (!id) {
      if ($error) $error.textContent = 'Id de solicitud inválido.';
      show($error, true); show($cargando, false); show($contenido, false);
      return;
    }

    try {
      const s = await API.get(`/api/solicitudes/${id}`);
      const img = document.getElementById('solicitud-imagen');
      if (img) { img.src = s.imagen || 'https://via.placeholder.com/320x200?text=Solicitud'; img.alt = s.servicio || 'Solicitud'; }
      const servicio = document.getElementById('solicitud-servicio');
      if (servicio) servicio.textContent = s.servicio || 'Servicio solicitado';
      const cliente = document.getElementById('solicitud-cliente');
      if (cliente) cliente.textContent = `Cliente: ${s.nombre || 'Anónimo'}`;

      const desc = document.getElementById('solicitud-descripcion'); if (desc) desc.textContent = s.descripcion || '-';
      const ubi = document.getElementById('solicitud-ubicacion'); if (ubi) ubi.textContent = s.ubicacion || '-';
      const rango = (s.precio_min != null || s.precio_max != null)
        ? `${s.precio_min != null ? s.precio_min : '—'} - ${s.precio_max != null ? s.precio_max : '—'}`
        : '—';
      const r = document.getElementById('solicitud-rango'); if (r) r.textContent = rango;

      // Contacto
      const tel = (s.telefono || '').trim();
      const em = (s.email || '').trim();
      const telLink = document.getElementById('solicitud-telefono');
      const emailLink = document.getElementById('solicitud-email');
      const btnTel = document.getElementById('btn-llamar');
      const btnEmail = document.getElementById('btn-email');
      if (tel) {
        if (telLink) { telLink.textContent = tel; telLink.href = `tel:${tel}`; }
        if (btnTel) { btnTel.href = `tel:${tel}`; btnTel.removeAttribute('disabled'); }
      } else {
        if (telLink) { telLink.textContent = '-'; telLink.removeAttribute('href'); }
        if (btnTel) btnTel.setAttribute('disabled', 'true');
      }
      if (em) {
        if (emailLink) { emailLink.textContent = em; emailLink.href = `mailto:${em}`; }
        if (btnEmail) { const asunto = encodeURIComponent(`Propuesta para: ${s.servicio || 'tu solicitud'}`); btnEmail.href = `mailto:${em}?subject=${asunto}`; btnEmail.removeAttribute('disabled'); }
      } else {
        if (emailLink) { emailLink.textContent = '-'; emailLink.removeAttribute('href'); }
        if (btnEmail) btnEmail.setAttribute('disabled', 'true');
      }

      show($contenido, true); show($cargando, false); show($error, false);

      // Modo desarrollador: clic derecho en la ficha para eliminar esta solicitud
      if ($contenido && !$contenido.dataset.devctx) {
        const devEnabled = (() => {
          const url = new URL(window.location.href);
          if (url.searchParams.get('dev') === '1') { try { localStorage.setItem('devMode','1'); } catch(_) {} return true; }
          try { return localStorage.getItem('devMode') === '1'; } catch(_) { return false; }
        })();
        if (devEnabled) {
          $contenido.addEventListener('contextmenu', async (e) => {
            const within = e.target.closest('#solicitud-contenido');
            if (!within) return;
            e.preventDefault();
            if (!confirm(`[DEV] Eliminar trabajo #${id}?`)) return;
            try {
              await API.delete(`/api/solicitudes/${id}`);
              alert('Trabajo eliminado');
              window.location.href = 'trabajo.html';
            } catch (err) { alert(err.message); }
          });
          $contenido.dataset.devctx = '1';
          console.info('[DEV] Clic derecho para eliminar este trabajo activado.');
        }
      }
    } catch (e) {
      if ($error) $error.textContent = e.message || 'No se pudo cargar la solicitud.';
      show($error, true); show($cargando, false); show($contenido, false);
    }
  }

  if (document.readyState !== 'loading') cargarSolicitud();
  else document.addEventListener('DOMContentLoaded', cargarSolicitud);
})();
