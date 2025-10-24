/**
 * Controladores de "solicitudes" (Ofertar)
 */
const modelo = require('../models/solicitudes.model');

async function getSolicitudes(req, res, next) {
  try {
    const { q = '', servicio = '', ubicacion = '' } = req.query || {};
    const filters = {
      q: q && q.toString().trim() || undefined,
      servicio: servicio && servicio.toString().trim() || undefined,
      ubicacion: ubicacion && ubicacion.toString().trim() || undefined,
    };
    const rows = await modelo.listarSolicitudes(filters);
    res.json(rows);
  } catch (e) { next(e); }
}

async function postSolicitud(req, res, next) {
  try {
    const result = await modelo.crearSolicitud(req.body || {}, req.userId || null);
    res.status(201).json(result);
  } catch (e) { next(e); }
}

async function getSolicitudPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Id inválido' });
    const row = await modelo.obtenerSolicitudPorId(id);
    if (!row) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(row);
  } catch (e) { next(e); }
}

async function getMisSolicitudes(req, res, next) {
  try {
    const uid = req.userId;
    if (!uid) return res.status(401).json({ error: 'Requiere usuario (X-User-Id)' });
    const rows = await modelo.listarMias(uid);
    res.json(rows);
  } catch (e) { next(e); }
}

async function putSolicitud(req, res, next) {
  try {
    const uid = req.userId;
    if (!uid) return res.status(401).json({ error: 'Requiere usuario (X-User-Id)' });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Id inválido' });
    const { changes } = await modelo.actualizarSolicitud(id, uid, req.body || {});
    if (!changes) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

async function deleteSolicitud(req, res, next) {
  try {
    const uid = req.userId;
    if (!uid) return res.status(401).json({ error: 'Requiere usuario (X-User-Id)' });
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Id inválido' });
    const { changes } = await modelo.eliminarSolicitud(id, uid);
    if (!changes) return res.status(404).json({ error: 'No encontrado o sin permisos' });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

module.exports = { getSolicitudes, postSolicitud, getSolicitudPorId, getMisSolicitudes, putSolicitud, deleteSolicitud };