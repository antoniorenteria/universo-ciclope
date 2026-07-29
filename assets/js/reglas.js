/* ============================================================
   LA BITÁCORA DE MIRANO · REGLAS DE LA EXPEDICIÓN
   ------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE SE TOCA PARA CAMBIAR EL PROGRAMA.
   Todo lo demás funciona solo.

   Las encomiendas son CONDUCTAS, no promociones: no caducan,
   no hay que actualizarlas cada mes.
   ============================================================ */

const REGLAS = {

  /* ---------- ECONOMÍA ----------------------------------------
     SELLOS  = visitas reales (folio de ticket). Suben de RANGO.
     PUNTOS  = se ganan jugando y visitando. Compran RECOMPENSAS.
     El premio mayor exige RANGO, no solo puntos: así los juegos
     nunca sustituyen a las visitas.
  ------------------------------------------------------------ */
  economia: {
    puntosPorVisita:      10,   // puntos que da sellar una visita
    puntosPorCadaCienPesos: 5,  // puntos extra por consumo
    topePuntosJuegoDia:   12,   // máximo de puntos/día desde los juegos
    consumoMinimo:        120,  // $ mínimos del ticket para sellar
  },

  /* ---------- RANGOS ------------------------------------------
     El rango se gana SOLO con sellos (visitas). No se compra.
  ------------------------------------------------------------ */
  rangos: [
    { id:'aprendiz',  nombre:'Aprendiz',            sellos:0,  ico:'🔦',
      lema:'Acabas de aterrizar. La expedición apenas comienza.' },
    { id:'explorador',nombre:'Explorador',          sellos:3,  ico:'🗺️',
      lema:'Ya conoces el terreno. Mirano empieza a reconocerte.' },
    { id:'cazador',   nombre:'Cazador',             sellos:8,  ico:'🏹',
      lema:'Pocos llegan aquí. La nave avanza gracias a ti.' },
    { id:'guardian',  nombre:'Guardián del Anillo', sellos:15, ico:'💍',
      lema:'Custodias el secreto de la Gema. Mirano confía en ti.' },
    { id:'mayor',     nombre:'Cíclope Mayor',       sellos:25, ico:'👁️',
      lema:'Leyenda viva. Tu nombre queda grabado en el Muro.' },
  ],

  /* ---------- ENCOMIENDAS (misiones permanentes) --------------
     activa:false  ->  la apaga sin borrar nada.
     auto:true     ->  la valida el sistema con el folio (Loyverse).
     Para el piloto arrancan 4. Las otras se encienden cambiando
     activa:false por activa:true. Nada más.
  ------------------------------------------------------------ */
  encomiendas: [
    { id:'primer-contacto', activa:true,  auto:true,  ico:'🔦',
      nombre:'Primer Contacto',
      desc:'Sella tu primera visita y abre tu bitácora.',
      meta:1, premio:15,
      mirano:'Un terrícola más en mi tripulación. Bienvenido.' },

    { id:'ojo-testigo', activa:true, auto:false, ico:'👁️',
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
      desc:'Sella una visita en Revolución y otra en Tulipanes.',
      meta:2, premio:35,
      mirano:'Dos bases, un mismo cielo. Recórrelas.' },

    { id:'convocatoria', activa:false, auto:false, ico:'📣',
      nombre:'Convocatoria',
      desc:'Trae 3 cíclopes nuevos con tu código de expedición.',
      meta:3, premio:60,
      mirano:'Ningún explorador llega lejos solo. Convoca a los tuyos.' },

    { id:'retador', activa:false, auto:false, ico:'🎮',
      nombre:'Retador de Mirano',
      desc:'Supera 8,000 puntos en La Gema Mágica.',
      meta:1, premio:25,
      enlace:'https://la-gema-magica.vercel.app/',
      mirano:'¿Crees que puedes con mis reflejos? Demuéstralo.' },
  ],

  /* ---------- RECOMPENSAS -------------------------------------
     Costos reales verificados en Loyverse (30 días, jul 2026).
     La escalera está calibrada para que ahorrar SÍ convenga:
     el valor por punto sube conforme sube el premio.
     rango:'cazador' -> exige rango, no solo puntos.
  ------------------------------------------------------------ */
  recompensas: [
    { id:'dip',    puntos:10, ico:'🥣', nombre:'Dip Extra 50g',
      desc:'La salsa que elijas para tus Cerebros.', costo:5.00 },

    { id:'pocion', puntos:40, ico:'🧪', nombre:'Poción Clásica 16oz',
      desc:'Baba de Ogro, Materia Gris, Sangre de Hada o Lodo del Pantano.',
      costo:null, pendiente:true },

    { id:'papas',  puntos:45, ico:'🍟', nombre:'Papas Muertas',
      desc:'250g a la francesa con catsup y queso.', costo:27.23 },

    { id:'crepi',  puntos:65, ico:'🧟', nombre:'Crepiburger Zombie',
      desc:'La creación de la casa, envuelta en piel de zombie.',
      costo:45.06, rango:'cazador' },
  ],

  /* ---------- SUCURSALES -------------------------------------- */
  sucursales: [
    { id:'revolucion', nombre:'Revolución', zona:'Pachuca de Soto' },
    { id:'tulipanes',  nombre:'Tulipanes',  zona:'Mineral de la Reforma' },
  ],

  /* ---------- NAVE --------------------------------------------
     Los sellos reparan la nave de Mirano: es la misma barra
     que ya vive en el sitio. 60 sellos = despegue.
  ------------------------------------------------------------ */
  nave: { base:38, sellosParaDespegue:60 },

  /* ---------- VOZ DE MIRANO ----------------------------------- */
  voz: {
    selloOk: [
      'Otro tornillo para la nave. Gracias, terrícola.',
      'Registrado en la bitácora. La Gema está más cerca.',
      'Mi ojo lo vio todo. Sello acreditado.',
      'Un paso más lejos de este planeta azul.',
    ],
    rangoNuevo: '¡Subiste de rango! El universo lo notó.',
    canjeOk:    'Trato hecho. Muestra este código antes de que se apague.',
  },
};

/* Utilidades derivadas de las reglas (no editar) */
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
