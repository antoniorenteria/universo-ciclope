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

function doGet(e)  { return handle(e, e.parameter || {}); }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (_) {}
  return handle(e, body);
}

function handle(e, data) {
  var accion = data.accion || (e.parameter && e.parameter.accion);
  if (accion === 'guardar') return json(guardar(data.perfil));
  if (accion === 'cargar')  return json(cargar(data.id || (e.parameter && e.parameter.id)));
  if (accion === 'folio')   return json({ ok: true }); // fase 2: validar contra Loyverse
  return json({ ok: false, msg: 'accion desconocida' });
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

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
