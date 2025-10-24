/**
 * Rutas de "profesionales"
 *
 * Aquí definimos por dónde llegan las solicitudes del navegador:
 * - GET /api/profesionales → listar
 * - POST /api/profesionales → crear
 * La lógica está en el controlador; aquí solo mapeamos URLs a funciones.
 */
const { Router } = require('express');
const ctrl = require('../controllers/profesionales.controller');

const router = Router();

// Devuelve todos los profesionales guardados
router.get('/', ctrl.getProfesionales);
// Devuelve los profesionales del usuario actual
router.get('/mios', ctrl.getMisProfesionales);
// Crea un nuevo profesional con los datos del formulario
router.post('/', ctrl.postProfesional);
// Actualiza un profesional del usuario actual
router.put('/:id', ctrl.putProfesional);
// Elimina un profesional del usuario actual
router.delete('/:id', ctrl.deleteProfesional);
// Devuelve un profesional por id
router.get('/:id', ctrl.getProfesionalPorId);

module.exports = router;
