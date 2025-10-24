// Manejo del formulario de Ofertar (solicitud de servicio)

function formToData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  // Normalizar números
  if (data.precio_min === '') data.precio_min = null; else data.precio_min = Number(data.precio_min);
  if (data.precio_max === '') data.precio_max = null; else data.precio_max = Number(data.precio_max);
  if (data.imagen && !/^https?:\/\//i.test(data.imagen)) {
    // Permitir URLs sólo http/https; si no, dejar vacío
    data.imagen = '';
  }
  // Sanitizar contacto
  if (data.telefono && !/^[0-9+\-\s]{7,}$/.test(data.telefono)) data.telefono = '';
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) data.email = '';
  return data;
}

function mostrarResultadoOferta(id, s) {
  const box = document.getElementById('resultado');
  if (!box) return;
  const rango = (s.precio_min != null || s.precio_max != null)
    ? `${s.precio_min != null ? s.precio_min : '—'} - ${s.precio_max != null ? s.precio_max : '—'}`
    : '—';
  document.getElementById('resOfId').textContent = id ?? '-';
  document.getElementById('resOfNombre').textContent = s.nombre || '';
  document.getElementById('resOfUbicacion').textContent = s.ubicacion || '';
  document.getElementById('resOfServicio').textContent = s.servicio || '';
  document.getElementById('resOfDescripcion').textContent = s.descripcion || '';
  document.getElementById('resOfTelefono').textContent = s.telefono || '';
  document.getElementById('resOfEmail').textContent = s.email || '';
  document.getElementById('resOfRango').textContent = rango;
  box.style.display = 'block';

  const btnMod = document.getElementById('btn-modificar-oferta');
  const btnDel = document.getElementById('btn-eliminar-oferta');
  if (btnMod && typeof btnMod._bound === 'undefined') {
    btnMod.addEventListener('click', async () => {
      try {
        const currentId = window.__lastSolicitudId || window.__editingSolicitudId || id;
        if (!currentId) return;
        const d = await API.get(`/api/solicitudes/${currentId}`);
        const form = document.getElementById('form-ofertar');
        form.nombre.value = d.nombre || '';
        form.ubicacion.value = d.ubicacion || '';
        form.servicio.value = d.servicio || '';
        form.descripcion.value = d.descripcion || '';
        form.imagen.value = d.imagen || '';
        form.precio_min.value = d.precio_min ?? '';
        form.precio_max.value = d.precio_max ?? '';
        form.telefono.value = d.telefono || '';
        form.email.value = d.email || '';
        window.__editingSolicitudId = d.id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) { alert(err.message); }
    });
    btnMod._bound = true;
  }
  if (btnDel && typeof btnDel._bound === 'undefined') {
    btnDel.addEventListener('click', async () => {
      const currentId = window.__lastSolicitudId || window.__editingSolicitudId || id;
      if (!currentId) return;
      if (!confirm('¿Eliminar esta oferta?')) return;
      try {
        await API.delete(`/api/solicitudes/${currentId}`);
        // Limpiar tarjeta
        document.getElementById('resOfId').textContent = '-';
        document.getElementById('resOfNombre').textContent = '';
        document.getElementById('resOfUbicacion').textContent = '';
        document.getElementById('resOfServicio').textContent = '';
        document.getElementById('resOfDescripcion').textContent = '';
        document.getElementById('resOfTelefono').textContent = '';
        document.getElementById('resOfEmail').textContent = '';
        document.getElementById('resOfRango').textContent = '—';
        await cargarMisOfertas();
      } catch (err) { alert(err.message); }
    });
    btnDel._bound = true;
  }
}

async function enviarSolicitud(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const out = document.getElementById('resultado');
  out.style.display = 'block';
  out.style.color = '#333';
  out.textContent = 'Enviando solicitud...';
  try {
    const payload = formToData(form);
    const id = window.__editingSolicitudId;
    let resp;
    if (id) {
      resp = await API.put(`/api/solicitudes/${id}`, payload);
      window.__editingSolicitudId = null;
    } else {
      resp = await API.post('/api/solicitudes', payload);
      window.__lastSolicitudId = resp.id;
    }
    out.style.color = '#333';
    try {
      const finalId = id || resp.id;
      const s = await API.get(`/api/solicitudes/${finalId}`);
      mostrarResultadoOferta(finalId, s);
    } catch(_) {
      mostrarResultadoOferta(id || resp.id || null, payload);
    }
    form.reset();
    await cargarMisOfertas();
  } catch (err) {
    out.style.color = 'red';
    out.textContent = err.message || 'Error al publicar la solicitud';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-ofertar');
  if (form) form.addEventListener('submit', enviarSolicitud);
  cargarMisOfertas();
});

async function cargarMisOfertas() {
  const tbody = document.getElementById('tbody-ofertas');
  const table = document.getElementById('tabla-ofertas');
  const form = document.getElementById('form-ofertar');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="10">Cargando tus ofertas...</td></tr>';
  try {
    const datos = await API.get('/api/solicitudes/mias');
    if (!Array.isArray(datos) || datos.length === 0) { tbody.innerHTML = '<tr><td colspan="10">No tienes ofertas aún.</td></tr>'; return; }
    tbody.innerHTML = datos.map(s => `
      <tr data-id="${s.id}">
        <td>${s.id}</td>
        <td>${s.nombre || ''}</td>
        <td>${s.ubicacion || ''}</td>
        <td>${s.servicio || ''}</td>
        <td>${s.descripcion || ''}</td>
        <td>${s.telefono || ''}</td>
        <td>${s.email || ''}</td>
        <td>${s.precio_min ?? ''}</td>
        <td>${s.precio_max ?? ''}</td>
        <td>
          <button type="button" class="btn-editar" data-id="${s.id}">Modificar</button>
          <button type="button" class="btn-eliminar" data-id="${s.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');

    if (table && !table.dataset.bound) {
      table.addEventListener('click', async (e) => {
        const btnE = e.target.closest('.btn-eliminar');
        const btnEd = e.target.closest('.btn-editar');
        if (btnE) {
          const id = btnE.getAttribute('data-id');
          if (id && confirm('¿Eliminar esta oferta?')) {
            try { await API.delete(`/api/solicitudes/${id}`); await cargarMisOfertas(); } catch(err){ alert(err.message); }
          }
        } else if (btnEd) {
          const id = btnEd.getAttribute('data-id');
          try {
            const s = await API.get(`/api/solicitudes/${id}`);
            form.nombre.value = s.nombre || '';
            form.ubicacion.value = s.ubicacion || '';
            form.servicio.value = s.servicio || '';
            form.descripcion.value = s.descripcion || '';
            form.imagen.value = s.imagen || '';
            form.precio_min.value = s.precio_min ?? '';
            form.precio_max.value = s.precio_max ?? '';
            form.telefono.value = s.telefono || '';
            form.email.value = s.email || '';
            window.__editingSolicitudId = s.id;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch(err){ alert(err.message); }
        }
      });
      table.dataset.bound = '1';
    }

    // Modo desarrollador: eliminar con clic derecho sobre la fila
    if (table && !table.dataset.devctx) {
      const devEnabled = (() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('dev') === '1') { try { localStorage.setItem('devMode','1'); } catch(_) {} return true; }
        try { return localStorage.getItem('devMode') === '1'; } catch(_) { return false; }
      })();
      if (devEnabled) {
        table.addEventListener('contextmenu', async (e) => {
          const tr = e.target.closest('tr[data-id]');
          if (!tr) return;
          e.preventDefault();
          const id = tr.getAttribute('data-id');
          if (!id) return;
          if (!confirm(`[DEV] Eliminar oferta #${id}?`)) return;
          try {
            await API.delete(`/api/solicitudes/${id}`);
            // Si la ficha persistente muestra este id, limpiarla
            const currentIdEl = document.getElementById('resId');
            const currentId = currentIdEl ? currentIdEl.textContent : null;
            if (currentId && String(currentId) === String(id)) {
              currentIdEl.textContent = '-';
              const fields = ['Nombre','Servicio','Descripcion','Ubicacion','Telefono','Email','Rango'];
              fields.forEach(f => {
                const el = document.getElementById('res'+f);
                if (el) el.textContent = '';
              });
              const preview = document.getElementById('imagenPreviewOferta');
              if (preview) preview.removeAttribute('src');
            }
            await cargarMisOfertas();
          } catch (err) { alert(err.message); }
        });
        table.dataset.devctx = '1';
        console.info('[DEV] Clic derecho para eliminar ofertas activado.');
      }
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan=\"10\" style=\"color:red\">${err.message}</td></tr>`;
  }
}
