// Middleware muy simple para asociar un "usuario actual" a partir de un header
// NOTA: Esto no es seguro para producción; es una solución ligera acorde al proyecto actual.

function attachUser(req, _res, next) {
  const raw = req.header('x-user-id');
  const id = Number(raw);
  if (Number.isInteger(id) && id > 0) {
    req.userId = id;
  }
  next();
}

module.exports = { attachUser };
