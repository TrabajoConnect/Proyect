const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/solicitudes.controller');

// GET lista de solicitudes (con filtros opcionales)
router.get('/', ctrl.getSolicitudes);

// GET mis solicitudes
router.get('/mias', ctrl.getMisSolicitudes);

// POST crear solicitud
router.post('/', ctrl.postSolicitud);

// PUT actualizar solicitud
router.put('/:id', ctrl.putSolicitud);

// DELETE eliminar solicitud
router.delete('/:id', ctrl.deleteSolicitud);

// GET solicitud por id
router.get('/:id', ctrl.getSolicitudPorId);

module.exports = router;
