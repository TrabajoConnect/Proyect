// Lista las solicitudes de clientes y las muestra como tarjetas.

async function cargarSolicitudes() {
  const cont = document.querySelector('.lista-servicios');
  if (!cont) return;
  cont.innerHTML = '<p>Cargando solicitudes...</p>';
  try {
    const datos = await API.get('/api/solicitudes');
    if (!Array.isArray(datos) || datos.length === 0) {
      cont.innerHTML = '<p>No hay solicitudes aún.</p>';
      return;
    }
    cont.innerHTML = datos.map(s => `
      <div class="tarjeta" data-id="${s.id}">
        <img src="${s.imagen || 'https://via.placeholder.com/250x150?text=Solicitud'}" alt="${s.servicio || 'Servicio'}">
        <h3>${s.servicio || 'Servicio solicitado'}</h3>
        <p><strong>Cliente:</strong> ${s.nombre || 'Anónimo'}</p>
        <p><strong>Ubicación:</strong> ${s.ubicacion || ''}</p>
        <p>${s.descripcion ? s.descripcion : ''}</p>
        ${
          (s.precio_min != null || s.precio_max != null)
            ? `<small><strong>Rango estimado:</strong> ${s.precio_min != null ? s.precio_min : '—'} - ${s.precio_max != null ? s.precio_max : '—'}</small>`
            : ''
        }
        <button type="button" class="btn-ver-trabajo" data-id="${s.id}">Ver trabajo</button>
      </div>
    `).join('');

    // Delegación para abrir detalle en nueva pestaña
    if (!cont.dataset.bound) {
      cont.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-trabajo');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        if (id) window.open(`solicitud.html?id=${id}`, '_blank', 'noopener');
      });
      cont.dataset.bound = '1';
    }

    // Modo desarrollador: clic derecho para eliminar tarjeta (solicitud)
    if (!cont.dataset.devctx) {
      const devEnabled = (() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('dev') === '1') { try { localStorage.setItem('devMode','1'); } catch(_) {} return true; }
        try { return localStorage.getItem('devMode') === '1'; } catch(_) { return false; }
      })();
      if (devEnabled) {
        cont.addEventListener('contextmenu', async (e) => {
          const card = e.target.closest('.tarjeta[data-id]');
          if (!card) return;
          e.preventDefault();
          const id = card.getAttribute('data-id');
          if (!id) return;
          if (!confirm(`[DEV] Eliminar trabajo #${id}?`)) return;
          try {
            await API.delete(`/api/solicitudes/${id}`);
            await cargarSolicitudes();
          } catch (err) { alert(err.message); }
        });
        cont.dataset.devctx = '1';
        console.info('[DEV] Clic derecho para eliminar trabajos en listado activado.');
      }
    }
  } catch (err) {
    cont.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', cargarSolicitudes);
