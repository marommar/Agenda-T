// ============================================================================
// DATABASE.JS - CAPA DE PERSISTENCIA Y MODELO DE DOMINIO (SQLite)
// Gestiona el ciclo CRUD (Crear, Leer, Actualizar, Borrar) de la base 
// de datos en tiempo real mediante promesas asíncronas sobre SQLite3.
// ============================================================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

// Funciones Helper para envolver el callback nativo de SQLite en Promesas (ES6)
function run(sql, p = []) {
  return new Promise((res, rej) => db.run(sql, p, function (e) { e ? rej(e) : res(this); }));
}
function all(sql, p = []) {
  return new Promise((res, rej) => db.all(sql, p, (e, r) => e ? rej(e) : res(r || [])));
}
function get(sql, p = []) {
  return new Promise((res, rej) => db.get(sql, p, (e, r) => e ? rej(e) : res(r)));
}

const DEFAULT_SERVICIOS = [
  { nombre: 'Corte de pelo',       precio: 18, duracion: 30  },
  { nombre: 'Corte + Lavado',      precio: 28, duracion: 45  },
  { nombre: 'Tinte completo',      precio: 55, duracion: 90  },
  { nombre: 'Mechas',              precio: 70, duracion: 120 },
  { nombre: 'Balayage',            precio: 90, duracion: 150 },
  { nombre: 'Permanente',          precio: 65, duracion: 120 },
  { nombre: 'Alisado',             precio: 80, duracion: 120 },
  { nombre: 'Tratamiento capilar', precio: 35, duracion: 45  },
  { nombre: 'Peinado',             precio: 25, duracion: 30  },
  { nombre: 'Barba',               precio: 12, duracion: 20  },
  { nombre: 'Manicura',            precio: 22, duracion: 45  },
  { nombre: 'Pedicura',            precio: 28, duracion: 60  },
];

/**
 * initDB()
 * Inicializa la conexión y crea el archivo `.db`.
 * Se asegura de usar la ruta protegida 'AppData' en producción.
 */
function initDB(userDataPath) {
  return new Promise((res, rej) => {
    // Cambiamos el nombre a agenda-t.db para asegurar una distribución limpia y evitar conflictos con DBs viejas
    const dbPath = userDataPath ? path.join(userDataPath, 'agenda-t.db') : path.join(__dirname, '..', 'agenda-t.db');
    db = new sqlite3.Database(dbPath, async (err) => {
      if (err) { rej(err); return; }
      console.log(`[DB] Conectado a la BD SQLite en: ${dbPath}`);
      try { await createTables(); res(); }
      catch (e) { rej(e); }
    });
  });
}

/**
 * createTables()
 * Sistema ORM simplificado. Si las tablas o columnas no existen, se inyectan 
 * de manera transparente al inicio. Carga también la capa Seed de servicios.
 */
async function createTables() {
  // ── Peluqueros ──
  await run(`CREATE TABLE IF NOT EXISTS peluqueros (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    color  TEXT DEFAULT '#7c3aed'
  )`);

  // ── Clientes ──
  await run(`CREATE TABLE IF NOT EXISTS clientes (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT NOT NULL,
    telefono TEXT
  )`);

  // ── Servicios ──
  await run(`CREATE TABLE IF NOT EXISTS servicios (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT NOT NULL,
    precio   REAL    DEFAULT 0,
    duracion INTEGER DEFAULT 60
  )`);

  // ── Citas ──
  await run(`CREATE TABLE IF NOT EXISTS citas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id   INTEGER,
    peluquero_id INTEGER DEFAULT 1,
    fecha        TEXT,
    hora         TEXT    DEFAULT '10:00',
    servicio     TEXT,
    duracion     INTEGER DEFAULT 60,
    precio       REAL    DEFAULT 0,
    estado       TEXT    DEFAULT 'pendiente',
    FOREIGN KEY(cliente_id)   REFERENCES clientes(id),
    FOREIGN KEY(peluquero_id) REFERENCES peluqueros(id)
  )`);

  // Migraciones
  for (const sql of [
    `ALTER TABLE citas ADD COLUMN hora         TEXT    DEFAULT '10:00'`,
    `ALTER TABLE citas ADD COLUMN duracion     INTEGER DEFAULT 60`,
    `ALTER TABLE citas ADD COLUMN precio       REAL    DEFAULT 0`,
    `ALTER TABLE citas ADD COLUMN estado       TEXT    DEFAULT 'pendiente'`,
    `ALTER TABLE citas ADD COLUMN peluquero_id INTEGER DEFAULT 1`,
  ]) { try { await run(sql); } catch (_) {} }

  // Seed personal por defecto (Necesario para tener al menos una agenda funcional)
  const { n: np } = await get('SELECT COUNT(*) as n FROM peluqueros');
  if (np === 0) {
    await run(`INSERT INTO peluqueros (nombre, color) VALUES ('Personal Principal', '#7c3aed')`);
    console.log('[DB] Registro de personal inicial creado');
  }

  // Seed servicios (Desactivado para distribución limpia)
  /*
  const { n: ns } = await get('SELECT COUNT(*) as n FROM servicios');
  if (ns === 0) {
    for (const s of DEFAULT_SERVICIOS)
      await run('INSERT INTO servicios (nombre, precio, duracion) VALUES (?,?,?)', [s.nombre, s.precio, s.duracion]);
    console.log('[DB] Catálogo de servicios inicializado');
  }
  */

  console.log('[DB] Tablas verificadas/creadas');
}

// ============================================================================
// ENDPOINTS INTERNOS DE BASE DE DATOS
// Sirven para aislar de consultas SQL al hilo principal del Main y al Frontend.
// ============================================================================

// ── PROFESIONALES (Antes Peluqueros) ───────────────────────────────────
function getPeluqueros() { return all('SELECT * FROM peluqueros ORDER BY id ASC'); }
function addPeluquero(nombre, color) {
  return run('INSERT INTO peluqueros (nombre, color) VALUES (?,?)', [nombre, color]).then(r => r.lastID);
}
function updatePeluquero(id, nombre, color) {
  return run('UPDATE peluqueros SET nombre=?, color=? WHERE id=?', [nombre, color, id]);
}
async function deletePeluquero(id) {
  const { n } = await get('SELECT COUNT(*) as n FROM citas WHERE peluquero_id=?', [id]);
  if (n > 0) throw new Error(`No se puede eliminar: tiene ${n} cita(s) asignada(s)`);
  return run('DELETE FROM peluqueros WHERE id=?', [id]);
}

// ── CLIENTES ─────────────────────────────────────────────
function getClientes() { return all('SELECT * FROM clientes ORDER BY nombre ASC'); }
function addCliente(nombre, telefono) {
  return run('INSERT INTO clientes (nombre, telefono) VALUES (?,?)', [nombre, telefono]).then(r => r.lastID);
}

// ── SERVICIOS ────────────────────────────────────────────
function getServicios() { return all('SELECT * FROM servicios ORDER BY nombre ASC'); }
function addServicio(nombre, precio, duracion) {
  return run('INSERT INTO servicios (nombre, precio, duracion) VALUES (?,?,?)', [nombre, precio, duracion]).then(r => r.lastID);
}
function updateServicio(id, nombre, precio, duracion) {
  return run('UPDATE servicios SET nombre=?, precio=?, duracion=? WHERE id=?', [nombre, precio, duracion, id]);
}
function deleteServicio(id) { return run('DELETE FROM servicios WHERE id=?', [id]); }

// ── CITAS ────────────────────────────────────────────────
const CITAS_SELECT = `
  SELECT
    c.id, c.fecha, c.hora, c.servicio, c.duracion, c.precio, c.estado,
    c.cliente_id,   cl.nombre,   cl.telefono,
    c.peluquero_id, p.nombre  AS peluquero_nombre, p.color AS peluquero_color
  FROM citas c
  JOIN clientes  cl ON c.cliente_id   = cl.id
  LEFT JOIN peluqueros p  ON c.peluquero_id = p.id
`;

function getCitas() {
  return all(CITAS_SELECT + ' ORDER BY c.fecha ASC, c.hora ASC');
}
function getCitasByFecha(fecha) {
  return all(CITAS_SELECT + ' WHERE c.fecha=? ORDER BY c.hora ASC', [fecha]);
}
function addCita(cliente_id, peluquero_id, fecha, hora, servicio, duracion, precio) {
  return run(
    `INSERT INTO citas (cliente_id, peluquero_id, fecha, hora, servicio, duracion, precio, estado)
     VALUES (?,?,?,?,?,?,?,'pendiente')`,
    [cliente_id, peluquero_id || 1, fecha, hora || '10:00', servicio, duracion || 60, precio || 0]
  ).then(r => r.lastID);
}
function updateCita(id, { cliente_id, peluquero_id, fecha, hora, servicio, duracion, precio }) {
  return run(
    `UPDATE citas SET cliente_id=?, peluquero_id=?, fecha=?, hora=?, servicio=?, duracion=?, precio=? WHERE id=?`,
    [cliente_id, peluquero_id || 1, fecha, hora, servicio, duracion, precio, id]
  );
}
function updateCitaEstado(id, estado) {
  return run('UPDATE citas SET estado=? WHERE id=?', [estado, id]);
}
function getCitasProximas24h() {
  const t = new Date(); t.setDate(t.getDate() + 1);
  const f = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  return all(`${CITAS_SELECT} WHERE c.fecha=? AND c.estado='pendiente'`, [f]);
}

// ── INGRESOS ─────────────────────────────────────────────
function getIngresosDelDia(fecha) {
  return get('SELECT COALESCE(SUM(precio),0) as total FROM citas WHERE fecha=?', [fecha]).then(r => r?.total || 0);
}
function getIngresosMes(year, month) {
  const s = `${year}-${String(month).padStart(2,'0')}-01`;
  const e = `${year}-${String(month).padStart(2,'0')}-31`;
  return get('SELECT COALESCE(SUM(precio),0) as total FROM citas WHERE fecha>=? AND fecha<=?', [s, e]).then(r => r?.total || 0);
}
function getCitasPorDia(year, month) {
  const s = `${year}-${String(month).padStart(2,'0')}-01`;
  const e = `${year}-${String(month).padStart(2,'0')}-31`;
  return all(`SELECT fecha, COALESCE(SUM(precio),0) as total, COUNT(*) as num
              FROM citas WHERE fecha>=? AND fecha<=? GROUP BY fecha`, [s, e]);
}

module.exports = {
  initDB,
  getPeluqueros, addPeluquero, updatePeluquero, deletePeluquero,
  getClientes, addCliente,
  getServicios, addServicio, updateServicio, deleteServicio,
  getCitas, getCitasByFecha, addCita, updateCita, updateCitaEstado, getCitasProximas24h,
  getIngresosDelDia, getIngresosMes, getCitasPorDia,
};
