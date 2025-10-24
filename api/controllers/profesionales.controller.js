/**
 * Controladores de "profesionales"
 *
 * Un controlador traduce la petición del navegador a acciones concretas.
 * Pide datos al modelo y devuelve respuestas en formato JSON.
 */
const modelo = require('../models/profesionales.model');

/**
 * GET /api/profesionales
 * Devuelve la lista de profesionales almacenados.
 */
async function getProfesionales(req, res, next) {
  try {
    const { q = '', servicio = '', ubicacion = '' } = req.query || {};
    const filters = {
      q: q && q.toString().trim() !== '' ? q.toString().trim() : undefined,
      servicio: servicio && servicio.toString().trim() !== '' ? servicio.toString().trim() : undefined,
      ubicacion: ubicacion && ubicacion.toString().trim() !== '' ? ubicacion.toString().trim() : undefined,
    };
    const rows = await modelo.listarProfesionales(filters);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/profesionales
 * Crea un profesional nuevo con los campos recibidos en el body.
 */
async function postProfesional(req, res, next) {
  try {
    const result = await modelo.crearProfesional(req.body || {}, req.userId || null);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/profesionales/:id
 * Devuelve un profesional por id o 404 si no existe.
 */
async function getProfesionalPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Id inválido' });
    }
    const row = await modelo.obtenerProfesionalPorId(id);
    if (!row) return res.status(404).json({ error: 'Profesional no encontrado' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

module.exports = { getProfesionales, postProfesional, getProfesionalPorId };
/**
 * GET /api/profesionales/mios
 * Lista los profesionales creados por el usuario actual (según X-User-Id).
 */
async function getMisProfesionales(req, res, next) {
  try {
    const uid = req.userId;
    if (!uid) return res.status(401).json({ error: 'Requiere usuario (X-User-Id)' });
    const rows = await modelo.listarPropios(uid);
    res.json(rows);
  } catch (e) { next(e); }
}

/**
 * PUT /api/profesionales/:id
 * Actualiza un profesional si pertenece al usuario actual.
 */
async function putProfesional(req, res, next) {
  try {
    const uid = req.userId;
    if (!uid) return res.status(401).json({ error: 'Requiere usuario (X-User-Id)' });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Id inválido' });
    const { changes } = await modelo.actualizarProfesional(id, uid, req.body || {});
    if (!changes) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

/**
 * DELETE /api/profesionales/:id
 * Elimina un profesional si pertenece al usuario actual.
 */
async function deleteProfesional(req, res, next) {
  try {
    const uid = req.userId;
    if (!uid) return res.status(401).json({ error: 'Requiere usuario (X-User-Id)' });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Id inválido' });
    const { changes } = await modelo.eliminarProfesional(id, uid);
    if (!changes) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { getProfesionales, postProfesional, getProfesionalPorId, getMisProfesionales, putProfesional, deleteProfesional };
