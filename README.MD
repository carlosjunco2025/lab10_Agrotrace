# 🌾 AgroTrace

Proyecto integrador de trazabilidad agrícola. Backend Django + Django REST
Framework y frontend React + Vite.

- Repositorio: <https://github.com/carlosjunco2025/lab10_Agrotrace>
- Frontend: `frontend/`
- API: `agrotrace/` y `agrotrace_config/`

## Laboratorio 11 — Comunicación entre componentes (React)

La pantalla principal del frontend permite alternar entre dos módulos:

1. **Parte 1 — Práctica cafetería:** mini catálogo con carrito, buscador y aviso
   temporal.
2. **Parte 2 — Panel AgroTrace:** gestión de `LoteRecepcionado` con listado,
   formulario de alta, resumen, buscador compartido y acciones por fila.

Ambos módulos usan datos mock escritos a mano con la forma de la respuesta de la
API de la Semana 8. **Todavía no se consume la API**; eso corresponde a la
Semana 12. Los campos decimales (`precio`, `toneladas_brutas`,
`porcentaje_descarte`, `hectareas`) se guardan como texto, igual que los
serializa DRF.

### Estructura del frontend

```text
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx                  # Navegación entre Parte 1 y Parte 2
│   ├── App.css                  # Base visual y estilos compartidos
│   ├── practica/                # PARTE 1
│   │   ├── datos.js             # 5 productos mock
│   │   ├── Practica.jsx         # Padre: carrito, búsqueda y aviso
│   │   ├── Buscador.jsx         # Input controlado
│   │   ├── Catalogo.jsx         # Lista con map() y key
│   │   ├── ProductoCard.jsx     # Presentación y botón Agregar
│   │   ├── Carrito.jsx          # Total y unidades con reduce()
│   │   ├── Aviso.jsx            # Toast con setTimeout y limpieza
│   │   └── practica.css
│   └── components/              # PARTE 2
│       ├── PanelLotes.jsx       # Padre: estado elevado de los lotes
│       ├── LoteList.jsx         # Listado con map() y key
│       ├── LoteRow.jsx          # Fila con acciones
│       ├── LoteForm.jsx         # Alta controlada y validada
│       ├── ResumenLotes.jsx     # Datos derivados sin useState
│       ├── LoteBuscador.jsx     # Filtro de texto y estado
│       ├── loteUtils.js         # Etiquetas, transiciones y formato
│       └── panel.css
├── index.html
├── package.json
└── vite.config.js
```

### Parte 1: flujo de estado y props

```text
Practica  (carrito, busqueda, aviso)
├── Buscador        ← valor, onCambiar
├── Catalogo        ← productosFiltrados, onAgregar
│   └── ProductoCard ← producto, onAgregar
├── Carrito         ← lineas, onQuitar, onVaciar
└── Aviso           ← aviso, onCerrar
```

- El usuario escribe en `Buscador`; el hijo llama a `onCambiar(texto)` y el
  padre actualiza `busqueda` con `setBusqueda`. El filtro se calcula con
  `filter()` + `includes()` en `Practica` y el resultado baja a `Catalogo` por
  props.
- El usuario pulsa **Agregar** en `ProductoCard`; la tarjeta ejecuta
  `onAgregar(producto)`. `Practica.agregarAlCarrito` crea un arreglo nuevo:
  `map()` para incrementar la cantidad de una línea existente o spread `[...]`
  para añadir una nueva. Nunca se usa `push` ni `splice`.
- `Carrito` recibe las líneas y calcula `cantidadTotal` y `totalPagar` con
  `reduce()`. Son datos derivados: no tienen `useState` propio.
- `Carrito` usa `useEffect` con dependencia `[cantidadTotal]` para actualizar
  `document.title` (`Carrito (X) — Cafetería`) y registrar el ciclo de vida en
  consola. La función de limpieza se ejecuta antes del siguiente efecto y al
  desmontar.
- `Aviso` muestra `Agregado: <nombre>` y programa un `setTimeout` de 3 segundos;
  la limpieza llama a `clearTimeout` para evitar temporizadores huérfanos.
- `ProductoCard` desactiva el botón cuando `stock === 0` y muestra `Agotado`.
  El precio se formatea con `Number(precio).toFixed(2)`.

### Parte 2: panel administrativo de AgroTrace

Entidad principal: `LoteRecepcionado`, con el `fundo` anidado tal como lo
entrega `LoteDetalladoSerializer` en la Semana 8:

```json
{
  "id": 1,
  "codigo_lote": "LOT-2026-001",
  "toneladas_brutas": "12.50",
  "porcentaje_descarte": "1.20",
  "estado_evaluacion": "PENDIENTE",
  "fecha_ingreso": "2026-11-02T08:30:00-05:00",
  "fundo": {
    "id": 1,
    "nombre_fundo": "Fundo Santa Elena",
    "propietario_dni_ruc": "20481234567",
    "hectareas": "48.50",
    "valido_exportacion": true,
    "cupo_diario_lotes": 12
  }
}
```

```text
PanelLotes  (lotes, busqueda, filtroEstado)
├── ResumenLotes   ← lotes
├── LoteForm       ← onGuardar, fundos, codigosExistentes
├── LoteBuscador   ← busqueda, onBusquedaChange, estado, onEstadoChange
└── LoteList       ← lotesFiltrados, onCambiarEstado, onEliminar
    └── LoteRow    ← lote, onCambiarEstado, onEliminar
```

- **Estado elevado:** `PanelLotes` guarda el arreglo de lotes con `useState`.
  `ResumenLotes`, `LoteList` y `LoteBuscador` reciben los datos por props.
- **Avisos del hijo al padre:** cada fila ejecuta `onCambiarEstado(id)` o
  `onEliminar(id)`. El padre responde con `map()` o `filter()` y crea siempre un
  arreglo nuevo.
- **Formulario controlado:** `LoteForm` maneja sus campos con `useState` y
  valida antes de enviar:
  1. `codigo_lote` obligatorio y único.
  2. `toneladas_brutas` numérico mayor que 0 (misma regla que
     `validate_toneladas_brutas` del serializer).
  3. `porcentaje_descarte` entre 0 y 100.
  4. `fundo` obligatorio.
  Si es válido llama a `onGuardar(nuevoRegistro)`, el padre añade el registro
  con `[...lotes, nuevo]` y el formulario limpia sus campos.
- **Resumen hermano:** `ResumenLotes` calcula total de lotes, suma de toneladas
  con `reduce()`, promedio de descarte y conteo por estado sin `useState`.
- **Buscador compartido:** `PanelLotes` filtra por texto (código, fundo o
  estado) y por estado. El listado muestra `No hay lotes que coincidan con la
  búsqueda.` cuando el resultado está vacío.
- **useEffect:** `PanelLotes` actualiza `document.title` con el número de lotes
  (`AgroTrace · X lotes`) y registra la limpieza del efecto en consola.

### Ejecutar el proyecto

Requisitos: Node.js LTS (incluye npm). Desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Vite publica la aplicación en <http://localhost:5173/>. Para verificar y generar
la build de producción:

```bash
npm run lint
npm run build
```

Ambos comandos deben terminar sin errores ni advertencias. `node_modules/` y
`dist/` están excluidos por el `.gitignore` de la raíz; no se versionan.

### Criterios de comunicación cubiertos

| Mecanismo | Parte 1 | Parte 2 |
|---|---|---|
| Datos del padre al hijo | `productos`, `lineas`, `valor` | `lotes`, `fundos`, `busqueda` |
| Aviso del hijo al padre | `onAgregar`, `onCambiar`, `onQuitar`, `onVaciar` | `onGuardar`, `onCambiarEstado`, `onEliminar`, `onBusquedaChange` |
| Estado elevado | `carrito` y `busqueda` en `Practica` | `lotes`, `busqueda` y `filtroEstado` en `PanelLotes` |
| Datos derivados | total y unidades con `reduce()` | totales, promedio y conteo con `reduce()` |
| `useEffect` | título del carrito y aviso de 3 s | título del panel y limpieza del efecto |
| Inmutabilidad | `map`, `filter`, spread | `map`, `filter`, spread |


---

# 🌾 AgroTrace — Laboratorio 10 (Frontend con React + Vite)

Bienvenido al repositorio de la **Semana 10** del proyecto **AgroTrace**, una plataforma web orientada al monitoreo, trazabilidad agrícola y control de fundos productores con recepción de lotes.

---

## 📋 Descripción del Proyecto

Este proyecto consiste en el desarrollo e implementación del frontend de la aplicación web utilizando **React** y **Vite**. Se construyó una arquitectura basada en componentes funcionales reutilizables, gestión de estado reactivo mediante Hooks (`useState`), flujos de datos unidireccionales (`props` y `children`), renderizado dinámico de colecciones (`.map()`), cálculos agregados (`.reduce()`) y validación de formularios controlados adaptada a las reglas de negocio de la API REST backend (desarrollada en Django).

---

## 🚀 Arquitectura y Componentes Desarrollados

La estructura del frontend se organiza dentro del directorio `src/`:

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ContenedorSeccion.jsx # Componente contenedor con patrón children
│   │   ├── FundoBuscador.jsx      # Componente controlado para filtrado en tiempo real
│   │   ├── FundoCard.jsx          # Ficha individual de fundo
│   │   ├── FundoConLotes.jsx      # Componente de relación anidada 1:N
│   │   ├── FundoForm.jsx          # Formulario controlado con validaciones de la API
│   │   ├── LoteItem.jsx           # Detalle individual de lote/cultivo
│   │   └── Tarjeta.jsx            # Contenedor gráfico reusable
│   ├── App.css                    # Estilos visuales de la plataforma
│   ├── App.jsx                    # Componente principal / Integración de estado global
│   ├── datos.js                   # Dataset mock de fundos y lotes
│   └── main.jsx                   # Punto de entrada de la aplicación React (StrictMode)
├── package.json
└── vite.config.js
🛠️ Tecnologías y Herramientas UtilizadasBiblioteca UI: React (v18+)Tooling / Bundler: ViteLenguaje: JavaScript (ES6+) / JSXEstilos: CSS3 (Flexbox & Grid Layout)Calidad de Código y Linter: ESLintEntorno de Ejecución: Node.js & npm⚙️ Instalación y Ejecución LocalSigue estos pasos para levantar el entorno de desarrollo en tu máquina local:1. Clonar el repositorioBashgit clone [https://github.com/carlosjunco2025/lab10_Agrotrace.git](https://github.com/carlosjunco2025/lab10_Agrotrace.git)
cd lab10_Agrotrace/frontend
2. Permitir ejecución de scripts (PowerShell en Windows)PowerShellSet-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
3. Instalación de dependenciasBashnpm install
4. Ejecución en entorno de desarrolloBashnpm run dev
La aplicación estará disponible en http://localhost:5173/.5. Validación de sintaxis y build de producciónBash# Verificación de linter (0 errores / 0 advertencias)
npm run lint

# Compilación optimizada para producción
npm run build
📌 Resumen de Ejercicios del LaboratorioEjercicioDescripciónConcepto EvaluadoEj. 1 al 3Configuración de Vite y componentes funcionalesProps, JSX, exportaciones e importaciones.Ej. 4Creación de componentes contenedoresUso del patrón children (Tarjeta.jsx).Ej. 5Relación 1:N y agregación de datosMétodos de arreglo .map() y .reduce() para métricas de peso.Ej. 6Estado local e interactividadHook useState para contadores sintéticos de inspección.Ej. 7Búsqueda reactivaFormulario controlado de filtrado con toLowerCase y includes.Ej. 8Registro y validaciónManejo de onSubmit, preventDefault() y reglas de la API de Django.Ej. 9 al 12Investigación propia en AgroTraceComponentes anidados 1:N, keys únicas y gestión de envíos válidos/inválidos.Ej. 13Inspección y entregaConsola limpia, comprobación de npm run lint / build e ignorado de node_modules y dist en .gitignore.💡 Conclusiones TécnicasImplementación de la Arquitectura Basada en Componentes y Props:Se logró estructurar una interfaz web modular en React dividiendo la aplicación en componentes funcionales reutilizables. Se demostró la eficacia del flujo de datos unidireccional y la inmutabilidad de las props, garantizando que la información transmitida hacia los componentes hijos se mantenga consistente.Gestión del Estado Local y Reactividad:La utilización del Hook useState junto con el manejo de eventos sintéticos (onClick, onChange, onSubmit) permitió construir una experiencia de usuario reactiva en tiempo real. Esto facilitó el filtrado de fundos sin depender del servidor y el cálculo dinámico de totales de producción mediante .reduce().Validación de Formularios y Preparación para Integración API REST:Mediante componentes controlados y e.preventDefault(), se implementó una capa de validación en el cliente que replica las reglas de negocio de la API en Django (longitud mínima de caracteres). Además, se garantizó la calidad técnica del código mediante las verificaciones de ESLint (npm run lint) y la compilación con Vite (npm run build).
