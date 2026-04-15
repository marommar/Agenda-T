# Agenda-T 📅
### v1.0.3 — Sistema de Gestión Inteligente B2B

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

### Funcionalidades Estrella
- **Agendas Multi-Profesional:** Columnas dinámicas generadas en tiempo real para separar visualmente las citas de cada trabajador o especialista del negocio.
- **Smart CRM:** Buscador integrado predictivo que localiza clientes instantáneamente por nombre o número de teléfono.
- **Analítica Financiera (Excel):** Exportación automática de archivos `.xlsx` estilizados con el cierre de caja y contabilidad mensual.
- **Recordatorios por WhatsApp (API Mock):** Tareas programadas con `node-cron` que simulan el envío de recordatorios automáticos.
- **Base de Datos Dinámica:** En producción, la app utiliza una base de datos aislada en `app.getPath('userData')`, asegurando que el software sea instalable y portable sin conflictos de permisos.

### 🛠️ Configuración de Desarrollo
1. Entra en la carpeta: `cd app_escritorio`
2. Instala dependencias: `npm install`
3. Ejecuta: `npm start`
4. **Empaquetar:** `npm run package` seguido de `node build-installer.js`.

---

## 🌐 Sitio Web Corporativo (`pagina_web`)

Landing page diseñada para maximizar la conversión y la confianza del cliente B2B.

### Características Técnicas
- **Estética "Glassmorphism":** CSS moderno sin librerías externas (Zero Dependencies).
- **Contacto Real (Web3Forms):** Integración AJAX que envía mensajes directamente al email configurado (`a181a1fa-da8c-4805-9586-36bdb4ac817b`).
- **Feedback Visual:** Componente "Toast" animado que confirma el envío del formulario con estilo.
- **Distribución vía GitHub:** El botón de descarga apunta directamente a los binarios de **GitHub Releases**, permitiendo actualizaciones centralizadas.

---

## 🚢 Despliegue y Distribución

### CI/CD con Vercel
El proyecto está configurado para **Despliegue Continuo**. Cada vez que realices un `git push` a la rama `main`, Vercel detectará el cambio y actualizará la web en vivo automáticamente en cuestión de segundos.

### Distribución de la App
1. Genera el instalador localmente con `node build-installer.js`.
2. Sube el archivo `Agenda-T-Setup.exe` a una nueva **Release** en tu cuenta de GitHub.
3. Asegúrate de que el enlace en la web apunte a la URL de descarga de GitHub para que los clientes siempre bajen la última versión estable.

---

## 🔧 Guía de Personalización

Para adaptar Agenda-T a un cliente específico:
1. **Branding:** Modifica las variables de color en `:root` dentro de `página_web/index.html` y `app_escritorio/index.html`.
2. **Formulario:** Cambia el `access_key` en el HTML de la web para recibir los correos en una cuenta diferente.
3. **WhatsApp:** Para conectar con la API real de Meta o Twilio, sustituye la lógica en `app_escritorio/src/whatsapp.js` por una petición `fetch` a sus respectivos endpoints.

---

## 📄 Licencia y Créditos
Proyecto desarrollado bajo estándares modernos de ingeniería de software.
© 2026 **Agenda-T**. Todos los derechos reservados.