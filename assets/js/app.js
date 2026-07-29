/* ============================================================
   UNIVERSO CÍCLOPE · MOTOR DE LA APP
   Router SPA + render de secciones. Sin frameworks, sin build.
   Depende de: reglas.js, contenido.js, estado.js
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const esc = (t='') => String(t).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  let P = Explorador.actual();
  const app = $('#app');

  /* ---------------- ESTRELLAS DE FONDO ---------------- */
  (function estrellas() {
    const c = $('#stars'); if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, pts = [];
    function medir() {
      w = c.width = innerWidth; h = c.height = innerHeight;
      pts = Array.from({length: Math.min(90, (w*h)/16000)}, () => ({
        x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.3+0.3, a: Math.random()*0.6+0.2, d: Math.random()*0.02+0.004
      }));
    }
    function dibuja() {
      ctx.clearRect(0,0,w,h);
      for (const p of pts) {
        p.a += p.d; if (p.a>0.85||p.a<0.15) p.d*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
        ctx.fillStyle = `rgba(255,214,0,${p.a})`; ctx.fill();
      }
      requestAnimationFrame(dibuja);
    }
    medir(); dibuja(); addEventListener('resize', medir);
  })();

  /* ---------------- GATE ---------------- */
  const gate = $('#gate');
  function abrirGate() {
    gate.classList.add('oculto');
    document.body.classList.remove('bloqueado');
    setTimeout(() => { gate.style.display='none'; }, 650);
  }
  if (gate) {
    document.body.classList.add('bloqueado');
    gate.addEventListener('click', abrirGate);
    gate.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); abrirGate(); } });
  }

  /* ---------------- TOAST ---------------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('ver');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('ver'), 2600);
  }

  /* ---------------- ROUTER ---------------- */
  const rutas = ['inicio','expedicion','juegos','archivo','perfil'];
  function ir(ruta) {
    if (!rutas.includes(ruta)) ruta = 'inicio';
    $$('.vista').forEach(v => v.classList.toggle('activa', v.id === 'v-'+ruta));
    $$('.tab').forEach(t => t.classList.toggle('activo', t.dataset.ruta === ruta));
    render(ruta);
    Acciones.marcarVisto(P, ruta);
    scrollTo({top:0, behavior:'instant'});
    location.hash = ruta;
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => ir(t.dataset.ruta)));

  /* ---------------- RENDER por sección ---------------- */
  function render(ruta) {
    P = Explorador.actual();
    $('#hdr-pts').textContent = P.puntos;
    if (ruta === 'inicio')     renderInicio();
    if (ruta === 'expedicion') renderExpedicion();
    if (ruta === 'juegos')     renderJuegos();
    if (ruta === 'archivo')    renderArchivo();
    if (ruta === 'perfil')     renderPerfil();
  }

  /* ===== INICIO ===== */
  function renderInicio() {
    const C = CONTENIDO;
    const rango = Estado.rango(P), sig = Estado.siguiente(P), pct = Estado.nave(P);
    let html = '';

    // HERO
    if (C.hero && C.hero.activo) {
      const h = C.hero;
      html += `<div class="hero">
        <div class="hero__glow"></div>
        ${h.img ? `<img class="hero__img" src="${esc(h.img)}" alt="" aria-hidden="true">` : ''}
        <div class="hero__body">
          ${h.etiqueta ? `<span class="hero__tag">${esc(h.etiqueta)}</span>` : ''}
          <h1 class="hero__title">${esc(h.titulo)}</h1>
          <p class="hero__text">${esc(h.texto)}</p>
          <button class="btn btn--solid" data-accion='${JSON.stringify(h.accion)}'>${esc(h.cta||'Explorar')}</button>
        </div>
      </div>`;
    }

    // NOVEDADES
    if (C.novedades && C.novedades.length) {
      html += `<div class="h-sec pad"><h2>Novedades</h2><span>Lo nuevo</span></div>`;
      html += `<div class="rail">` + C.novedades.map(n => `
        <div class="card nov" data-accion='${JSON.stringify(n.accion)}'>
          <div class="nov__ico">${esc(n.ico)}</div>
          <div class="nov__tag">${esc(n.tag||'')}</div>
          <div class="nov__title">${esc(n.titulo)}</div>
          <div class="nov__text">${esc(n.texto)}</div>
        </div>`).join('') + `</div>`;
    }

    // CONTINUAR EXPLORANDO (si ya tocó algún juego)
    const jugado = Object.keys(P.juegos || {});
    if (jugado.length) {
      const jid = jugado[jugado.length-1];
      const j = C.juegos.find(x => x.id === jid);
      if (j) html += `
      <div class="h-sec pad"><h2>Continuar</h2><span>Donde quedaste</span></div>
      <div class="pad"><div class="card tile tile--wide tile--hot" data-juego="${esc(j.id)}">
        <span class="tile__ico">${esc(j.ico)}</span>
        <div style="flex:1"><div class="tile__t">${esc(j.nombre)}</div>
          <div class="tile__d">Mejor: ${(P.juegos[jid]&&P.juegos[jid].mejor)||0} · ${(P.juegos[jid]&&P.juegos[jid].partidas)||0} partidas</div></div>
        <span class="btn btn--sm btn--ghost">Seguir</span>
      </div></div>`;
    }

    // NAVE (progreso del explorador)
    html += `<div class="pad"><div class="card card--purple nave" data-ir="perfil">
      <div class="nave__top">
        <div class="nave__rango"><span class="nave__ico">${esc(rango.ico)}</span>
          <b>${esc(rango.nombre)}</b></div>
        <span class="nave__pct">${pct}%</span>
      </div>
      <div class="bar"><div class="bar__fill" style="width:${pct}%"></div></div>
      <p class="nave__hint">${sig
        ? `Repara la nave de Mirano. ${sig.sellos - P.sellos} sello(s) para ${esc(sig.nombre)}.`
        : 'La nave está lista para despegar. Eres leyenda.'}</p>
    </div></div>`;

    // ACCESOS grandes
    html += `<div class="h-sec pad"><h2>Tu universo</h2></div>`;
    html += `<div class="pad tiles">
      <div class="card tile tile--wide tile--hot" data-ir="expedicion">
        <span class="tile__ico">🧭</span>
        <div style="flex:1"><div class="tile__t">Expedición Cíclope</div>
          <div class="tile__d">Misiones de Mirano. El corazón del universo.</div></div>
        <span class="btn btn--sm btn--solid">Ir</span>
      </div>
      <div class="card tile" data-ir="juegos"><span class="tile__ico">🎮</span>
        <div><div class="tile__t">Juegos</div><div class="tile__d">Juega y suma puntos</div></div>
        <span class="tile__go btn btn--sm btn--ghost">Jugar</span></div>
      <div class="card tile" data-ir="archivo"><span class="tile__ico">📖</span>
        <div><div class="tile__t">Archivo</div><div class="tile__d">El lore del universo</div></div>
        <span class="tile__go btn btn--sm btn--ghost">Abrir</span></div>
    </div>`;

    // PROMOS (descubrimientos)
    const promos = (C.promos||[]).filter(p => p.activo);
    if (promos.length) {
      html += `<div class="h-sec pad"><h2>Descubrimientos</h2></div><div class="pad">`;
      html += promos.map(p => `<div class="card listrow" style="margin-bottom:12px">
        <div class="listrow__l"><span class="listrow__ico">${esc(p.ico)}</span>
          <div><b>${esc(p.titulo)}</b><small>${esc(p.texto)}</small></div></div></div>`).join('');
      html += `</div>`;
    }

    // COMPARTIR
    html += `<div class="h-sec pad"><h2>Comparte</h2></div>
      <div class="pad"><div class="card tile tile--wide" data-modal="resena">
        <span class="tile__ico">⭐</span>
        <div style="flex:1"><div class="tile__t">Cuenta tu expedición</div>
          <div class="tile__d">${esc(C.compartir.pregunta)}</div></div>
        <span class="btn btn--sm btn--ghost">Calificar</span>
      </div></div>`;

    html += `<p class="foot">UNIVERSO CÍCLOPE · EL ANILLO DEL CÍCLOPE®</p>`;
    $('#v-inicio').innerHTML = html;
  }

  /* ===== EXPEDICIÓN ===== */
  function renderExpedicion() {
    const rango = Estado.rango(P), sig = Estado.siguiente(P), pct = Estado.nave(P);
    let html = `<div class="pad">
      <p class="eyebrow" style="margin-top:8px">Expedición Cíclope</p>
      <div class="card card--purple nave" style="margin:10px 0 4px">
        <div class="nave__top">
          <div class="nave__rango"><span class="nave__ico">${esc(rango.ico)}</span><b>${esc(rango.nombre)}</b></div>
          <span class="nave__pct">${pct}%</span></div>
        <div class="bar"><div class="bar__fill" style="width:${pct}%"></div></div>
        <p class="nave__hint">${esc(rango.lema)}</p>
      </div>
      <button class="btn btn--solid btn--full" data-modal="sellar" style="margin:14px 0 4px">🎟️ Sellar una visita</button>
      <p style="font-size:12px;opacity:.7;text-align:center;margin-bottom:6px">Cada ticket cuenta una vez. Suma sellos y sube de rango.</p>
    </div>`;

    html += `<div class="h-sec pad"><h2>Encomiendas</h2><span>Misiones</span></div><div class="pad">`;
    REGLAS.encomiendasActivas().forEach(e => {
      const st = P.encomiendas[e.id] || {avance:0, completada:false, cobrada:false};
      const pctm = Math.round((Math.min(st.avance, e.meta)/e.meta)*100);
      const rare = e.premio >= 50 ? 'Legendaria' : e.premio >= 35 ? 'Rara' : 'Común';
      html += `<div class="card mision">
        <div class="mision__head">
          <span class="mision__ico">${esc(e.ico)}</span>
          <div style="flex:1">
            <div class="mision__nom">${esc(e.nombre)}</div>
            <div class="mision__rare">${rare} · meta ${e.meta}</div>
          </div>
          <span class="mision__premio">+${e.premio}</span>
        </div>
        <p class="mision__desc">${esc(e.desc)}</p>
        <p class="mision__mirano">“${esc(e.mirano)}”</p>
        <div class="mision__foot">
          ${st.completada
            ? `<span class="chip-ok">✓ Cumplida</span>`
            : `<div class="prog"><div class="prog__fill" style="width:${pctm}%"></div></div>
               <span style="font-family:var(--panelfont);font-size:15px;color:var(--marfil)">${Math.min(st.avance,e.meta)}/${e.meta}</span>`}
          ${e.enlace && !st.completada ? `<a class="btn btn--sm btn--ghost" href="${esc(e.enlace)}" target="_blank" rel="noopener">Ir</a>` : ''}
        </div>
      </div>`;
    });
    html += `</div>`;

    // Recompensas dentro de expedición
    html += `<div class="h-sec pad"><h2>Recompensas</h2><span>${P.puntos} pts</span></div><div class="pad">`;
    REGLAS.recompensas.forEach(r => {
      const idxR = REGLAS.indiceRango(rango.id);
      const idxNeed = r.rango ? REGLAS.indiceRango(r.rango) : 0;
      const bloqRango = idxR < idxNeed;
      const bloqPts = P.puntos < r.puntos;
      html += `<div class="card reward">
        <span class="reward__ico">${esc(r.ico)}</span>
        <div class="reward__body">
          <div class="reward__nom">${esc(r.nombre)}</div>
          <div class="reward__desc">${esc(r.desc)}</div>
          ${bloqRango ? `<span class="lock">🔒 Rango ${esc(REGLAS.rangos[idxNeed].nombre)}</span>` : ''}
        </div>
        <div class="reward__cta">
          <div class="reward__pts">${r.puntos}</div>
          <button class="btn btn--sm ${bloqRango||bloqPts?'btn--ghost':'btn--solid'}" ${bloqRango?'disabled':''}
            data-cobrar="${esc(r.id)}">${bloqRango?'Bloqueado':'Canjear'}</button>
        </div>
      </div>`;
    });
    html += `</div>`;
    $('#v-expedicion').innerHTML = html;
  }

  /* ===== JUEGOS ===== */
  function renderJuegos() {
    const juegos = (CONTENIDO.juegos||[]).filter(j => j.activo);
    let html = `<div class="pad"><p class="eyebrow" style="margin-top:8px">Arcade del universo</p>
      <div class="h-sec"><h2>Juegos</h2><span>Sin registro</span></div></div><div class="pad">`;
    if (!juegos.length) html += `<p class="empty">Pronto habrá juegos nuevos.</p>`;
    juegos.forEach(j => {
      const g = P.juegos[j.id];
      html += `<div class="card tile tile--wide tile--hot" data-juego="${esc(j.id)}" style="margin-bottom:12px">
        <span class="tile__ico">${esc(j.ico)}</span>
        <div style="flex:1">
          <div class="nov__tag">${esc(j.etiqueta||'')}</div>
          <div class="tile__t">${esc(j.nombre)}</div>
          <div class="tile__d">${esc(j.desc)}</div>
          ${g ? `<div class="tile__d" style="color:var(--amarillo-hex)">Mejor: ${g.mejor||0} · ${g.partidas||0} partidas</div>` : ''}
        </div>
        <span class="btn btn--sm btn--solid">Jugar</span>
      </div>`;
    });
    html += `<p style="font-size:12px;opacity:.7;text-align:center;margin-top:8px">
      Jugar suma puntos para tus recompensas (hasta ${REGLAS.economia.topePuntosJuegoDia}/día).</p></div>`;
    $('#v-juegos').innerHTML = html;
  }

  /* ===== ARCHIVO ===== */
  function renderArchivo() {
    const entradas = CONTENIDO.archivo || [];
    let html = `<div class="pad"><p class="eyebrow" style="margin-top:8px">La enciclopedia del universo</p>
      <div class="h-sec"><h2>Archivo Cíclope</h2><span>${entradas.filter(e=>Estado.archivoAbierto(P,e)).length}/${entradas.length}</span></div></div>`;
    html += `<div class="pad arch-grid">`;
    entradas.forEach((e, i) => {
      const abierto = Estado.archivoAbierto(P, e);
      if (abierto) {
        html += `<div class="card arch" data-arch="${i}">
          <div class="arch__cat">${esc(e.cat)}</div>
          <div class="arch__ico">${esc(e.ico)}</div>
          <div class="arch__t">${esc(e.titulo)}</div>
          <div class="arch__rare">${esc(e.rareza||'')}</div>
        </div>`;
      } else {
        html += `<div class="card arch arch--locked">
          <div class="arch__cat">${esc(e.cat)}</div>
          <div class="arch__ico">${esc(e.ico)}</div>
          <div class="arch__t">${esc(e.titulo)}</div>
          <div class="arch__lock"><span>🔒</span><small>${esc(Estado.desbloqueoTexto(e))}</small></div>
        </div>`;
      }
    });
    html += `</div><p class="foot">Explora más para desbloquear el resto.</p>`;
    $('#v-archivo').innerHTML = html;
  }

  /* ===== PERFIL ===== */
  function renderPerfil() {
    const rango = Estado.rango(P), sig = Estado.siguiente(P), pct = Estado.nave(P);
    const nombre = P.apodo || 'Explorador anónimo';
    let html = `<div class="pad">
      <div class="card card--purple ficha">
        <div class="ficha__ava">${esc(rango.ico)}</div>
        <div class="ficha__nom">${esc(nombre)}</div>
        <div class="ficha__rango">${esc(rango.nombre)}</div>
        <div class="ficha__edit" data-modal="apodo">${P.apodo?'Cambiar apodo':'Ponte un apodo ✎'}</div>
      </div>
      <div class="stats">
        <div class="card stat"><b>${P.sellos}</b><span>Sellos</span></div>
        <div class="card stat"><b>${P.puntos}</b><span>Puntos</span></div>
        <div class="card stat"><b>${P.visitas.length}</b><span>Visitas</span></div>
      </div>
      <div class="card nave" style="margin-bottom:16px">
        <div class="nave__top"><div class="nave__rango"><b>Nave de Mirano</b></div><span class="nave__pct">${pct}%</span></div>
        <div class="bar"><div class="bar__fill" style="width:${pct}%"></div></div>
        <p class="nave__hint">${sig?`${sig.sellos-P.sellos} sello(s) para ${esc(sig.nombre)}`:'Nave lista para despegar.'}</p>
      </div>`;

    // código de referido
    html += `<div class="card listrow" data-copiar="${esc(P.codigoRef)}">
      <div class="listrow__l"><span class="listrow__ico">📣</span>
        <div><b>Tu código de expedición</b><small>Invita cíclopes y gana</small></div></div>
      <span class="code">${esc(P.codigoRef)}</span></div>`;

    // canjes activos
    if (P.canjes.length) {
      html += `<div class="h-sec"><h2 style="font-size:17px">Tus canjes</h2></div>`;
      P.canjes.slice(0,5).forEach(c => {
        html += `<div class="card listrow"><div class="listrow__l"><span class="listrow__ico">🎁</span>
          <div><b>${esc(c.nombre)}</b><small>Muéstralo en caja</small></div></div>
          <span class="code">${esc(c.codigo)}</span></div>`;
      });
    }

    // enlaces de marca
    const C = CONTENIDO;
    html += `<div class="h-sec"><h2 style="font-size:17px">Encuéntranos</h2></div>
      <a class="card listrow" href="${esc(C.compartir.instagram)}" target="_blank" rel="noopener">
        <div class="listrow__l"><span class="listrow__ico">📸</span><div><b>Instagram</b><small>@elanillodelciclope</small></div></div><span>›</span></a>
      <a class="card listrow" href="${esc(C.compartir.tiktok)}" target="_blank" rel="noopener">
        <div class="listrow__l"><span class="listrow__ico">🎵</span><div><b>TikTok</b><small>@elanillodelciclope</small></div></div><span>›</span></a>`;
    C.bases.forEach(b => {
      html += `<a class="card listrow" href="${esc(b.maps)}" target="_blank" rel="noopener">
        <div class="listrow__l"><span class="listrow__ico">📍</span><div><b>Base ${esc(b.nombre)}</b><small>${esc(b.zona)}</small></div></div><span>›</span></a>`;
    });

    html += `<div style="margin-top:20px"><button class="btn btn--ghost btn--sm" data-reset>Reiniciar mi expedición</button></div>`;
    html += `</div><p class="foot">v1 · Sin registro. Tu progreso vive en este teléfono.</p>`;
    $('#v-perfil').innerHTML = html;
  }

  /* ---------------- VISOR DE JUEGOS ---------------- */
  const player = $('#player');
  function abrirJuego(id) {
    const j = (CONTENIDO.juegos||[]).find(x => x.id === id);
    if (!j) return;
    $('#player-title').textContent = j.nombre;
    $('#player-frame').src = j.archivo;
    player.classList.add('abierto');
    document.body.classList.add('bloqueado');
    // registra una partida + puntos simbólicos (tope diario en Acciones)
    Acciones.sumarPuntosJuego(P, id, 4, null);
    P = Explorador.actual();
    $('#hdr-pts').textContent = P.puntos;
  }
  function cerrarJuego() {
    player.classList.remove('abierto');
    document.body.classList.remove('bloqueado');
    $('#player-frame').src = 'about:blank';
    toast('Jugaste una partida · +puntos en tu bitácora');
    render(location.hash.replace('#','') || 'inicio');
  }
  $('#player-x').addEventListener('click', cerrarJuego);

  /* ---------------- MODALES ---------------- */
  const modal = $('#modal');
  function abrirModal(html) {
    $('#modal-card').innerHTML = `<div class="modal__grip"></div>` + html;
    modal.classList.add('abierto');
    document.body.classList.add('bloqueado');
  }
  function cerrarModal() {
    modal.classList.remove('abierto');
    if (!player.classList.contains('abierto')) document.body.classList.remove('bloqueado');
  }
  $('#modal-bg').addEventListener('click', cerrarModal);

  function modalSellar() {
    const bases = REGLAS.sucursales.map(s => `<option value="${esc(s.nombre)}">${esc(s.nombre)}</option>`).join('');
    abrirModal(`
      <div class="modal__ico">🎟️</div>
      <div class="modal__title">Sellar visita</div>
      <p class="modal__text">Escribe el folio de tu ticket. Mirano hará el resto.</p>
      <div class="field"><label>Folio del ticket</label><input id="in-folio" placeholder="Ej. A-1042" autocomplete="off"></div>
      <div class="field"><label>¿En qué base?</label><select id="in-base">${bases}</select></div>
      <div class="msg-err" id="sellar-err"></div>
      <button class="btn btn--solid btn--full" id="btn-sellar">Sellar</button>`);
    $('#btn-sellar').addEventListener('click', () => {
      const folio = $('#in-folio').value, base = $('#in-base').value;
      const r = Acciones.sellar(P, folio, base);
      if (!r.ok) { $('#sellar-err').textContent = r.msg; return; }
      P = Explorador.actual();
      abrirModal(`
        <div class="modal__ico">${r.doble?'🌙':'👁️'}</div>
        <div class="modal__title">${r.doble?'¡Sello doble!':'Sello acreditado'}</div>
        <p class="modal__mirano">“${esc(r.msg)}”</p>
        <p class="modal__text">+${r.sellos} sello${r.sellos>1?'s':''} · +${REGLAS.economia.puntosPorVisita*r.sellos} puntos</p>
        <button class="btn btn--solid btn--full" id="btn-ok">Seguir explorando</button>`);
      $('#btn-ok').addEventListener('click', () => { cerrarModal(); render('expedicion'); });
    });
  }

  function modalCobrar(id) {
    const r = REGLAS.recompensas.find(x => x.id === id); if (!r) return;
    const res = Acciones.cobrar(P, r);
    if (!res.ok) { toast(res.msg); return; }
    P = Explorador.actual();
    abrirModal(`
      <div class="modal__ico">${esc(r.ico)}</div>
      <div class="modal__title">${esc(r.nombre)}</div>
      <p class="modal__mirano">“${esc(res.msg)}”</p>
      <div class="modal__code">${esc(res.codigo)}</div>
      <p class="modal__text">Muéstralo en caja. Se descuenta de tus puntos.</p>
      <button class="btn btn--solid btn--full" id="btn-ok">Listo</button>`);
    $('#btn-ok').addEventListener('click', () => { cerrarModal(); render('expedicion'); });
  }

  function modalApodo() {
    abrirModal(`
      <div class="modal__ico">✎</div>
      <div class="modal__title">Tu nombre de explorador</div>
      <p class="modal__text">Opcional. Sirve para presumir tu progreso.</p>
      <div class="field"><label>Apodo</label><input id="in-apodo" maxlength="18" value="${esc(P.apodo)}" placeholder="Cazador del Anillo"></div>
      <button class="btn btn--solid btn--full" id="btn-apodo">Guardar</button>`);
    $('#btn-apodo').addEventListener('click', () => {
      Acciones.ponerApodo(P, $('#in-apodo').value);
      P = Explorador.actual(); cerrarModal(); render('perfil');
    });
  }

  function modalResena() {
    const C = CONTENIDO.compartir;
    abrirModal(`
      <div class="modal__ico">⭐</div>
      <div class="modal__title">${esc(C.pregunta)}</div>
      <p class="modal__text">Toca las estrellas.</p>
      <div class="stars-rate" id="rate">${[1,2,3,4,5].map(n=>`<span data-n="${n}">★</span>`).join('')}</div>
      <div id="rate-out"></div>`);
    let val = 0;
    $$('#rate span').forEach(s => {
      s.addEventListener('click', () => {
        val = +s.dataset.n;
        $$('#rate span').forEach(x => x.classList.toggle('on', +x.dataset.n <= val));
        if (val >= 4) {
          $('#rate-out').innerHTML = `<p class="modal__mirano">“El universo se va a enterar. Gracias.”</p>
            <a class="btn btn--solid btn--full" href="${esc(C.enlaceGoogle)}" target="_blank" rel="noopener">Dejar mi reseña en Google</a>`;
        } else {
          $('#rate-out').innerHTML = `<p class="modal__text">Cuéntanos qué mejorar. Mirano lee todo.</p>
            <a class="btn btn--ghost btn--full" href="https://wa.me/${esc(CONTENIDO.whatsapp.numero)}?text=${encodeURIComponent('Quiero darles una sugerencia sobre mi visita')}" target="_blank" rel="noopener">Escribir a Mirano</a>`;
        }
      });
    });
  }

  function modalArch(i) {
    const e = CONTENIDO.archivo[i]; if (!e || !Estado.archivoAbierto(P, e)) return;
    Acciones.descubrirArchivo(P, e.titulo);
    abrirModal(`
      <div class="modal__ico">${esc(e.ico)}</div>
      <div class="eyebrow" style="text-align:center">${esc(e.cat)} · ${esc(e.rareza||'')}</div>
      <div class="modal__title">${esc(e.titulo)}</div>
      <p class="modal__text" style="text-align:left">${esc(e.texto)}</p>
      <button class="btn btn--ghost btn--full" id="btn-ok">Cerrar</button>`);
    $('#btn-ok').addEventListener('click', cerrarModal);
  }

  /* ---------------- DELEGACIÓN GLOBAL DE CLICKS ---------------- */
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-ir],[data-juego],[data-modal],[data-cobrar],[data-arch],[data-accion],[data-copiar],[data-reset]');
    if (!el) return;
    if (el.dataset.ir)      return ir(el.dataset.ir);
    if (el.dataset.juego)   return abrirJuego(el.dataset.juego);
    if (el.dataset.cobrar)  return modalCobrar(el.dataset.cobrar);
    if (el.dataset.arch)    return modalArch(+el.dataset.arch);
    if (el.dataset.copiar)  { navigator.clipboard?.writeText(el.dataset.copiar); toast('Código copiado'); return; }
    if (el.dataset.reset)   {
      if (confirm('¿Reiniciar tu expedición? Se borra tu progreso en este teléfono.')) {
        Explorador.borrar(); P = Explorador.actual(); render('perfil'); toast('Expedición reiniciada');
      } return;
    }
    if (el.dataset.modal) {
      if (el.dataset.modal==='sellar') return modalSellar();
      if (el.dataset.modal==='apodo')  return modalApodo();
      if (el.dataset.modal==='resena') return modalResena();
    }
    if (el.dataset.accion) {
      let a; try { a = JSON.parse(el.dataset.accion); } catch(_) { a = el.dataset.accion; }
      if (typeof a === 'string') return ir(a);
      if (a && a.url) { window.open(a.url, '_blank', 'noopener'); return; }
    }
  });

  /* ---------------- ARRANQUE ---------------- */
  const inicial = (location.hash || '#inicio').replace('#','');
  ir(rutas.includes(inicial) ? inicial : 'inicio');

  /* PWA: service worker */
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
  }
})();
