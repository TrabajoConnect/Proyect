// Rutas de autenticación (registro e inicio de sesión)
// Mantiene las URLs y delega la lógica al controlador.

const express = require('express');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// Registro de usuario nuevo
router.post('/register', register);

// Inicio de sesión (por email o teléfono) + contraseña
router.post('/login', login);

module.exports = router;
