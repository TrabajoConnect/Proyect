# EXPLAINME: Cómo funciona este proyecto (paso a paso y sin tecnicismos)

Esta web se divide en dos partes:
- La parte que ves en el navegador (páginas y botones).
- La parte “invisible” que guarda y devuelve datos (la API/servidor y la base de datos).

Piensa en esto como un restaurante:
- Tú (el navegador) pides un plato.
- El camarero (la API) toma tu pedido.
- La cocina (la base de datos) prepara la comida.
- El camarero te trae el plato (la respuesta con datos) y tú lo ves en tu mesa (la página).

---

## 1) ¿Qué hay en cada carpeta?

- Páginas y estilos (lo que ves):
  - `inicio.html`, `servicios.html`, `publicar.html` → pantallas de la web.
  - `inicio.css`, `servicios.css`, `publicar.css` → colores y tamaños.
  - `js/api.js`, `js/servicios.js`, `js/publicar.js` → lógica del navegador (pedir datos y mostrarlos).

- API/Servidor (el “camarero”):
  - `api/server.js` → enciende el servidor y conecta todo. Incluye la semilla de datos `seedIfEmpty`.
  - `api/routes/profesionales.routes.js` → define por dónde entran los pedidos (URLs).
  - `api/controllers/profesionales.controller.js` → decide qué hacer con cada pedido: `getProfesionales`, `postProfesional`.
  - `api/models/profesionales.model.js` → habla con la base de datos: `listarProfesionales`, `crearProfesional`.
  - `api/middlewares/error.js` → maneja errores: `errorHandler`.

- Base de datos (la “cocina”):
  - `db/database.js` → crea la base SQLite y la tabla “profesionales”.

- Otros:
  - `package.json` → dependencias y comandos para arrancar la API.

---

## 2) Cómo arrancar todo

1) Instalar dependencias (una sola vez):
```powershell
npm install
```

2) Encender la API (el servidor):
```powershell
npm run dev
```
- La API quedará escuchando en: http://localhost:3000
- Si la base está vacía, se cargan 3 ejemplos automáticamente gracias a `seedIfEmpty`.

3) Abrir las páginas en el navegador:
- Abre `inicio.html` o `servicios.html` o `publicar.html` con doble clic o desde VS Code.

Tip: si la API corre en otra dirección, puedes definir `window.API_BASE` antes de cargar `js/api.js`.

---

## 3) El viaje de un dato (dos historias cortas)

### A) Ver la lista de profesionales (Servicios)
1. Abres `servicios.html`.
2. Carga `js/api.js` y luego `js/servicios.js`.
3. Entra la función `cargarProfesionales`, que pide datos a la API con `API.get('/api/profesionales')`.
4. La API recibe eso en `api/server.js` y lo pasa a la ruta `api/routes/profesionales.routes.js`.
5. La ruta llama al controlador `getProfesionales`.
6. El controlador pide al modelo `listarProfesionales` que lea la tabla.
7. El modelo pregunta a la base en `db/database.js` y devuelve la lista.
8. La API responde con un JSON y el navegador dibuja tarjetas con los datos.

Resultado: ves tarjetas con nombre, servicio, experiencia y ubicación.

### B) Publicar un nuevo profesional (Publicar)
1. Abres `publicar.html`.
2. Carga `js/api.js` y luego `js/publicar.js`.
3. La función `hookPublicarFormulario` prepara el formulario y, al enviarlo, arma un “paquete de datos” con nombre, cédula, servicio, etc.
4. Se envía a la API con `API.post('/api/profesionales', datos)`.
5. La API pasa por la ruta `api/routes/profesionales.routes.js` y llega al controlador `postProfesional`.
6. El controlador manda al modelo `crearProfesional` a guardar el registro en la base.
7. La base confirma y devuelve el id nuevo.
8. El navegador muestra un recuadro-resumen con lo enviado usando `mostrarResultado`.

Resultado: el profesional queda guardado y luego aparecerá también en la lista de Servicios.

---

## 4) ¿Qué hace cada archivo de JS en el navegador?

- `js/api.js`
  - Ofrece `API.get` y `API.post` para hablar fácil con la API.

- `js/servicios.js`
  - `cargarProfesionales`: pide la lista y dibuja tarjetas HTML.

- `js/publicar.js`
  - `hookPublicarFormulario`: conecta el formulario, arma los datos y los envía.
  - `mostrarResultado`: enseña un resumen visible con lo enviado.

---

## 5) ¿Qué hace cada pieza en la API?

- `api/server.js`
  - Enciende el servidor, configura permisos (CORS), entiende JSON y monta rutas.
  - Healthcheck en `/health`.
  - Semilla de datos (ejemplos) con `seedIfEmpty`.

- `api/routes/profesionales.routes.js`
  - Define por dónde entran las peticiones: GET y POST a `/api/profesionales`.

- `api/controllers/profesionales.controller.js`
  - Traduce la petición y llama al modelo:
    - `getProfesionales`
    - `postProfesional`

- `api/models/profesionales.model.js`
  - Habla con la base de datos:
    - `listarProfesionales`
    - `crearProfesional`

- `api/middlewares/error.js`
  - `errorHandler`: si algo falla, responde con un mensaje claro.

- `db/database.js`
  - Crea el archivo de base de datos SQLite y la tabla “profesionales”.

---

## 6) Problemas comunes y soluciones rápidas

- “No carga nada” en Servicios:
  - ¿La API está encendida? Ejecuta: `npm run dev`
  - Visita http://localhost:3000/health — Debería responder `{ ok: true }`.

- “CORS” o permisos:
  - La API ya usa CORS en `api/server.js`. Asegúrate de que la URL de la API sea `http://localhost:3000` o ajusta `window.API_BASE`.

- “¿Dónde está la base?”:
  - El archivo `trabajoconect.db` se crea en la carpeta `db`.

---

## 7) Cambiar la dirección de la API (opcional)

Antes de cargar `js/api.js`, puedes definir:
```html
<script>
  window.API_BASE = 'http://mi-servidor:3000';
</script>
<script src="js/api.js"></script>
```

---

## 8) Próximos pasos (ideas)

- Validar mejor los campos en el backend (seguridad).
- Subir imágenes de verdad (no solo vista previa).
- Agregar filtros por ciudad y categoría.
- Página de perfil individual.
- Registro e inicio de sesión.

---

## 9) Glosario rápido

- API: el “camarero” que recibe pedidos y trae datos.
- Base de datos: donde se guardan los datos para no perderlos.
- Endpoint: una dirección/URL específica de la API (por ejemplo, `/api/profesionales`).
- JSON: formato de texto simple para enviar/recibir datos.
