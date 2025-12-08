// Este archivo conecta el formulario de "Publicar" con la API.
// Lee los datos del formulario, los valida de forma básica y los envía al servidor.

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB, coincide con límite del servidor

function leerArchivoComoDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

function esFechaValida(valor) {
  if (!valor) return false;
  const fecha = new Date(valor);
  return !Number.isNaN(fecha.getTime());
}

function formatearExperiencia(valor) {
  if (!valor) return '-';
  if (!esFechaValida(valor)) return valor;
  const fecha = new Date(valor);
  const hoy = new Date();
  let anos = hoy.getFullYear() - fecha.getFullYear();
  const antesDeAniversario = hoy.getMonth() < fecha.getMonth() || (hoy.getMonth() === fecha.getMonth() && hoy.getDate() < fecha.getDate());
  if (antesDeAniversario) anos -= 1;
  const fechaFormateada = fecha.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
  return anos >= 0 ? `${fechaFormateada} · ${anos} año${anos === 1 ? '' : 's'} de experiencia` : fechaFormateada;
}

function setValorExperienciaInput(input, valor) {
  if (!input) return;
  if (esFechaValida(valor)) {
    const iso = new Date(valor).toISOString().slice(0, 10);
    input.value = iso;
    input.removeAttribute('data-placeholder');
    input.removeAttribute('placeholder');
  } else if (valor) {
    input.value = '';
    input.setAttribute('placeholder', `Antes: ${valor}`);
  } else {
    input.value = '';
    input.removeAttribute('placeholder');
  }
}

// Muestra en pantalla un resumen de lo que se envió (no es obligatorio, solo informativo)
function mostrarResultado(id, datos, imagenSrc) {
  const resultado = document.getElementById('resultado');
  if (document.getElementById('resId')) document.getElementById('resId').textContent = id != null ? id : '-';
  document.getElementById('resNombre').textContent = datos.nombre;
  document.getElementById('resCedula').textContent = datos.cedula;
  document.getElementById('resServicio').textContent = datos.servicio;
  document.getElementById('resExperiencia').textContent = formatearExperiencia(datos.experiencia);
  document.getElementById('resUbicacion').textContent = datos.ubicacion;
  if (document.getElementById('resTelefono')) document.getElementById('resTelefono').textContent = datos.telefono || '';
  if (document.getElementById('resEmail')) document.getElementById('resEmail').textContent = datos.email || '';
  document.getElementById('resHorario').textContent = datos.horario;
  const preview = document.getElementById('imagenPreview');
  const finalPreview = imagenSrc || datos.imagen;
  if (preview) {
    if (finalPreview) preview.src = finalPreview; else preview.removeAttribute('src');
  }
  resultado.style.display = 'block';

  // Botones persistentes de modificar/eliminar
  const btnMod = document.getElementById('btn-modificar-publicacion');
  const btnDel = document.getElementById('btn-eliminar-publicacion');
  if (btnMod && typeof btnMod._bound === 'undefined') {
    btnMod.addEventListener('click', async () => {
      try {
        const pubId = window.__lastProfesionalId || window.__editingProfesionalId || id;
        if (!pubId) return;
        const p = await API.get(`/api/profesionales/${pubId}`);
        const form = document.getElementById('registroForm');
        if (!form) return;
        form.nombre.value = p.nombre || '';
        form.cedula.value = p.cedula || '';
        const servicioSelect = document.getElementById('servicio');
        const otroServicioInput = document.getElementById('otroServicioInput');
        const servicio = p.servicio || '';
        const known = ['Tutor','Electricista','Niñera','Ebanista','Otro'];
        if (!known.includes(servicio)) { servicioSelect.value = 'Otro'; otroServicioInput.style.display = 'block'; otroServicioInput.value = servicio; }
        else { servicioSelect.value = servicio; otroServicioInput.style.display = servicio === 'Otro' ? 'block' : 'none'; otroServicioInput.value = servicio === 'Otro' ? servicio : ''; }
        setValorExperienciaInput(form.experiencia, p.experiencia);
        form.ubicacion.value = p.ubicacion || '';
        form.telefono.value = p.telefono || '';
        form.email.value = p.email || '';
        form.horario.value = p.horario || '';
        window.__editingProfesionalId = p.id;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) { alert(err.message); }
    });
    btnMod._bound = true;
  }
  if (btnDel && typeof btnDel._bound === 'undefined') {
    btnDel.addEventListener('click', async () => {
      const pubId = window.__lastProfesionalId || window.__editingProfesionalId || id;
      if (!pubId) return;
      if (!confirm('¿Eliminar esta publicación?')) return;
      try {
        await API.delete(`/api/profesionales/${pubId}`);
        // Limpiar resultado tras eliminar
        document.getElementById('resId').textContent = '-';
        document.getElementById('resNombre').textContent = '';
        document.getElementById('resCedula').textContent = '';
        document.getElementById('resServicio').textContent = '';
        document.getElementById('resExperiencia').textContent = '';
        document.getElementById('resUbicacion').textContent = '';
        document.getElementById('resTelefono').textContent = '';
        document.getElementById('resEmail').textContent = '';
        document.getElementById('resHorario').textContent = '';
        const preview = document.getElementById('imagenPreview');
        if (preview) preview.removeAttribute('src');
        await cargarMisPublicaciones();
      } catch (err) { alert(err.message); }
    });
    btnDel._bound = true;
  }
}

// Prepara los eventos y el envío del formulario
function hookPublicarFormulario() {
  const form = document.getElementById('registroForm');
  const servicioSelect = document.getElementById('servicio');
  const otroServicioInput = document.getElementById('otroServicioInput');

  if (!form) return;

  // Mostrar input adicional si es "Otro"
  servicioSelect.addEventListener('change', function () {
    otroServicioInput.style.display = this.value === 'Otro' ? 'block' : 'none';
  });

  // Envío del formulario a la API
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const servicioElegido = servicioSelect.value === 'Otro' ? (otroServicioInput.value || 'Otro') : servicioSelect.value;

    const payload = {
      nombre: form.nombre.value.trim(),
      cedula: form.cedula.value.trim(),
      servicio: servicioElegido,
      experiencia: form.experiencia.value.trim(),
      ubicacion: form.ubicacion.value.trim(),
      telefono: (form.telefono?.value || '').trim(),
      email: (form.email?.value || '').trim(),
      horario: form.horario.value.trim()
    };

    let imagenSrc = '';
    const file = form.imagen?.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_BYTES) {
        alert('La imagen supera el límite de 5 MB. Por favor selecciona una más ligera.');
        return;
      }
      try {
        imagenSrc = await leerArchivoComoDataURL(file);
        payload.imagen = imagenSrc;
      } catch (errorLectura) {
        alert(errorLectura?.message || 'No se pudo leer la imagen seleccionada.');
        return;
      }
    }

    try {
      const id = window.__editingProfesionalId;
      let nuevoId = id || null;
      if (id) {
        await API.put(`/api/profesionales/${id}`, payload);
        window.__editingProfesionalId = null;
      } else {
        const result = await API.post('/api/profesionales', payload);
        nuevoId = result.id;
        window.__lastProfesionalId = nuevoId;
      }

      // Cargar desde el servidor para reflejar datos reales y mostrar ficha persistente
      const finalId = nuevoId;
      let datos = payload;
      try { if (finalId) datos = await API.get(`/api/profesionales/${finalId}`); } catch(_) {}
      mostrarResultado(finalId, datos, imagenSrc);

      // Opcional: limpiar formulario
      // form.reset();
      await cargarMisPublicaciones();
    } catch (err) {
      alert(err.message);
    }
  });

  // Ya no ocultamos la ficha; permanece visible con botones propios
}

document.addEventListener('DOMContentLoaded', () => { hookPublicarFormulario(); cargarMisPublicaciones(); });

async function cargarMisPublicaciones() {
  const tbody = document.getElementById('tbody-publicaciones');
  const table = document.getElementById('tabla-publicaciones');
  const form = document.getElementById('registroForm');
  const servicioSelect = document.getElementById('servicio');
  const otroServicioInput = document.getElementById('otroServicioInput');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="10">Cargando tus publicaciones...</td></tr>';
  try {
    const datos = await API.get('/api/profesionales/mios');
    if (!Array.isArray(datos) || datos.length === 0) { tbody.innerHTML = '<tr><td colspan="10">No tienes publicaciones aún.</td></tr>'; return; }
    tbody.innerHTML = datos.map(p => `
      <tr data-id="${p.id}">
        <td>${p.id}</td>
        <td>${p.nombre || ''}</td>
        <td>${p.cedula || ''}</td>
        <td>${p.servicio || ''}</td>
        <td>${formatearExperiencia(p.experiencia)}</td>
        <td>${p.ubicacion || ''}</td>
        <td>${p.telefono || ''}</td>
        <td>${p.email || ''}</td>
        <td>${p.horario || ''}</td>
        <td>
          <button type="button" class="btn-editar" data-id="${p.id}">Modificar</button>
          <button type="button" class="btn-eliminar" data-id="${p.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');

    if (table && !table.dataset.bound) {
      table.addEventListener('click', async (e) => {
        const btnE = e.target.closest('.btn-eliminar');
        const btnEd = e.target.closest('.btn-editar');
        if (btnE) {
          const id = btnE.getAttribute('data-id');
          if (id && confirm('¿Eliminar esta publicación?')) {
            try { await API.delete(`/api/profesionales/${id}`); await cargarMisPublicaciones(); } catch(err){ alert(err.message); }
          }
        } else if (btnEd) {
          const id = btnEd.getAttribute('data-id');
          try {
            const p = await API.get(`/api/profesionales/${id}`);
            form.nombre.value = p.nombre || '';
            form.cedula.value = p.cedula || '';
            const servicio = p.servicio || '';
            const known = ['Tutor','Electricista','Niñera','Ebanista','Otro'];
            if (!known.includes(servicio)) { servicioSelect.value = 'Otro'; otroServicioInput.style.display = 'block'; otroServicioInput.value = servicio; }
            else { servicioSelect.value = servicio; otroServicioInput.style.display = servicio === 'Otro' ? 'block' : 'none'; otroServicioInput.value = servicio === 'Otro' ? servicio : ''; }
            setValorExperienciaInput(form.experiencia, p.experiencia);
            form.ubicacion.value = p.ubicacion || '';
            form.telefono.value = p.telefono || '';
            form.email.value = p.email || '';
            form.horario.value = p.horario || '';
            window.__editingProfesionalId = p.id;
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
          if (!confirm(`[DEV] Eliminar publicación #${id}?`)) return;
          try {
            await API.delete(`/api/profesionales/${id}`);
            // Si la ficha persistente muestra este id, limpiarla
            const currentId = (document.getElementById('resId')||{}).textContent;
            if (currentId && String(currentId) === String(id)) {
              document.getElementById('resId').textContent = '-';
              document.getElementById('resNombre').textContent = '';
              document.getElementById('resCedula').textContent = '';
              document.getElementById('resServicio').textContent = '';
              document.getElementById('resExperiencia').textContent = '';
              document.getElementById('resUbicacion').textContent = '';
              document.getElementById('resTelefono').textContent = '';
              document.getElementById('resEmail').textContent = '';
              document.getElementById('resHorario').textContent = '';
              const preview = document.getElementById('imagenPreview');
              if (preview) preview.removeAttribute('src');
            }
            await cargarMisPublicaciones();
          } catch (err) { alert(err.message); }
        });
        table.dataset.devctx = '1';
        console.info('[DEV] Clic derecho para eliminar publicaciones activado.');
      }
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" style=\"color:red\">${err.message}</td></tr>`;
  }
}
