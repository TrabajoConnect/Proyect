/**
 * API de TrabajoConect (servidor backend)
 *
 * En palabras simples: este archivo enciende el servidor que recibe
 * solicitudes del navegador (por ejemplo, "dame la lista de profesionales")
 * y responde con datos desde la base de datos.
 */
// API mínima con Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../db/database');
const { attachUser } = require('./middlewares/auth-lite');

const app = express();
// Log de errores globales para diagnosticar fallas en Render
process.on('unhandledRejection', (reason) => {
  try { console.error('[unhandledRejection]', reason); } catch(_) {}
});
process.on('uncaughtException', (err) => {
  try { console.error('[uncaughtException]', err); } catch(_) {}
});
// Habilita que navegadores de otra dirección (tu frontend) puedan llamar a esta API
app.use(cors());
// Permite que la API entienda cuerpos JSON o formularios grandes enviados por el navegador (ej. imágenes base64)
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ limit: '6mb', extended: true }));
// Adjunta req.userId si el frontend envía X-User-Id
app.use(attachUser);

// Servir archivos estáticos del frontend (HTML/CSS/JS) desde la raíz del proyecto
// Esto permite abrir http://localhost:3000/servicios.html (y el resto de páginas)
app.use(express.static(path.resolve(__dirname, '..')));

// Rutas y middlewares
const profesionalesRouter = require('./routes/profesionales.routes');
const solicitudesRouter = require('./routes/solicitudes.routes');
const authRouter = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/error');
/**
 * Semillas de ejemplo (seed): si la tabla está vacía, insertamos 3
 * profesionales para que al abrir la web ya se vea contenido.
 */
function seedIfEmpty(callback) {
  db.get('SELECT COUNT(*) as total FROM profesionales', [], (err, row) => {
    if (err) return callback && callback(err);
    if (row && row.total === 0) {
      const ejemplos = [
        { nombre: 'Juan Pérez', cedula: '001-1234567-8', servicio: 'Electricista', experiencia: '5 años', ubicacion: 'Santo Domingo', horario: '8am-5pm', imagen: '' },
        { nombre: 'María Gómez', cedula: '001-7654321-9', servicio: 'Ebanista', experiencia: '7 años', ubicacion: 'Santiago', horario: '9am-6pm', imagen: '' },
        { nombre: 'Pedro López', cedula: '001-2468135-7', servicio: 'Niñero', experiencia: '3 años', ubicacion: 'La Romana', horario: 'Tiempo parcial', imagen: '' },
      ];
      const sql = 'INSERT INTO profesionales (nombre, cedula, servicio, experiencia, ubicacion, horario, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const stmt = db.prepare(sql);
      ejemplos.forEach(e => stmt.run([e.nombre, e.cedula, e.servicio, e.experiencia, e.ubicacion, e.horario, e.imagen]));
      stmt.finalize(callback);
    } else {
      callback && callback();
    }
  });
}

// Healthcheck: pequeño chequeo para saber si el servidor está vivo
app.get('/health', (_req, res) => res.json({ ok: true }));

// Todas las rutas que empiezan con /api/profesionales se atienden aquí
app.use('/api/profesionales', profesionalesRouter);

// Rutas de solicitudes (Ofertar)
app.use('/api/solicitudes', solicitudesRouter);

// Rutas de autenticación (registro e inicio de sesión)
app.use('/api/auth', authRouter);

// Ruta para forzar la siembra de datos (útil en pruebas)
app.post('/api/seed', (_req, res) => {
  seedIfEmpty((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true, message: 'Seed ejecutado (si estaba vacío).' });
  });
});

// Si algo falla en las rutas, este manejador devuelve un error claro
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Auto-seed solo en desarrollo/local
  if (process.env.NODE_ENV !== 'production') {
    seedIfEmpty((err) => {
      if (err) console.error('Error en seed:', err.message);
      console.log('Seed verificado.');
    });
  }
  console.log(`API escuchando en http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});
