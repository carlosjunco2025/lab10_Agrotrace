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
