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

// Permite configurar la ruta de la DB por variable de entorno (Render Free: /tmp/trabajoconect.db)
const DEFAULT_PATH = path.join(__dirname, 'trabajoconect.db');
const DB_PATH = process.env.DB_PATH || DEFAULT_PATH;
const db = new sqlite3.Database(DB_PATH);
// Log informativo para diagnosticar en despliegues
try { console.log(`[DB] Using SQLite at: ${DB_PATH}`); } catch(_) {}

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
      telefono TEXT,                         -- contacto telefónico (opcional)
      email TEXT,                            -- contacto por correo (opcional)
      horario TEXT,                          -- disponibilidad
      imagen TEXT,                           -- URL/ruta de imagen (opcional)
      usuario_id INTEGER                     -- dueño/creador (opcional)
    )
  `);

  // Para bases de datos ya existentes, intentamos agregar columnas si faltan
  // Estas operaciones son seguras si ya existen (ignoramos el error de columna duplicada)
  db.run(`ALTER TABLE profesionales ADD COLUMN telefono TEXT`, (err) => {
    if (err && !/duplicate column/i.test(err.message)) {
      console.warn('Aviso: no se pudo agregar columna telefono:', err.message);
    }
  });
  db.run(`ALTER TABLE profesionales ADD COLUMN email TEXT`, (err) => {
    if (err && !/duplicate column/i.test(err.message)) {
      console.warn('Aviso: no se pudo agregar columna email:', err.message);
    }
  });
  db.run(`ALTER TABLE profesionales ADD COLUMN usuario_id INTEGER`, (err) => {
    if (err && !/duplicate column/i.test(err.message)) {
      console.warn('Aviso: no se pudo agregar columna usuario_id en profesionales:', err.message);
    }
  });

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

  // Solicitudes de clientes (Ofertar): lo que los clientes necesitan
  db.run(`
    CREATE TABLE IF NOT EXISTS solicitudes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,            -- nombre del cliente
      ubicacion TEXT,         -- ubicación del cliente
      servicio TEXT,          -- qué servicio necesita
      descripcion TEXT,       -- detalle del problema/solicitud
      imagen TEXT,            -- URL/ruta de imagen (opcional)
      telefono TEXT,          -- teléfono de contacto (opcional)
      email TEXT,             -- correo de contacto (opcional)
      precio_min REAL,        -- rango estimado mínimo (opcional)
      precio_max REAL,        -- rango estimado máximo (opcional)
      usuario_id INTEGER,     -- dueño/creador (opcional)
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Intentar agregar columnas si la tabla ya existía
  db.run(`ALTER TABLE solicitudes ADD COLUMN telefono TEXT`, (err) => {
    if (err && !/duplicate column/i.test(err.message)) {
      console.warn('Aviso: no se pudo agregar columna telefono en solicitudes:', err.message);
    }
  });
  db.run(`ALTER TABLE solicitudes ADD COLUMN email TEXT`, (err) => {
    if (err && !/duplicate column/i.test(err.message)) {
      console.warn('Aviso: no se pudo agregar columna email en solicitudes:', err.message);
    }
  });
  db.run(`ALTER TABLE solicitudes ADD COLUMN usuario_id INTEGER`, (err) => {
    if (err && !/duplicate column/i.test(err.message)) {
      console.warn('Aviso: no se pudo agregar columna usuario_id en solicitudes:', err.message);
    }
  });
});

module.exports = db;
