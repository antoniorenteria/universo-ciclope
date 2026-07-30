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
    try { localStorage.setItem(LLAVE, JSON.stringify(p)); } catch (_) {}
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

  /* Gemas por jugar, con tope diario para que los juegos no
     sustituyan a las visitas. */
  sumarGemasJuego(p, juegoId, gemas, mejor) {
    const tope = REGLAS.economia.topeGemasJuegoDia;
    const g = p.juegos[juegoId] || { partidas:0, mejor:0 };
    g.partidas += 1;
    if (mejor != null && mejor > g.mejor) g.mejor = mejor;
    p.juegos[juegoId] = g;
    p.gemas += Math.min(tope, Math.max(0, gemas | 0));
    Explorador.guardar(p);
    return p;
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
   BACKEND  ·  lo único que cambia al conectar Loyverse
   ------------------------------------------------------------
   Hoy: simulado:true -> todo local, para probar la experiencia.
   Mañana: simulado:false + endpoint de Apps Script que valida el
   folio contra la API de Loyverse (existe, es de hoy/ayer, monto
   >= consumo mínimo, y NADIE lo reclamó antes). Ese mismo endpoint
   podrá empujar los datos al Ojo Maestro para el panel admin.
  ============================================================ */
const BACKEND = {
  simulado: true,
  endpoint: '', // p.ej. 'https://script.google.com/macros/s/AKfy.../exec'
  async validarFolio(folio, base) {
    if (this.simulado) return { ok:true };
    try {
      const r = await fetch(`${this.endpoint}?accion=folio&folio=${encodeURIComponent(folio)}&base=${encodeURIComponent(base||'')}`);
      return await r.json();
    } catch (_) { return { ok:false, msg:'No pude verificar el folio. Intenta de nuevo.' }; }
  },
};

window.Explorador = Explorador;
window.Estado = Estado;
window.Acciones = Acciones;
window.BACKEND = BACKEND;
