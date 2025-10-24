// En esta página pedimos a la API la lista de profesionales y los dibujamos como tarjetas.

async function cargarProfesionales() {
  const contenedor = document.querySelector('.lista-servicios');
  if (!contenedor) return;

  contenedor.innerHTML = '<p>Cargando profesionales...</p>';
  try {
    // Construimos querystring a partir del buscador y filtros múltiples
    const q = document.getElementById('q')?.value?.trim() || '';
    const valServicio = document.getElementById('filtro-servicio')?.value?.trim() || '';
    const valUbicacion = document.getElementById('filtro-ubicacion')?.value?.trim() || '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (valServicio) params.set('servicio', valServicio);
    if (valUbicacion) params.set('ubicacion', valUbicacion);
    // Reflejar filtros en la URL para poder compartirla/recargar
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
    if (newUrl !== window.location.pathname + window.location.search) {
      history.replaceState(null, '', newUrl);
    }
    const path = '/api/profesionales' + (qs ? `?${qs}` : '');
    const datos = await API.get(path);

    if (!Array.isArray(datos) || datos.length === 0) {
      contenedor.innerHTML = params.size
        ? '<p>No se encontraron profesionales que coincidan con la búsqueda o el filtro.</p>'
        : '<p>No hay profesionales aún.</p>';
      return;
    }

    contenedor.innerHTML = datos.map(p => `
      <div class="tarjeta" data-id="${p.id}">
        <img src="${p.imagen || 'https://via.placeholder.com/250x150?text=Profesional'}" alt="${p.servicio || 'Servicio'}">
        <h3>${p.nombre || 'Sin nombre'}</h3>
        <p>${p.servicio || ''} ${p.experiencia ? `- ${p.experiencia}` : ''}</p>
        <small>${p.ubicacion || ''}</small>
        <button type="button" class="btn-ver-perfil" data-id="${p.id}">Ver perfil</button>
      </div>
    `).join('');

    // Delegación de eventos: abrir perfil en nueva pestaña al pulsar el botón
    if (!contenedor.dataset.bound) {
      contenedor.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-perfil');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        if (id) window.open(`perfil.html?id=${id}`, '_blank', 'noopener');
      });
      contenedor.dataset.bound = '1';
    }

    // Modo desarrollador: clic derecho para eliminar tarjeta (publicación)
    if (!contenedor.dataset.devctx) {
      const devEnabled = (() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('dev') === '1') { try { localStorage.setItem('devMode','1'); } catch(_) {} return true; }
        try { return localStorage.getItem('devMode') === '1'; } catch(_) { return false; }
      })();
      if (devEnabled) {
        contenedor.addEventListener('contextmenu', async (e) => {
          const card = e.target.closest('.tarjeta[data-id]');
          if (!card) return;
          e.preventDefault();
          const id = card.getAttribute('data-id');
          if (!id) return;
          if (!confirm(`[DEV] Eliminar publicación #${id}?`)) return;
          try {
            await API.delete(`/api/profesionales/${id}`);
            await cargarProfesionales();
          } catch (err) { alert(err.message); }
        });
        contenedor.dataset.devctx = '1';
        console.info('[DEV] Clic derecho para eliminar publicaciones en servicios activado.');
      }
    }
  } catch (err) {
    contenedor.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

function hookFiltros() {
  const btn = document.getElementById('btn-filtrar');
  if (btn) btn.addEventListener('click', cargarProfesionales);
  const q = document.getElementById('q');
  if (q) q.addEventListener('keyup', (e) => { if (e.key === 'Enter') cargarProfesionales(); });

  const selector = document.getElementById('selector-filtro');
  const campoServicio = document.getElementById('campo-servicio');
  const campoUbicacion = document.getElementById('campo-ubicacion');
  const inputServicio = document.getElementById('filtro-servicio');
  const inputUbicacion = document.getElementById('filtro-ubicacion');
  const acciones = document.getElementById('acciones-extra');
  const btnOtro = document.getElementById('btn-activar-otro');

  function actualizarUI() {
    const sel = selector ? selector.value : '';
    if (!selector) return;
    if (!sel) {
      if (campoServicio) campoServicio.style.display = 'none';
      if (campoUbicacion) campoUbicacion.style.display = 'none';
      if (acciones) acciones.style.display = 'none';
      return;
    }
    if (sel === 'servicio') {
      if (campoServicio) { campoServicio.style.display = ''; inputServicio && inputServicio.focus(); }
      if (campoUbicacion && !inputUbicacion.value) campoUbicacion.style.display = 'none';
      if (acciones) { acciones.style.display = ''; if (btnOtro) btnOtro.textContent = 'Añadir filtro por ubicación'; }
    } else if (sel === 'ubicacion') {
      if (campoUbicacion) { campoUbicacion.style.display = ''; inputUbicacion && inputUbicacion.focus(); }
      if (campoServicio && !inputServicio.value) campoServicio.style.display = 'none';
      if (acciones) { acciones.style.display = ''; if (btnOtro) btnOtro.textContent = 'Añadir filtro por profesión'; }
    }
    // Si ambos ya visibles, oculta el botón extra
    const ambosVisibles = campoServicio && campoServicio.style.display !== 'none' && campoUbicacion && campoUbicacion.style.display !== 'none';
    if (acciones) acciones.style.display = ambosVisibles ? 'none' : '';
  }

  if (selector) selector.addEventListener('change', actualizarUI);
  if (btnOtro) btnOtro.addEventListener('click', () => {
    const sel = selector ? selector.value : '';
    if (sel === 'servicio') {
      if (campoUbicacion) { campoUbicacion.style.display = ''; inputUbicacion && inputUbicacion.focus(); }
    } else if (sel === 'ubicacion') {
      if (campoServicio) { campoServicio.style.display = ''; inputServicio && inputServicio.focus(); }
    }
    if (acciones) acciones.style.display = 'none';
  });

  // Enter para inputs de filtro
  if (inputServicio) inputServicio.addEventListener('keyup', (e) => { if (e.key === 'Enter') cargarProfesionales(); });
  if (inputUbicacion) inputUbicacion.addEventListener('keyup', (e) => { if (e.key === 'Enter') cargarProfesionales(); });

  actualizarUI();
}

document.addEventListener('DOMContentLoaded', () => {
  // Prefill desde la URL si existen
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const servicio = params.get('servicio');
  const ubicacion = params.get('ubicacion');
  if (q && document.getElementById('q')) document.getElementById('q').value = q;
  if (servicio && document.getElementById('filtro-servicio')) {
    document.getElementById('filtro-servicio').value = servicio;
    const cs = document.getElementById('campo-servicio'); if (cs) cs.style.display = '';
    const selector = document.getElementById('selector-filtro'); if (selector) selector.value = 'servicio';
  }
  if (ubicacion && document.getElementById('filtro-ubicacion')) {
    document.getElementById('filtro-ubicacion').value = ubicacion;
    const cu = document.getElementById('campo-ubicacion'); if (cu) cu.style.display = '';
    const selector = document.getElementById('selector-filtro'); if (selector && !servicio) selector.value = 'ubicacion';
  }
  hookFiltros();
  cargarProfesionales();
});
