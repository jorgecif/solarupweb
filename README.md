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
assets/js/main.js       Menú, calculadora, videos, visor, formulario
assets/img/             Imágenes optimizadas en WebP
assets/img/equipo/      Fotos del equipo técnico y de los equipos instalados
assets/video/           Video de fondo del hero y video del equipo
assets/video/proyectos/ Un clip y su portada por cada instalación
assets/icons/           Favicons
.claude/devserver.py    Servidor local sin caché (ver punto 6)
Info SolarUp/           Material original (excluido del repo por .gitignore)
```

Secciones, en orden: hero · franja de confianza · **proyectos** · servicios ·
soluciones · calculadora · beneficios · proceso · **equipo** · preguntas · contacto.

**Colores de marca** (muestreados del logotipo original), definidos en `:root`:

| Token | Valor |
|---|---|
| `--sun` | `#FED317` |
| `--sun-deep` | `#DCB20D` |
| `--ink` | `#08080A` |

---

## 4b. Proyectos y videos

Cada tarjeta de proyecto vive en `index.html` dentro de `.pjs`. Para añadir una
instalación nueva basta con copiar un `<article class="pj">` y cambiar tres cosas:

```html
<button class="pj__media" type="button"
        data-video="assets/video/proyectos/MUNICIPIO-DEPARTAMENTO.mp4"
        data-caption="Texto que aparece bajo el video ampliado">
  <img src="assets/video/proyectos/MUNICIPIO-DEPARTAMENTO.webp" alt="…">
  <span class="pj__lugar">… Municipio · <b>Departamento</b></span>
```

La etiqueta `.pj__lugar` es la que muestra la ubicación sobre el video y se mantiene
visible durante la reproducción.

**Para añadir potencia y tipo de sistema** a una tarjeta que aún no los tiene, se
copia el bloque `.pj__pie` de la tarjeta destacada (Los Andes) y se ajustan los
valores. Sin ese bloque, la tarjeta muestra solo la ubicación.

**Cómo se comportan los videos.** Con `preload="none"` implícito: la página solo
descarga la imagen de portada. El clip se pide cuando el visitante pasa el cursor
por encima (escritorio) o toca la tarjeta (móvil). Quien no interactúe con ningún
proyecto no descarga ni un byte de video.

**Preparar un clip nuevo** desde el original:

```bash
ffmpeg -i original.mp4 -an -vf scale=960:-2 -c:v libx264 -profile:v main -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart salida.mp4
```

```bash
ffmpeg -ss 3 -i original.mp4 -frames:v 1 -vf scale=960:-2 portada.png
```

`-an` quita el audio: son tomas de dron y la reproducción automática exige silencio
de todas formas. Un clip de 10 s queda en torno a 900 KB.

### El video de fondo del hero

Solo se carga en pantallas de 1024 px o más, y nunca si el navegador pide reducir el
movimiento o el sistema tiene el ahorro de datos activo. En móvil se ve únicamente la
imagen de portada.

**Va a cámara lenta, y esa lentitud está horneada en el archivo.** No la reduzcas con
`playbackRate`: el navegador no inventa fotogramas, solo mantiene cada uno más tiempo,
así que un video de 30 fps a `0.5` se ve a 15 fps y el movimiento salta. La cámara
lenta se genera interpolando fotogramas nuevos, de modo que el archivo son 40 s a
30 fps reales que se reproducen a velocidad normal:

```bash
ffmpeg -i VideoGeneral.mp4 -an -vf "scale=1024:-2,setpts=2.0*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -c:v libx264 -profile:v main -crf 34 -preset slow -pix_fmt yuv420p -movflags +faststart assets/video/hero-solarup.mp4
```

`setpts=2.0*PTS` duplica la duración y `minterpolate` rellena los huecos con
fotogramas intermedios calculados por movimiento. Tarda varios minutos.
La constante `HERO_VELOCIDAD` de `main.js` debe quedarse en `1`.

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
python .claude/devserver.py
```

Luego abre `http://localhost:4173`.

Es `http.server` con las cabeceras de caché desactivadas. Con el servidor estándar de
Python el navegador se queda con el CSS y el JS en memoria y sigue mostrando la versión
anterior aunque el archivo haya cambiado, lo que hace perder tiempo depurando cambios
que en realidad ya estaban aplicados.

> Lo mismo pasa en producción, pero con un límite de 10 minutos: tras publicar,
> revisa siempre con **Ctrl + Shift + R** o esperarás a que expire la caché.
