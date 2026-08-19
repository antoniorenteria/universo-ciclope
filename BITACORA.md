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

### 📌 Historial de cierres
- **2026-07-30 — Cierre #1:** app completa en vivo con dominio propio, backend online,
  panel admin (métricas + editor + subir fotos), notificaciones, onboarding, referidos,
  juegos con logros, misiones calculadas, QR imprimible. Textos de notificaciones
  listos en `NOTIFICACIONES.md`. Pendiente inmediato: Toño pega los textos en OneSignal
  y pone su WhatsApp real.
