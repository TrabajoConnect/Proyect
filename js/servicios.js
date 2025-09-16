// Carga y render de profesionales desde la API
const API_BASE = 'http://localhost:3000'; // Cambia a tu URL en Render cuando despliegues

async function cargarProfesionales() {
  const contenedor = document.querySelector('.lista-servicios');
  if (!contenedor) return;

  contenedor.innerHTML = '<p>Cargando profesionales...</p>';
  try {
    const resp = await fetch(`${API_BASE}/api/profesionales`);
    if (!resp.ok) throw new Error('Error al cargar profesionales');
    const datos = await resp.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      contenedor.innerHTML = '<p>No hay profesionales aún.</p>';
      return;
    }

    contenedor.innerHTML = datos.map(p => `
      <div class="tarjeta">
        <img src="${p.imagen || 'https://via.placeholder.com/250x150?text=Profesional'}" alt="${p.servicio || 'Servicio'}">
        <h3>${p.nombre || 'Sin nombre'}</h3>
        <p>${p.servicio || ''} ${p.experiencia ? `- ${p.experiencia}` : ''}</p>
        <small>${p.ubicacion || ''}</small>
        <button>Ver perfil</button>
      </div>
    `).join('');
  } catch (err) {
    contenedor.innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', cargarProfesionales);
