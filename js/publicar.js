// Conecta el formulario de publicar con la API y guarda en la base de datos
const API_BASE = 'http://localhost:3000'; // Cambia a tu URL en Render cuando despliegues

function mostrarResultado(datos, imagenSrc) {
  const resultado = document.getElementById('resultado');
  document.getElementById('resNombre').textContent = datos.nombre;
  document.getElementById('resCedula').textContent = datos.cedula;
  document.getElementById('resServicio').textContent = datos.servicio;
  document.getElementById('resExperiencia').textContent = datos.experiencia;
  document.getElementById('resUbicacion').textContent = datos.ubicacion;
  document.getElementById('resHorario').textContent = datos.horario;
  const preview = document.getElementById('imagenPreview');
  if (imagenSrc) preview.src = imagenSrc; else preview.removeAttribute('src');
  resultado.style.display = 'block';
}

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
      horario: form.horario.value.trim(),
      imagen: null // Nota: por ahora no subimos archivos; opcionalmente guarda una URL.
    };

    // Vista previa local de la imagen (no se sube al servidor todavía)
    let imagenSrc = '';
    const file = form.imagen.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagenSrc = e.target.result;
        // Mostrar vista previa tras subir exitosamente
      };
      reader.readAsDataURL(file);
    }

    try {
      const resp = await fetch(`${API_BASE}/api/profesionales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('No se pudo guardar la publicación');
      const result = await resp.json();

      // Mostrar resumen en la página
      mostrarResultado(payload, imagenSrc);

      // Opcional: limpiar formulario
      // form.reset();
    } catch (err) {
      alert(err.message);
    }
  });

  // Botón Modificar: oculta el resultado para editar
  window.modificarDatos = function () {
    const resultado = document.getElementById('resultado');
    if (resultado) resultado.style.display = 'none';
  };
}

document.addEventListener('DOMContentLoaded', hookPublicarFormulario);
