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
// Crea un nuevo profesional con los datos del formulario
router.post('/', ctrl.postProfesional);

module.exports = router;
