# 🔭 UNIVERSO CÍCLOPE — Bitácora del proyecto

> **Este archivo es la memoria portátil del proyecto.** Vive en GitHub, así que
> se puede leer desde la compu, el teléfono o donde sea. Aquí está TODO lo
> necesario para retomar sin perder nada.

---

## ▶️ CÓMO RETOMAR (lee esto primero)

**Regla de oro:** las *sesiones de chat* se terminan, pero el *proyecto* no.
Todo el código está en GitHub y nunca se pierde. Para continuar, **no** intentes
reconectar una sesión vieja (por eso aparecen "Desconectadas"): **abre una sesión
nueva** y escribe el disparador. Claude lee esta bitácora + el código y sigue.

| Desde dónde | Qué escribes | Qué hace Claude |
|---|---|---|
| 💻 **Compu** (Claude Code) | `seguir con Universo Cíclope` | Lee este archivo + la memoria local + el código del disco (`universo-ciclope/`) y confirma el estado. |
| 📱 **Teléfono** (app de Claude) | `seguir con Universo Cíclope — lee el repo antoniorenteria/universo-ciclope y su BITACORA.md` | Lee todo desde GitHub y continúa. |

No hace falta re-explicar nada ni armar prompts nuevos: el disparador + esta
bitácora bastan.

---

## 🌐 EN VIVO (todo lo que ya existe)

- **App (clientes):** https://universo.elanillodelciclope.com
- **Panel de administración:** https://universo.elanillodelciclope.com/admin/
- **QR imprimible (sucursales):** https://universo.elanillodelciclope.com/imprimir/
- **Repo (código):** https://github.com/antoniorenteria/universo-ciclope (público)
- **Base de datos:** Google Sheet "Universo Cíclope - DB" (en el Drive de Toño)
- **Notificaciones:** OneSignal (cuenta de arenteria851@gmail.com)

---

## 🧭 QUÉ ES

PWA de fidelización gamificada de El Anillo del Cíclope. Sin login. El cliente
("Explorador") entra por QR o link, juega, cumple **misiones**, gana **gemas** y
**sellos**, sube de **rango** (5 niveles) y canjea premios. Hospeda los juegos
(Gema Mágica, Ojo del Cíclope). Universo narrativo de Mirano.

- **Sellos** = solo por visitar (folio del ticket) → suben rango y reparan la nave.
- **Gemas** = por visitar + logros de juego → se gastan en recompensas.
- **Rangos (5):** Explorador → Rastreador → Cazador de Reliquias → Guardián del Anillo → Embajador del Universo.

---

## 🏗️ ARQUITECTURA / ARCHIVOS

Carpeta local: `D:\El Anillo del cíclope - copia\universo-ciclope\` (NO es git ahí;
el repo git está inicializado en esa misma carpeta y sube a GitHub).

```
universo-ciclope/
├── index.html            Shell de la app (gate, nav, onboarding)
├── manifest.webmanifest  PWA
├── sw.js                 Service worker (network-first; subir VERSION al publicar)
├── CNAME                 dominio: universo.elanillodelciclope.com
├── BITACORA.md           ESTE ARCHIVO
├── NOTIFICACIONES.md     Textos de notificaciones (bienvenida + plantillas) en español
├── LEEME.md              Manual para Toño
├── assets/
│   ├── css/universo.css  Diseño (tokens de marca)
│   ├── js/reglas.js      ← economía, rangos, misiones (se edita para cambiar reglas)
│   ├── js/contenido.js   ← contenido editable por defecto (hero, novedades, archivo, juegos)
│   ├── js/estado.js      Perfil localStorage + Sync (backend) + ENDPOINT
│   ├── js/app.js         Motor de la app (router, render, modales)
│   ├── fonts/            ITC Serif Gothic
│   ├── img/  audio/      logo, lore, banners, música
├── juegos/               gema-magica.html · ojo-ciclope.html (con reporter de score)
├── admin/index.html      Panel de administración (métricas + editor de contenido + subir fotos)
└── backend/Code.gs       Backend Apps Script (pegar en el editor de Apps Script)
```

**Stack:** JavaScript vanilla, sin build, sin npm. GitHub Pages sirve la app.
Backend = Google Apps Script + Sheets (mismo patrón que El Ojo Maestro).

---

## 🔑 DÓNDE ESTÁN LAS LLAVES (no van en este archivo, el repo es público)

- **Clave del panel admin:** en `backend/Code.gs`, línea `const ADMIN_KEY = '...'`
  (Toño la cambió a la suya; la sabe él).
- **URL del backend (/exec):** ya está pegada en `assets/js/estado.js` (`const ENDPOINT`).
- **OneSignal App ID:** en `assets/js/contenido.js` (`notificaciones.onesignalAppId`). Es público, no es secreto.
- **Loyverse token:** pendiente (fase 2), irá en Code.gs del lado servidor.

---

## ✅ QUÉ ESTÁ HECHO

- App en vivo con **dominio propio** + HTTPS. El link viejo de github.io redirige.
- **Base de datos online** (progreso no se pierde al reinstalar). Sync automático.
- **Panel de admin:** métricas (exploradores, visitas, gemas, rangos, canjes) +
  editor de contenido (hero, novedades, promos, misiones) + **subir fotos** (van a Drive).
- **Notificaciones push** (OneSignal), auto-preguntan al entrar.
- **Onboarding** de bienvenida al entrar (+ agregar a inicio: Android install / instrucciones iPhone).
- **Juegos conectados**: reportan score → logros de gemas (con tope diario, anti-farmeo).
- **Referidos**: link/QR de invitación; 20 gemas al referidor cuando el invitado visita.
- **Reseñas**: 2 botones por sucursal → link directo de Google (Revolución/Tulipanes).
- **Misiones** que se calculan del historial real: Primer Contacto, Cazador Nocturno
  (mar/mié/jue), Racha (30 días), Peregrino (2 sucursales), El Ojo Testigo (al reseñar).
- **QR imprimible** (póster A4 + tarjeta de mesa, por sucursal).
- Fix de parpadeo del hero (cachea el contenido editado).

---

## ⏳ QUÉ FALTA / PRÓXIMOS PASOS

- [x] ~~Textos en español para OneSignal~~ → hechos en `NOTIFICACIONES.md`.
      **FALTA que Toño los pegue en OneSignal** (Welcome Notification + Slide Prompt).
- [ ] **Datos reales en `contenido.js`:** número de WhatsApp real (`whatsapp.numero`).
- [ ] **Catador de Pociones:** requiere Loyverse (saber qué brebajes pidió). Dejar
      apagada en el panel hasta conectar Loyverse.
- [ ] **Conectar Loyverse** (fase 2): validar folios reales (existe, de hoy/ayer,
      monto ≥ mínimo, no reclamado) en `Code.gs` acción `folio`, y encender Catador/Peregrino auto.
- [ ] **Responsive** para tablet/desktop (hoy es mobile-first, columna centrada).
- [ ] **Costo real de la Poción** (único premio sin costo verificado en reglas.js).
- [ ] **Wallet nativo** (Apple/Google Wallet) — fase 3, opcional (requiere certificado Apple).
- [ ] Integrar métricas del panel al **Ojo Maestro** (mismo ecosistema).

> **PRÓXIMO PASO INMEDIATO (al 2026-07-30):** Toño pega en OneSignal la bienvenida
> y el slide prompt de `NOTIFICACIONES.md` (para quitar el inglés) y pone su número
> real de WhatsApp en `contenido.js`. Después: decidir si se conecta Loyverse
> (fase 2) o se hace el responsive de desktop/tablet.

---

## 🚀 CÓMO PUBLICAR CAMBIOS

1. **App (código):** `git add -A && git commit -m "..." && git push` desde
   `universo-ciclope/`. GitHub Pages reconstruye solo en ~1-2 min.
   Subir `VERSION` en `sw.js` cuando cambie html/js/css (así llega sin reinstalar).
2. **Backend (`Code.gs`):** Toño pega el archivo en Apps Script → Implementar →
   Gestionar implementaciones → ✏️ → Nueva versión → Implementar. (La URL /exec no cambia.)
3. **Contenido (sin código):** Toño lo edita desde el **panel /admin/** (se guarda en la Sheet).

---

## 🗂️ MEMORIA LOCAL (en la compu)

`C:\Users\Usuario\.claude\projects\D--El-Anillo-del-c-clope---copia\memory\universo-ciclope-app.md`
— se auto-carga en cada sesión de Claude Code y tiene el detalle + el último
"PRÓXIMO PASO". Este BITACORA.md (en GitHub) es la versión portátil equivalente.

---

*Actualizar esta bitácora al cerrar cada sesión importante.*

---

## 🎴 BRIEF EN CURSO (2026-08-28) — Pop-up de bienvenida con card volteable

> Copy original de Toño, guardado para que no se pierda nada. Se está implementando.

**Qué:** al ingresar por primera vez, un **pop-up flotante** (NO cubre toda la pantalla)
con una **card 9:16 proporcional pero más pequeña** y un **destello alrededor** (el mismo
efecto `.glow-card` / `.promo-card` del sitio web, sección Promos).

**Cómo funciona:**
- La card muestra primero el **dorso** (carta posterior: remolino morado + ojo dorado).
- Un **botón inferior** dice **"Toca y descubre tu recompensa"**. Al tocar la card (o el botón),
  **gira** y revela el **frente** = banner de promo (descuento).
- Al girar, el botón cambia a **"Jugar ahora"** → abre el juego de la **Gema Mágica**.
- La promo es un **banner de descuento** que se gana si **superan 15,000 puntos** en la Gema Mágica.
- Al **salir del juego** se abre el **pop-up que ya existía** (invitación a "agregar a la pantalla
  de inicio") pero con **3 botones CTA de beneficio inmediato**: "Realiza esta Expedición",
  "Registra tu visita", "Deja tu reseña" (solo 3).

**Imágenes:** Toño pasa banner (frente) + contraportada (dorso). Por ahora se usan las de
`1.Redes Sociales/1. 2026/Promos/` (EADC - Promo app.png = 50% dto; EADC - Carta posterior.png)
optimizadas a `assets/img/promo-frente.jpg` y `promo-dorso.jpg`. Config editable en
`contenido.js → promoPopup` (frente/dorso/metaPuntos/textos/3 CTAs) y **desde el panel admin**
(subir imágenes + textos, sin sesión de código).

**Técnico:** el juego `juegos/gema-magica.html` NO reportaba score al padre (pendiente fase 2);
se le agrega `postMessage {tipo:'uc-score', juego:'gema', score}` al terminar la partida para
que la app detecte los 15,000.

### ✅ IMPLEMENTADO y verificado en local (2026-08-28) — falta publicar
- **HTML** (`index.html`): pop-up `#promo` (card 9:16 con caras dorso/frente + `.glow-card`),
  y onboarding rehecho con `#ob-body` = 3 CTAs + "Agregar a inicio".
- **CSS** (`assets/css/universo.css`): `.promo-pop*` (flip 3D idéntico al sitio) + `.glow-card`
  con latido, y `.onboard__ctas`. La card mide ~58% del alto (flotante, no cubre pantalla).
- **JS** (`assets/js/app.js`): secuencia gate→promo→juego→onboarding; `cfgPromo()`, `mostrarPromo`,
  `voltearPromo`, reward al superar `metaPuntos` (modal 🏆), onboarding con CTAs; hook en
  `aplicarConfig` para `cfg.promoPopup`. Flags: `uc_promo_visto`, `uc_onboard`, `uc_promo_premio`.
- **Config** (`assets/js/contenido.js` → `promoPopup`): dorso/frente/textos/juego/metaPuntos/
  recompensa/postSub/3 CTAs. Default usa `assets/img/promo-dorso.jpg` y `promo-frente.jpg`.
- **Juego** (`juegos/gema-magica.html`): ahora reporta el score al padre al terminar.
- **Admin** (`admin/index.html`): tarjeta "🎴 Pop-up de bienvenida" para subir dorso/frente
  (reusa `subirImagen`→Drive) y editar textos/meta/CTAs; se guarda en la Config (sin redeploy).
- **SW**: `VERSION` subida a `uc-v12`.
- Imágenes default optimizadas desde `1.Redes Sociales/1. 2026/Promos/` (EADC - Promo app.png →
  frente; EADC - Carta posterior.png → dorso), 680px, ~150 KB c/u.

> **PRÓXIMO PASO:** Toño decide: (a) publicar YA con estas imágenes default, o (b) pasar el
> banner/contraportada nuevos (o subirlos desde /admin/). Publicar = `git add -A && commit && push`
> desde `universo-ciclope/` (Vercel/Pages redespliega solo). NO se ha publicado todavía.

---

## 🖼️ Encabezado + Novedades fijados en código (2026-08-28)

**Por qué:** Toño cambió el hero y las novedades desde /admin/ pero **no se guardaron en el
servidor** (config del backend = `{}`; el backend SÍ funciona —probadas todas las acciones—,
el guardado no llegó). Para que sea a prueba de fallos se dejó el contenido **fijo en
`contenido.js`** en vez de depender del panel.
- **Hero:** fondo `assets/img/hero-app.jpg` (vaso calavera recortado sin texto), etiqueta
  "SOLO EN LA APP", título "50% en tu brebaje", texto de reto (15,000 pts en Gema Mágica),
  CTA "Jugar y ganar" → juegos. (Liga con el pop-up de la promo.)
- **Novedades (4 promos):** `assets/img/nov/promo-{cerebros,alitas,ninos,cumple}.jpg`
  (stories 9:16 recortadas a 4:5 centradas ~720x900, contenido conservado). Títulos: 1kg
  cerebros $335 (martes), 25 alitas $329 (miércoles), niños comen gratis (domingos), postre
  de cumpleaños. Todas llevan a `expedicion`.
- **Nota panel admin:** el editor de contenido guarda a la hoja Config, pero el guardado de
  Toño no persistió. Si vuelve a usarlo, confirmar que salga el "✓ Guardado" verde. Ojo:
  imágenes subidas por el panel quedan como URL `drive.google.com/thumbnail?id=...` (pueden
  ser inestables para hotlink); por eso conviene el contenido crítico fijo en código.
- **SW** `uc-v13`. Fuentes originales en `1.Redes Sociales/1. 2026/Promos/`.

---

## 🎫 TARJETA DE LEALTAD + CAJA + ZONAS (2026-09-07) — IMPLEMENTADO en local, FALTA publicar

Brief de Toño: tarjeta de lealtad que se agrega a Wallet, QR que registra la visita al
escanear, notificaciones por zona (Pachuca / Mineral), botón "Descargar"/"Agregar a Wallet"
en Mi perfil, estilo degradado con logo, y el sitio web en el perfil.

**Decisiones de Toño (esta sesión):**
- Wallet → **versión gratis que funciona hoy** (descargar tarjeta como imagen + agregar a inicio).
  El Wallet NATIVO (Apple/Google) queda para fase 3 (necesita cuenta Apple Developer $99/año
  y/o emisor de Google Wallet + servicio que firme el pase).
- QR de visita → **el cajero escanea al cliente** (página de caja protegida con clave).
- Zonas → **detección al abrir la app** (en web NO hay geofence en segundo plano, sobre todo iPhone).

**Qué se construyó (todo verificado en navegador, fresco y con datos legacy):**
- **Librería QR local** `assets/js/qr.min.js` (qrcode-generator) → el QR de la tarjeta ahora
  se genera OFFLINE y se puede exportar a imagen sin problemas de origen. Cargada en index.html.
- **Perfil (`app.js` renderPerfil):** la Card ahora es la **Tarjeta de lealtad**; su QR lleva a
  `/checkin/?e=<id>` (para caja). Debajo, botones **📥 Descargar** y **🎫 Agregar a Wallet**, y
  el texto de ayuda. Nueva fila **📍 Avisos por zona**. Nueva fila **🌐 Sitio web oficial**
  (de `CONTENIDO.sitio`).
- **Descargar tarjeta:** `descargarTarjeta()` dibuja la card en canvas (degradado morado + logo +
  datos + QR) y la ofrece para guardar en Fotos / descargar PNG. `modalTarjeta()` = QR grande
  "muestra esto en caja". `modalWallet()` = guardar imagen + agregar a inicio (iOS/Android).
- **Zonas:** módulo `Zonas` en app.js (haversine). Al abrir la app, si el permiso de ubicación
  YA está concedido, saluda si estás cerca de una base; el botón del perfil pide permiso.
  Config en `contenido.js → geoZonas` (activo, zonas con lat/lng/radio/saludo).
  ⚠️ **Coordenadas son APROXIMADAS** — Toño debe poner las exactas (Google Maps → clic derecho
  → copiar lat,lng) en `contenido.js`.
- **Página de caja** `checkin/index.html` (nueva): pide la **clave del personal** (la de admin),
  la guarda en ese dispositivo, muestra al explorador (lo lee por id) y registra la visita.
  El cajero escanea el QR de la tarjeta del cliente con la cámara → abre esta página con el id.
- **Backend `Code.gs`:** nueva acción **`checkin`** (protegida con la clave) que suma 1 sello +
  10 gemas, guarda la visita, sube el `sync` (el teléfono del cliente lo adopta al reabrir) y
  evita duplicados en 90 s. ⚠️ **Toño debe RE-DESPLEGAR Code.gs** (nueva versión) para que la
  caja funcione; sin eso, todo lo demás (tarjeta, descarga, sitio, zonas) igual sirve.
- **SW** subido a `uc-v14` (+ qr.min.js en el caché).
- `sitio: 'https://elanillodelciclope.com'` agregado en contenido.js.

> **PRÓXIMO PASO:** (1) Publicar = `git add -A && git commit && git push` desde `universo-ciclope/`
> (Pages/Vercel redespliega). (2) Toño re-despliega `Code.gs` (para la caja). (3) Toño pone las
> **coordenadas exactas** de las 2 sucursales en `contenido.js → geoZonas`. NO se ha publicado aún.

---

### 📌 Historial de cierres
- **2026-07-30 — Cierre #1:** app completa en vivo con dominio propio, backend online,
  panel admin (métricas + editor + subir fotos), notificaciones, onboarding, referidos,
  juegos con logros, misiones calculadas, QR imprimible. Textos de notificaciones
  listos en `NOTIFICACIONES.md`. Pendiente inmediato: Toño pega los textos en OneSignal
  y pone su WhatsApp real.
