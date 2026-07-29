# 🔭 Universo Cíclope

### El hub digital de El Anillo del Cíclope — misiones, juegos y lore, en el teléfono de cada explorador.

> *"El restaurante es solo una parte del Universo Cíclope. La app es donde ese universo sigue vivo todos los días."*
> — Documento Maestro de Producto v1.0

---

## 1. Qué es

Una **PWA** (web instalable, sin tiendas de apps) que el cliente abre desde
**su propio teléfono** con un QR en la sucursal — o pidiendo el link por WhatsApp.

**No hay registro.** El explorador entra y ya existe. Puede:
- **Jugar** (La Gema Mágica, El Ojo del Cíclope) sin dar un solo dato.
- **Explorar** el Archivo (el lore de Mirano, desbloqueable).
- **Unirse a la Expedición**: sellar visitas, cumplir misiones, ganar recompensas.

Si quiere conservar y presumir su progreso, se pone un apodo. Nunca es obligatorio.

| | |
|---|---|
| **Sellos** | Se ganan viniendo (folio del ticket). Suben de **rango**. |
| **Puntos** | Se ganan jugando y visitando. Compran **recompensas**. |
| **Rango** | Solo se compra con visitas. Desbloquea premios grandes y lore. |

> **La regla que protege tu margen:** la Crepiburger exige rango Cazador (8 sellos).
> Nadie farmea premios desde su casa jugando.

---

## 2. Probarlo ahora

En una terminal, dentro de esta carpeta:

```bash
python -m http.server 8722
```

Y abre **http://localhost:8722/** (ábrelo también desde el celular en la misma
red cambiando `localhost` por la IP de tu compu).

> **Modo demo:** los folios se validan de mentiras (escribe cualquier cosa
> tipo `A-1042`) para sentir la experiencia completa antes de conectar Loyverse.

---

## 3. Cómo cambiar el contenido — SIN tocar código

Todo lo editorial vive en **`assets/js/contenido.js`**. Ese es tu panel de control:

| Quiero… | Qué hago en `contenido.js` |
|---|---|
| Cambiar el Hero (la gran noticia) | edito el bloque `hero` |
| Publicar una novedad | copio una tarjeta en `novedades` |
| Encender / apagar una promo | `activo: true` ↔ `activo: false` |
| Agregar una entrada al Archivo (lore) | añado un objeto a `archivo` |
| Definir cuándo se desbloquea | `desbloqueo: {sellos: 8}` o `{mision:'racha'}` |
| Activar / ocultar un juego | `activo: true` ↔ `false` en `juegos` |

Las **misiones** de la Expedición viven en **`assets/js/reglas.js`** (igual que
en la Bitácora original): son *conductas*, no promociones. **Nada caduca solo.**

---

## 4. Lo que TÚ debes rellenar antes de lanzar

| # | Dónde | Qué |
|---|---|---|
| 1 | `contenido.js → whatsapp.numero` | Tu número real de WhatsApp con lada país (ej. `52771...`). |
| 2 | `contenido.js → compartir.enlaceGoogle` | El link directo de reseña de Google (ya tienes el QR: `EADC - Qr reseña google.png`). |
| 3 | `reglas.js → ojo-testigo.enlace` | El mismo link de reseña. |
| 4 | `contenido.js → compartir.instagram / tiktok` | Verifica que los @ sean correctos. |
| 5 | `reglas.js → pocion.costo` | Único premio sin costo verificado (marcado `pendiente`). |

---

## 5. Publicarlo (el link en línea)

Es una carpeta 100% estática: sirve tal cual en cualquier hosting.

**Opción rápida (Vercel, la que ya usas):**
1. Entra a [vercel.com](https://vercel.com) → *Add New → Project*.
2. Arrastra la carpeta `universo-ciclope/` (o conéctala a un repo de GitHub,
   igual que `la-gema-magica`).
3. Vercel te da un link tipo `universo-ciclope.vercel.app`.
4. Apunta un subdominio bonito desde Namecheap:
   **`universo.elanillodelciclope.com`**.

Ese link es el que va en el **QR de las sucursales** y el que tu WhatsApp
responde automáticamente.

---

## 6. WhatsApp automatizado

La idea: la gente escribe al WhatsApp del restaurante y la IA de tu teléfono
responde con el link. Configura esta respuesta automática:

> 🔭 *¡Bienvenido al Universo Cíclope!*
> Entra aquí para jugar, cumplir misiones y descubrir el lore de Mirano:
> **https://universo.elanillodelciclope.com**
> No necesitas registrarte. Solo toca el ojo. 👁️

---

## 7. Conectar Loyverse (fase 2)

Hoy `assets/js/estado.js` termina con un bloque `BACKEND` con `simulado:true`.
**Ese bloque es lo único que cambia.** Ni una línea de la interfaz se toca.

Mismo patrón que ya usas en El Ojo Maestro:
1. **Pie de recibo en Loyverse:** `🔦 Tu expedición continúa: universo.elanillodelciclope.com`
2. **Token de API** de Loyverse → se guarda en **Apps Script** (servidor), nunca aquí.
3. Apps Script recibe el folio y verifica 4 cosas: existe, es de hoy/ayer,
   monto ≥ consumo mínimo, y **nadie lo reclamó antes** (esto mata el fraude).
4. En `estado.js`: `BACKEND.simulado = false` y pon el `endpoint`.

---

## 8. Estructura

```
universo-ciclope/
├── index.html              El shell del hub (gate + nav + secciones)
├── manifest.webmanifest    PWA (instalable)
├── sw.js                   Service worker (carga offline)
├── LEEME.md                Esto
├── juegos/
│   ├── gema-magica.html    La Gema Mágica (módulo independiente)
│   └── ojo-ciclope.html    El Ojo del Cíclope (módulo independiente)
└── assets/
    ├── css/universo.css    Diseño (tokens de la marca, sin inventar nada)
    ├── js/contenido.js     ← TU PANEL: hero, novedades, archivo, promos, juegos
    ├── js/reglas.js        ← Las misiones y la economía (conductas)
    ├── js/estado.js        Perfil del explorador + bloque BACKEND
    ├── js/app.js           Motor de la app (no se toca)
    ├── fonts/              ITC Serif Gothic
    └── img/                Isotipo, logo, Mirano
```

---

## 9. Decisiones de diseño (del Documento Maestro)

- **El usuario es "Explorador", nunca "cliente".** Su perfil es una *Ficha de Explorador*.
- **Nunca se siente como app de restaurante.** Se siente como Nintendo × Pokémon GO × Steam, bajo la marca del Anillo.
- **Máximo 3 toques** a cualquier función. Nav abajo, al alcance del pulgar. Áreas táctiles ≥46px.
- **Los mismos tokens** de la marca (`oklch`, ITC Serif Gothic, Poppins, VT323, el notch de las esquinas).
- **Gamificación invisible:** el explorador no siente que trabaja, siente que descubre.
- **Motor modular de juegos:** agregar un juego nuevo = subir su `.html` y una tarjeta en `contenido.js`.
- **El Archivo nunca muestra todo:** lo bloqueado se ve en silueta con candado. Eso engancha.
- **Reseñas:** primero preguntamos "¿cómo estuvo tu expedición?". Solo las de 4-5★ van a Google; las bajas abren WhatsApp.
- **Accesibilidad:** foco visible, `prefers-reduced-motion`, roles ARIA, salto al contenido, alto contraste.

---

## 10. Verificado (móvil 375×812)

- ✅ Gate → Inicio (hero, novedades, accesos, nave)
- ✅ Las 5 pestañas renderizan sin error
- ✅ Sellado: folio válido, **folio repetido rechazado**, sello doble entre semana
- ✅ Primer Contacto se cumple sola y paga
- ✅ Crepiburger bloqueada por rango aunque sobren puntos
- ✅ Los dos juegos abren en el visor y cierran limpio
- ✅ Archivo se desbloquea al subir de sellos; ficha de lore abre
- ✅ PWA: service worker registrado, manifest válido, instalable
- ✅ Cero errores en consola
```
```
