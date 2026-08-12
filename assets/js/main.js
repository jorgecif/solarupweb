/* =========================================================================
   SolarUp — comportamiento del sitio
   Sin dependencias. Todo el contenido funciona sin JS; esto solo mejora.
   ========================================================================= */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* Datos de contacto en un solo lugar --------------------------------- */
  const WHATSAPP = '573166318848';
  const EMAIL    = 'comercial@solarupsas.com';

  /* Supuestos de la calculadora (validados contra los kits reales:
     2,88 kWp → 311 kWh/mes ⇒ 3,6 kWh por kWp al día). --------------------- */
  const KWH_POR_KWP_DIA   = 3.6;   // promedio Colombia, incluye pérdidas del sistema
  const DIAS_MES          = 30;
  const W_POR_PANEL       = 720;   // paneles usados en los kits SolarUp
  const M2_POR_KWP        = 4.5;   // 13 m² / 2,88 kWp
  const KG_CO2_POR_KWH    = 0.164; // factor de emisión del SIN colombiano (aprox.)
  const KG_CO2_POR_ARBOL  = 21;    // absorción anual de un árbol maduro (aprox.)
  const TOPE_AHORRO       = 0.95;  // la factura conserva cargos fijos de comercialización

  const nfCOP = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
  const nf1   = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

  const pesos  = n => '$' + nfCOP.format(Math.round(n));
  const digits = s => {
    const n = parseInt(String(s).replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  };
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));


  /* ── Header: estado al hacer scroll ────────────────────────────────── */
  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });


  /* ── Menú móvil ────────────────────────────────────────────────────── */
  const burger = $('#burger');
  const nav    = $('#nav');

  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('is-locked', open);
  };

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });


  /* ── Aparición progresiva de bloques ───────────────────────────────── */
  const revealables = $$('.reveal');
  const mostrarTodo = () => revealables.forEach(el => el.classList.add('is-in'));

  if ('IntersectionObserver' in window) {
    let disparado = false;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        disparado = true;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(el => io.observe(el));

    // Red de seguridad: si el observador nunca reporta nada (motor lento,
    // navegador raro), se muestra todo antes que dejar la página en blanco.
    setTimeout(() => { if (!disparado) mostrarTodo(); }, 2000);
  } else {
    mostrarTodo();
  }


  /* ── Enlace activo según la sección visible ────────────────────────── */
  const navLinks = $$('.nav__list a');
  const targets  = navLinks
    .map(a => ({ link: a, sec: $(a.getAttribute('href')) }))
    .filter(t => t.sec);

  if (targets.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const match = targets.find(t => t.sec === entry.target);
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('is-active'));
          match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t.sec));
  }


  /* ── Calculadora de ahorro ─────────────────────────────────────────── */
  const calc = $('#calcForm');
  if (calc) {
    const inFactura = $('#factura');
    const inRange   = $('#facturaRange');
    const inTarifa  = $('#tarifa');
    const out = {
      ahorroAnual: $('#rAhorroAnual'),
      ahorroMes:   $('#rAhorroMes'),
      potencia:    $('#rPotencia'),
      paneles:     $('#rPaneles'),
      generacion:  $('#rGeneracion'),
      area:        $('#rArea'),
      co2:         $('#rCo2'),
      arboles:     $('#rArboles'),
    };
    const waBtn = $('#calcWa');

    const RANGE_MIN = Number(inRange.min);
    const RANGE_MAX = Number(inRange.max);

    const pintarSlider = v => {
      const pct = ((clamp(v, RANGE_MIN, RANGE_MAX) - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100;
      inRange.style.setProperty('--fill', pct.toFixed(1) + '%');
    };

    const calcular = () => {
      const factura = clamp(digits(inFactura.value), 20000, 50000000);
      const tarifa  = clamp(digits(inTarifa.value), 200, 5000);
      const cober   = Number(($('input[name="cobertura"]:checked') || {}).value || 0.9);

      const consumoMes  = factura / tarifa;                       // kWh/mes
      const objetivo    = consumoMes * cober;                     // kWh/mes a cubrir
      const rendMes     = KWH_POR_KWP_DIA * DIAS_MES;             // kWh por kWp al mes
      const paneles     = Math.max(2, Math.round((objetivo / rendMes) * 1000 / W_POR_PANEL));
      const kWp         = (paneles * W_POR_PANEL) / 1000;
      const generacion  = kWp * rendMes;
      const area        = kWp * M2_POR_KWP;
      // El ahorro se topa en el 95% de la factura: los cargos fijos de
      // comercialización no desaparecen aunque el sistema cubra todo el consumo.
      // Se redondea al millar: es una estimación, y "$295.000" comunica mejor
      // que "$295.488" el grado de precisión real del cálculo.
      const ahorroMes   = Math.round(Math.min(generacion * tarifa, factura * TOPE_AHORRO) / 1000) * 1000;
      const co2Anual    = generacion * 12 * KG_CO2_POR_KWH;

      out.ahorroAnual.textContent = pesos(ahorroMes * 12);
      out.ahorroMes.textContent   = pesos(ahorroMes);
      out.potencia.textContent    = nf1.format(kWp) + ' kWp';
      out.paneles.textContent     = paneles + (paneles === 1 ? ' panel' : ' paneles');
      out.generacion.textContent  = nfCOP.format(generacion) + ' kWh';
      out.area.textContent        = nfCOP.format(Math.ceil(area)) + ' m²';
      out.co2.textContent         = nfCOP.format(co2Anual) + ' kg';
      out.arboles.textContent     = nfCOP.format(Math.round(co2Anual / KG_CO2_POR_ARBOL)) + ' árboles';

      const msg =
        `Hola SolarUp, usé la calculadora de la página web y me gustaría una cotización.\n\n` +
        `• Factura mensual: ${pesos(factura)}\n` +
        `• Tarifa estimada: ${pesos(tarifa)}/kWh\n` +
        `• Cobertura deseada: ${Math.round(cober * 100)}%\n` +
        `• Sistema sugerido: ${nf1.format(kWp)} kWp (${paneles} paneles de ${W_POR_PANEL} W)\n` +
        `• Generación estimada: ${nfCOP.format(generacion)} kWh/mes\n` +
        `• Ahorro estimado: ${pesos(ahorroMes)}/mes`;
      waBtn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

      pintarSlider(factura);
    };

    // Texto → cálculo (y sincroniza el deslizador)
    inFactura.addEventListener('input', () => {
      const v = digits(inFactura.value);
      inRange.value = clamp(v, RANGE_MIN, RANGE_MAX);
      calcular();
    });
    inFactura.addEventListener('blur', () => {
      const v = clamp(digits(inFactura.value), 20000, 50000000);
      inFactura.value = nfCOP.format(v);
      calcular();
    });

    // Deslizador → texto
    inRange.addEventListener('input', () => {
      inFactura.value = nfCOP.format(Number(inRange.value));
      calcular();
    });

    inTarifa.addEventListener('input', calcular);
    inTarifa.addEventListener('blur', () => {
      inTarifa.value = nfCOP.format(clamp(digits(inTarifa.value), 200, 5000));
      calcular();
    });

    $$('input[name="cobertura"]', calc).forEach(r => r.addEventListener('change', calcular));
    calc.addEventListener('submit', e => e.preventDefault());

    calcular();
  }


  /* ── Formulario de contacto ────────────────────────────────────────── */
  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');

    const leer = () => ({
      nombre:   $('#f-nombre').value.trim(),
      telefono: $('#f-tel').value.trim(),
      email:    $('#f-email').value.trim(),
      ciudad:   $('#f-ciudad').value.trim(),
      tipo:     $('#f-tipo').value,
      factura:  $('#f-factura').value,
      mensaje:  $('#f-msg').value.trim(),
    });

    const avisar = (texto, tipo) => {
      status.textContent = texto;
      status.classList.remove('is-ok', 'is-err');
      if (tipo) status.classList.add(tipo);
    };

    const validar = d => {
      if (!d.nombre)   { avisar('Por favor escribe tu nombre.', 'is-err'); $('#f-nombre').focus(); return false; }
      if (!d.telefono) { avisar('Necesitamos un celular o WhatsApp para contactarte.', 'is-err'); $('#f-tel').focus(); return false; }
      return true;
    };

    const componer = d =>
      `Hola SolarUp, quiero una cotización.\n\n` +
      `• Nombre: ${d.nombre}\n` +
      `• Celular: ${d.telefono}\n` +
      (d.email  ? `• Correo: ${d.email}\n` : '') +
      (d.ciudad ? `• Ciudad: ${d.ciudad}\n` : '') +
      `• Tipo de proyecto: ${d.tipo}\n` +
      `• Factura mensual aprox.: ${d.factura}` +
      (d.mensaje ? `\n\n${d.mensaje}` : '');

    // Envío por WhatsApp
    $('#btnWa').addEventListener('click', () => {
      const d = leer();
      if (!validar(d)) return;
      avisar('Abriendo WhatsApp con tu mensaje…', 'is-ok');
      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(componer(d))}`, '_blank', 'noopener');
    });

    // Envío por correo (Formspree si está configurado; si no, cliente de correo).
    // El estado se deduce del atributo action: no hay nada más que sincronizar.
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const d = leer();
      const configurado = form.action.includes('formspree.io/f/')
                       && !form.action.includes('TU_ID_FORMSPREE');

      if (!configurado) {
        if (!validar(d)) return;
        avisar('Abriendo tu cliente de correo…', 'is-ok');
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Solicitud de cotización — ' + d.nombre)}&body=${encodeURIComponent(componer(d))}`;
        return;
      }

      if (!validar(d)) return;

      const btn = $('#btnMail');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Enviando…';
      avisar('');

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('respuesta ' + res.status);
        form.reset();
        avisar('¡Gracias! Recibimos tu solicitud y te contactaremos muy pronto.', 'is-ok');
      } catch {
        avisar(`No pudimos enviar el formulario. Escríbenos a ${EMAIL} o por WhatsApp.`, 'is-err');
      } finally {
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }


  /* ── Lightbox de galería ───────────────────────────────────────────── */
  const lb        = $('#lightbox');
  const lbStage   = $('#lightboxStage');
  const lbCaption = $('#lightboxCaption');
  const lbClose   = $('.lightbox__close', lb);
  let lastFocus = null;

  const abrirLb = (html, caption) => {
    lbStage.innerHTML = html;
    lbCaption.textContent = caption || '';
    lb.hidden = false;
    document.body.classList.add('is-locked');
    lbClose.focus();
  };

  const cerrarLb = () => {
    const vid = $('video', lbStage);
    if (vid) vid.pause();
    lb.hidden = true;
    lbStage.innerHTML = '';
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  };

  $$('.gitem').forEach(item => {
    item.addEventListener('click', () => {
      lastFocus = item;
      const caption = item.dataset.caption || '';
      const video   = item.dataset.video;

      if (video) {
        const poster = $('img', item).getAttribute('src');
        abrirLb(
          `<video src="${video}" poster="${poster}" controls autoplay playsinline preload="metadata"></video>`,
          caption
        );
      } else {
        const alt = ($('img', item) || {}).alt || caption;
        abrirLb(`<img src="${item.dataset.full}" alt="${alt.replace(/"/g, '&quot;')}">`, caption);
      }
    });
  });

  lbClose.addEventListener('click', cerrarLb);
  lb.addEventListener('click', e => { if (e.target === lb) cerrarLb(); });

  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') { cerrarLb(); return; }
    if (e.key !== 'Tab') return;

    // Foco confinado al diálogo, pero permitiendo recorrer los controles
    // del video: sin esto el teclado no podría reproducirlo.
    const focusables = $$('button, [href], video[controls], [tabindex]:not([tabindex="-1"])', lb);
    if (!focusables.length) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });


  /* ── Detalles varios ───────────────────────────────────────────────── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
