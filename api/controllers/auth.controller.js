/**
 * Controlador de autenticación: registro e inicio de sesión
 *
 * Valida entradas del cliente y delega al modelo para hablar con la DB.
 */
const bcrypt = require('bcryptjs');
const {
  crearUsuario,
  buscarUsuarioPorEmailOTelefono,
} = require('../models/auth.model');

// Helpers simples de validación
function esEmailValido(email) {
  if (!email) return true; // email es opcional (se puede usar teléfono)
  // Validación básica de email
  return /\S+@\S+\.\S+/.test(email);
}

function esTelefonoValido(telefono) {
  if (!telefono) return true; // teléfono es opcional (se puede usar email)
  // Solo dígitos, 7 a 15 caracteres
  return /^[0-9]{7,15}$/.test(telefono);
}

function limpiar(str) {
  return String(str || '').trim();
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const nombre = limpiar(req.body?.nombre);
    const email = limpiar(req.body?.email);
    const telefono = limpiar(req.body?.telefono);
    const ubicacion = limpiar(req.body?.ubicacion);
    const password = String(req.body?.password || '');
    const confirmar = String(req.body?.confirmar || '');

    // Reglas de negocio mínimas
    if (!nombre || nombre.length < 2) {
      return res.status(400).json({ error: 'Nombre es obligatorio y debe tener al menos 2 caracteres.' });
    }
    if (!email && !telefono) {
      return res.status(400).json({ error: 'Debes proporcionar email o teléfono.' });
    }
    if (!esEmailValido(email)) {
      return res.status(400).json({ error: 'Email no tiene un formato válido.' });
    }
    if (!esTelefonoValido(telefono)) {
      return res.status(400).json({ error: 'Teléfono debe contener solo dígitos (7 a 15).' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (password !== confirmar) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    // Unicidad (email/telefono si se enviaron)
    if (email) {
      const existenteEmail = await buscarUsuarioPorEmailOTelefono(email);
      if (existenteEmail) {
        return res.status(409).json({ error: 'Ya existe un usuario con este email.' });
      }
    }
    if (telefono) {
      const existenteTel = await buscarUsuarioPorEmailOTelefono(telefono);
      if (existenteTel) {
        return res.status(409).json({ error: 'Ya existe un usuario con este teléfono.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { id } = await crearUsuario({ nombre, email, telefono, passwordHash, ubicacion });

    return res.status(201).json({
      id,
      nombre,
      email: email || null,
      telefono: telefono || null,
      ubicacion: ubicacion || null,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const identificador = limpiar(req.body?.identificador); // email o teléfono
    const password = String(req.body?.password || '');

    if (!identificador || !password) {
      return res.status(400).json({ error: 'Identificador (email o teléfono) y contraseña son obligatorios.' });
    }

    const usuario = await buscarUsuarioPorEmailOTelefono(identificador);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Devolvemos datos públicos (sin hash)
    return res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      ubicacion: usuario.ubicacion,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
