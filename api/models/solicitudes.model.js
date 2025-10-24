/**
 * Modelo de datos de "solicitudes" (Ofertar)
 *
 * Acceso a la tabla solicitudes: listar y crear solicitudes de clientes.
 */
const db = require('../../db/database');

/**
 * Lista solicitudes. Opcionalmente permite filtrar por servicio o ubicacion o hacer búsqueda general q.
 * filters: { q?: string, servicio?: string, ubicacion?: string }
 */
function listarSolicitudes(filters = {}) {
  const where = [];
  const params = [];
  if (filters.q) {
    const q = `%${String(filters.q).toLowerCase()}%`;
    where.push('(LOWER(servicio) LIKE ? OR LOWER(ubicacion) LIKE ? OR LOWER(nombre) LIKE ? OR LOWER(descripcion) LIKE ?)');
    params.push(q, q, q, q);
  }
  if (filters.servicio) {
    where.push('LOWER(servicio) LIKE ?');
    params.push(`%${String(filters.servicio).toLowerCase()}%`);
  }
  if (filters.ubicacion) {
    where.push('LOWER(ubicacion) LIKE ?');
    params.push(`%${String(filters.ubicacion).toLowerCase()}%`);
  }
  const sql = `SELECT * FROM solicitudes` + (where.length ? ` WHERE ${where.join(' AND ')}` : '') + ` ORDER BY datetime(created_at) DESC`;
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Crea una solicitud de cliente.
 * Espera: { nombre, ubicacion, servicio, descripcion, imagen?, precio_min?, precio_max? }
 * Devuelve { id }
 */
function crearSolicitud(data, userId) {
  const { nombre, ubicacion, servicio, descripcion, imagen, precio_min, precio_max, telefono, email } = data;
  const sql = `
    INSERT INTO solicitudes (nombre, ubicacion, servicio, descripcion, imagen, telefono, email, precio_min, precio_max, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [nombre || null, ubicacion || null, servicio || null, descripcion || null, imagen || null, telefono || null, email || null, precio_min ?? null, precio_max ?? null, userId || null], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function obtenerSolicitudPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM solicitudes WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

module.exports = { listarSolicitudes, crearSolicitud, obtenerSolicitudPorId };
function listarMias(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM solicitudes WHERE usuario_id = ? ORDER BY id DESC', [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function actualizarSolicitud(id, userId, data) {
  const campos = ['nombre','ubicacion','servicio','descripcion','imagen','telefono','email','precio_min','precio_max'];
  const sets = [];
  const params = [];
  for (const c of campos) {
    if (Object.prototype.hasOwnProperty.call(data, c)) { sets.push(`${c} = ?`); params.push(data[c] ?? null); }
  }
  if (!sets.length) return Promise.resolve({ changes: 0 });
  const sql = `UPDATE solicitudes SET ${sets.join(', ')} WHERE id = ? AND usuario_id = ?`;
  params.push(id, userId);
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){ if (err) return reject(err); resolve({ changes: this.changes }); });
  });
}

function eliminarSolicitud(id, userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM solicitudes WHERE id = ? AND usuario_id = ?', [id, userId], function(err){
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

module.exports = { listarSolicitudes, crearSolicitud, obtenerSolicitudPorId, listarMias, actualizarSolicitud, eliminarSolicitud };