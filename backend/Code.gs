/* ============================================================
   UNIVERSO CÍCLOPE · BACKEND (Google Apps Script + Sheets)
   ------------------------------------------------------------
   Base de datos de exploradores en la nube. El progreso queda
   guardado aunque el usuario reinstale o cambie de teléfono.

   CÓMO DESPLEGARLO (una sola vez):
   1. Crea una Hoja de Google nueva (sheets.new). Ponle nombre
      "Universo Cíclope - DB".
   2. En esa hoja: Extensiones -> Apps Script. Borra lo que haya
      y pega TODO este archivo. Guarda.
   3. Implementar -> Nueva implementación -> tipo "Aplicación web".
        - Ejecutar como: Yo
        - Quién tiene acceso: Cualquier persona
      Copia la URL que termina en /exec.
   4. Pega esa URL en assets/js/estado.js -> const ENDPOINT = '...'
      Sube el cambio (git push) y listo: todo queda online.

   Mismo patrón que El Ojo Maestro. La hoja "Exploradores" es tu
   base de datos: ahí ves usuarios, sellos, gemas y visitas, y de
   ahí se podrá alimentar el panel del Ojo Maestro.
   ============================================================ */

const HOJA = 'Exploradores';
const HOJA_CFG = 'Config';

/* CLAVE DE ADMIN — cámbiala por una tuya. Es la contraseña del
   panel de administración. No la compartas. */
const ADMIN_KEY = 'ciclope-2026';

function doGet(e)  { return handle(e, e.parameter || {}); }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (_) {}
  return handle(e, body);
}

function handle(e, data) {
  var accion = data.accion || (e.parameter && e.parameter.accion);
  var key = data.key || (e.parameter && e.parameter.key);
  // --- públicas (las usa la app) ---
  if (accion === 'guardar') return json(guardar(data.perfil));
  if (accion === 'cargar')  return json(cargar(data.id || (e.parameter && e.parameter.id)));
  if (accion === 'config')  return json({ ok: true, config: configLeer() }); // la app lee el contenido
  if (accion === 'referido') return json(acreditarReferido(data.invitadoId, data.codigo));
  if (accion === 'folio')   return json({ ok: true }); // fase 2: validar contra Loyverse
  // --- de admin (requieren clave) ---
  if (accion === 'login')         return json({ ok: key === ADMIN_KEY });
  if (accion === 'stats')         return json(admin(key, stats));
  if (accion === 'lista')         return json(admin(key, lista));
  if (accion === 'configGuardar') return json(admin(key, function () { return configGuardar(data.config); }));
  if (accion === 'subirImagen')   return json(admin(key, function () { return subirImagen(data.nombre, data.data, data.mime); }));
  return json({ ok: false, msg: 'accion desconocida' });
}

function admin(key, fn) {
  if (key !== ADMIN_KEY) return { ok: false, msg: 'clave incorrecta' };
  return fn();
}

/* Obtiene la hoja de cálculo de forma robusta:
   1) si ya guardamos su ID, la abre;
   2) si el script está ligado a una hoja, la usa y recuerda su ID;
   3) si no, crea una hoja nueva ("Universo Cíclope - DB") en tu
      Drive y recuerda su ID. Así funciona siempre, sea script
      ligado o independiente. */
function getSS() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SS_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (_) {} }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) ss = SpreadsheetApp.create('Universo Cíclope - DB');
  props.setProperty('SS_ID', ss.getId());
  return ss;
}

function sheet() {
  var ss = getSS();
  var sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(['id', 'apodo', 'sellos', 'gemas', 'visitas', 'rango', 'sync', 'actualizado', 'blob']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow(sh, id) {
  var n = Math.max(sh.getLastRow() - 1, 0);
  if (!n) return 0;
  var ids = sh.getRange(2, 1, n, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return 0;
}

function guardar(p) {
  if (!p || !p.id) return { ok: false, msg: 'sin id' };
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (_) { return { ok: false, msg: 'ocupado' }; }
  try {
    var sh = sheet();
    var row = findRow(sh, p.id);
    var rango = (p.sellos >= 25) ? 5 : (p.sellos >= 15) ? 4 : (p.sellos >= 8) ? 3 : (p.sellos >= 3) ? 2 : 1;
    var fila = [p.id, p.apodo || '', p.sellos || 0, p.gemas || 0, (p.visitas || []).length, rango, p.sync || 0, new Date(), JSON.stringify(p)];
    if (row) sh.getRange(row, 1, 1, fila.length).setValues([fila]);
    else sh.appendRow(fila);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function cargar(id) {
  if (!id) return { ok: false };
  var sh = sheet();
  var row = findRow(sh, id);
  if (!row) return { ok: true, perfil: null };
  var blob = sh.getRange(row, 9).getValue();
  try { return { ok: true, perfil: JSON.parse(blob) }; }
  catch (_) { return { ok: true, perfil: null }; }
}

/* ---------- REFERIDOS ----------
   Paga GEMAS_REFERIDO al explorador dueño de 'codigo' cuando su
   invitado hace su primera visita. Se paga UNA sola vez por
   invitado (se registra en la hoja "Referidos"). */
const GEMAS_REFERIDO = 20;

function acreditarReferido(invitadoId, codigo) {
  if (!invitadoId || !codigo) return { ok: false };
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (_) { return { ok: false, msg: 'ocupado' }; }
  try {
    var ss = getSS();
    var ref = ss.getSheetByName('Referidos');
    if (!ref) { ref = ss.insertSheet('Referidos'); ref.appendRow(['invitadoId', 'codigo', 'fecha']); ref.setFrozenRows(1); }
    var n = Math.max(ref.getLastRow() - 1, 0);
    if (n) {
      var ids = ref.getRange(2, 1, n, 1).getValues();
      for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(invitadoId)) return { ok: true, yaAcreditado: true };
    }
    var sh = sheet();
    var rows = Math.max(sh.getLastRow() - 1, 0);
    if (rows) {
      var data = sh.getRange(2, 1, rows, 9).getValues();
      for (var r = 0; r < data.length; r++) {
        var blob; try { blob = JSON.parse(data[r][8]); } catch (_) { continue; }
        if (blob && blob.codigoRef === codigo) {
          blob.gemas = (blob.gemas || 0) + GEMAS_REFERIDO;
          blob.referidos = (blob.referidos || 0) + 1;
          sh.getRange(r + 2, 4).setValue(blob.gemas);
          sh.getRange(r + 2, 9).setValue(JSON.stringify(blob));
          ref.appendRow([invitadoId, codigo, new Date()]);
          return { ok: true, acreditado: true };
        }
      }
    }
    return { ok: false, msg: 'referidor no encontrado' };
  } finally { lock.releaseLock(); }
}

/* ---------- PANEL DE ADMINISTRACIÓN ---------- */

// Lee todas las filas de Exploradores como objetos.
function leerTodo() {
  var sh = sheet();
  var n = Math.max(sh.getLastRow() - 1, 0);
  if (!n) return [];
  var vals = sh.getRange(2, 1, n, 9).getValues();
  return vals.map(function (r) {
    var blob = {};
    try { blob = JSON.parse(r[8]) || {}; } catch (_) {}
    return {
      id: r[0], apodo: r[1], sellos: +r[2] || 0, gemas: +r[3] || 0,
      visitas: +r[4] || 0, rango: +r[5] || 1,
      actualizado: r[7] ? new Date(r[7]).getTime() : 0,
      canjes: blob.canjes || [], alta: blob.alta || ''
    };
  });
}

function stats() {
  var all = leerTodo();
  var ahora = Date.now(), d7 = 7 * 864e5, d30 = 30 * 864e5;
  var s = {
    total: all.length, activos7: 0, activos30: 0,
    visitas: 0, gemas: 0, sellos: 0, canjes: 0,
    rangos: [0, 0, 0, 0, 0], nombres: ['Explorador', 'Rastreador', 'Cazador', 'Guardián', 'Embajador']
  };
  var canjesRecientes = [];
  all.forEach(function (e) {
    if (ahora - e.actualizado < d7) s.activos7++;
    if (ahora - e.actualizado < d30) s.activos30++;
    s.visitas += e.visitas; s.gemas += e.gemas; s.sellos += e.sellos;
    s.rangos[Math.min(Math.max(e.rango, 1), 5) - 1]++;
    (e.canjes || []).forEach(function (c) {
      s.canjes++;
      canjesRecientes.push({ apodo: e.apodo || 'Explorador', nombre: c.nombre, codigo: c.codigo, fecha: c.fecha });
    });
  });
  canjesRecientes.sort(function (a, b) { return (b.fecha || '').localeCompare(a.fecha || ''); });
  s.canjesRecientes = canjesRecientes.slice(0, 25);
  return { ok: true, stats: s };
}

function lista() {
  var all = leerTodo().sort(function (a, b) { return b.actualizado - a.actualizado; });
  return { ok: true, exploradores: all.slice(0, 500) };
}

/* ---------- CONFIG editable (contenido de la app) ---------- */
function cfgSheet() {
  var ss = getSS();
  var sh = ss.getSheetByName(HOJA_CFG);
  if (!sh) { sh = ss.insertSheet(HOJA_CFG); sh.getRange(1, 1).setValue('{}'); }
  return sh;
}
function configLeer() {
  try { return JSON.parse(cfgSheet().getRange(1, 1).getValue() || '{}'); }
  catch (_) { return {}; }
}
function configGuardar(cfg) {
  cfgSheet().getRange(1, 1).setValue(JSON.stringify(cfg || {}));
  return { ok: true };
}

/* ---------- SUBIR FOTOS (a Drive, públicas) ----------
   Guarda la imagen en una carpeta de tu Drive y devuelve una URL
   pública lista para usar en la app. */
function imgFolder() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('IMG_FOLDER');
  if (id) { try { return DriveApp.getFolderById(id); } catch (_) {} }
  var f = DriveApp.createFolder('Universo Cíclope - Imágenes');
  props.setProperty('IMG_FOLDER', f.getId());
  return f;
}
function subirImagen(nombre, dataB64, mime) {
  if (!dataB64) return { ok: false, msg: 'sin datos' };
  try {
    var blob = Utilities.newBlob(Utilities.base64Decode(dataB64), mime || 'image/jpeg', nombre || ('img-' + Date.now() + '.jpg'));
    var file = imgFolder().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var id = file.getId();
    return { ok: true, url: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1200', id: id };
  } catch (e) { return { ok: false, msg: String(e) }; }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
