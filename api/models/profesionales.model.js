/**
 * Modelo de datos de "profesionales"
 *
 * Aquí vive el código que habla directamente con la base de datos (SQLite).
 * Ofrece funciones reutilizables para listar y crear profesionales.
 */
const db = require('../../db/database');

/**
 * Lista profesionales, con soporte de búsqueda general y filtros.
 * filters: { q?: string, servicio?: string, ubicacion?: string }
 */
function listarProfesionales(filters = {}) {
  const where = [];
  const params = [];
  if (filters.q) {
    const q = `%${String(filters.q).toLowerCase()}%`;
    // Búsqueda amplia: coincide si el término aparece en servicio o ubicación (y también en nombre como extra útil)
    where.push('(LOWER(servicio) LIKE ? OR LOWER(ubicacion) LIKE ? OR LOWER(nombre) LIKE ?)');
    params.push(q, q, q);
  }
  if (filters.servicio) {
    where.push('LOWER(servicio) LIKE ?');
    params.push(`%${String(filters.servicio).toLowerCase()}%`);
  }
  if (filters.ubicacion) {
    where.push('LOWER(ubicacion) LIKE ?');
    params.push(`%${String(filters.ubicacion).toLowerCase()}%`);
  }
  const sql = `SELECT * FROM profesionales` + (where.length ? ` WHERE ${where.join(' AND ')}` : '');
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Inserta un profesional en la tabla.
 * Espera un objeto con: nombre, cedula, servicio, experiencia, ubicacion, telefono, email, horario, imagen.
 * Devuelve el id del registro creado.
 */
function crearProfesional(data, userId) {
  const { nombre, cedula, servicio, experiencia, ubicacion, telefono, email, horario, imagen } = data;
  const sql = `
    INSERT INTO profesionales (nombre, cedula, servicio, experiencia, ubicacion, telefono, email, horario, imagen, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [nombre, cedula, servicio, experiencia, ubicacion, telefono || null, email || null, horario, imagen || null, userId || null], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

/**
 * Obtiene un profesional por su id.
 * Devuelve una promesa con el registro o null si no existe.
 */
function obtenerProfesionalPorId(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM profesionales WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

module.exports = { listarProfesionales, crearProfesional, obtenerProfesionalPorId, listarPropios, actualizarProfesional, eliminarProfesional };
function listarPropios(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM profesionales WHERE usuario_id = ? ORDER BY id DESC', [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function actualizarProfesional(id, userId, data) {
  const campos = ['nombre','cedula','servicio','experiencia','ubicacion','telefono','email','horario','imagen'];
  const sets = [];
  const params = [];
  for (const c of campos) {
    if (Object.prototype.hasOwnProperty.call(data, c)) { sets.push(`${c} = ?`); params.push(data[c] ?? null); }
  }
  if (!sets.length) return Promise.resolve({ changes: 0 });
  const sql = `UPDATE profesionales SET ${sets.join(', ')} WHERE id = ? AND usuario_id = ?`;
  params.push(id, userId);
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err){ if (err) return reject(err); resolve({ changes: this.changes }); });
  });
}

function eliminarProfesional(id, userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM profesionales WHERE id = ? AND usuario_id = ?', [id, userId], function(err){
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}
