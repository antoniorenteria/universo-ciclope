/* ============================================================
   UNIVERSO CÍCLOPE · MOTOR DE LA APP (v2)
   Router SPA + render. Sin frameworks, sin build.
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

  /* ---------------- MÚSICA ---------------- */
  const bgm = $('#bgm');
  const MUTE_KEY = 'uc_mute';
  let muted = localStorage.getItem(MUTE_KEY) === '1';
  function pintarMute() {
    const ic = muted ? '🔇' : '🎵';
    const g = $('#gate-mute'), t = $('#music-toggle');
    if (g) g.textContent = ic;
    if (t) t.textContent = ic;
  }
  function arrancarMusica() {
    if (!bgm || muted) return;
    bgm.volume = 0.35;
    bgm.play().catch(()=>{});
  }
  function toggleMute() {
    muted = !muted;
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    if (bgm) { bgm.muted = muted; if (!muted) bgm.play().catch(()=>{}); }
    pintarMute();
  }
  pintarMute();

  /* ---------------- GATE ---------------- */
  const gate = $('#gate');
  function abrirGate() {
    arrancarMusica();
    gate.classList.add('oculto');
    document.body.classList.remove('bloqueado');
    setTimeout(() => { gate.style.display='none'; }, 650);
    setTimeout(autoPromptNotis, 1800);   // pide permiso de notis solo al entrar
  }
  if (gate) {
    document.body.classList.add('bloqueado');
    gate.addEventListener('click', e => { if (e.target.closest('#gate-mute')) return; abrirGate(); });
    gate.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); abrirGate(); } });
  }
  $('#gate-mute') && $('#gate-mute').addEventListener('click', e => { e.stopPropagation(); toggleMute(); });
  $('#music-toggle') && $('#music-toggle').addEventListener('click', toggleMute);

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
    document.body.dataset.sec = ruta;              // contraste de fondo por sección
    $$('.vista').forEach(v => v.classList.toggle('activa', v.id === 'v-'+ruta));
    $$('.tab').forEach(t => t.classList.toggle('activo', t.dataset.ruta === ruta));
    render(ruta);
    Acciones.marcarVisto(P, ruta);
    scrollTo({top:0, behavior:'instant'});
    location.hash = ruta;
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => ir(t.dataset.ruta)));

  /* ---------------- RENDER ---------------- */
  function render(ruta) {
    P = Explorador.actual();
    $('#hdr-pts').textContent = P.gemas;
    if (ruta === 'inicio')     renderInicio();
    if (ruta === 'expedicion') renderExpedicion();
    if (ruta === 'juegos')     renderJuegos();
    if (ruta === 'archivo')    renderArchivo();
    if (ruta === 'perfil')     renderPerfil();
  }

  /* helper: cabecera de sección con título en ITC */
  function secHead(kicker, titulo, sub) {
    return `<div class="sec-head">
      <div class="sec-head__kicker">${esc(kicker)}</div>
      <h1 class="sec-head__title">${esc(titulo)}</h1>
      ${sub ? `<p class="sec-head__sub">${esc(sub)}</p>` : ''}
    </div>`;
  }

  /* ===== INICIO ===== */
  function renderInicio() {
    const C = CONTENIDO;
    const rango = Estado.rango(P);
    let html = '';

    // HERO (imagen de fondo + scrim)
    if (C.hero && C.hero.activo) {
      const h = C.hero;
      html += `<div class="hero">
        ${h.bg ? `<img class="hero__bg" src="${esc(h.bg)}" alt="" aria-hidden="true">` : ''}
        <div class="hero__scrim"></div>
        <div class="hero__body">
          ${h.etiqueta ? `<span class="hero__tag">${esc(h.etiqueta)}</span>` : ''}
          <h1 class="hero__title">${esc(h.titulo)}</h1>
          <p class="hero__text">${esc(h.texto)}</p>
          <button class="btn btn--solid" data-accion='${JSON.stringify(h.accion)}'>${esc(h.cta||'Explorar')}</button>
        </div>
      </div>`;
    }

    // CONTINUAR (si ya jugó algo)
    const jugado = Object.keys(P.juegos || {});
    if (jugado.length) {
      const jid = jugado[jugado.length-1];
      const j = C.juegos.find(x => x.id === jid);
      if (j) html += `
      <div class="h-sec pad"><h2>Continuar</h2><span>Donde quedaste</span></div>
      <div class="pad"><div class="card hook__card--wide" data-juego="${esc(j.id)}" style="cursor:pointer;clip-path:var(--notch);padding:16px;display:flex;align-items:center;gap:14px">
        <span style="font-size:30px">${esc(j.ico)}</span>
        <div style="flex:1"><div class="hook__t" style="font-size:16px">${esc(j.nombre)}</div>
          <div class="hook__d">Mejor: ${(P.juegos[jid]&&P.juegos[jid].mejor)||0} · ${(P.juegos[jid]&&P.juegos[jid].partidas)||0} partidas</div></div>
        <span class="btn btn--sm btn--ghost">Seguir</span>
      </div></div>`;
    }

    // NOVEDADES — carrusel de imágenes
    if (C.novedades && C.novedades.length) {
      html += `<div class="h-sec pad"><h2>Novedades</h2><span>Desliza →</span></div>`;
      html += `<div class="rail">` + C.novedades.map(n => `
        <div class="novimg" data-accion='${JSON.stringify(n.accion)}'>
          <img src="${esc(n.img)}" alt="${esc(n.titulo)}" loading="lazy">
          <div class="novimg__scrim"></div>
          <div class="novimg__body">
            <div class="novimg__tag">${esc(n.tag||'')}</div>
            <div class="novimg__title">${esc(n.titulo)}</div>
          </div>
        </div>`).join('') + `</div>`;
    }

    // HOOK — acciones claras (debajo de novedades)
    html += `<div class="h-sec pad"><h2>¿Qué quieres hacer?</h2></div>`;
    html += `<div class="pad hook">
      <div class="hook__card hook__card--play" data-ir="juegos">
        <span class="hook__go">›</span>
        <div class="hook__ico">🎮</div>
        <div class="hook__t">Jugar</div>
        <div class="hook__d">Sin registro. Diviértete y descubre los juegos.</div>
      </div>
      <div class="hook__card hook__card--exp" data-ir="expedicion">
        <span class="hook__go">›</span>
        <div class="hook__ico">🧭</div>
        <div class="hook__t">Unirme a la expedición</div>
        <div class="hook__d">Registra visitas, sube de rango, canjea premios.</div>
      </div>
      <div class="hook__card hook__card--wide" data-modal="ayuda">
        <div class="hook__ico">❓</div>
        <div style="flex:1"><div class="hook__t" style="font-size:16px">¿Cómo funciona?</div>
          <div class="hook__d">Sellos, gemas y visitas — para qué sirve cada uno.</div></div>
        <span class="hook__go" style="position:static">›</span>
      </div>
    </div>`;

    // MI BITÁCORA — aclara dónde vive la bitácora
    const pct = Estado.nave(P);
    html += `<div class="h-sec pad"><h2>Mi bitácora</h2><span>Tu progreso</span></div>
      <div class="pad"><div class="card listrow" data-ir="perfil" style="cursor:pointer">
        <div class="listrow__l"><span class="listrow__ico">${esc(rango.ico)}</span>
          <div><b>${esc(P.apodo || 'Explorador')} · ${esc(rango.nombre)}</b>
            <small>${P.sellos} sellos · ${P.gemas} gemas · nave ${pct}%</small></div></div>
        <span class="btn btn--sm btn--ghost">Abrir</span>
      </div></div>`;

    // DESCUBRIMIENTOS (cada uno con acción concreta)
    const promos = (C.promos||[]).filter(p => p.activo);
    if (promos.length) {
      html += `<div class="h-sec pad"><h2>Descubrimientos</h2></div><div class="pad">`;
      html += promos.map(p => `<div class="card listrow" data-promo="${esc(p.accion||'')}" style="margin-bottom:12px;cursor:pointer">
        <div class="listrow__l"><span class="listrow__ico">${esc(p.ico)}</span>
          <div><b>${esc(p.titulo)}</b><small>${esc(p.texto)}</small></div></div>
        ${p.cta ? `<span class="btn btn--sm btn--ghost">${esc(p.cta)}</span>` : `<span style="opacity:.6">›</span>`}</div>`).join('');
      html += `</div>`;
    }

    // COMPARTE — sección aparte, separada de Descubrimientos
    html += `<div class="h-sec pad"><h2>Comparte</h2><span>Reseña</span></div>
      <div class="pad"><div class="card listrow" data-modal="resena" style="cursor:pointer">
        <div class="listrow__l"><span class="listrow__ico">⭐</span>
          <div><b>Cuenta tu expedición</b><small>Califícanos y ayúdanos a crecer</small></div></div>
        <span class="btn btn--sm btn--solid">Calificar</span>
      </div></div>`;

    html += `<p class="foot">UNIVERSO CÍCLOPE · EL ANILLO DEL CÍCLOPE®</p>`;
    $('#v-inicio').innerHTML = html;
  }

  /* ===== EXPEDICIÓN ===== */
  function renderExpedicion() {
    const rango = Estado.rango(P), sig = Estado.siguiente(P), pct = Estado.nave(P);
    const activas = REGLAS.encomiendasActivas();
    const cumplidas = activas.filter(e => (P.encomiendas[e.id]||{}).completada).length;

    let html = secHead('El corazón del universo', 'Expedición', 'Registra tus visitas, cumple misiones y sube de rango de explorador.');

    html += `<div class="pad">
      <button class="btn btn--solid btn--full" data-modal="sellar" style="margin:8px 0 4px">📸 Registrar mi visita</button>
      <p style="font-size:12px;opacity:.72;text-align:center;margin-bottom:6px">Con el folio de tu ticket. Cada ticket cuenta una vez.</p>
    </div>`;

    // MISIONES (sin subtítulo redundante)
    html += `<div class="h-sec pad"><h2>Misiones</h2><span>${cumplidas}/${activas.length} cumplidas</span></div><div class="pad">`;
    activas.forEach(e => {
      const st = P.encomiendas[e.id] || {avance:0, completada:false};
      const pctm = Math.round((Math.min(st.avance, e.meta)/e.meta)*100);
      const rare = e.premio >= 50 ? 'Legendaria' : e.premio >= 35 ? 'Rara' : 'Común';
      html += `<div class="card mision">
        <div class="mision__head">
          <span class="mision__ico">${esc(e.ico)}</span>
          <div style="flex:1">
            <div class="mision__nom">${esc(e.nombre)}</div>
            <div class="mision__rare">${rare} · meta ${e.meta}</div>
          </div>
          <span class="mision__premio">+${e.premio}💎</span>
        </div>
        <p class="mision__desc">${esc(e.desc)}</p>
        <p class="mision__mirano">“${esc(e.mirano)}”</p>
        <div class="mision__foot">
          ${st.completada
            ? `<span class="chip-ok">✓ Cumplida</span>`
            : `<div class="prog"><div class="prog__fill" style="width:${pctm}%"></div></div>
               <span style="font-family:var(--body);font-weight:700;font-size:14px;color:var(--marfil)">${Math.min(st.avance,e.meta)}/${e.meta}</span>`}
          ${!st.completada && e.id==='ojo-testigo' ? `<button class="btn btn--sm btn--ghost" data-modal="resena">Ir</button>`
            : (e.enlace && !st.completada ? `<a class="btn btn--sm btn--ghost" href="${esc(e.enlace)}" target="_blank" rel="noopener">Ir</a>` : '')}
        </div>
      </div>`;
    });
    html += `</div>`;

    // RECOMPENSAS (gemas)
    html += `<div class="h-sec pad"><h2>Recompensas</h2><span>💎 ${P.gemas} gemas</span></div><div class="pad">`;
    REGLAS.recompensas.forEach(r => {
      const idxR = REGLAS.indiceRango(rango.id);
      const idxNeed = r.rango ? REGLAS.indiceRango(r.rango) : 0;
      const bloqRango = idxR < idxNeed;
      const bloqPts = P.gemas < r.gemas;
      html += `<div class="card reward">
        <span class="reward__ico">${esc(r.ico)}</span>
        <div class="reward__body">
          <div class="reward__nom">${esc(r.nombre)}</div>
          <div class="reward__desc">${esc(r.desc)}</div>
          ${bloqRango ? `<span class="lock">🔒 Rango ${esc(REGLAS.rangos[idxNeed].nombre)}</span>` : ''}
        </div>
        <div class="reward__cta">
          <div class="reward__pts">${r.gemas}💎</div>
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
    let html = secHead('Arcade del universo', 'Juegos', 'Sin registro. Jugar suma gemas para tus recompensas.');
    html += `<div class="pad" style="margin-top:6px">`;
    if (!juegos.length) html += `<p class="empty">Pronto habrá juegos nuevos.</p>`;
    juegos.forEach(j => {
      const g = P.juegos[j.id];
      html += `<div class="card hook__card--wide" data-juego="${esc(j.id)}" style="cursor:pointer;clip-path:var(--notch);padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <span style="font-size:32px">${esc(j.ico)}</span>
        <div style="flex:1">
          <div class="novimg__tag" style="color:var(--acento)">${esc(j.etiqueta||'')}</div>
          <div class="hook__t" style="font-size:17px">${esc(j.nombre)}</div>
          <div class="hook__d">${esc(j.desc)}</div>
          ${g ? `<div class="hook__d" style="color:var(--amarillo-hex)">Mejor: ${g.mejor||0} · ${g.partidas||0} partidas</div>` : ''}
        </div>
        <span class="btn btn--sm btn--solid">Jugar</span>
      </div>`;
    });
    html += `<p style="font-size:12px;opacity:.7;text-align:center;margin-top:8px">
      Máximo ${REGLAS.economia.topeGemasJuegoDia} gemas al día desde los juegos.</p></div>`;
    $('#v-juegos').innerHTML = html;
  }

  /* ===== ARCHIVO ===== */
  function renderArchivo() {
    const entradas = CONTENIDO.archivo || [];
    const prog = Estado.archivoProgreso(P, entradas);
    let html = secHead('La enciclopedia del universo', 'Archivo', 'Cada visita y misión desbloquea un secreto. Toca lo que ya descubriste.');
    html += `<div class="h-sec pad"><h2 style="font-size:16px">Descubierto</h2><span>${prog.abiertas}/${prog.total}</span></div>`;
    html += `<div class="pad arch-grid">`;
    entradas.forEach((e, i) => {
      const abierto = Estado.archivoAbierto(P, e);
      const imgTag = e.img ? `<img class="arch__img" src="${esc(e.img)}" alt="" loading="lazy">` : '';
      if (abierto) {
        html += `<div class="arch" data-arch="${i}">
          ${imgTag}<div class="arch__scrim"></div>
          <div class="arch__emoji">${esc(e.ico)}</div>
          <div class="arch__body">
            <div class="arch__cat">${esc(e.cat)}</div>
            <div class="arch__t">${esc(e.titulo)}</div>
            <div class="arch__rare">${esc(e.rareza||'')}</div>
          </div>
        </div>`;
      } else {
        html += `<div class="arch arch--locked">
          ${imgTag}<div class="arch__scrim"></div>
          <div class="arch__emoji">${esc(e.ico)}</div>
          <div class="arch__lock"><span>🔒</span><small>${esc(Estado.desbloqueoTexto(e))}</small></div>
        </div>`;
      }
    });
    html += `</div><p class="foot">Explora más para desbloquear el resto.</p>`;
    $('#v-archivo').innerHTML = html;
  }

  /* ===== PERFIL / BITÁCORA ===== */
  function renderPerfil() {
    const rango = Estado.rango(P), sig = Estado.siguiente(P), pct = Estado.nave(P);
    const piezas = Estado.navePiezas(P);
    const nombre = P.apodo || 'Explorador';

    let html = secHead('Tu bitácora de explorador', 'Perfil');
    html += `<div class="pad">`;

    // ---- CARD DE EXPLORACIÓN (estilo wallet) ----
    html += `<div class="pass">
      <div class="pass__top">
        <div class="pass__brand"><img src="assets/img/isotipo.png" alt=""><span>UNIVERSO CÍCLOPE</span></div>
        <span class="pass__lvl">NIVEL ${rango.nivel}</span>
      </div>
      <div class="pass__holder">
        <div class="pass__label">Explorador</div>
        <div class="pass__name">${esc(nombre)}</div>
        <div class="pass__rank">${esc(rango.ico)} ${esc(rango.nombre)}</div>
      </div>
      <div class="pass__grid">
        <div class="pass__stat"><b>${P.sellos}</b><span>Sellos</span></div>
        <div class="pass__stat"><b>${P.gemas}</b><span>Gemas</span></div>
        <div class="pass__stat"><b>${P.visitas.length}</b><span>Visitas</span></div>
      </div>
      <div class="pass__code">${esc(P.codigoRef)}</div>
      <div class="pass__qr"><img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=0&data=${encodeURIComponent(location.href.split('#')[0].split('?')[0] + '?ref=' + P.codigoRef)}" alt="Escanéame" loading="lazy"></div>
    </div>
    <div class="ficha__edit" data-modal="apodo">${P.apodo?'✎ Cambiar mi nombre':'✎ Ponte un nombre de explorador'}</div>`;

    // ---- NAVE DE MIRANO (con explicación clara) ----
    html += `<div class="card nave" style="margin-bottom:16px">
      <div class="nave__top"><div class="nave__rango"><span class="nave__ico">🛸</span><b>La nave de Mirano</b></div><span class="nave__pct">${pct}%</span></div>
      <div class="bar"><div class="bar__fill" style="width:${pct}%"></div></div>
      <p class="nave__hint">La nave de Mirano se averió al caer en la Tierra. <b>Cada visita tuya repara una pieza.</b> Llevas ${piezas.hechas} de ${piezas.total}. ${pct>=100?'¡Está lista para despegar!':'Cuando llegue al 100%, Mirano retomará su viaje.'}</p>
    </div>`;

    // ---- ESCALERA DE RANGOS (5 niveles) ----
    html += `<div class="h-sec"><h2 style="font-size:16px">Rango de explorador</h2><span>Nivel ${rango.nivel}/5</span></div>`;
    html += `<div class="card ladder">`;
    REGLAS.rangos.forEach(r => {
      const actual = r.id === rango.id;
      const hecho = P.sellos >= r.sellos && !actual;
      html += `<div class="ladder__row ${actual?'on':''} ${hecho?'done':''}">
        <div class="ladder__ico">${esc(r.ico)}</div>
        <div class="ladder__b"><b>${esc(r.nombre)}</b><small>${esc(r.lema)}</small></div>
        <div class="ladder__n">${r.sellos===0?'inicio':r.sellos+' sellos'}</div>
      </div>`;
    });
    html += `</div>`;
    if (sig) html += `<p style="font-size:12.5px;opacity:.8;text-align:center;margin:-6px 0 16px">Te faltan <b>${sig.sellos - P.sellos} visita(s)</b> para ser ${esc(sig.nombre)}.</p>`;

    // ---- NOTIFICACIONES (Card de retención estilo WonCards) ----
    html += `<div class="card listrow" data-modal="notis" style="cursor:pointer;margin-top:4px">
      <div class="listrow__l"><span class="listrow__ico">🔔</span>
        <div><b>${P.notis?'Notificaciones activadas':'Activar notificaciones'}</b>
          <small>${P.notis?'Te avisaremos de expediciones y premios':'Entérate de nuevos productos y expediciones'}</small></div></div>
      <span class="btn btn--sm ${P.notis?'btn--ghost':'btn--solid'}">${P.notis?'✓':'Activar'}</span></div>`;

    // ---- código de referido ----
    html += `<div class="card listrow" data-copiar="${esc(P.codigoRef)}" style="cursor:pointer">
      <div class="listrow__l"><span class="listrow__ico">📣</span>
        <div><b>Tu código de expedición</b><small>Invita cíclopes y gana gemas</small></div></div>
      <span class="code">${esc(P.codigoRef)}</span></div>`;

    // ---- visitas registradas (prueba de que se registró) ----
    if (P.visitas.length) {
      html += `<div class="h-sec"><h2 style="font-size:16px">Tus visitas</h2><span>${P.visitas.length}</span></div>`;
      P.visitas.slice(0,6).forEach(v => {
        const f = new Date(v.fecha);
        const fecha = isNaN(f) ? '' : f.toLocaleDateString('es-MX',{day:'2-digit',month:'short'});
        html += `<div class="card listrow"><div class="listrow__l"><span class="listrow__ico">📍</span>
          <div><b>Folio ${esc(v.folio)}</b><small>${esc(v.base||'Base')} · ${esc(fecha)}</small></div></div>
          <span class="chip-ok">✓</span></div>`;
      });
    }

    // ---- canjes ----
    if (P.canjes.length) {
      html += `<div class="h-sec"><h2 style="font-size:16px">Tus canjes</h2></div>`;
      P.canjes.slice(0,5).forEach(c => {
        html += `<div class="card listrow"><div class="listrow__l"><span class="listrow__ico">🎁</span>
          <div><b>${esc(c.nombre)}</b><small>Muéstralo en caja</small></div></div>
          <span class="code">${esc(c.codigo)}</span></div>`;
      });
    }

    // ---- enlaces de marca ----
    const C = CONTENIDO;
    html += `<div class="h-sec"><h2 style="font-size:16px">Encuéntranos</h2></div>
      <a class="card listrow" href="${esc(C.compartir.instagram)}" target="_blank" rel="noopener">
        <div class="listrow__l"><span class="listrow__ico">📸</span><div><b>Instagram</b><small>@elanillodelciclope</small></div></div><span>›</span></a>
      <a class="card listrow" href="${esc(C.compartir.tiktok)}" target="_blank" rel="noopener">
        <div class="listrow__l"><span class="listrow__ico">🎵</span><div><b>TikTok</b><small>@elanillodelciclope</small></div></div><span>›</span></a>`;
    C.bases.forEach(b => {
      html += `<a class="card listrow" href="${esc(b.maps)}" target="_blank" rel="noopener">
        <div class="listrow__l"><span class="listrow__ico">📍</span><div><b>Base ${esc(b.nombre)}</b><small>${esc(b.zona)}</small></div></div><span>›</span></a>`;
    });

    html += `<div style="margin-top:20px;text-align:center"><button class="btn btn--ghost btn--sm" data-reset>Reiniciar mi bitácora</button></div>`;
    html += `</div><p class="foot">v2 · Sin registro. Tu progreso vive en este teléfono.</p>`;
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
    const r = Acciones.registrarPartida(P, id, null);
    P = Explorador.actual();
    $('#hdr-pts').textContent = P.gemas;
    if (r.primera) setTimeout(() => toast(`¡Descubriste ${j.nombre}! +${r.gemas} gemas`), 400);
  }
  function cerrarJuego() {
    player.classList.remove('abierto');
    document.body.classList.remove('bloqueado');
    $('#player-frame').src = 'about:blank';
    render(document.body.dataset.sec || 'inicio');
  }
  $('#player-x').addEventListener('click', cerrarJuego);

  /* Recibe el puntaje de los juegos (iframe del mismo sitio) y
     otorga gemas por LOGROS (con tope diario, sin farmeo). */
  window.addEventListener('message', e => {
    if (e.origin !== location.origin) return;
    const d = e.data;
    if (!d || d.tipo !== 'uc-score' || !d.juego) return;
    const dadas = Acciones.otorgarLogros(P, d.juego, +d.score || 0);
    if (dadas > 0) {
      P = Explorador.actual();
      $('#hdr-pts').textContent = P.gemas;
      toast(`¡Logro! +${dadas} gemas`);
    }
  });

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
      <div class="modal__ico">📸</div>
      <div class="modal__title">Registrar visita</div>
      <ol class="pasos">
        <li>Pide tu ticket en caja al pagar.</li>
        <li>Escribe el folio que aparece en el ticket.</li>
        <li>Mirano lo guarda en tu bitácora al instante.</li>
      </ol>
      <div class="field"><label>Folio del ticket</label><input id="in-folio" placeholder="Ej. A-1042" autocomplete="off"></div>
      <div class="field"><label>¿En qué base?</label><select id="in-base">${bases}</select></div>
      <div class="msg-err" id="sellar-err"></div>
      <button class="btn btn--solid btn--full" id="btn-sellar">Registrar</button>
      <p class="field__hint" style="margin-top:12px;text-align:center">Hoy en modo demo se registra al momento. Al conectar la caja validaremos que el folio sea real y del día.</p>`);
    $('#btn-sellar').addEventListener('click', () => {
      const folio = $('#in-folio').value, base = $('#in-base').value;
      const r = Acciones.sellar(P, folio, base);
      if (!r.ok) { $('#sellar-err').textContent = r.msg; return; }
      P = Explorador.actual();
      abrirModal(`
        <div class="modal__ico">${r.doble?'🌙':'✅'}</div>
        <div class="modal__title">${r.doble?'¡Visita doble!':'¡Visita registrada!'}</div>
        <p class="modal__mirano">“${esc(r.msg)}”</p>
        <div class="card" style="padding:14px;margin-bottom:16px;text-align:center">
          <div style="font-family:var(--panelfont);font-size:14px;letter-spacing:.12em;color:var(--ambar)">FOLIO ${esc(r.folio)}</div>
          <div style="display:flex;justify-content:center;gap:20px;margin-top:8px">
            <div><b style="font-family:var(--panelfont);font-size:22px;color:var(--amarillo-hex)">+${r.sellos}</b><div style="font-size:11px;opacity:.7">SELLO${r.sellos>1?'S':''}</div></div>
            <div><b style="font-family:var(--panelfont);font-size:22px;color:var(--amarillo-hex)">+${r.gemas}</b><div style="font-size:11px;opacity:.7">GEMAS</div></div>
          </div>
        </div>
        ${r.subioRango?`<p class="modal__text" style="color:var(--amarillo-hex)">${esc(REGLAS.voz.rangoNuevo)} Ahora eres ${esc(r.rango.nombre)}.</p>`:''}
        <button class="btn btn--solid btn--full" id="btn-ok">Ver mi bitácora</button>
        <button class="btn btn--ghost btn--full" id="btn-mas" style="margin-top:10px">Registrar otra</button>`);
      $('#btn-ok').addEventListener('click', () => { cerrarModal(); ir('perfil'); });
      $('#btn-mas').addEventListener('click', () => modalSellar());
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
      <p class="modal__text">Muéstralo en caja. Se descontó de tus gemas.</p>
      <button class="btn btn--solid btn--full" id="btn-ok">Listo</button>`);
    $('#btn-ok').addEventListener('click', () => { cerrarModal(); render('expedicion'); });
  }

  function modalApodo() {
    abrirModal(`
      <div class="modal__ico">✎</div>
      <div class="modal__title">Tu nombre de explorador</div>
      <p class="modal__text">Opcional. Aparece en tu Card de Exploración.</p>
      <div class="field"><label>Nombre</label><input id="in-apodo" maxlength="18" value="${esc(P.apodo)}" placeholder="Cazador del Anillo"></div>
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
    $$('#rate span').forEach(s => {
      s.addEventListener('click', () => {
        const val = +s.dataset.n;
        $$('#rate span').forEach(x => x.classList.toggle('on', +x.dataset.n <= val));
        if (val >= 4) {
          // 4-5 estrellas -> elige sucursal -> link DIRECTO a reseña de esa base
          const botones = REGLAS.sucursales.map(su => {
            const b = (CONTENIDO.bases||[]).find(x => x.nombre === su.nombre) || {};
            const link = b.resena || C.enlaceGoogle || b.maps || '#';
            return `<a class="btn btn--solid btn--full" href="${esc(link)}" target="_blank" rel="noopener">📍 Sucursal ${esc(su.nombre)}</a>`;
          }).join('');
          $('#rate-out').innerHTML = `<p class="modal__mirano">“El universo se va a enterar. Gracias.”</p>
            <p class="modal__text" style="margin-bottom:12px">¿En qué base nos visitaste?</p>
            <div class="modal__branches">${botones}</div>`;
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
      ${e.img ? `<img class="modal__img" src="${esc(e.img)}" alt="">` : `<div class="modal__ico">${esc(e.ico)}</div>`}
      <div class="eyebrow" style="text-align:center">${esc(e.cat)} · ${esc(e.rareza||'')}</div>
      <div class="modal__title">${esc(e.ico)} ${esc(e.titulo)}</div>
      <p class="modal__text" style="text-align:left;line-height:1.6">${esc(e.texto)}</p>
      <button class="btn btn--ghost btn--full" id="btn-ok">Cerrar</button>`);
    $('#btn-ok').addEventListener('click', cerrarModal);
  }

  function modalNotis() {
    const appId = (CONTENIDO.notificaciones||{}).onesignalAppId;
    abrirModal(`
      <div class="modal__ico">🔔</div>
      <div class="modal__title">Notificaciones</div>
      <p class="modal__text">Recibe avisos de nuevas expediciones, productos y premios. Como una tarjeta de lealtad, pero viva.</p>
      ${appId
        ? `<button class="btn btn--solid btn--full" id="btn-notis">Activar notificaciones</button>`
        : `<p class="modal__mirano">Las notificaciones se encienden muy pronto. Mirano está afinando la señal.</p>
           <button class="btn btn--ghost btn--full" id="btn-ok">Entendido</button>`}
      <p class="field__hint" style="margin-top:12px;text-align:center">En iPhone, agrega la app a tu pantalla de inicio para recibirlas.</p>`);
    if (appId) {
      $('#btn-notis').addEventListener('click', () => pedirNotis());
    } else {
      $('#btn-ok').addEventListener('click', cerrarModal);
    }
  }

  function modalAyuda() {
    abrirModal(`
      <div class="modal__ico">🧭</div>
      <div class="modal__title">¿Cómo funciona?</div>
      <div style="text-align:left;font-size:14px;line-height:1.5">
        <p style="margin-bottom:12px"><b style="font-family:var(--display);color:var(--marfil)">📍 Visitas</b><br>Cada vez que vienes y registras el folio de tu ticket, sumas una <b>visita</b>.</p>
        <p style="margin-bottom:12px"><b style="font-family:var(--display);color:var(--marfil)">🔖 Sellos</b><br>Las visitas te dan <b>sellos</b>. Los sellos <b>suben tu rango de explorador</b> (del 1 al 5) y reparan la nave de Mirano. <i>Solo se ganan visitando.</i></p>
        <p style="margin-bottom:12px"><b style="font-family:var(--display);color:var(--marfil)">💎 Gemas</b><br>Son tu moneda. Se ganan al visitar y, poquito, por logros en los juegos. Sirven para <b>canjear recompensas</b> (papas, pociones, la Crepiburger...).</p>
        <p style="margin-bottom:4px"><b style="font-family:var(--display);color:var(--marfil)">🏆 En resumen</b><br>Visita → ganas sellos y gemas → subes de rango y canjeas premios. Jugar es por diversión; las gemas de verdad vienen de venir.</p>
      </div>
      <button class="btn btn--solid btn--full" id="btn-ok" style="margin-top:18px">¡Entendido!</button>`);
    $('#btn-ok').addEventListener('click', cerrarModal);
  }

  /* ---------------- ONESIGNAL (push) ---------------- */
  function initOneSignal() {
    const appId = (CONTENIDO.notificaciones||{}).onesignalAppId;
    if (!appId) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    s.defer = true; document.head.appendChild(s);
    // la app vive en un subpath en GitHub Pages (/universo-ciclope/):
    // el service worker de OneSignal debe registrarse ahí, no en la raíz.
    const base = location.pathname.replace(/[^/]*$/, '') || '/';   // '/universo-ciclope/'
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId,
          serviceWorkerPath: base.replace(/^\//, '') + 'OneSignalSDKWorker.js',
          serviceWorkerParam: { scope: base },
          allowLocalhostAsSecureOrigin: true,
        });
      } catch(_) {}
    });
  }
  function pedirNotis() {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission();
        Acciones.activarNotis(P, true); P = Explorador.actual();
        cerrarModal(); render('perfil'); toast('¡Notificaciones activadas!');
      } catch(_) { toast('No se pudo activar. Revisa los permisos.'); }
    });
  }
  /* Pide el permiso SOLO al entrar (una vez), sin que el usuario
     tenga que ir a Perfil. El navegador igual exige tocar "Permitir". */
  function autoPromptNotis() {
    const appId = (CONTENIDO.notificaciones||{}).onesignalAppId;
    if (!appId) return;
    if (localStorage.getItem('uc_notis_ask') === '1') return;
    localStorage.setItem('uc_notis_ask', '1');
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        const perm = await OneSignal.Notifications.permission;
        if (perm) return; // ya concedido
        await OneSignal.Notifications.requestPermission();
        if (OneSignal.Notifications.permission) { Acciones.activarNotis(P, true); P = Explorador.actual(); }
      } catch(_) {}
    });
  }

  /* ---------------- DELEGACIÓN GLOBAL DE CLICKS ---------------- */
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-ir],[data-juego],[data-modal],[data-cobrar],[data-arch],[data-accion],[data-promo],[data-copiar],[data-reset]');
    if (!el) return;
    if (el.dataset.promo !== undefined) {
      const a = el.dataset.promo;
      if (a === 'registrar') return modalSellar();
      if (a === 'resena')    return modalResena();
      if (a)                 return ir(a);
      return;
    }
    if (el.dataset.ir)      return ir(el.dataset.ir);
    if (el.dataset.juego)   return abrirJuego(el.dataset.juego);
    if (el.dataset.cobrar)  return modalCobrar(el.dataset.cobrar);
    if (el.dataset.arch)    return modalArch(+el.dataset.arch);
    if (el.dataset.copiar)  { navigator.clipboard?.writeText(el.dataset.copiar); toast('Código copiado'); return; }
    if (el.dataset.reset)   {
      if (confirm('¿Reiniciar tu bitácora? Se borra tu progreso en este teléfono.')) {
        Explorador.borrar(); P = Explorador.actual(); render('perfil'); toast('Bitácora reiniciada');
      } return;
    }
    if (el.dataset.modal) {
      if (el.dataset.modal==='sellar') return modalSellar();
      if (el.dataset.modal==='apodo')  return modalApodo();
      if (el.dataset.modal==='resena') return modalResena();
      if (el.dataset.modal==='notis')  return modalNotis();
      if (el.dataset.modal==='ayuda')  return modalAyuda();
    }
    if (el.dataset.accion) {
      let a; try { a = JSON.parse(el.dataset.accion); } catch(_) { a = el.dataset.accion; }
      if (typeof a === 'string') return ir(a);
      if (a && a.url) { window.open(a.url, '_blank', 'noopener'); return; }
    }
  });

  /* ---------------- ARRANQUE ---------------- */
  /* Aplica la configuración editada desde el panel de admin sobre
     el contenido por defecto. Solo toca lo que el panel definió. */
  function aplicarConfig(cfg) {
    if (!cfg || typeof cfg !== 'object') return false;
    let cambio = false;
    if (cfg.hero && typeof cfg.hero === 'object') { CONTENIDO.hero = Object.assign({}, CONTENIDO.hero, cfg.hero); cambio = true; }
    if (Array.isArray(cfg.novedades) && cfg.novedades.length) { CONTENIDO.novedades = cfg.novedades; cambio = true; }
    if (Array.isArray(cfg.promos)) { CONTENIDO.promos = cfg.promos; cambio = true; }
    if (Array.isArray(cfg.misionesActivas)) {
      REGLAS.encomiendas.forEach(e => { e.activa = cfg.misionesActivas.includes(e.id); });
      cambio = true;
    }
    return cambio;
  }

  const inicial = (location.hash || '#inicio').replace('#','');
  ir(rutas.includes(inicial) ? inicial : 'inicio');
  initOneSignal();
  // online: trae contenido editado (panel) y el progreso más reciente
  if (window.Sync && Sync.activo()) {
    Sync.config().then(cfg => { if (aplicarConfig(cfg)) render(document.body.dataset.sec || 'inicio'); });
    Sync.reconciliar().then(np => { if (np) { P = np; render(document.body.dataset.sec || 'inicio'); } });
  }

  /* PWA: service worker */
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(()=>{}));
  }
})();
