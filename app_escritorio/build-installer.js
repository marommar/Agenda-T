const electronInstaller = require('electron-winstaller');
const path = require('path');

async function build() {
  console.log('Construyendo el instalador...');
  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: path.join(__dirname, 'dist/Agenda-T-win32-x64'),
      outputDirectory: path.join(__dirname, 'dist/installer'),
      authors: 'Agenda-T',
      exe: 'Agenda-T.exe',
      name: 'AgendaT',
      description: 'Sistema de Gestión Agenda-T',
      setupExe: 'Agenda-T-Setup.exe'
    });
    console.log('¡Instalador creado con éxito!');
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

build();
