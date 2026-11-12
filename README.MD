# AgroTrace

Proyecto integrador de trazabilidad agrícola. Backend **Django + Django REST
Framework** y frontend **React + Vite**. En la Semana 12 el panel administrativo
deja de usar datos mock y consume la API REST real mediante **Axios**, con
**CORS** configurado en Django.

- Repositorio: <https://github.com/carlosjunco2025/lab10_Agrotrace>
- Backend: `agrotrace/`, `agrotrace_config/`, `manage.py`
- Frontend: `frontend/`
- Documentación de la Semana 12: `GLAB-S12-YBESTARD-2026-02.docx`

## Semana 12 — Integración Full Stack con Axios y CORS

La aplicación tiene dos módulos que se alternan desde la barra superior:

1. **Parte 1 — Lista de práctica (`frontend/src/practica/ListaPractica.jsx`)**:
   CRUD completo sobre `/api/fundos/` con `GET`, `POST`, `PATCH` y `DELETE`.
   Incluye estados de carga y error, búsqueda con `?search=` y mensajes de
   validación `400` devueltos por el serializer.
2. **Parte 2 — Panel administrativo (`frontend/src/components/PanelLotes.jsx`)**:
   gestión real de `LoteRecepcionado` contra `/api/lotes-detallados/`. Incluye
   alta con `POST`, edición con `PATCH`, eliminación con confirmación y manejo
   explícito del `404`, búsqueda + filtro por estado combinados y un resumen
   derivado de los datos reales.

### Endpoints REST utilizados

| Recurso | Método | URL | Código esperado | Uso |
|---|---|---|---|---|
| Fundos | `GET` | `/api/fundos/?search=texto` | `200 OK` | Listado y búsqueda de la Parte 1 |
| Fundos | `POST` | `/api/fundos/` | `201 Created` | Alta de fundo |
| Fundos | `PATCH` | `/api/fundos/{id}/` | `200 OK` | Edición rápida de exportación |
| Fundos | `DELETE` | `/api/fundos/{id}/` | `204 No Content` | Baja de fundo |
| Lotes | `GET` | `/api/lotes-detallados/?search=&estado=` | `200 OK` | Listado y filtro combinado del panel |
| Lotes | `POST` | `/api/lotes/` | `201 Created` | Alta de lote |
| Lotes | `PATCH` | `/api/lotes/{id}/` | `200 OK` | Edición de lote y cambio de estado |
| Lotes | `DELETE` | `/api/lotes/{id}/` | `204 No Content` | Baja de lote con confirmación |
| Error de validación | `POST` | `/api/fundos/` o `/api/lotes/` | `400 Bad Request` | Errores de `validate_<campo>` |
| Registro inexistente | `DELETE` | `/api/.../{id}/` | `404 Not Found` | Registro eliminado en el servidor |

Los endpoints de la API se montan bajo `http://127.0.0.1:8000/api/` mediante el
`DefaultRouter` de DRF. También existen `fundos`, `lotes`, `lotes-detallados`,
`evaluaciones` y `evaluaciones-detalladas`.

### Configuración de CORS

En `agrotrace_config/settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
    'agrotrace',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ...
    'django.middleware.common.CommonMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

`CorsMiddleware` debe ir antes de `CommonMiddleware` y de cualquier middleware
que pueda generar respuestas (por ejemplo `WhiteNoise`). Si el frontend se abre
desde otro puerto u origen, hay que agregarlo a `CORS_ALLOWED_ORIGINS`.

### Cliente Axios

`frontend/src/api.js` exporta una instancia única:

```js
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
})
```

También expone `normalizarErrores()` para convertir la respuesta `400` de DRF
en errores por campo y `mensajeDeError()` para errores de red o timeout.

### Ejecutar backend y frontend simultáneamente

Requisitos: Python 3.12+ y Node.js LTS. Desde la raíz del repositorio:

```powershell
# 1. Entorno virtual e instalación del backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo       # datos de demostración idempotentes
python manage.py runserver 127.0.0.1:8000
```

En una **segunda terminal**:

```powershell
cd frontend
npm install
npm run dev
```

- Django: <http://127.0.0.1:8000/api/>
- React + Vite: <http://localhost:5173/>

Ambos servidores deben quedar encendidos al mismo tiempo. Vite usa el puerto
`5173`; si está ocupado, ajusta el origen en `CORS_ALLOWED_ORIGINS`.

### Datos de demostración

El comando `seed_demo` crea cuatro fundos y seis lotes. Para reiniciar la base
local:

```powershell
python manage.py seed_demo --reset
```

El archivo `db.sqlite3` es local y está excluido por `.gitignore`.

### Verificación de calidad

```powershell
cd frontend
npm run lint
npm run build
```

Ambos comandos deben terminar sin errores ni advertencias. `node_modules/` y
`dist/` están excluidos del repositorio.

## Estructura del frontend

```text
frontend/
├── public/
├── src/
│   ├── api.js                     # Instancia Axios y manejo de errores
│   ├── App.jsx                    # Alterna Parte 1 y Parte 2
│   ├── App.css                    # Base visual compartida
│   ├── practica/
│   │   ├── ListaPractica.jsx      # PARTE 1: CRUD con Axios
│   │   ├── Practica.jsx           # Práctica de la Semana 11 (referencia)
│   │   └── ...
│   └── components/
│       ├── PanelLotes.jsx         # PARTE 2: estado y llamadas a la API
│       ├── LoteForm.jsx           # POST / PATCH y errores 400
│       ├── LoteList.jsx           # Listado con map() y key
│       ├── LoteRow.jsx            # Editar, cambiar estado y eliminar
│       ├── LoteBuscador.jsx       # search + estado
│       ├── ResumenLotes.jsx       # Datos derivados sin useState
│       └── panel.css
├── index.html
├── package.json
└── vite.config.js
```

## Flujo de datos de la Semana 12

```text
ListaPractica
├── useEffect [buscar] -> GET /fundos/?search=
├── POST /fundos/      -> spread [...fundos, respuesta.data]
├── PATCH /fundos/:id/ -> map() para reemplazar la fila
└── DELETE /fundos/:id/-> filter() cuando llega 204

PanelLotes
├── useEffect []                    -> GET /fundos/ (select del formulario)
├── useEffect [busqueda, estado]    -> GET /lotes-detallados/?search=&estado=
├── LoteForm -> POST /lotes/ o PATCH /lotes/:id/
├── LoteRow  -> PATCH estado o DELETE con window.confirm
├── 400 -> normalizarErrores() y mensajes junto a cada campo
├── 404 -> aviso y sincronización de la tabla
└── ResumenLotes -> totales, promedios y conteos con reduce()
```

### Decisiones de implementación

- **Estados de carga y error:** cada petición `GET` usa `cargando`, `error` y
  `finally`; las listas vacías muestran un estado explícito.
- **Cancelación:** los `useEffect` crean un `AbortController` y lo abortan en la
  limpieza para evitar respuestas fuera de orden al escribir en el buscador.
- **Normalización:** los decimales de DRF llegan como texto (`"12.50"`). El
  panel los convierte con `Number()` antes de sumar o promediar.
- **Inmutabilidad:** las altas usan spread, las ediciones `map()` y las bajas
  `filter()`.
- **Errores del servidor:** se leen de `err.response.data`, se muestran junto al
  campo y no se confunden con errores de red.
- **Eliminación:** se pide confirmación con `window.confirm`. Si el servidor
  responde `404`, el registro se quita de la tabla y se avisa que ya no existía.

## Laboratorios anteriores

- **Semana 11:** comunicación entre componentes con datos mock (práctica de
  carrito y panel con estado elevado).
- **Semana 10:** frontend React + Vite con componentes, props, `useState`,
  `map()`, `reduce()` y validación de formularios.
- **Semanas 7 y 8:** backend Django, modelos, CRUD con templates, transacciones
  y API REST con DRF.

## Autor

Yunior Bestard Aroche — Desarrollo de Aplicaciones Empresariales.
