// DB mínima con SQLite + tabla profesionales
/**
 * Base de datos (SQLite)
 *
 * SQLite guarda los datos en un archivo local .db. Es ideal para comenzar
 * porque no hay que instalar servidores de base de datos.
 * Este archivo crea la conexión y asegura que la tabla exista.
 */
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'trabajoconect.db');
const db = new sqlite3.Database(DB_PATH);

// Al iniciar, creamos las tablas necesarias si todavía no existen
db.serialize(() => {
  // Profesionales publicados (servicios)
  db.run(`
    CREATE TABLE IF NOT EXISTS profesionales (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- identificador único
      nombre TEXT,                           -- nombre y apellido
      cedula TEXT,                           -- documento de identidad
      servicio TEXT,                         -- oficio: Electricista, Ebanista, etc.
      experiencia TEXT,                      -- años o descripción de experiencia
      ubicacion TEXT,                        -- ciudad o zona
      horario TEXT,                          -- disponibilidad
      imagen TEXT                            -- URL/ruta de imagen (opcional)
    )
  `);

  // Usuarios para registro/inicio de sesión
  // Guardamos un hash seguro de la contraseña (no la contraseña en texto plano)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE,         -- único si se usa email
      telefono TEXT UNIQUE,      -- único si se usa teléfono
      password_hash TEXT NOT NULL,
      ubicacion TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
