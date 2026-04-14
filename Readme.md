# Agenda-T 📅
### v1.0.1

Agenda-T es una solución de software premium compuesta por dos partes principales:
1. **Aplicación de Escritorio (Desktop App):** Un sistema de gestión avanzado construido en Electron, diseñado para funcionar nativamente en Windows. Está enfocado a cualquier negocio que necesite gestionar citas: clínicas, consultas, despachos, salones, centros de estética, fisioterapia, etc.
2. **Página Web de Marketing (Landing Page):** Un sitio web corporativo de alto rendimiento construido con HTML, CSS (Vanilla) y JavaScript que sirve como carta de presentación B2B, genera leads mediante formulario de contacto real y proporciona la descarga directa del instalador.

🌐 **Web en producción:** [https://agenda-t-opal.vercel.app/](https://agenda-t-opal.vercel.app/)

---

## 🚀 Arquitectura del Proyecto

```
Agenda-T/
├── app_escritorio/          # Aplicación de escritorio (Electron + SQLite)
│   ├── main.js              # Controlador central de Electron (backend)
│   ├── index.html           # Interfaz principal de la aplicación
│   ├── clientes.html        # Vista de gestión de clientes
│   ├── src/
│   │   ├── database.js      # Capa de persistencia SQLite (CRUD)
│   │   └── whatsapp.js      # Mock de integración WhatsApp Business API
│   ├── build-installer.js   # Script para generar el instalador .exe
│   └── package.json         # Dependencias y scripts de Node.js
├── pagina_web/              # Landing page de marketing
│   └── index.html           # SPA completa (HTML + CSS + JS)
├── reportes/                # Reportes Excel generados por la app
├── .gitignore
└── Readme.md
```

---

## 📱 Aplicación de Escritorio (`app_escritorio`)

Desarrollada con **Node.js, Electron y SQLite**. Sus características principales son:

### Funcionalidades
- **Agendas Multi-Profesional:** Columnas dinámicas generadas en tiempo real para separar visualmente las citas de cada trabajador o especialista del negocio, con colores identificativos personalizados.
- **Smart CRM:** Buscador integrado predictivo que localiza clientes instantáneamente por nombre o número de teléfono mediante autocompletado.
- **Analítica Financiera (Excel):** Módulo autónomo que recopila un resumen financiero de las citas completadas y exporta automáticamente archivos `.xlsx` estilizados con la contabilidad mensual.
- **Recordatorios por WhatsApp (API Mock):** Integración con Node-Cron para emitir recordatorios automatizados en segundo plano cada mañana a los números móviles de los clientes.
- **Barra de ventana personalizada:** Interfaz frameless con controles de ventana propios (minimizar, maximizar, cerrar) y soporte de arrastre.
- **Base de Datos Dinámica y Limpia:** En desarrollo utiliza la DB local. Tras compilar (modo empaquetado/producción), crea una base de datos `peluqueria.db` estéril desde cero en `AppData` del usuario para asegurar privacidad en las instalaciones de clientes.

### Scripts (package.json)
- `npm start`: Inicia el entorno de desarrollo.
- `npm run package`: Genera un paquete ejecutable para Windows x64 con `electron-packager`.

---

## 🌐 Sitio Web (`pagina_web`)

Landing page moderna enfocada a conversiones B2B, desplegada automáticamente en **Vercel**.

### Características
- **Estética "Glassmorphism":** Diseñada con Vanilla CSS puro sin librerías externas. Efectos de cristal, degradados, animaciones 3D y modo oscuro nativo.
- **SEO Optimizado:** Metadatos Open Graph estructurados, HTML5 semántico, etiquetas `<title>` y `<meta>` descriptivas.
- **Descarga directa:** Botón principal conectado a **GitHub Releases** para descarga del instalador `Agenda-T-Setup.exe` (~150MB) desde CDN ultrarrápido.
- **Formulario de Contacto Real:** Conectado a **Web3Forms** vía AJAX (Fetch API). Los mensajes de clientes llegan directamente al email del administrador sin backend propio.
- **Toast de Confirmación:** Notificación visual elegante animada al enviar el formulario, con feedback de estado ("Enviando..." → "✅ ¡Mensaje enviado correctamente!").
- **Menú Móvil Responsivo:** Menú hamburguesa con overlay a pantalla completa y desenfoque de fondo.
- **Animaciones de Scroll:** Componentes con efecto `fade-up` gestionados por `IntersectionObserver`.

---

## 🛠️ Tecnologías Empleadas

### Backend / Core
| Tecnología | Función |
|---|---|
| **Electron** | Contenedor de interfaz nativa para escritorio |
| **Node.js** | Entorno de ejecución backend |
| **SQLite3** | Base de datos local embebida |
| **ExcelJS** | Generación de reportes Excel estilizados |
| **Node-Cron** | Tareas programadas (recordatorios automáticos) |
| **electron-packager** | Empaquetado del ejecutable Windows |
| **electron-winstaller** | Generación del instalador Setup.exe |

### Frontend Web
| Tecnología | Función |
|---|---|
| **HTML5 Semántico** | Estructura accesible y optimizada para SEO |
| **CSS Vanilla** | Glassmorphism, transformaciones 3D, variables CSS |
| **JavaScript ES6+** | IntersectionObserver, Fetch API, FormData |
| **Web3Forms** | Pasarela de formularios (emails sin backend) |
| **Google Fonts (Inter)** | Tipografía profesional |
| **Material Symbols** | Iconografía de Google Material Design |

### Infraestructura
| Servicio | Función |
|---|---|
| **GitHub** | Control de versiones y almacenamiento del código |
| **GitHub Releases** | CDN de descarga del instalador (.exe) |
| **Vercel** | Despliegue automático de la web (CI/CD) |

---

## 💻 Instrucciones para entorno de desarrollo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/marommar/Agenda-T.git
   cd Agenda-T
   ```
2. Instala las dependencias de la aplicación:
   ```bash
   cd app_escritorio
   npm install
   ```
3. Levanta el entorno de desarrollo:
   ```bash
   npm start
   ```
4. Para empaquetar una nueva versión distribuible:
   ```bash
   npx electron-packager . Agenda-T --platform=win32 --arch=x64 --out=dist --overwrite --ignore="peluqueria\.db"
   node build-installer.js
   ```
   *(Después, sube el nuevo `Agenda-T-Setup.exe` a GitHub Releases y Vercel lo servirá automáticamente).*

---

## 📦 Despliegue

El despliegue es completamente automático:
1. Se hace `git push` a la rama `main`.
2. **GitHub** almacena el código actualizado.
3. **Vercel** detecta el cambio y re-despliega la web en segundos (CI/CD).
4. Los instaladores se suben manualmente a **GitHub Releases** como binarios adjuntos.

---

## 📄 Licencia

© 2026 Agenda-T. Todos los derechos reservados.