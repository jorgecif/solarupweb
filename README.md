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

## 3. Envío del formulario por correo

GitHub Pages no tiene servidor, así que el formulario usa un servicio externo:
**[Web3Forms](https://web3forms.com)** (gratuito, sin límite mensual, sin cuenta que crear).

### Configuración

**Ya está configurado** y entrega en `comercial@solarupsas.com`. La clave vive en un
campo oculto de `index.html`:

```html
<input type="hidden" name="access_key" value="c166444f-...">
```

Para cambiar el destino, saca una clave nueva en [web3forms.com](https://web3forms.com)
con el correo que quieras y reemplaza ese valor.

Ese campo es el **único punto de configuración**. Si lo dejas como `TU_CLAVE_WEB3FORMS`,
el JavaScript lo detecta y el botón *Enviar por correo* abre el gestor de correo del
visitante en lugar de enviar; así la página nunca finge un envío que no ocurrió.

> La clave es pública por diseño, igual que el ID de Formspree: va en el HTML de
> cualquier sitio que use el servicio. No es una credencial.

### Por qué no se usa Formspree

Se configuró primero con Formspree (formulario `mppadelj`) y **su filtro antispam
archivaba todos los envíos legítimos**, incluidos los hechos desde el dominio real
con datos verosímiles y después de marcar los anteriores como *Not spam*.

La API respondía `200 {"ok":true}` en cada intento: el rechazo ocurría después, sin
avisar por la respuesta, así que no hay forma de detectarlo desde la web. Descartado
el campo trampa como causa, se migró de servicio.

Si algún día quieres volver, basta con reponer el `action` y los campos `_subject`
y `_gotcha`; el manejador de respuestas ya entiende las dos convenciones
(`{success:false}` de Web3Forms y `{errors:[…]}` de Formspree).

### Campos

Llegan al correo como `nombre`, `telefono`, `email`, `ciudad`, `tipo`, `factura`
y `mensaje`. El campo `email` se usa como *responder a*, así que puedes contestar
directamente desde tu bandeja.

El formulario incluye una casilla trampa (`botcheck`) oculta: si llega marcada, el
servicio descarta el envío. Es una casilla y no un campo de texto precisamente para
que ningún autocompletado del navegador la rellene por accidente.

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
