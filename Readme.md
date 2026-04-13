# Agenda-T 📅

Agenda-T es una solución de software premium compuesta por dos partes principales:
1. **Aplicación de Escritorio (Desktop App):** Un sistema de gestión avanzado construido en Electron, diseñado para funcionar nativamente en Windows. Está enfocado a negocios, profesionales independientes, centros médicos, clínicas o despachos que necesiten organizar citas.
2. **Página Web de Marketing (Landing Page):** Un sitio web corporativo de altísimo rendimiento construido con HTML, CSS (Vanilla Design) y JavaScript funcional que sirve como carta de presentación para comercializar el software, generar leads (contacto) y proporcionar la descarga directa del producto.

---

## 🚀 Arquitectura del Proyecto

El proyecto está dividido en dos carpetas principales:

- `app_escritorio/`: Contiene todo el código de la aplicación de escritorio y la lógica de backend.
- `pagina_web/`: Contiene el sitio web corporativo y el instalador público del software.

### 1. Aplicación de Escritorio (`app_escritorio`)
Desarrollada con **Node.js, Electron y SQLite**. Sus características principales son:
- **Agendas Multi-Profesional:** Columnas dinámicas generadas en tiempo real para separar visualmente las citas de cada trabajador o especialista del negocio.
- **Smart CRM:** Buscador integrado predictivo que localiza clientes instantáneamente por nombre o número de teléfono.
- **Analítica Financiera (Excel):** Un módulo autónomo que recopila un resumen financiero de las citas completadas y exporta automáticamente archivos `.xlsx` estilizados con toda la contabilidad mensual o en un rango de fechas.
- **Recordatorios por WhatsApp (API Mock):** Integración con Node-Cron para emitir recordatorios automatizados en segundo plano cada mañana a los números móviles de los clientes y recolectar confirmaciones.
- **Base de Datos Dinámica y Limpia:** En desarrollo utiliza la db local. Tras compilar (modo empaquetado/producción), crea una base de datos `peluqueria.db` estéril desde cero en la carpeta principal de usuario (`AppData`) para asegurar privacidad y protección contra corrupción en las instalaciones de clientes.

#### 🔧 Scripts (package.json)
- `npm start`: Inicia el entorno de desarrollo con hot-reloading (nodemon).
- `npm run package`: Transforma el código fuente y genera un paquete base para Windows x64 aislando el código usando `electron-packager` y exceptuando las bases de datos de entorno local de pruebas.

### 2. Sitio Web (`pagina_web`)
Sitio SPA (Single Page Application) moderno y enfocado a conversiones (B2B). 
- **Estética "Glassmorphism" / Neon:** Diseñada con Vanilla CSS sin librerías de terceros (se decidió eliminar Tailwind para mayor control modular y pureza del código). 
- **Estructura Optimizada al SEO:** Metadatos nativos estructurados, renderizado SSR (porque es un HTML puro) y transiciones fluidas de Javascript nativo sin bloquear el hilo principal.
- **Descarga Mágica:** Integra el ejecutable final `Agenda-T-Setup.exe` preparado previamente por Electron como punto principal del funnel de conversión de los usuarios visitantes.

---

## 🛠️ Tecnologías Empleadas

### Backend / Core
- **Electron:** (Framework de Contenedor de Interfaz Nativa).
- **Node.js:** (Entorno de Ejecución Backend).
- **SQLite3:** (Base de Datos Local In-App Inmutable).
- **ExcelJS:** (Para volcado estructurado algorítmico y estilizado de arrays de registros en matrices XLS nativas usando XML de Office).
- **Node-Cron:** (Gestor de transacciones calendarizadas para recordatorios invisibles).

### Frontend Web
- **HTML5 (DOM Semántico)**
- **CSS Vanilla Moderno:** Transformaciones 3D, filtros SVG, Pseudo Clases.
- **JavaScript Vanilla:** Observadores de intersección nativos (`IntersectionObserver`) e inyección dinámica.

---

## 💻 Instrucciones para entorno de desarrollo

Para continuar trabajando o adaptar el software en el futuro en tu propio ordenador:

1. Ingresa interactuando en la terminal a la carpeta de la App de escritorio:
   \`\`\`bash
   cd "app_escritorio"
   \`\`\`
2. Cerciórate de tener todas las dependencias locales instaladas con Node:
   \`\`\`bash
   npm install
   \`\`\`
3. Levanta la instancia virtual de desarrollo:
   \`\`\`bash
   npm start
   \`\`\`
4. Si quieres empaquetar una nueva versión para los usuarios finales, primero compila la carpeta de despliegue y después ejecuta el script para construir el \`.exe\` vinculante:
   \`\`\`bash
   npx electron-packager . Agenda-T --platform=win32 --arch=x64 --out=dist --overwrite --ignore="peluqueria\.db"
   node build-installer.js
   \`\`\`
  *(Por último, desplaza o copia el nuevo instalador de la carpeta \`dist/installer\` generada, a la raíz de \`pagina_web\`).*