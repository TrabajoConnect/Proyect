// DB mínima con SQLite + tabla profesionales
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'trabajoconect.db');
const db = new sqlite3.Database(DB_PATH);

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS profesionales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      cedula TEXT,
      servicio TEXT,
      experiencia TEXT,
      ubicacion TEXT,
      horario TEXT,
      imagen TEXT
    )
  `);
});

module.exports = db;
