// En esta página pedimos a la API la lista de profesionales y los dibujamos como tarjetas.

function formatExperiencia(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  const hoy = new Date();
  let anos = hoy.getFullYear() - fecha.getFullYear();
  if (hoy.getMonth() < fecha.getMonth() || (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate())) {
    anos -= 1;
  }
  const fechaStr = fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
  return `${fechaStr} · ${anos >= 0 ? `${anos} año${anos === 1 ? '' : 's'}` : '0 años'}`;
}

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
        <p>${p.servicio || ''} ${p.experiencia ? `- ${formatExperiencia(p.experiencia)}` : ''}</p>
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

function hookFiltros(options = {}) {
  const btnBuscar = document.getElementById('btn-buscar');
  if (btnBuscar) btnBuscar.addEventListener('click', cargarProfesionales);
  const q = document.getElementById('q');
  if (q) q.addEventListener('keyup', (e) => { if (e.key === 'Enter') cargarProfesionales(); });

  const modal = document.getElementById('filtros-modal');
  const btnToggleFiltros = document.getElementById('btn-toggle-filtros');
  const btnCerrar = document.getElementById('btn-cerrar-filtros');
  const btnAplicar = document.getElementById('btn-aplicar-filtros');
  const btnLimpiar = document.getElementById('btn-limpiar-filtros');
  const inputServicio = document.getElementById('filtro-servicio');
  const inputUbicacion = document.getElementById('filtro-ubicacion');
  let dropdownAbierto = null;

  const handleDropdownWheel = (event) => {
    if (!dropdownAbierto) return;
    const { list } = dropdownAbierto;
    if (list.contains(event.target)) return; // permitir scroll natural dentro del listado
    event.preventDefault();
    list.scrollTop += event.deltaY;
  };

  document.addEventListener('wheel', handleDropdownWheel, { passive: false });

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
    if (activar) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  };

  const actualizarToggleState = (abierto) => {
    if (!btnToggleFiltros) return;
    btnToggleFiltros.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    btnToggleFiltros.setAttribute('aria-label', abierto ? 'Ocultar filtros' : 'Mostrar filtros');
  };

  const abrirModalFiltros = () => {
    if (!modal) return;
    cerrarDropdowns();
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
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
      cargarProfesionales();
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', () => {
      if (inputServicio) inputServicio.value = '';
      if (inputUbicacion) inputUbicacion.value = '';
      cargarProfesionales();
    });
  }

  [inputServicio, inputUbicacion].forEach((input) => {
    if (!input) return;
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnAplicar ? btnAplicar.click() : cargarProfesionales();
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
      if (isHidden) {
        abrirDropdown(button, list);
      } else {
        cerrarDropdowns();
      }
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

  });

  document.addEventListener('click', (event) => {
    if (!dropdownAbierto) return;
    const { button, list } = dropdownAbierto;
    if (button.contains(event.target) || list.contains(event.target)) return;
    cerrarDropdowns();
  });

  if (options.autoOpen) abrirModalFiltros();
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
  }
  if (ubicacion && document.getElementById('filtro-ubicacion')) {
    document.getElementById('filtro-ubicacion').value = ubicacion;
  }
  hookFiltros({ autoOpen: Boolean(servicio || ubicacion) });
  cargarProfesionales();
});
