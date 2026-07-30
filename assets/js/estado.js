/* ============================================================
   UNIVERSO CÍCLOPE · ESTADO DEL EXPLORADOR
   ------------------------------------------------------------
   SIN LOGIN. El explorador entra y ya existe: se crea un perfil
   anónimo en su propio teléfono (localStorage). Si quiere, se
   pone un apodo para conservar y presumir su progreso.

   Estos datos (sellos, gemas, rango, misiones, visitas) se guardan
   con una forma LIMPIA para que mañana el panel del Ojo Maestro /
   Mentor los lea. Al conectar Loyverse solo cambia el bloque
   BACKEND del final; la interfaz no se toca.
   ============================================================ */

const LLAVE = 'universo_ciclope_v1';

const Explorador = {
  vacio() {
    return {
      apodo: '',              // vacío = anónimo, sigue siendo válido
      alta: new Date().toISOString(),
      sellos: 0,              // visitas reales -> suben de rango y reparan la nave
      gemas: 0,               // se ganan jugando/visitando -> recompensas
      visitas: [],            // { folio, fecha, base, monto }
      encomiendas: {},        // { id: { avance, completada, cobrada } }  (misiones)
      canjes: [],             // { id, nombre, codigo, fecha }
      archivo: [],            // titulos de fichas de lore ya descubiertas
      juegos: {},             // { id: { partidas, mejor } }
      visto: {},              // { seccion: true } para "continuar explorando"
      notis: false,           // ¿activó notificaciones push?
      codigoRef: 'CIC-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      id: 'UC-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), // id de dispositivo (backend)
      sync: 0,                // timestamp de última sincronización con el servidor
    };
  },

  cargar() {
    try {
      const raw = localStorage.getItem(LLAVE);
      if (!raw) return null;
      const p = Object.assign(this.vacio(), JSON.parse(raw));
      // migración: perfiles viejos usaban "puntos" -> ahora "gemas"
      if (p.puntos != null && (p.gemas == null || p.gemas === 0)) p.gemas = p.puntos;
      delete p.puntos;
      return p;
    } catch (_) { return null; }
  },

  guardar(p) {
    p.sync = Date.now();                       // marca de tiempo para el backend
    try { localStorage.setItem(LLAVE, JSON.stringify(p)); } catch (_) {}
    if (window.Sync) window.Sync.subir(p);     // respaldo online (si hay endpoint)
    return p;
  },

  /* Devuelve SIEMPRE un perfil. Si no había, lo crea al vuelo:
     así el explorador casual nunca ve una pantalla de registro. */
  actual() {
    let p = this.cargar();
    if (!p) {
      p = this.vacio();
      REGLAS.encomiendas.forEach(e => {
        p.encomiendas[e.id] = { avance: 0, completada: false, cobrada: false };
      });
      this.guardar(p);
    }
    REGLAS.encomiendas.forEach(e => {
      if (!p.encomiendas[e.id]) p.encomiendas[e.id] = { avance:0, completada:false, cobrada:false };
    });
    return p;
  },

  borrar() { try { localStorage.removeItem(LLAVE); } catch (_) {} },
};

/* ---------- Estado derivado (lectura, no se edita) ----------- */
const Estado = {
  rango(p)     { return REGLAS.rangoPorSellos(p.sellos); },
  siguiente(p) { return REGLAS.siguienteRango(p.sellos); },

  /* % de reparación de la nave: empieza en 0 y sube con cada
     visita hasta 'sellosParaDespegue'. Claro y congruente. */
  nave(p) {
    const meta = REGLAS.nave.sellosParaDespegue;
    return Math.min(100, Math.round((p.sellos / meta) * 100));
  },
  navePiezas(p) {
    const meta = REGLAS.nave.sellosParaDespegue;
    return { hechas: Math.min(p.sellos, meta), total: meta };
  },

  archivoAbierto(p, entrada) {
    const d = entrada.desbloqueo;
    if (!d || d === 'siempre') return true;
    if (d.sellos != null) return p.sellos >= d.sellos;
    if (d.mision) {
      const e = p.encomiendas[d.mision];
      return !!(e && e.completada);
    }
    return false;
  },

  desbloqueoTexto(entrada) {
    const d = entrada.desbloqueo;
    if (d && d.sellos != null) return `Se abre con ${d.sellos} sellos`;
    if (d && d.mision) {
      const m = REGLAS.encomiendas.find(e => e.id === d.mision);
      return `Se abre con la misión "${m ? m.nombre : d.mision}"`;
    }
    return 'Bloqueado';
  },

  /* Cuántas fichas de lore hay desbloqueadas (para el %) */
  archivoProgreso(p, entradas) {
    const abiertas = entradas.filter(e => this.archivoAbierto(p, e)).length;
    return { abiertas, total: entradas.length };
  },
};

/* ---------- Acciones (mutan el perfil y guardan) ------------- */
const Acciones = {

  ponerApodo(p, apodo) {
    p.apodo = (apodo || '').trim().slice(0, 18);
    return Explorador.guardar(p);
  },

  /* Registrar una visita con folio. HOY en modo demo valida
     localmente (cualquier folio no repetido). En producción lo
     valida el servidor contra Loyverse (ver BACKEND). Devuelve
     todo lo necesario para mostrar una confirmación clara. */
  sellar(p, folio, base) {
    folio = (folio || '').trim().toUpperCase();
    if (!folio) return { ok:false, msg:'Escribe el folio de tu ticket.' };
    if (p.visitas.some(v => v.folio === folio))
      return { ok:false, msg:'Ese folio ya se registró. Cada ticket cuenta una vez.' };

    const hoy = new Date();
    const dia = hoy.getDay();
    const doble = REGLAS.encomiendas.some(e => e.activa && e.dobleSello && e.dias && e.dias.includes(dia));
    const sellos = doble ? 2 : 1;
    const gemas = REGLAS.economia.gemasPorVisita * sellos;
    const rangoAntes = Estado.rango(p).id;

    p.sellos += sellos;
    p.gemas += gemas;
    p.visitas.unshift({ folio, fecha: hoy.toISOString(), base: base || '', monto: 0 });

    this._avanzarMisiones(p, { tipo:'visita', dia, base });
    Explorador.guardar(p);

    const rangoDespues = Estado.rango(p);
    const subioRango = rangoAntes !== rangoDespues.id;
    const voz = REGLAS.voz.selloOk[p.visitas.length % REGLAS.voz.selloOk.length];
    return { ok:true, sellos, gemas, doble, subioRango, rango: rangoDespues,
             totalSellos: p.sellos, totalGemas: p.gemas, folio, msg: voz };
  },

  /* Registrar una partida. Da gemas SOLO la primera vez que
     descubres el juego (bonus). Después, jugar por jugar NO da
     gemas: hay que superar LOGROS de puntaje (ver otorgarLogro). */
  registrarPartida(p, juegoId, mejor) {
    const g = p.juegos[juegoId] || { partidas:0, mejor:0, bonus:false, logros:[], dia:'', gemasHoy:0 };
    g.partidas += 1;
    if (mejor != null && mejor > g.mejor) g.mejor = mejor;
    let gemas = 0, primera = false;
    if (!g.bonus) { g.bonus = true; gemas = REGLAS.economia.gemasPrimerJuego; p.gemas += gemas; primera = true; }
    p.juegos[juegoId] = g;
    Explorador.guardar(p);
    return { gemas, primera };
  },

  /* Otorga gemas por LOGROS de puntaje (cuando el juego reporte
     su score). Cada logro se paga una sola vez y respeta el tope
     diario por juego (se reinicia cada día). */
  otorgarLogros(p, juegoId, score) {
    const metas = (REGLAS.logrosJuego || {})[juegoId] || [];
    const g = p.juegos[juegoId] || { partidas:0, mejor:0, bonus:false, logros:[], dia:'', gemasHoy:0 };
    const hoy = new Date().toISOString().slice(0,10);
    if (g.dia !== hoy) { g.dia = hoy; g.gemasHoy = 0; }
    let dadas = 0;
    metas.forEach((m, i) => {
      const clave = 'l'+i;
      if (score >= m.score && !(g.logros||[]).includes(clave)) {
        const espacio = REGLAS.economia.topeGemasJuegoDia - g.gemasHoy;
        const dar = Math.min(m.gemas, Math.max(0, espacio));
        if (dar > 0) { g.logros = (g.logros||[]).concat(clave); g.gemasHoy += dar; p.gemas += dar; dadas += dar; }
      }
    });
    p.juegos[juegoId] = g;
    Explorador.guardar(p);
    return dadas;
  },

  descubrirArchivo(p, id) {
    if (!p.archivo.includes(id)) { p.archivo.push(id); Explorador.guardar(p); }
    return p;
  },

  cobrar(p, recompensa) {
    if (p.gemas < recompensa.gemas)
      return { ok:false, msg:'Aún no tienes gemas suficientes.' };
    if (recompensa.rango) {
      const idx = REGLAS.indiceRango(Estado.rango(p).id);
      const need = REGLAS.indiceRango(recompensa.rango);
      if (idx < need)
        return { ok:false, msg:`Esta recompensa exige rango ${REGLAS.rangos[need].nombre}. Sigue visitando.` };
    }
    p.gemas -= recompensa.gemas;
    const codigo = 'OJO-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    p.canjes.unshift({ id:recompensa.id, nombre:recompensa.nombre, codigo, fecha:new Date().toISOString() });
    Explorador.guardar(p);
    return { ok:true, codigo, msg: REGLAS.voz.canjeOk };
  },

  marcarVisto(p, seccion) {
    if (!p.visto[seccion]) { p.visto[seccion] = true; Explorador.guardar(p); }
    return p;
  },

  activarNotis(p, valor) {
    p.notis = !!valor; Explorador.guardar(p); return p;
  },

  _avanzarMisiones(p, evento) {
    REGLAS.encomiendas.forEach(e => {
      if (!e.activa) return;
      const st = p.encomiendas[e.id];
      if (st.completada) return;
      let cuenta = false;
      if (e.id === 'primer-contacto' && evento.tipo === 'visita') cuenta = true;
      if (e.id === 'cazador-nocturno' && evento.tipo === 'visita' && e.dias && e.dias.includes(evento.dia)) cuenta = true;
      if (e.id === 'racha' && evento.tipo === 'visita') cuenta = true;
      if (cuenta) {
        st.avance = Math.min(e.meta, st.avance + 1);
        if (st.avance >= e.meta) { st.completada = true; p.gemas += (e.premio || 0); }
      }
    });
  },
};

/* ============================================================
   BACKEND · respaldo online (Google Apps Script + Sheets)
   ------------------------------------------------------------
   Pega la URL del Web App de Apps Script en ENDPOINT y todo el
   progreso queda guardado en la nube: el usuario no pierde nada
   aunque reinstale, y podrás ver los datos en tu Sheet / Ojo
   Maestro. Si ENDPOINT queda vacío, la app funciona 100% local
   (como hasta ahora), sin romperse.
   Código del servidor: /backend/Code.gs  ·  guía en LEEME.md
  ============================================================ */
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwK_fBVUVF-PpQTblUGQciOdCOFk1d0Cuc4YUo4UEtJZL16wAYdlnrj8DMWpI3JDYGv/exec'; // Apps Script Web App

const Sync = {
  activo() { return !!ENDPOINT; },
  _t: 0, _pend: null,

  /* Sube el perfil (con rebote para no saturar). Fire-and-forget. */
  subir(p) {
    if (!this.activo()) return;
    clearTimeout(this._pend);
    this._pend = setTimeout(() => {
      try {
        fetch(ENDPOINT, {
          method:'POST', keepalive:true,
          headers:{'Content-Type':'text/plain;charset=utf-8'}, // evita preflight CORS
          body: JSON.stringify({ accion:'guardar', perfil:p }),
        }).catch(()=>{});
      } catch(_) {}
    }, 1200);
  },

  /* Lee la configuración de contenido editada desde el panel de
     admin (hero, novedades, promos, misiones activas). */
  async config() {
    if (!this.activo()) return null;
    try {
      const r = await fetch(`${ENDPOINT}?accion=config`);
      const j = await r.json();
      return (j && j.ok) ? j.config : null;
    } catch (_) { return null; }
  },

  /* Baja el perfil del servidor al cargar. Devuelve el perfil
     remoto o null. */
  async bajar(id) {
    if (!this.activo() || !id) return null;
    try {
      const r = await fetch(`${ENDPOINT}?accion=cargar&id=${encodeURIComponent(id)}`);
      const j = await r.json();
      return (j && j.ok && j.perfil) ? j.perfil : null;
    } catch(_) { return null; }
  },

  /* Al arrancar: adopta lo más reciente entre lo local y la nube. */
  async reconciliar() {
    if (!this.activo()) return Explorador.actual();
    let local = Explorador.actual();
    const remoto = await this.bajar(local.id);
    if (remoto && (remoto.sync||0) > (local.sync||0)) {
      // el servidor tiene una versión más nueva (p.ej. otro dispositivo)
      local = Object.assign(Explorador.vacio(), remoto);
      try { localStorage.setItem(LLAVE, JSON.stringify(local)); } catch(_) {}
    } else {
      this.subir(local); // sube lo local por si el server está atrás
    }
    return local;
  },
};

/* Validación de folio contra Loyverse (fase 2, vía el mismo Apps Script) */
const BACKEND = {
  async validarFolio(folio, base) {
    if (!ENDPOINT) return { ok:true }; // demo: acepta local
    try {
      const r = await fetch(`${ENDPOINT}?accion=folio&folio=${encodeURIComponent(folio)}&base=${encodeURIComponent(base||'')}`);
      return await r.json();
    } catch (_) { return { ok:true }; } // si falla la red, no bloquea la experiencia
  },
};

window.Explorador = Explorador;
window.Estado = Estado;
window.Acciones = Acciones;
window.Sync = Sync;
window.BACKEND = BACKEND;
