# SolarUp — sitio web

Sitio estático de **Solar Up SAS** (sistemas solares fotovoltaicos, Colombia).
HTML, CSS y JavaScript puros: **no hay que compilar nada**. Se publica subiendo los archivos tal cual.

---

## 1. Publicar

El repositorio es **[jorgecif/solarupweb](https://github.com/jorgecif/solarupweb)** y GitHub Pages
ya está activo, sirviendo la rama `main` desde la raíz. Para publicar cambios basta con:

```bash
git add . && git commit -m "Actualiza contenido" && git push
```

Cada push dispara un despliegue; en 1–2 minutos está en línea.

### Direcciones

| | |
|---|---|
| Dominio propio | `https://solarupsas.com` (definido en el archivo `CNAME`) |
| Dirección de GitHub | `https://jorgecif.github.io/solarupweb/` |

> **No borres el archivo `CNAME`.** Es lo que mantiene el dominio propio; si desaparece
> de la rama publicada, el sitio vuelve a la dirección `github.io`.

### DNS del dominio

Para que `solarupsas.com` apunte a GitHub Pages, estos registros deben existir
en el panel del dominio:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `jorgecif.github.io` |

Cuando el DNS propague, activa **Enforce HTTPS** en Settings → Pages.

> Mientras el dominio propio no resuelva, el sitio se ve en `jorgecif.github.io/solarupweb/`
> y todo funciona salvo `404.html`, que usa rutas absolutas y solo se ve completo
> desde la raíz del dominio.

## 2. Cosas que debes revisar antes de publicar

| Qué | Dónde | Nota |
|---|---|---|
| **Número de WhatsApp** | `assets/js/main.js` (const `WHATSAPP`) y los `wa.me/` de `index.html` | Está puesto **573166318848** (316 631 8848). Verifica que ese sea el que recibe WhatsApp. |
| **Formulario por correo** | `index.html`, atributo `action` del `<form id="contactForm">` | Ver punto 3. |
| **Dominio en los metadatos** | `index.html` (`canonical`, `og:url`, JSON-LD), `sitemap.xml`, `robots.txt` | Cambia `https://solarupsas.com/` si usas otra URL. |

Buscar y reemplazar el número en todo el proyecto:

```bash
grep -rn "573166318848" index.html assets/js/main.js
```

---

## 3. Envío del formulario por correo (Formspree)

GitHub Pages no tiene servidor, así que el formulario usa [Formspree](https://formspree.io).

**Ya está configurado** con el formulario `mppadelj`, que entrega en `comercial@solarupsas.com`.
El identificador vive en un único sitio, el atributo `action` de `index.html`:

```html
<form class="form reveal" id="contactForm" action="https://formspree.io/f/mppadelj" method="POST">
```

Para cambiar de cuenta o de formulario, reemplaza solo ese ID. Si lo dejas como
`TU_ID_FORMSPREE`, el JavaScript lo detecta y el botón vuelve a abrir el gestor de
correo del visitante en lugar de enviar por AJAX.

> El ID de Formspree es público por diseño: va en el HTML de cualquier sitio que lo use.
> No es una credencial y no hay problema en versionarlo.

**En el panel de Formspree, revisa dos ajustes** (son la causa habitual de que un
formulario "no llegue"):

- **reCAPTCHA desactivado.** Si está activo, el envío por AJAX se queda esperando un
  desafío que la página nunca muestra. El honeypot `_gotcha` que ya trae el formulario
  cubre el spam básico.
- **Dominios permitidos.** Si restringes por dominio, incluye tanto
  `jorgecif.github.io` como `solarupsas.com`.

Los campos llegan al correo con estos nombres: `nombre`, `telefono`, `email`, `ciudad`,
`tipo`, `factura` y `mensaje`. El campo `email` lo usa Formspree como *responder a*,
así que puedes contestar directamente desde tu bandeja.

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
