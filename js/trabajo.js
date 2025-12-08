// Lista las solicitudes de clientes y las muestra como tarjetas filtrables.

async function cargarSolicitudes() {
  const cont = document.querySelector('.lista-servicios');
  if (!cont) return;
  cont.innerHTML = '<p>Cargando solicitudes...</p>';
  try {
    const q = document.getElementById('q')?.value?.trim() || '';
    const valServicio = document.getElementById('filtro-servicio')?.value?.trim() || '';
    const valUbicacion = document.getElementById('filtro-ubicacion')?.value?.trim() || '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (valServicio) params.set('servicio', valServicio);
    if (valUbicacion) params.set('ubicacion', valUbicacion);
    const qs = params.toString();
    const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
    if (newUrl !== window.location.pathname + window.location.search) {
      history.replaceState(null, '', newUrl);
    }

    const datos = await API.get('/api/solicitudes' + (qs ? `?${qs}` : ''));
    if (!Array.isArray(datos) || datos.length === 0) {
      cont.innerHTML = params.size
        ? '<p>No hay solicitudes que coincidan con la búsqueda.</p>'
        : '<p>No hay solicitudes aún.</p>';
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

    if (!cont.dataset.bound) {
      cont.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-ver-trabajo');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        if (id) window.open(`solicitud.html?id=${id}`, '_blank', 'noopener');
      });
      cont.dataset.bound = '1';
    }

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

function hookFiltrosTrabajo(options = {}) {
  const btnBuscar = document.getElementById('btn-buscar');
  if (btnBuscar) btnBuscar.addEventListener('click', cargarSolicitudes);
  const q = document.getElementById('q');
  if (q) q.addEventListener('keyup', (e) => { if (e.key === 'Enter') cargarSolicitudes(); });

  const modal = document.getElementById('filtros-modal');
  const btnToggleFiltros = document.getElementById('btn-toggle-filtros');
  const btnCerrar = document.getElementById('btn-cerrar-filtros');
  const btnAplicar = document.getElementById('btn-aplicar-filtros');
  const btnLimpiar = document.getElementById('btn-limpiar-filtros');
  const inputServicio = document.getElementById('filtro-servicio');
  const inputUbicacion = document.getElementById('filtro-ubicacion');
  let dropdownAbierto = null;

  const cerrarDropdowns = () => {
    if (!dropdownAbierto) return;
    dropdownAbierto.list.setAttribute('hidden', '');
    dropdownAbierto.button.setAttribute('aria-expanded', 'false');
    dropdownAbierto = null;
  };

  const abrirDropdown = (button, list) => {
    if (!button || !list) return;
    if (dropdownAbierto?.list === list) {
      cerrarDropdowns();
      return;
    }
    cerrarDropdowns();
    list.removeAttribute('hidden');
    button.setAttribute('aria-expanded', 'true');
    dropdownAbierto = { button, list };
  };

  const bloquearScroll = (activar) => {
    if (activar) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
  };

  const actualizarToggleState = (abierto) => {
    if (!btnToggleFiltros) return;
    btnToggleFiltros.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    btnToggleFiltros.setAttribute('aria-label', abierto ? 'Ocultar filtros' : 'Mostrar filtros');
  };

  const abrirModalFiltros = () => {
    if (!modal) return;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    cerrarDropdowns();
    bloquearScroll(true);
    actualizarToggleState(true);
    inputServicio?.focus();
  };

  const cerrarModalFiltros = () => {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    cerrarDropdowns();
    bloquearScroll(false);
    actualizarToggleState(false);
  };

  if (btnToggleFiltros) btnToggleFiltros.addEventListener('click', abrirModalFiltros);
  if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalFiltros);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target !== modal) return;
      if (dropdownAbierto) {
        cerrarDropdowns();
        return;
      }
      cerrarModalFiltros();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !modal || modal.hasAttribute('hidden')) return;
    if (dropdownAbierto) {
      cerrarDropdowns();
      return;
    }
    cerrarModalFiltros();
  });

  if (btnAplicar) {
    btnAplicar.addEventListener('click', () => {
      cerrarModalFiltros();
      cargarSolicitudes();
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      if (inputServicio) inputServicio.value = '';
      if (inputUbicacion) inputUbicacion.value = '';
      cargarSolicitudes();
    });
  }

  [inputServicio, inputUbicacion].forEach((input) => {
    if (!input) return;
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnAplicar ? btnAplicar.click() : cargarSolicitudes();
      }
    });
  });

  const dropdownArrows = document.querySelectorAll('.dropdown-arrow');
  dropdownArrows.forEach((button) => {
    const listId = button.dataset.dropdown;
    const inputId = button.dataset.input;
    if (!listId || !inputId) return;
    const list = document.getElementById(listId);
    const input = document.getElementById(inputId);
    if (!list || !input) return;

    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const isHidden = list.hasAttribute('hidden');
      if (isHidden) abrirDropdown(button, list);
      else cerrarDropdowns();
    });

    list.addEventListener('click', (event) => {
      const optionBtn = event.target.closest('button[data-value]');
      if (!optionBtn) return;
      event.preventDefault();
      const value = optionBtn.dataset.value || optionBtn.textContent.trim();
      input.value = value;
      cerrarDropdowns();
      input.focus();
    });

    list.addEventListener('wheel', (event) => {
      event.preventDefault();
      event.stopPropagation();
      list.scrollTop += event.deltaY;
    }, { passive: false });
  });

  document.addEventListener('wheel', (event) => {
    if (!dropdownAbierto) return;
    const { list } = dropdownAbierto;
    if (list.contains(event.target)) return;
    event.preventDefault();
    list.scrollTop += event.deltaY;
  }, { passive: false });

  document.addEventListener('click', (event) => {
    if (!dropdownAbierto) return;
    const { button, list } = dropdownAbierto;
    if (button.contains(event.target) || list.contains(event.target)) return;
    cerrarDropdowns();
  });

  if (options.autoOpen) abrirModalFiltros();
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  const servicio = params.get('servicio');
  const ubicacion = params.get('ubicacion');
  if (qParam && document.getElementById('q')) document.getElementById('q').value = qParam;
  if (servicio && document.getElementById('filtro-servicio')) document.getElementById('filtro-servicio').value = servicio;
  if (ubicacion && document.getElementById('filtro-ubicacion')) document.getElementById('filtro-ubicacion').value = ubicacion;
  hookFiltrosTrabajo({ autoOpen: Boolean(servicio || ubicacion) });
  cargarSolicitudes();
});
