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
async function getProfesionales(_req, res, next) {
  try {
    const rows = await modelo.listarProfesionales();
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
    const result = await modelo.crearProfesional(req.body || {});
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = { getProfesionales, postProfesional };
