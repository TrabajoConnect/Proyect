// Cliente sencillo para hablar con la API desde el navegador.
// En vez de repetir fetch en cada archivo, centralizamos aquí las llamadas.
const API_BASE = window.API_BASE || 'http://localhost:3000';

// Hace una petición GET (leer datos) y devuelve el JSON resultante.
async function apiGet(path) {
  const resp = await fetch(`${API_BASE}${path}`);
  if (!resp.ok) throw new Error(`GET ${path} falló (${resp.status})`);
  return resp.json();
}

// Hace una petición POST (crear datos) enviando un cuerpo JSON y devuelve la respuesta.
async function apiPost(path, body) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    let msg = `POST ${path} falló (${resp.status})`;
    try { const e = await resp.json(); msg = e.error || msg; } catch (_) {}
    throw new Error(msg);
  }
  return resp.json();
}

// Exponemos las funciones en window para usarlas desde otros scripts del frontend
window.API = { get: apiGet, post: apiPost };
