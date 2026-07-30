/* ============================================================
   UNIVERSO CÍCLOPE · REGLAS DEL JUEGO
   ------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO (junto con contenido.js) QUE SE TOCA
   PARA CAMBIAR EL PROGRAMA. Todo lo demás funciona solo.

   MODELO CLARO (así el explorador entiende qué hace y por qué):
   · VISITAS  -> se registran con el folio del ticket. Dan SELLOS.
   · SELLOS   -> suben tu RANGO de explorador y REPARAN la nave.
   · GEMAS    -> se ganan jugando y visitando. Compran RECOMPENSAS.
   · RANGO    -> solo se sube visitando. Desbloquea premios y lore.
   ============================================================ */

const REGLAS = {

  /* ---------- ECONOMÍA ----------------------------------------
     Regla clave: los JUEGOS casi no dan gemas (para que no se
     farmee). Solo dan un premio la PRIMERA vez que descubres el
     juego, y por LOGROS de puntaje (metas), con tope diario que
     se reinicia cada día. Las gemas de verdad vienen de VISITAR.
  ------------------------------------------------------------ */
  economia: {
    gemasPorVisita:        10,  // gemas por registrar una visita
    gemasPorCadaCienPesos:  5,  // gemas extra por consumo
    gemasPrimerJuego:       3,  // bonus UNA sola vez al abrir cada juego
    topeGemasJuegoDia:      6,  // máx gemas/día por CADA juego (logros); se reinicia diario
    consumoMinimo:        120,  // $ mínimos del ticket para sellar
  },

  /* Logros por puntaje dentro de cada juego. Cuando el juego
     reporte tu score, cruzar estos umbrales da gemas (una vez
     cada uno). Requiere que el juego mande su puntaje (fase 2). */
  logrosJuego: {
    gema: [ {score:2000, gemas:2}, {score:5000, gemas:3}, {score:10000, gemas:5} ],
    ojo:  [ {score:1,    gemas:2}, {score:2,    gemas:3}, {score:3,     gemas:5} ], // por niveles resueltos
  },

  /* ---------- RANGOS DE EXPLORADOR (5 niveles) ----------------
     Del 1 (explorador convencional) al 5 (embajador de marca).
     Se suben SOLO con sellos (visitas). Esta métrica se guarda
     limpia para que el panel del Ojo Maestro / Mentor la lea
     después (id, nivel, sellos). No cambies los ids: el backend
     se vinculará por ellos.
  ------------------------------------------------------------ */
  rangos: [
    { id:'explorador', nivel:1, nombre:'Explorador',            sellos:0,  ico:'🔭',
      lema:'Acabas de aterrizar en el Universo Cíclope.' },
    { id:'rastreador', nivel:2, nombre:'Rastreador',            sellos:3,  ico:'🧭',
      lema:'Sigues el rastro de Mirano por el cosmos.' },
    { id:'cazador',    nivel:3, nombre:'Cazador de Reliquias',  sellos:8,  ico:'🏹',
      lema:'Buscas lo que nadie más se atreve a ver.' },
    { id:'guardian',   nivel:4, nombre:'Guardián del Anillo',   sellos:15, ico:'💍',
      lema:'Custodias el secreto de la Gema. Mirano confía en ti.' },
    { id:'embajador',  nivel:5, nombre:'Embajador del Universo',sellos:25, ico:'👁️',
      lema:'Eres la voz del Anillo. Tu nombre queda en la leyenda.' },
  ],

  /* ---------- LA NAVE DE MIRANO -------------------------------
     La nave de Mirano se averió al caer en la Tierra. Cada
     visita repara una pieza. Empieza en 0 y llega a 100% con
     'sellosParaDespegue' visitas. Es una barra CLARA de progreso.
  ------------------------------------------------------------ */
  nave: { sellosParaDespegue: 30 },

  /* ---------- MISIONES (permanentes) --------------------------
     Antes "encomiendas". La clave interna se queda igual para no
     romper datos guardados, pero en pantalla se llaman MISIONES.
     activa:false la apaga.  auto:true la valida el sistema.
  ------------------------------------------------------------ */
  encomiendas: [
    { id:'primer-contacto', activa:true,  auto:true,  ico:'🛸',
      nombre:'Primer Contacto',
      desc:'Registra tu primera visita y abre tu bitácora.',
      meta:1, premio:15,
      mirano:'Un terrícola más en mi tripulación. Bienvenido.' },

    { id:'ojo-testigo', activa:true, auto:false, ico:'⭐',
      nombre:'El Ojo Testigo',
      desc:'Deja tu reseña en Google. El ojo que todo lo ve, ahora te ve a ti.',
      meta:1, premio:30, unaVez:true,
      enlace:'https://g.page/r/CQ/review',
      mirano:'Cuenta lo que viste aquí. Que el universo se entere.' },

    { id:'cazador-nocturno', activa:true, auto:true, ico:'🌙',
      nombre:'Cazador Nocturno',
      desc:'Visítanos martes, miércoles o jueves. Cada visita cuenta doble.',
      meta:3, premio:40, dobleSello:true, dias:[2,3,4],
      mirano:'Entre semana la nave está sola. Ven, te lo pago doble.' },

    { id:'racha', activa:true, auto:true, ico:'🔥',
      nombre:'Racha del Anillo',
      desc:'Tres visitas en 30 días sin romper la cadena.',
      meta:3, premio:35, ventanaDias:30,
      mirano:'La constancia repara motores. Sigue así.' },

    /* --- Fase 2: se encienden cambiando activa a true --- */
    { id:'catador', activa:false, auto:true, ico:'🧪',
      nombre:'Catador de Pociones',
      desc:'Prueba 4 brebajes distintos del universo.',
      meta:4, premio:45,
      mirano:'Cada poción guarda un recuerdo de otro planeta.' },

    { id:'peregrino', activa:false, auto:true, ico:'🗺️',
      nombre:'Peregrino',
      desc:'Registra una visita en Revolución y otra en Tulipanes.',
      meta:2, premio:35,
      mirano:'Dos bases, un mismo cielo. Recórrelas.' },
  ],

  /* ---------- RECOMPENSAS (se pagan con GEMAS) ---------------- */
  recompensas: [
    { id:'dip',    gemas:10, ico:'🥣', nombre:'Dip Extra 50g',
      desc:'La salsa que elijas para tus Cerebros.', costo:5.00 },

    { id:'pocion', gemas:40, ico:'🧪', nombre:'Poción Clásica 16oz',
      desc:'Baba de Ogro, Materia Gris, Sangre de Hada o Lodo del Pantano.',
      costo:null, pendiente:true },

    { id:'papas',  gemas:45, ico:'🍟', nombre:'Papas Muertas',
      desc:'250g a la francesa con catsup y queso.', costo:27.23 },

    { id:'crepi',  gemas:65, ico:'🧟', nombre:'Crepiburger Zombie',
      desc:'La creación de la casa, envuelta en piel de zombie.',
      costo:45.06, rango:'cazador' },
  ],

  /* ---------- SUCURSALES / BASES ------------------------------ */
  sucursales: [
    { id:'revolucion', nombre:'Revolución', zona:'Pachuca de Soto' },
    { id:'tulipanes',  nombre:'Tulipanes',  zona:'Mineral de la Reforma' },
  ],

  /* ---------- VOZ DE MIRANO ----------------------------------- */
  voz: {
    selloOk: [
      'Otra pieza para la nave. Gracias, terrícola.',
      'Registrado en tu bitácora. La Gema está más cerca.',
      'Mi ojo lo vio todo. Visita acreditada.',
      'Un paso más lejos de este planeta azul.',
    ],
    rangoNuevo: '¡Subiste de rango! El universo lo notó.',
    canjeOk:    'Trato hecho. Muestra este código antes de que se apague.',
  },
};

/* ---------- Utilidades derivadas (no editar) ---------------- */
REGLAS.rangoPorSellos = function (sellos) {
  let r = this.rangos[0];
  for (const x of this.rangos) if (sellos >= x.sellos) r = x;
  return r;
};
REGLAS.siguienteRango = function (sellos) {
  return this.rangos.find(x => sellos < x.sellos) || null;
};
REGLAS.encomiendasActivas = function () {
  return this.encomiendas.filter(e => e.activa);
};
REGLAS.indiceRango = function (id) {
  return this.rangos.findIndex(r => r.id === id);
};

window.REGLAS = REGLAS;
