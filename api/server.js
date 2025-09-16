// API mínima con Express
const express = require('express');
const cors = require('cors');
const db = require('../db/database');

const app = express();
app.use(cors());
app.use(express.json());

// Utilidad: insertar datos de ejemplo si la tabla está vacía
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

// Healthcheck
app.get('/health', (_req, res) => res.json({ ok: true }));

// Listar profesionales
app.get('/api/profesionales', (_req, res) => {
  db.all('SELECT * FROM profesionales', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear profesional
app.post('/api/profesionales', (req, res) => {
  const { nombre, cedula, servicio, experiencia, ubicacion, horario, imagen } = req.body || {};
  const sql = `
    INSERT INTO profesionales (nombre, cedula, servicio, experiencia, ubicacion, horario, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [nombre, cedula, servicio, experiencia, ubicacion, horario, imagen || null], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// Endpoint para sembrar datos manualmente
app.post('/api/seed', (_req, res) => {
  seedIfEmpty((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true, message: 'Seed ejecutado (si estaba vacío).' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Auto-seed solo en desarrollo/local
  if (process.env.NODE_ENV !== 'production') {
    seedIfEmpty((err) => {
      if (err) console.error('Error en seed:', err.message);
      console.log('Seed verificado.');
    });
  }
  console.log(`API escuchando en http://localhost:${PORT}`);
});
