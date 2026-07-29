/* ============================================================
   UNIVERSO CÍCLOPE · CONTENIDO EDITABLE
   ------------------------------------------------------------
   ESTE ES EL PANEL DE CONTROL DE TOÑO.
   Todo lo que cambia día a día (el Hero, las novedades, el lore,
   las promos, los enlaces) vive AQUÍ y solo aquí.

   Reglas de oro:
   · Para APAGAR algo:  activo: true  ->  activo: false
   · Para publicar una novedad nueva: copia una tarjeta y cámbiala.
   · Nunca hace falta tocar el código de la app. Nada caduca solo.

   Las MISIONES de la Expedición viven en reglas.js (encomiendas).
   Aquí solo va lo editorial: qué se anuncia y qué se descubre.
   ============================================================ */

const CONTENIDO = {

  /* ---------- HERO PRINCIPAL ----------------------------------
     La única gran noticia del momento. Ocupa el 40% superior.
     Cambia el hero cuando haya algo GRANDE: nueva hamburguesa,
     nueva temporada, nuevo planeta, evento.
     accion: 'expedicion' | 'juegos' | 'archivo' | 'recompensas'
             | {url:'https://...'}  (abre enlace externo)
  ------------------------------------------------------------ */
  hero: {
    activo: true,
    etiqueta: 'NUEVA TEMPORADA',
    titulo: 'El Ojo de Vorak despertó',
    texto: 'Una reliquia se perdió entre las dos bases. Mirano necesita exploradores. La expedición está abierta.',
    cta: 'Unirme a la expedición',
    accion: 'expedicion',
    img: 'assets/img/mirano-full.png',
  },

  /* ---------- NOVEDADES (scroll horizontal) -------------------
     Tarjetas cortas. Lo nuevo de la semana. Mostrar, no explicar.
     ico: cualquier emoji.  tag: la categoría chica de arriba.
  ------------------------------------------------------------ */
  novedades: [
    { ico:'🎮', tag:'JUEGO', titulo:'La Gema Mágica',
      texto:'El clásico arcade del Anillo, ahora dentro del universo.',
      accion:'juegos' },
    { ico:'👁️', tag:'JUEGO', titulo:'El Ojo del Cíclope',
      texto:'Encuentra lo oculto en tres mundos. ¿Tienes buen ojo?',
      accion:'juegos' },
    { ico:'🍔', tag:'MENÚ', titulo:'Crepiburger Zombie',
      texto:'La creación de la casa, envuelta en piel de zombie.',
      accion:'recompensas' },
    { ico:'🧪', tag:'ARCHIVO', titulo:'Las Pociones de Mirano',
      texto:'Cuatro brebajes, cuatro planetas. Descubre su origen.',
      accion:'archivo' },
  ],

  /* ---------- PROMOCIONES (descubrimientos, no descuentos) ----
     Nunca "20% de descuento". Siempre "algo se desbloqueó".
  ------------------------------------------------------------ */
  promos: [
    { activo:true, ico:'🌙', titulo:'Noches de expedición',
      texto:'Martes a jueves cada visita cuenta doble en tu bitácora.' },
    { activo:true, ico:'⭐', titulo:'El Ojo Testigo',
      texto:'Deja tu testimonio en el mapa estelar y gana 30 puntos.' },
  ],

  /* ---------- ARCHIVO CÍCLOPE (la wiki desbloqueable) ---------
     La enciclopedia del universo. NUNCA se muestra todo:
     el explorador descubre.
       desbloqueo: 'siempre'         -> visible desde el inicio
                   {sellos: 3}       -> se abre al llegar a N sellos
                   {mision:'racha'}  -> se abre al cumplir esa misión
     Lo bloqueado se ve en silueta con un candado. Eso engancha.
  ------------------------------------------------------------ */
  archivo: [
    { cat:'Personajes', ico:'👁️', titulo:'Mirano',
      desbloqueo:'siempre', rareza:'Único',
      texto:'El último cíclope de su estirpe. Su nave se averió sobre la Tierra y desde entonces recluta terrícolas para juntar los tornillos que lo lleven de vuelta a casa. Cocina para no olvidar su planeta.' },

    { cat:'Planetas', ico:'🪐', titulo:'Vorak',
      desbloqueo:'siempre', rareza:'Común',
      texto:'El planeta natal de Mirano. Un mundo de anillos donde la comida y la memoria son la misma cosa. Perdió su Gema y con ella, su luz.' },

    { cat:'Objetos', ico:'💍', titulo:'El Anillo del Cíclope',
      desbloqueo:{sellos:3}, rareza:'Legendario',
      texto:'La reliquia que da nombre a todo. Quien reúne los tornillos suficientes puede mirar a través de él y ver el camino a Vorak.' },

    { cat:'Criaturas', ico:'🧟', titulo:'Los Zombies del Pantano',
      desbloqueo:{sellos:8}, rareza:'Raro',
      texto:'Antiguos exploradores que se quedaron demasiado tiempo. Hoy solo saben una receta, y es deliciosa.' },

    { cat:'Pociones', ico:'🧪', titulo:'Baba de Ogro',
      desbloqueo:{mision:'catador'}, rareza:'Raro',
      texto:'Verde, brillante y sorprendentemente dulce. Dicen que un sorbo te deja ver en la oscuridad.' },

    { cat:'Reliquias', ico:'✨', titulo:'La Gema Perdida',
      desbloqueo:{sellos:15}, rareza:'Mítico',
      texto:'El corazón de Vorak. Nadie la ha visto en mil años. Mirano cree que sigue en la Tierra, escondida a plena vista.' },
  ],

  /* ---------- JUEGOS ------------------------------------------
     Motor modular: cada juego es un archivo suelto en /juegos.
     Para agregar uno nuevo: sube su .html y añade una tarjeta.
     'archivo' es la ruta al html.  activo:false lo oculta.
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

  /* ---------- COMPARTE TU EXPERIENCIA -------------------------
     Primero preguntamos. Solo las buenas van a Google.
  ------------------------------------------------------------ */
  compartir: {
    pregunta: '¿Cómo estuvo tu expedición?',
    // El enlace directo a dejar reseña en Google (ya tienes el QR).
    enlaceGoogle: 'https://g.page/r/CQ/review',
    instagram: 'https://instagram.com/elanillodelciclope',
    tiktok: 'https://tiktok.com/@elanillodelciclope',
  },

  /* ---------- CONTACTO / WHATSAPP -----------------------------
     El número al que la gente escribe. La IA de tu teléfono
     responde con el link de esta app.
  ------------------------------------------------------------ */
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
