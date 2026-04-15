// ============================================================================
// MAIN.JS - CONTROLADOR CENTRAL DE ELECTRON (BACKEND)
// Este script es el "servidor" o núcleo de la aplicación de escritorio.
// Controla el ciclo de vida de la ventana, la interacción con hardware,
// tareas programadas (CRON) y comunicaciones remotas.
// ============================================================================

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const cron = require('node-cron');
const db   = require('./src/database.js');
const whatsappMock = require('./src/whatsapp.js');
const ExcelJS = require('exceljs');

let mainWindow;

/**
 * createWindow()
 * Instancia y levanta la ventana de navegador de Chromium embebida.
 * Oculta el marco nativo de Windows (frame: false) para permitir un diseño CSS personalizado.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed',     () => { mainWindow = null; });
  mainWindow.on('maximize',   () => mainWindow.webContents.send('window-maximized', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-maximized', false));
}

// ── Window controls ──────────────────────────────────────
ipcMain.on('close-app',    () => mainWindow?.close());
ipcMain.on('minimize-app', () => mainWindow?.minimize());
ipcMain.on('maximize-app', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});

// ============================================================================
// SISTEMA AUTOMATIZADO CRON - RECORDATORIOS DE WHATSAPP
// ============================================================================

/**
 * triggerReminders()
 * Lee la base de datos en busca de citas pendientes en las próximas 24h.
 * Utiliza el módulo externo whatsapp.js (Mock de API Oficial) para despachar
 * las notificaciones silenciosamente.
 */
async function triggerReminders() {
  try {
    const citas = await db.getCitasProximas24h();
    for (const cita of citas) {
      whatsappMock.sendReminder(cita);
      await db.updateCitaEstado(cita.id, 'recordatorio_enviado');
      mainWindow?.webContents.send('whatsapp-reminder-sent', { citaId: cita.id, nombre: cita.nombre });
    }
    mainWindow?.webContents.send('whatsapp-done', { count: citas.length });
    console.log(`[CRON] ${citas.length} recordatorio(s) enviado(s)`);
  } catch (e) {
    console.error('[CRON] Error reminders:', e);
  }
}
ipcMain.on('trigger-whatsapp-reminders', triggerReminders);

// ============================================================================
// MÓDULO FINANCIERO - OBTENCIÓN Y COMPILACIÓN HACIA EXCEL NATIVO (.xlsx)
// ============================================================================

/**
 * ipcMain.handle('generate-excel-report')
 * Escucha un canal asíncrono desde el frontend.
 * Abre el diálogo nativo de guardado de Windows invocando 'dialog.showSaveDialog'
 * Extrae los registros de la DB y usa 'ExcelJS' para estructurar un documento formal.
 */
ipcMain.handle('generate-excel-report', async () => {
  try {
    const now = new Date();
    const defaultName = `reporte_luxe_salon_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}.xlsx`;

    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar Reporte Excel',
      defaultPath: defaultName,
      filters: [
        { name: 'Excel', extensions: ['xlsx'] },
        { name: 'CSV',   extensions: ['csv']  },
      ]
    });

    if (canceled || !filePath) return { success: false };

    const [citas, clientes] = await Promise.all([db.getCitas(), db.getClientes()]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Luxe Salon';
    wb.created = now;

    // ── Hoja: Citas ──
    const wsCitas = wb.addWorksheet('Citas');
    wsCitas.columns = [
      { header: 'ID',          key: 'id',         width: 8  },
      { header: 'Fecha',       key: 'fecha',       width: 14 },
      { header: 'Hora',        key: 'hora',        width: 10 },
      { header: 'Personal',    key: 'personal',    width: 20 },
      { header: 'Cliente',     key: 'nombre',      width: 25 },
      { header: 'Teléfono',    key: 'telefono',    width: 18 },
      { header: 'Servicio',    key: 'servicio',    width: 25 },
      { header: 'Duración',    key: 'duracion',    width: 12 },
      { header: 'Precio (€)',  key: 'precio',      width: 14 },
      { header: 'Estado',      key: 'estado',      width: 18 },
    ];
    // Cabecera estilizada
    wsCitas.getRow(1).eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
      cell.alignment = { horizontal: 'center' };
    });
    citas.forEach(c => {
      wsCitas.addRow({
        id: c.id, fecha: c.fecha, hora: c.hora||'',
        personal: c.personal_nombre || 'N/A',
        nombre: c.nombre, telefono: c.telefono||'',
        servicio: c.servicio, duracion: `${c.duracion} min`,
        precio: c.precio, estado: c.estado,
      });
    });

    // ── Hoja: Resumen mensual ──
    const wsResumen = wb.addWorksheet('Resumen Mensual');
    wsResumen.columns = [
      { header: 'Mes',              key: 'mes',    width: 18 },
      { header: 'Nº Citas',         key: 'num',    width: 12 },
      { header: 'Ingresos (€)',     key: 'total',  width: 18 },
    ];
    wsResumen.getRow(1).eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
      cell.alignment = { horizontal: 'center' };
    });
    // Agrupar por mes
    const porMes = {};
    citas.forEach(c => {
      const mesKey = c.fecha ? c.fecha.slice(0, 7) : 'N/A';
      if (!porMes[mesKey]) porMes[mesKey] = { num: 0, total: 0 };
      porMes[mesKey].num++;
      porMes[mesKey].total += c.precio || 0;
    });
    Object.entries(porMes).sort().forEach(([mes, data]) => {
      wsResumen.addRow({ mes, num: data.num, total: data.total });
    });

    // ── Hoja: Clientes ──
    const wsClientes = wb.addWorksheet('Clientes');
    wsClientes.columns = [
      { header: 'ID',       key: 'id',       width: 8  },
      { header: 'Nombre',   key: 'nombre',   width: 28 },
      { header: 'Teléfono', key: 'telefono', width: 18 },
    ];
    wsClientes.getRow(1).eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      cell.alignment = { horizontal: 'center' };
    });
    clientes.forEach(c => {
      wsClientes.addRow({ id: c.id, nombre: c.nombre, telefono: c.telefono||'' });
    });

    await wb.xlsx.writeFile(filePath);
    console.log(`[EXCEL] Reporte guardado en: ${filePath}`);
    return { success: true, filePath };
  } catch (e) {
    console.error('[EXCEL] Error:', e);
    return { success: false, error: e.message };
  }
});

// ============================================================================
// INICIALIZACIÓN DEL CICLO DE VIDA DE LA APLICACIÓN
// ============================================================================
app.whenReady().then(async () => {
  createWindow();

  // [CRÍTICO] Aislamiento BBDD: Si la aplicación está empaquetada (producción),
  // enviamos el AppData al gestor de bases de datos para no corromper el instalador.
  const userDataPath = app.isPackaged ? app.getPath('userData') : null;
  await db.initDB(userDataPath);
  
  // Levanta el servicio subyacente del sistema API
  whatsappMock.init();

  cron.schedule('0 9 * * *', triggerReminders);
  cron.schedule('0 23 28-31 * *', () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    if (now.getDate() === lastDay) {
      console.log('[CRON] Generando reporte mensual automático...');
      // Auto-genera en la misma carpeta del exe
      ipcMain.emit('generate-excel-manual');
    }
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!mainWindow) createWindow(); });
