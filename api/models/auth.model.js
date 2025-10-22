/**
 * Modelo de datos de "usuarios"
 *
 * Encapsula el acceso a la base de datos para el registro e inicio de sesión.
 */
const db = require('../../db/database');

/**
 * Crea un usuario nuevo.
 * Espera: { nombre, email, telefono, passwordHash, ubicacion }
 * Devuelve: { id }
 */
function crearUsuario({ nombre, email, telefono, passwordHash, ubicacion }) {
  const sql = `
    INSERT INTO usuarios (nombre, email, telefono, password_hash, ubicacion)
    VALUES (?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [nombre, email || null, telefono || null, passwordHash, ubicacion || null], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

/**
 * Busca un usuario por email o teléfono. Si el valor contiene un "@", asumimos email.
 * Devuelve el usuario completo o null si no existe.
 */
function buscarUsuarioPorEmailOTelefono(identificador) {
  const esEmail = /@/.test(identificador);
  const sql = esEmail
    ? 'SELECT * FROM usuarios WHERE email = ? LIMIT 1'
    : 'SELECT * FROM usuarios WHERE telefono = ? LIMIT 1';

  return new Promise((resolve, reject) => {
    db.get(sql, [identificador], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

module.exports = { crearUsuario, buscarUsuarioPorEmailOTelefono };
