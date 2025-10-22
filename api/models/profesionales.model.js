/**
 * Modelo de datos de "profesionales"
 *
 * Aquí vive el código que habla directamente con la base de datos (SQLite).
 * Ofrece funciones reutilizables para listar y crear profesionales.
 */
const db = require('../../db/database');

/**
 * Lista todos los profesionales.
 * Devuelve una promesa con un arreglo de filas de la tabla.
 */
function listarProfesionales() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM profesionales', [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Inserta un profesional en la tabla.
 * Espera un objeto con: nombre, cedula, servicio, experiencia, ubicacion, horario, imagen.
 * Devuelve el id del registro creado.
 */
function crearProfesional(data) {
  const { nombre, cedula, servicio, experiencia, ubicacion, horario, imagen } = data;
  const sql = `
    INSERT INTO profesionales (nombre, cedula, servicio, experiencia, ubicacion, horario, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [nombre, cedula, servicio, experiencia, ubicacion, horario, imagen || null], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

module.exports = { listarProfesionales, crearProfesional };
