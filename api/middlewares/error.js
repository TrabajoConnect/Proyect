/**
 * Middleware de manejo de errores
 *
 * Si alguna parte del backend lanza un error, Express llega hasta aquí.
 * Respondemos con un JSON simple para que el frontend pueda mostrar un mensaje.
 */
function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno' });
}

module.exports = { errorHandler };
