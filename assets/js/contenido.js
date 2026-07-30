/* ============================================================
   UNIVERSO CÍCLOPE · CONTENIDO EDITABLE
   ------------------------------------------------------------
   EL PANEL DE CONTROL DE TOÑO. Todo lo editorial vive aquí.
   · Apagar algo:  activo: true  ->  activo: false
   · Publicar novedad: copia una tarjeta y cámbiala.
   Las MISIONES y la economía viven en reglas.js.
   ============================================================ */

const CONTENIDO = {

  /* ---------- HERO PRINCIPAL ----------------------------------
     La única gran noticia. accion: 'expedicion'|'juegos'|'archivo'
     |'recompensas' o {url:'https://...'}. bg = imagen de fondo.
  ------------------------------------------------------------ */
  hero: {
    activo: true,
    etiqueta: 'NUEVA TEMPORADA',
    titulo: 'El Ojo de Vorak despertó',
    texto: 'Una reliquia se perdió entre las bases. Mirano necesita exploradores. La expedición está abierta.',
    cta: 'Unirme a la expedición',
    accion: 'expedicion',
    bg: 'assets/img/lore/magmafera.jpg',
  },

  /* ---------- NOVEDADES · CARRUSEL DE IMÁGENES ----------------
     Cada tarjeta es una imagen (banner de marca). accion define
     a dónde lleva al tocarla.
  ------------------------------------------------------------ */
  novedades: [
    { img:'assets/img/nov/hechicera.jpg', tag:'PERSONAJE', titulo:'Anodina, la princesa guerrera', accion:'archivo' },
    { img:'assets/img/nov/malteadas.jpg', tag:'MENÚ',      titulo:'Malteadas del Universo',        accion:'recompensas' },
    { img:'assets/img/nov/cerebros.jpg',  tag:'MENÚ',      titulo:'Cerebros: el clásico',          accion:'recompensas' },
    { img:'assets/img/nov/planeta.jpg',   tag:'ARCHIVO',   titulo:'Explora los planetas',          accion:'archivo' },
    { img:'assets/img/nov/kori.jpg',      tag:'UNIVERSO',  titulo:'Nuevas criaturas',              accion:'archivo' },
    { img:'assets/img/nov/dedos.jpg',     tag:'MENÚ',      titulo:'Dedos de la casa',              accion:'recompensas' },
  ],

  /* ---------- PROMOCIONES (descubrimientos, no descuentos) ---- */
  promos: [
    { activo:true, ico:'🌙', titulo:'Noches de expedición',
      texto:'Martes a jueves cada visita cuenta doble en tu bitácora.' },
    { activo:true, ico:'⭐', titulo:'El Ojo Testigo',
      texto:'Deja tu testimonio en el mapa estelar y gana 30 gemas.' },
  ],

  /* ---------- ARCHIVO CÍCLOPE (la wiki desbloqueable) ---------
     La enciclopedia oficial del universo. NUNCA se muestra todo:
     el explorador descubre. Cada elemento es una ficha aparte.
       desbloqueo: 'siempre' | {sellos:N} | {mision:'id'}
     Lo bloqueado se ve en silueta con candado. Eso engancha.
     Basado en la narrativa canónica de El Anillo del Cíclope.
  ------------------------------------------------------------ */
  archivo: [
    /* ---- PERSONAJES ---- */
    { cat:'Personajes', ico:'👁️', titulo:'Mirano', img:'assets/img/mirano-cartoon.jpg',
      desbloqueo:'siempre', rareza:'Único',
      texto:'Cíclope de Cyclos, criado entre cocineros e inventores. Heredó de su abuelo la inquietud por lo que hay más allá. Su nave se averió sobre la Tierra y, para repararla, abrió El Anillo del Cíclope: cocina platillos galácticos mientras reúne lo necesario para retomar la búsqueda de la Gema —y de su abuelo perdido.' },

    { cat:'Personajes', ico:'📓', titulo:'El Abuelo de Mirano', img:'assets/img/lore/origen.jpg',
      desbloqueo:{sellos:3}, rareza:'Legendario',
      texto:'Inventor excéntrico que dedicó su vida a buscar la Gema Mágica. No la quería como arma, sino para comprender el universo. Las Casas lo llamaron obsesivo y le cerraron la puerta. Partió solo tras un rastro… y no regresó. Dejó una libreta con la clave de todo.' },

    { cat:'Personajes', ico:'⚔️', titulo:'Anodina', img:'assets/img/nov/hechicera.jpg',
      desbloqueo:{sellos:8}, rareza:'Épico',
      texto:'Princesa guerrera de la Casa Púrpura, enviada a vigilar y, si era necesario, eliminar a Mirano. Cuando una cueva cedió sobre ambos, él eligió salvarla en vez de salvarse. Ese acto lo cambió todo: para su Casa fue un fracaso; para Anodina, el inicio de una alianza inesperada.' },

    /* ---- PLANETAS ---- */
    { cat:'Planetas', ico:'🪐', titulo:'Cyclos', img:'assets/img/lore/cyclos.jpg',
      desbloqueo:'siempre', rareza:'Común',
      texto:'El planeta Cíclope, del sistema Zeta: siete mundos y una estrella roja. La leyenda dice que nació del choque de dos planetas antiguos, quedando rodeado por un anillo de asteroides. Nada en Cyclos es equilibrio: todo es fuerzas opuestas que aprendieron a coexistir.' },

    { cat:'Planetas', ico:'🌍', titulo:'La Tierra', img:null,
      desbloqueo:'siempre', rareza:'Común',
      texto:'El planeta azul donde cayó Mirano. Aquí descubrió que la comida es un lenguaje universal: una forma de compartir sin imponer. Así nació El Anillo del Cíclope, un punto neutral donde escucha historias mientras repara su nave.' },

    { cat:'Planetas', ico:'🌋', titulo:'Magmafera', img:'assets/img/lore/magmafera.jpg',
      desbloqueo:{sellos:3}, rareza:'Raro',
      texto:'Mundo incandescente de volcanes eternos, ríos de lava y minerales tan antiguos como el universo. Guarda la Gema Pyroxa, que sostiene el equilibrio del planeta. Aquí Mirano conoció a los Volcaninos… y nació el Hotdog Volcanino.' },

    { cat:'Planetas', ico:'🏜️', titulo:'Arenopsis y Krómida', img:null,
      desbloqueo:{sellos:8}, rareza:'Raro',
      texto:'Un mundo de arenas doradas y cielos rojizos. En él se alza Krómida, una ciudadela de chatarra brillante y engañosa. Todo reluce en la superficie, pero debajo aguarda la traición de sus habitantes, los Kromidos.' },

    /* ---- LAS TRES CASAS ---- */
    { cat:'Las Tres Casas', ico:'🟡', titulo:'Casa Amarilla', img:null,
      desbloqueo:'siempre', rareza:'Común',
      texto:'Gobierna desde el conocimiento: archiva, estudia, preserva. Cree que todo fenómeno puede comprenderse con tiempo. Su virtud es la curiosidad; su defecto, el miedo a perder el control de lo que descubre.' },

    { cat:'Las Tres Casas', ico:'🟣', titulo:'Casa Púrpura', img:null,
      desbloqueo:{sellos:3}, rareza:'Raro',
      texto:'Entiende el universo como piezas que deben encajar bajo una sola voluntad. Su ambición no es caótica: es metódica, calculada y profundamente peligrosa. Vigila a Mirano porque un explorador sin lealtades es impredecible.' },

    { cat:'Las Tres Casas', ico:'🟢', titulo:'Casa Verde', img:null,
      desbloqueo:{sellos:8}, rareza:'Raro',
      texto:'Sobrevive adaptándose: negocia, traiciona, se alía. Para ellos el poder no se posee, se aprovecha mientras dura. Se alinean siempre con el mejor postor.' },

    /* ---- CRIATURAS ---- */
    { cat:'Criaturas', ico:'🐺', titulo:'Volcaninos', img:'assets/img/lore/volcaninos.jpg',
      desbloqueo:{sellos:3}, rareza:'Raro',
      texto:'Criaturas caninas de piel rocosa y picos incandescentes, guardianas de Magmafera. Su líder, Pyrocan, protege las riquezas del planeta. Al principio vio a Mirano como intruso; luego reconoció su nobleza y lucharon juntos contra Lord Ferrix.' },

    { cat:'Criaturas', ico:'💀', titulo:'Los Osseris', img:null,
      desbloqueo:{sellos:8}, rareza:'Raro',
      texto:'Seres pacíficos y sabios hechos de hueso y arena compactada, habitantes de las cuevas bajo Krómida. Enseñaron a Mirano a escuchar la cueva y a aprovechar los restos de los Mazaurios para sobrevivir.' },

    { cat:'Criaturas', ico:'🦕', titulo:'Los Mazaurios', img:null,
      desbloqueo:{sellos:15}, rareza:'Épico',
      texto:'Criaturas colosales, extintas hace siglos, cuyos huesos fosilizados llenan las cuevas de Krómida. Ricos en nutrientes por su dieta de árboles mazapánicos, sus restos molidos dan el "Polvo de la Eternidad": dulce, nutritivo, legendario.' },

    { cat:'Criaturas', ico:'🪲', titulo:'Los Kromidos', img:null,
      desbloqueo:{sellos:8}, rareza:'Común',
      texto:'Insectos bípedos, astutos y sin escrúpulos. Reciben a los viajeros con hospitalidad exagerada y los guían directo a las arenas movedizas para saquear sus naves. Nadie escapa de Krómida ileso.' },

    /* ---- RELIQUIAS ---- */
    { cat:'Reliquias', ico:'💎', titulo:'La Gema Mágica', img:'assets/img/lore/origen.jpg',
      desbloqueo:{sellos:15}, rareza:'Mítico',
      texto:'No es un arma: es un vestigio. Una manifestación de energía antigua, libre, anterior a los sistemas y a las Casas. Encontrarla no significa dominar el universo, sino comprenderlo. Mirano cree que su abuelo ya la halló… pero no pudo volver.' },

    { cat:'Reliquias', ico:'📓', titulo:'La Libreta del Abuelo', img:null,
      desbloqueo:{sellos:3}, rareza:'Legendario',
      texto:'Aparentaba ser un cuaderno de notas más. Tras años de estudiarla, Mirano entendió que escondía la ubicación de la Gema. No eran los errores de alguien que fracasó, sino las pausas de alguien que avanzó demasiado.' },

    { cat:'Reliquias', ico:'🔥', titulo:'Gema Pyroxa', img:null,
      desbloqueo:{sellos:8}, rareza:'Épico',
      texto:'Piedra legendaria que contiene el poder del núcleo de Magmafera. No puede retirarse de su tierra: su energía mantiene el equilibrio del planeta. Mirano no se la llevó; se llevó una lección sobre dónde está la verdadera riqueza.' },

    /* ---- RECETAS (nacidas de la aventura) ---- */
    { cat:'Recetas', ico:'🌭', titulo:'Hotdog Volcanino', img:'assets/img/lore/crepi.jpg',
      desbloqueo:{sellos:3}, rareza:'Raro',
      texto:'Oscuro y poderoso, inspirado en los Volcaninos que protegen las entrañas de Magmafera. Un recordatorio: la verdadera riqueza no está en las gemas, sino en el espíritu de quienes luchan por su hogar.' },

    { cat:'Recetas', ico:'🥤', titulo:'Malteada de Mazapán', img:'assets/img/lore/pociones.jpg',
      desbloqueo:{sellos:8}, rareza:'Épico',
      texto:'El "Polvo de la Eternidad" de los Mazaurios, convertido en bebida. Lleva el legado de los Mazapántirox a todo el Universo: incluso en los lugares más oscuros, hay dulzura por descubrir.' },
  ],

  /* ---------- JUEGOS ------------------------------------------
     Motor modular: cada juego es un archivo suelto en /juegos.
     Para agregar uno: sube su .html y añade una tarjeta.
     activo:false lo oculta.
  ------------------------------------------------------------ */
  juegos: [
    { id:'gema', activo:true, ico:'💎',
      nombre:'La Gema Mágica',
      desc:'Arcade de reflejos. Reúne las gemas antes de que se apaguen.',
      etiqueta:'ARCADE',
      archivo:'juegos/gema-magica.html' },

    { id:'ojo', activo:true, ico:'👁️',
      nombre:'El Ojo del Cíclope',
      desc:'Objetos ocultos en tres mundos. Encuentra lo que nadie más ve.',
      etiqueta:'BÚSQUEDA',
      archivo:'juegos/ojo-ciclope.html' },
  ],

  /* ---------- NOTIFICACIONES (OneSignal) ----------------------
     Para mandar avisos al celular (productos, expediciones,
     alertas). Crea tu cuenta gratis en onesignal.com, agrega
     un "Web Push" con el sitio, y pega aquí tu App ID. Mientras
     esté vacío, el botón de activar queda oculto.
  ------------------------------------------------------------ */
  notificaciones: {
    onesignalAppId: '',   // <-- pega aquí tu App ID de OneSignal
  },

  /* ---------- COMPARTE TU EXPERIENCIA ------------------------- */
  compartir: {
    pregunta: '¿Cómo estuvo tu expedición?',
    enlaceGoogle: 'https://g.page/r/CQ/review',
    instagram: 'https://instagram.com/elanillodelciclope',
    tiktok: 'https://tiktok.com/@elanillodelciclope',
  },

  /* ---------- CONTACTO / WHATSAPP ----------------------------- */
  whatsapp: {
    numero: '525555555555', // <-- pon aquí el número real con lada país
    mensaje: 'Hola Mirano, quiero unirme al Universo Cíclope 🔭',
  },

  /* ---------- BASES ------------------------------------------- */
  bases: [
    { nombre:'Revolución', zona:'Pachuca de Soto',
      maps:'https://maps.google.com/?q=El+Anillo+del+Ciclope+Revolucion' },
    { nombre:'Tulipanes', zona:'Mineral de la Reforma',
      maps:'https://maps.google.com/?q=El+Anillo+del+Ciclope+Tulipanes' },
  ],
};

window.CONTENIDO = CONTENIDO;
