# SolarUp — sitio web

Sitio estático de **Solar Up SAS** (sistemas solares fotovoltaicos, Colombia).
HTML, CSS y JavaScript puros: **no hay que compilar nada**. Se publica subiendo los archivos tal cual.

---

## 1. Publicar en GitHub Pages

### Primera vez

1. Crea un repositorio nuevo en GitHub (por ejemplo `solarup-web`), **público**.
2. Desde esta carpeta:

```bash
git init -b main
```

```bash
git add . && git commit -m "Sitio web SolarUp"
```

```bash
git remote add origin https://github.com/TU_USUARIO/solarup-web.git && git push -u origin main
```

3. En GitHub: **Settings → Pages → Build and deployment**
   - *Source*: `Deploy from a branch`
   - *Branch*: `main` · carpeta `/ (root)` → **Save**
4. En 1–2 minutos el sitio queda en `https://TU_USUARIO.github.io/solarup-web/`

### Actualizaciones posteriores

```bash
git add . && git commit -m "Actualiza contenido" && git push
```

### Dominio propio (solarupsas.com)

1. En **Settings → Pages → Custom domain** escribe `solarupsas.com` y guarda.
2. En el panel de tu dominio crea estos registros DNS:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `TU_USUARIO.github.io` |

3. Cuando el DNS propague, activa **Enforce HTTPS**.

> Si publicas en un subdirectorio (`usuario.github.io/solarup-web/`), el sitio funciona igual:
> todas las rutas son relativas. La única excepción es `404.html`, que usa rutas absolutas
> y solo se ve bien con dominio propio.

---

## 2. Cosas que debes revisar antes de publicar

| Qué | Dónde | Nota |
|---|---|---|
| **Número de WhatsApp** | `assets/js/main.js` (const `WHATSAPP`) y los `wa.me/` de `index.html` | Está puesto **573237255414** (323 725 5414). Verifica que ese sea el que recibe WhatsApp. |
| **Formulario por correo** | `index.html`, atributo `action` del `<form id="contactForm">` | Ver punto 3. |
| **Dominio en los metadatos** | `index.html` (`canonical`, `og:url`, JSON-LD), `sitemap.xml`, `robots.txt` | Cambia `https://solarupsas.com/` si usas otra URL. |

Buscar y reemplazar el número en todo el proyecto:

```bash
grep -rn "573237255414" index.html assets/js/main.js
```

---

## 3. Activar el envío del formulario por correo

GitHub Pages no tiene servidor, así que el formulario necesita un servicio externo.
**Mientras no lo configures el sitio funciona igual**: el botón *Enviar por correo* abre el
gestor de correo del visitante con el mensaje ya escrito, y *Enviar por WhatsApp* funciona siempre.

Para que los envíos lleguen solos a `comercial@solarupsas.com`:

1. Crea una cuenta gratuita en [formspree.io](https://formspree.io) y un formulario nuevo con ese correo.
2. Te darán un ID como `xayzqwer`.
3. En `index.html` reemplaza **las dos apariciones** de `TU_ID_FORMSPREE`:

```html
<form ... action="https://formspree.io/f/xayzqwer" data-formspree-id="xayzqwer">
```

El JavaScript detecta solo que ya está configurado y pasa a enviar por AJAX, mostrando
mensajes de éxito o error dentro de la misma página.

---

## 4. Estructura

```
index.html              Toda la página (una sola vista con anclas)
404.html                Página de error
assets/css/styles.css   Estilos, con los tokens de marca al inicio
assets/js/main.js       Menú, calculadora, galería, formulario
assets/img/             Imágenes optimizadas en WebP
assets/video/           Reel comprimido (8 MB → 1,7 MB) + su miniatura
assets/icons/           Favicons
Info SolarUp/           Material original (excluido del repo por .gitignore)
```

**Colores de marca** (muestreados del logotipo original), definidos en `:root`:

| Token | Valor |
|---|---|
| `--sun` | `#FED317` |
| `--sun-deep` | `#DCB20D` |
| `--ink` | `#08080A` |

---

## 5. La calculadora de ahorro

Los supuestos están al inicio de `assets/js/main.js` y son fáciles de ajustar:

| Constante | Valor | De dónde sale |
|---|---|---|
| `KWH_POR_KWP_DIA` | 3,6 | Calibrado con el kit real de SolarUp: 2,88 kWp → 311 kWh/mes |
| `W_POR_PANEL` | 720 | Paneles usados en los kits |
| `M2_POR_KWP` | 4,5 | 13 m² / 2,88 kWp |
| `KG_CO2_POR_KWH` | 0,164 | Factor de emisión aproximado del SIN colombiano |
| `TOPE_AHORRO` | 0,95 | La factura conserva cargos fijos de comercialización |

Con la tarifa por defecto ($950/kWh) y una factura de $350.000, la calculadora sugiere
**2,9 kWp / 4 paneles / 311 kWh mes** — exactamente el Kit On Grid real. Si cambias de
proveedor de paneles, actualiza `W_POR_PANEL`.

---

## 6. Ver el sitio en local

```bash
python -m http.server 4173
```

Luego abre `http://localhost:4173`. (Abrir `index.html` con doble clic también funciona,
pero algunas cosas se comportan mejor sobre `http://`.)
