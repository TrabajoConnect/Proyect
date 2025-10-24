/**
 * Admin helper: delete profesionales by exact nombre
 * Usage:
 *   node api/scripts/delete_profesional_by_name.js "Nombre Exacto"
 */
const db = require('../../db/database');

const nameArg = process.argv[2];
if (!nameArg) {
  console.error('Uso: node api/scripts/delete_profesional_by_name.js "Nombre Exacto"');
  process.exit(1);
}

db.serialize(() => {
  db.all('SELECT id, nombre FROM profesionales WHERE nombre = ?', [nameArg], (err, rows) => {
    if (err) {
      console.error('Error buscando profesionales:', err.message);
      process.exit(2);
    }
    if (!rows || rows.length === 0) {
      // fallback: búsqueda difusa con LIKE
      const like = `%${nameArg}%`;
      db.all('SELECT id, nombre FROM profesionales WHERE nombre LIKE ?', [like], (err2, rows2) => {
        if (err2) {
          console.error('Error en búsqueda LIKE:', err2.message);
          process.exit(2);
        }
        if (!rows2 || rows2.length === 0) {
          console.log(`No se encontraron publicaciones que contengan: "${nameArg}".`);
          process.exit(0);
        }
        console.log(`Se encontraron (LIKE) ${rows2.length} publicación(es):`, rows2.map(r => `#${r.id} ${r.nombre}`).join(', '));
        db.run('DELETE FROM profesionales WHERE nombre LIKE ?', [like], function(delErr2) {
          if (delErr2) {
            console.error('Error eliminando (LIKE):', delErr2.message);
            process.exit(3);
          }
          console.log(`Eliminadas (LIKE) ${this.changes} publicación(es) que contienen "${nameArg}".`);
          process.exit(0);
        });
      });
      return;
    }
    console.log(`Se encontraron ${rows.length} publicación(es):`, rows.map(r => `#${r.id} ${r.nombre}`).join(', '));
    db.run('DELETE FROM profesionales WHERE nombre = ?', [nameArg], function(delErr) {
      if (delErr) {
        console.error('Error eliminando:', delErr.message);
        process.exit(3);
      }
      console.log(`Eliminadas ${this.changes} publicación(es) con nombre = "${nameArg}".`);
      process.exit(0);
    });
  });
});
