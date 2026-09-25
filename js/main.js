/* ==========================================================================
   #CAFFIENATION — BROADCAST CONTROL
   ========================================================================== */
(function () {
  'use strict';

  window.__cfnReady = true;

  const DATA = window.CFN || {};
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionOK = () => !reduceMQ.matches;
  const CYAN = '98,216,255';
  const BLUE = '50,130,255';

  // "[REDACTED]" in data renders as a black bar.
  const val = (v) => (v === '[REDACTED]' ? '<span class="redact">REDACTED</span>' : esc(v));

  /* ------------------------------------------------------------------------
     RENDER — Situation Room
     ------------------------------------------------------------------------ */
  const VERDICT_NO = /REJECT|PROTEST|HIGH RISK|RISKY|SUSPICIOUS/;
  const VERDICT_YES = /PREFER|DEMAND|RECOMMEND|REQUIRED/;

  function renderSituationRoom() {
    const fronts = DATA.situationRoom || [];
    const items = fronts.flatMap((f) => f.items);
    const count = (fn) => items.filter(fn).length;
    const resolved = (i) => i.status === 'RESOLVED' || !!i.position;

    const board = $('[data-board]');
    if (board) {
      const cells = [
        [items.length, 'Decision branches', ''],
        [count((i) => i.status === 'PRIORITY' && !resolved(i)), 'Priority', ''],
        [count((i) => i.status === 'CONTESTED' && !resolved(i)), 'Contested', 'board__cell--red'],
        [count((i) => i.status === 'OPEN' && !resolved(i)), 'Open', ''],
        [count(resolved), 'Resolved', '']
      ];
      board.innerHTML = cells.map(([n, l, c]) =>
        `<div class="board__cell ${c}"><span class="board__n">${String(n).padStart(2, '0')}</span><span class="label">${l}</span></div>`
      ).join('');
    }

    const root = $('[data-fronts]');
    if (!root) return;
    root.innerHTML = fronts.map((f) => `
      <div class="front">
        <p class="front__head"><b>FRONT ${esc(f.front)}</b> ${esc(f.name)}</p>
        <div class="front__grid">
          ${f.items.map(intelCard).join('')}
        </div>
      </div>`).join('');
  }

  function intelCard(i) {
    const status = i.position ? 'RESOLVED' : i.status;
    const chip = { PRIORITY: 'chip--priority', CONTESTED: 'chip--contested', RESOLVED: 'chip--resolved' }[status] || '';
    const opts = (i.options || []).map((o) => {
      const cls = VERDICT_NO.test(o.verdict) ? 'v--no' : VERDICT_YES.test(o.verdict) ? 'v--yes' : '';
      return `<li><span>${esc(o.label)}</span><span class="v ${cls}">${esc(o.verdict)}</span></li>`;
    }).join('');
    const position = i.position
      ? `COMMITTEE POSITION: <b>${esc(i.position)}</b>`
      : 'COMMITTEE POSITION: PENDING <span class="redact">██████████</span>';
    return `
      <details class="intel panel reveal">
        <summary>
          <span class="intel__top"><span class="intel__code">${esc(i.code)}</span><span class="chip ${chip}">${esc(status)}</span></span>
          <span class="intel__title">${esc(i.title)}</span>
          <span class="intel__q">${esc(i.question)}</span>
          <span class="intel__open">
            <span class="open">OPEN INTELLIGENCE →</span><span class="close">CLOSE FILE ×</span>
            <span class="pos">${i.position ? 'DECIDED' : 'POSITION PENDING'}</span>
          </span>
        </summary>
        <div class="intel__body">
          <h4>Field intelligence</h4>
          <ul class="intel__list">${(i.intel || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${opts ? `<h4>Options on the table</h4><ul class="intel__opts">${opts}</ul>` : ''}
          <p class="intel__position">${position}</p>
        </div>
      </details>`;
  }

  /* ------------------------------------------------------------------------
     RENDER — Field Calculator
     ------------------------------------------------------------------------ */
  const CALC_FIELDS = [
    ['staff', 'Staff in office (peak day)', 'people', 1],
    ['drinks', 'Drinks per person / day', 'cups', 0.1],
    ['machines', 'Number of machines', 'units', 1],
    ['days', 'Office days / month', 'days', 1],
    ['rush', 'Rush: people in same 15 min', 'people', 1],
    ['seconds', 'Time per drink', 'sec', 1],
    ['beanPrice', 'Bean price', '£/kg', 0.5],
    ['grams', 'Coffee per drink', 'g', 0.5],
    ['milkShare', 'Drinks with milk', '%', 1],
    ['milkMl', 'Milk per milk drink', 'ml', 10],
    ['milkPrice', 'Milk price', '£/litre', 0.05],
    ['fixed', 'Rental / service', '£/month', 5],
    ['consumables', 'Consumables', '£/month', 5]
  ];

  function renderCalculator() {
    const form = $('[data-calc]');
    const fieldsEl = $('[data-calc-fields]');
    const out = $('[data-calc-out]');
    if (!form || !fieldsEl || !out) return;
    const defaults = (DATA.config && DATA.config.calculator) || {};

    fieldsEl.innerHTML = CALC_FIELDS.map(([k, label, unit, step]) => `
      <div class="calc__field">
        <label for="calc-${k}">${esc(label)}</label>
        <div class="in"><input id="calc-${k}" name="${k}" type="number" inputmode="decimal" min="0" step="${step}" value="${esc(defaults[k] != null ? defaults[k] : 0)}"><span class="u">${esc(unit)}</span></div>
      </div>`).join('');

    const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
    const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
    const num = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

    function update() {
      const v = {};
      CALC_FIELDS.forEach(([k]) => { v[k] = Math.max(0, parseFloat(form.elements[k].value) || 0); });
      const machines = Math.max(1, Math.round(v.machines));
      const daily = v.staff * v.drinks;
      const perMachine = Math.ceil((daily * 1.3) / machines);
      const monthly = daily * v.days;
      const beans = monthly * (v.grams / 1000) * v.beanPrice;
      const milk = monthly * (v.milkShare / 100) * (v.milkMl / 1000) * v.milkPrice;
      const fixed = v.fixed + v.consumables;
      const total = beans + milk + fixed;
      const perCup = monthly > 0 ? total / monthly : 0;
      const waitMin = (Math.ceil(v.rush / machines) * v.seconds) / 60;
      const perPerson = v.staff > 0 ? total / v.staff : 0;

      let verdict = 'ACCEPTABLE';
      let hot = false;
      if (waitMin > 8) { verdict = 'RIOT CONDITIONS'; hot = true; }
      else if (waitMin > 3) { verdict = 'TENSIONS RISING'; }

      const per = (x) => (monthly > 0 ? gbp.format(x / monthly) : '—');
      out.innerHTML = `
        <div class="readout"><span class="label">Peak-day demand</span><span class="readout__v">${num.format(daily)} drinks</span><span class="readout__s">${num.format(v.staff)} people × ${v.drinks} drinks</span></div>
        <div class="readout"><span class="label">Minimum rated capacity</span><span class="readout__v">${num.format(perMachine)} / day</span><span class="readout__s">per machine, incl. 30% headroom (${machines} machine${machines > 1 ? 's' : ''})</span></div>
        <div class="readout ${hot ? 'readout--hot' : 'readout--ok'}"><span class="label">Last in the 09:00 queue waits</span><span class="readout__v">${waitMin < 1 ? '< 1' : waitMin.toFixed(1)} min</span><span class="readout__s">Threat assessment: <span class="verdict">${verdict}</span></span></div>
        <div class="readout"><span class="label">Cost per cup</span><span class="readout__v">${monthly > 0 ? gbp.format(perCup) : '—'}</span><span class="readout__s">beans ${per(beans)} · milk ${per(milk)} · fixed ${per(fixed)}</span></div>
        <div class="readout"><span class="label">Monthly war chest</span><span class="readout__v">${gbp0.format(total)}</span><span class="readout__s">${num.format(monthly)} drinks/month · ${gbp.format(perPerson)} per person</span></div>`;
    }

    form.addEventListener('input', update);
    form.addEventListener('reset', () => setTimeout(update, 0));
    update();
  }

  /* ------------------------------------------------------------------------
     RENDER — Intelligence Files
     ------------------------------------------------------------------------ */
  const THREAT = ['', 'MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'SEVERE'];

  function threatMeter(n) {
    n = clamp(Math.round(n || 0), 0, 5);
    let bars = '';
    for (let i = 1; i <= 5; i++) bars += `<i class="${i <= n ? 'on' : ''}"></i>`;
    return `<span class="threat ${n >= 4 ? 'threat--hi' : ''}" aria-hidden="true">${bars}</span>${THREAT[n] || 'UNKNOWN'}`;
  }

  function renderDossiers() {
    const root = $('[data-dossiers]');
    const list = DATA.dossiers || [];
    if (!root) return;
    root.innerHTML = list.map((d, idx) => `
      <article class="dossier panel reveal" data-type="${esc(d.type || 'FILE')}">
        <header class="dossier__head"><span>DOSSIER <b>${esc(d.id)}</b></span><span>EYES ONLY</span></header>
        <div class="dossier__photo">
          ${d.image ? `<img src="${esc(d.image)}" alt="${esc(d.subject)}" loading="lazy">` : '<span>NO IMAGE ON FILE</span>'}
          <i>● REC</i>
        </div>
        <div class="dossier__body">
          <p class="dossier__subject">SUBJECT</p>
          <h3 class="dossier__name">${esc(d.subject)}</h3>
          ${d.codename ? `<p class="dossier__sub">Codename: “${esc(d.codename)}”</p>` : ''}
          <dl class="dossier__facts">
            ${(d.summary || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${val(v)}</dd></div>`).join('')}
            <div><dt>Threat level</dt><dd>${threatMeter(d.threat)}</dd></div>
          </dl>
          <p class="label">Intelligence</p>
          <p class="dossier__intel">${esc(d.intel)}</p>
          <div class="dossier__foot">
            <span class="stamp">${esc(d.status || 'UNDER REVIEW')}</span>
            <button class="btn btn--small" type="button" data-dossier="${idx}">ACCESS DOSSIER <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </article>`).join('');

    const modal = $('[data-modal]');
    const body = $('[data-modal-body]');
    if (!modal || !body || typeof modal.showModal !== 'function') return;

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-dossier]');
      if (!btn) return;
      const d = list[+btn.dataset.dossier];
      if (!d) return;
      const sections = Object.entries(d.details || {}).map(([h, rows]) =>
        `<h3>${esc(h)}</h3><ul>${rows.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`).join('');
      body.innerHTML = `
        <button class="modal__close" type="button" data-close>CLOSE FILE ×</button>
        <p class="modal__meta">DOSSIER ${esc(d.id)} // TYPE: ${esc(d.type || 'FILE')}<br>CLASSIFICATION: COMMITTEE EYES ONLY</p>
        <h2 class="modal__title" id="modal-title">${esc(d.subject)}</h2>
        ${d.codename ? `<p class="modal__code">Codename: “${esc(d.codename)}”</p>` : ''}
        <span class="stamp">${esc(d.status || 'UNDER REVIEW')}</span>
        <dl>
          ${(d.summary || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${val(v)}</dd></div>`).join('')}
          <div><dt>Threat level</dt><dd>${THREAT[clamp(Math.round(d.threat || 0), 0, 5)] || 'UNKNOWN'} — ${esc(d.threatNote || 'Maintenance complexity')}</dd></div>
          <div><dt>Intelligence</dt><dd>${esc(d.intel)}</dd></div>
        </dl>
        ${sections}
        <p class="modal__foot">Specimen data until verified. Field agents: update <code>js/data.js</code> with confirmed models and quotes.</p>`;
      modal.showModal();
      if (motionOK()) tear();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-close]')) modal.close();
    });
  }

  /* ------------------------------------------------------------------------
     RENDER — Timeline
     ------------------------------------------------------------------------ */
  function renderTimeline() {
    const phases = DATA.phases || [];
    const current = clamp((DATA.config && DATA.config.currentPhase) || 1, 1, phases.length || 1);
    const state = (n) => (n < current ? 'done' : n === current ? 'active' : 'pending');
    const pad = (n) => String(n).padStart(2, '0');

    const bar = $('[data-op-bar]');
    if (bar) bar.innerHTML = phases.map((_, i) => `<i class="${state(i + 1)}"></i>`).join('');
    const prog = $('[data-op-progress]');
    if (prog) prog.textContent = `OPERATION LIBERATION // PHASE ${pad(current)} OF ${pad(phases.length)} ACTIVE`;

    const root = $('[data-phases]');
    if (!root) return;
    const STAMP = { done: 'COMPLETE', active: 'ACTIVE', pending: 'PENDING' };
    root.innerHTML = phases.map((p, i) => {
      const s = state(i + 1);
      return `
        <li class="phase is-${s} reveal">
          <span class="phase__no" aria-hidden="true">${pad(i + 1)}</span>
          <div>
            <p class="phase__label">PHASE ${pad(i + 1)}</p>
            <h3 class="phase__name">${esc(p.name)}</h3>
            <p class="phase__sum">${esc(p.summary)}</p>
            ${p.detail ? `<p class="phase__det">${esc(p.detail)}</p>` : ''}
          </div>
          <div class="phase__side">
            <span class="stamp">${STAMP[s]}</span>
            <span class="phase__win">WINDOW: ${esc(p.window || 'TBC')}</span>
          </div>
        </li>`;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     RENDER — Transmissions & briefing
     ------------------------------------------------------------------------ */
  function renderTransmissions() {
    const root = $('[data-transmissions]');
    if (root) {
      root.innerHTML = (DATA.transmissions || []).map((t) => `
        <article class="transmission panel reveal ${t.live ? '' : 'transmission--archived'}">
          <p class="transmission__meta">
            <b>TRANSMISSION ${esc(t.number)}</b>
            <span>${esc(t.date)} // ${esc(t.time)}</span>
            <span>CLASSIFICATION: ${esc(t.classification)}</span>
            ${t.live ? '<span class="live">● LIVE</span>' : ''}
          </p>
          <h3 class="transmission__title">${esc(t.title)}</h3>
          <div class="transmission__body">${(t.body || []).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          ${t.meta && t.meta.length ? `<p class="transmission__kv">${t.meta.map(([k, v]) => `<span>${esc(k).toUpperCase()}: <b>${val(v)}</b></span>`).join('')}</p>` : ''}
        </article>`).join('');
    }

    const b = DATA.briefing;
    const br = $('[data-briefing]');
    if (br && b) {
      br.innerHTML = `
        <p class="label">${esc(b.title || 'Next briefing')}</p>
        <dl>${(b.rows || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${val(v)}</dd></div>`).join('')}</dl>
        <p class="label">Standing orders</p>
        <ol>${(b.orders || []).map((o) => `<li>${esc(o)}</li>`).join('')}</ol>`;
    }

    const cfg = DATA.config || {};
    $$('[data-transmit]').forEach((a) => {
      a.href = `mailto:${encodeURIComponent(cfg.contactEmail || '').replace('%40', '@')}?subject=${encodeURIComponent(cfg.contactSubject || '#CaffieNation')}`;
    });
  }

  /* ------------------------------------------------------------------------
     SIGNAL LOSS — horizontal-sync failure on large headings
     The readable base text stays in the DOM. During a glitch it is hidden
     and replaced by a stack of identical layers, each clipped to one
     horizontal band. Most bands stay perfectly aligned; one or two are
     stretched, smeared or shifted, with cyan ghosting. Then: snap.
     ------------------------------------------------------------------------ */
  function wrapChars(root) {
    const nodes = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) nodes.push(w.currentNode);
    const spans = [];
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      for (const ch of n.data.split('')) {
        const s = document.createElement('span');
        s.className = 'c';
        s.textContent = ch;
        frag.appendChild(s);
        spans.push(s);
      }
      n.parentNode.replaceChild(frag, n);
    });
    return spans;
  }

  const LAYERS = 8;

  class SignalText {
    constructor(el) {
      this.el = el;
      this.busy = false;
      this.timers = [];

      const base = document.createElement('span');
      base.className = 'sig__base';
      while (el.firstChild) base.appendChild(el.firstChild);
      el.appendChild(base);
      this.base = base;

      const fx = document.createElement('span');
      fx.className = 'sig__fx';
      fx.setAttribute('aria-hidden', 'true');
      const markup = base.innerHTML.replace(/\sid="[^"]*"/g, '');
      this.layers = [];
      for (let i = 0; i < LAYERS; i++) {
        const l = document.createElement('span');
        l.className = 'sig__layer';
        l.innerHTML = markup;
        fx.appendChild(l);
        this.layers.push(l);
      }
      this.smear = document.createElement('span');
      this.smear.className = 'sig__layer';
      this.smear.innerHTML = markup;
      this.smearChars = wrapChars(this.smear);
      fx.appendChild(this.smear);
      this.noise = document.createElement('span');
      this.noise.className = 'sig__noise';
      fx.appendChild(this.noise);
      el.appendChild(fx);
    }

    measure() {
      const box = this.el.getBoundingClientRect();
      if (!box.width || !box.height) return null;
      const chars = [];
      const range = document.createRange();
      const w = document.createTreeWalker(this.base, NodeFilter.SHOW_TEXT);
      let i = 0;
      while (w.nextNode()) {
        const n = w.currentNode;
        for (let j = 0; j < n.data.length; j++, i++) {
          const ch = n.data[j];
          if (!/[A-Za-z0-9#]/.test(ch)) continue;
          range.setStart(n, j);
          range.setEnd(n, j + 1);
          const r = range.getBoundingClientRect();
          if (!r.width) continue;
          chars.push({ i, ch, x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height });
        }
      }
      return chars.length ? { W: box.width, H: box.height, chars } : null;
    }

    plan(intensity) {
      const m = this.measure();
      if (!m) return null;
      const { W, H, chars } = m;
      const t = pick(chars);
      const lh = t.h;
      const bandH = clamp(lh * rand(0.07, 0.2) * intensity, 3, lh * 0.36);
      const top = t.y + lh * rand(0.2, 0.62);
      const bands = [{
        kind: 'smear', top, bot: top + bandH, t,
        step: Math.max(2, t.w * rand(0.55, 1.02)),
        reps: Math.max(2, Math.round(rand(2, 6.4) * Math.min(intensity, 1.4))),
        sx: rand(1.02, 1.1),
        ghost: rand(3, 8)
      }];

      const add = (h, props) => {
        for (let k = 0; k < 8; k++) {
          const y = rand(-h * 0.2, H - h * 0.8);
          const b = Object.assign({ top: y, bot: y + h }, props);
          if (!bands.some((o) => b.top < o.bot + 2 && b.bot > o.top - 2)) { bands.push(b); return; }
        }
      };
      // a band pulled the other way
      if (Math.random() < 0.8) add(lh * rand(0.05, 0.16), { kind: 'shift', dx: -rand(4, 16) * intensity, sx: rand(1, 1.05), ox: rand(0, W), ghost: rand(3, 7) });
      // occasionally a thin, violently displaced sliver
      if (Math.random() < 0.35) add(rand(1.5, 4), { kind: 'shift', dx: rand(18, 52) * intensity, sx: 1, ox: 0, ghost: rand(6, 14), bright: true });
      bands.sort((a, b) => a.top - b.top);
      return { W, H, bands };
    }

    mutate(p) {
      p.bands.forEach((b) => {
        if (b.kind === 'smear') { b.reps += Math.round(rand(0, 2.4)); b.sx = rand(1.02, 1.12); b.ghost *= rand(0.7, 1.4); }
        else { b.dx *= Math.random() < 0.3 ? -rand(0.4, 0.8) : rand(0.5, 1.6); }
      });
    }

    apply(p) {
      const { W, H, bands } = p;
      const L = -W, R = W * 2;
      const poly = (x1, y1, x2, y2) => `polygon(${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px)`;
      let n = 0;
      const put = (clip, tf = '', origin = '', shadow = '', filter = '') => {
        const l = this.layers[n++];
        if (!l) return;
        const s = l.style;
        s.display = 'block';
        s.clipPath = s.webkitClipPath = clip;
        s.transform = tf;
        s.transformOrigin = origin;
        s.textShadow = shadow;
        s.filter = filter;
      };

      let y = -H;
      this.smear.style.display = 'none';
      for (const b of bands) {
        if (b.top > y) put(poly(L, y, R, b.top));
        if (b.kind === 'smear') {
          const t = b.t;
          const xr = t.x + t.w;
          const shift = b.step * b.reps;
          const g = b.ghost;
          // static hiss confined to the disturbed band
          this.noise.style.top = (b.top - 3) + 'px';
          this.noise.style.height = (b.bot - b.top + 6) + 'px';
          put(poly(L, b.top, xr, b.bot));
          put(poly(xr, b.top, R, b.bot),
            `translateX(${shift}px) scaleX(${b.sx})`, `${xr}px 0`,
            `${-g}px 0 0 rgba(${CYAN},.55), ${-g * 2.3}px 0 1px rgba(${BLUE},.28)`,
            'blur(.35px)');
          // the smear: the target letter repeated sideways
          const shadows = [];
          for (let k = 1; k <= b.reps; k++) shadows.push(`${(k * b.step).toFixed(1)}px 0 0 currentColor`);
          shadows.push(`${(b.reps * b.step - g).toFixed(1)}px 0 1px rgba(${CYAN},.5)`);
          this.smearChars.forEach((c) => { c.classList.remove('is-on'); c.style.textShadow = ''; });
          const target = this.smearChars[t.i];
          if (target) {
            target.classList.add('is-on');
            target.style.textShadow = shadows.join(',');
            const s = this.smear.style;
            s.display = 'block';
            s.clipPath = s.webkitClipPath = poly(xr, b.top, xr + shift + 1, b.bot);
            s.filter = 'blur(.3px)';
          }
        } else {
          const g = b.ghost * Math.sign(b.dx || 1);
          put(poly(L, b.top, R, b.bot),
            `translateX(${b.dx}px) scaleX(${b.sx})`, `${b.ox}px 0`,
            `${-g}px 0 0 rgba(${CYAN},.5), ${-g * 2}px 0 1px rgba(${BLUE},.22)`,
            b.bright ? 'brightness(1.6) blur(.6px)' : 'blur(.3px)');
        }
        y = b.bot;
      }
      put(poly(L, y, R, H * 2));
      for (let i = n; i < this.layers.length; i++) this.layers[i].style.display = 'none';
    }

    glitch(opts = {}) {
      if (this.busy || !motionOK()) return;
      const intensity = opts.intensity || 1;
      const p = this.plan(intensity);
      if (!p) return;
      this.busy = true;
      this.apply(p);
      this.el.classList.add('is-glitching');
      const dur = opts.duration || rand(80, 250);
      if (dur > 120 && Math.random() < 0.6) {
        this.timers.push(setTimeout(() => { this.mutate(p); this.apply(p); }, rand(45, dur - 35)));
      }
      this.timers.push(setTimeout(() => this.snap(), dur));
    }

    // Abrupt restoration. No easing, no transition.
    snap() {
      this.timers.forEach(clearTimeout);
      this.timers = [];
      this.el.classList.remove('is-glitching');
      this.busy = false;
    }
  }

  /* screen-level horizontal tear */
  const tearEl = $('.tear');
  let tearTimer;
  function tear(yvh) {
    if (!tearEl || !motionOK()) return;
    tearEl.style.top = (yvh != null ? yvh : rand(8, 92)) + 'vh';
    tearEl.style.height = rand(12, 38).toFixed(0) + 'px';
    tearEl.classList.add('is-on');
    clearTimeout(tearTimer);
    tearTimer = setTimeout(() => tearEl.classList.remove('is-on'), rand(60, 140));
  }

  /* scheduler: one heading at a time, at unpredictable 4–12s intervals */
  const Signal = {
    all: [],
    visible: new Set(),
    last: null,
    timer: null,
    paused: false,

    init() {
      this.all = $$('[data-sig]').map((el) => new SignalText(el));
      this.byEl = new Map(this.all.map((s) => [s.el, s]));
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            const s = this.byEl.get(e.target);
            if (e.isIntersecting) this.visible.add(s); else this.visible.delete(s);
          });
        }, { threshold: 0.6 });
        this.all.forEach((s) => io.observe(s.el));
      } else {
        this.all.forEach((s) => this.visible.add(s));
      }
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.schedule(); });
    },

    schedule(min = 4000, max = 12000) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.tick(), rand(min, max));
    },

    tick() {
      if (!this.paused && !document.hidden && motionOK()) {
        const pool = Array.from(this.visible).filter((s) => s !== this.last);
        const s = pick(pool.length ? pool : Array.from(this.visible));
        if (s) {
          s.glitch();
          this.last = s;
          const coarse = window.matchMedia('(pointer: coarse)').matches;
          if (Math.random() < (coarse ? 0.12 : 0.28)) setTimeout(tear, rand(0, 60));
          // rare aftershock on the same line
          if (Math.random() < 0.18) setTimeout(() => s.glitch({ intensity: 0.6, duration: rand(60, 110) }), rand(380, 720));
        }
      }
      this.schedule();
    },

    get(el) { return this.byEl && this.byEl.get(el); }
  };

  /* ------------------------------------------------------------------------
     OPENING TRANSMISSION
     ------------------------------------------------------------------------ */
  function staticNoise(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    let w, h, img, buf;
    const size = () => {
      w = canvas.width = Math.max(96, Math.ceil(window.innerWidth / 3));
      h = canvas.height = Math.max(64, Math.ceil(window.innerHeight / 3));
      img = ctx.createImageData(w, h);
      buf = new Uint32Array(img.data.buffer);
    };
    size();
    let raf = 0, last = 0, roll = 0;
    const frame = (ts) => {
      raf = requestAnimationFrame(frame);
      if (ts - last < 34) return;
      last = ts;
      roll = (roll + h * 0.035) % h;
      for (let y = 0; y < h; y++) {
        const band = Math.abs(y - roll) < h * 0.07 ? 42 : 0;
        const row = y * w;
        for (let x = 0; x < w; x++) {
          const v = Math.min(255, (Math.random() * 205 + band) | 0);
          buf[row + x] = 0xff000000 | (v << 16) | (v << 8) | v;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', size);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }

  const Intro = {
    el: $('#intro'),
    running: false,
    timers: [],
    stopStatic: null,

    at(ms, fn) { this.timers.push(setTimeout(fn, ms)); },

    play() {
      const el = this.el;
      if (!el) return this.finish(false);
      this.running = true;
      Signal.paused = true;
      html.classList.add('intro-on');
      el.classList.remove('is-log', 'is-burst');
      const lines = $$('.intro__line', el);
      lines.forEach((l) => l.classList.remove('is-on'));
      this.lineSigs = this.lineSigs || $$('.intro__line .sig', el).map((s) => new SignalText(s));

      const canvas = $('.intro__static', el);
      if (canvas) this.stopStatic = staticNoise(canvas);
      const skip = $('.intro__skip', el);
      if (skip) skip.focus({ preventScroll: true });

      this.at(850, () => el.classList.add('is-log'));
      this.at(1000, () => lines[0] && lines[0].classList.add('is-on'));
      this.at(1350, () => lines[1] && lines[1].classList.add('is-on'));
      this.at(1700, () => lines[2] && lines[2].classList.add('is-on'));
      // burst of interference, then cut to the broadcast
      this.at(2400, () => {
        el.classList.add('is-burst');
        this.lineSigs.forEach((s, i) => setTimeout(() => s.glitch({ intensity: 1.6, duration: 150 }), i * 60));
        tear(rand(30, 45));
      });
      this.at(2560, () => { tear(rand(55, 75)); this.lineSigs.forEach((s) => { s.snap(); s.glitch({ intensity: 2, duration: 120 }); }); });
      this.at(2700, () => tear(rand(15, 85)));
      this.at(2820, () => this.finish(true));
    },

    finish(played) {
      this.timers.forEach(clearTimeout);
      this.timers = [];
      if (this.stopStatic) { this.stopStatic(); this.stopStatic = null; }
      (this.lineSigs || []).forEach((s) => s.snap());
      html.classList.remove('intro-on');
      if (this.el) this.el.classList.remove('is-log', 'is-burst');
      try { localStorage.setItem('cfn:intro', String(Date.now())); } catch (e) { /* private mode */ }
      const wasRunning = this.running;
      this.running = false;
      Signal.paused = false;

      if (played && wasRunning && motionOK()) {
        const hero = $('.hero');
        if (hero) {
          hero.classList.add('is-powering');
          setTimeout(() => hero.classList.remove('is-powering'), 360);
        }
        const title = Signal.get($('.hero__title'));
        setTimeout(() => title && title.glitch({ intensity: 1.15, duration: 190 }), 900);
        Signal.schedule(4500, 9000);
      } else {
        Signal.schedule(2200, 5000);
      }
    },

    bind() {
      if (!this.el) return;
      const skip = () => { if (this.running) this.finish(true); };
      this.el.addEventListener('click', skip);
      document.addEventListener('keydown', (e) => {
        if (this.running && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); skip(); }
      });
    }
  };

  /* ------------------------------------------------------------------------
     HUD — navigation
     ------------------------------------------------------------------------ */
  function initNav() {
    const hud = $('.hud');
    const toggle = $('.hud__toggle');
    const nav = $('#site-nav');
    if (!hud || !toggle || !nav) return;

    const setOpen = (open) => {
      hud.classList.toggle('is-open', open);
      html.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!hud.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hud.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });

    // Changing channel: occasionally a single interference line.
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', () => {
      setOpen(false);
      if (Math.random() < 0.5) setTimeout(tear, rand(80, 260));
    }));

    // highlight the current section
    const links = new Map($$('a', nav).map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.remove('is-current'));
          const a = links.get(e.target.id);
          if (a) a.classList.add('is-current');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('main > section[id]').forEach((s) => io.observe(s));
    }
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll ("receiving power")
     ------------------------------------------------------------------------ */
  function initReveal() {
    const els = $$('.reveal');
    if (!motionOK() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------------
     Broadcast furniture: VHS timecode, signal strength
     ------------------------------------------------------------------------ */
  function initFurniture() {
    const tc = $('[data-timecode]');
    if (tc) {
      const t0 = performance.now() - rand(600, 5400) * 1000;
      const p2 = (n) => String(n).padStart(2, '0');
      const draw = () => {
        const s = (performance.now() - t0) / 1000;
        tc.textContent = `${p2(Math.floor(s / 3600))}:${p2(Math.floor(s / 60) % 60)}:${p2(Math.floor(s) % 60)}:${p2(Math.floor((s % 1) * 25))}`;
      };
      draw();
      let heroVisible = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('.hero'));
      }
      setInterval(() => { if (heroVisible && !document.hidden) draw(); }, motionOK() ? 40 : 1000);
    }

    const sig = $$('[data-signal]');
    const flutter = () => {
      setTimeout(() => {
        if (!document.hidden) {
          const v = pick([84, 85, 86, 88, 89]);
          sig.forEach((s) => { s.textContent = v + '%'; });
          setTimeout(() => sig.forEach((s) => { s.textContent = '87%'; }), rand(500, 1100));
        }
        flutter();
      }, rand(4000, 11000));
    };
    if (sig.length) flutter();
  }

  /* ------------------------------------------------------------------------
     Easter eggs
     ------------------------------------------------------------------------ */
  function initEggs() {
    const flash = $('.stamp-flash');
    const words = { instant: 'NO INSTANT COFFEE', decaf: 'NOTED. SUSPICIOUS.', beans: 'THE BEANS WILL RISE', kettle: 'COLLABORATOR' };
    let buf = '';
    let t;
    document.addEventListener('keydown', (e) => {
      if (Intro.running || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-12);
      const hit = Object.keys(words).find((w) => buf.endsWith(w));
      if (!hit || !flash) return;
      buf = '';
      $('span', flash).textContent = words[hit];
      flash.classList.add('is-on');
      tear();
      clearTimeout(t);
      t = setTimeout(() => flash.classList.remove('is-on'), 1300);
    });

    try {
      console.log('%c#CAFFIENATION', 'font: 32px Anton, Impact, sans-serif; color: #e6dfd0; background: #0b0a09; padding: 6px 12px;');
      console.log('%cIf you are reading this, you are already one of us. The beans will rise.', 'font: 12px monospace; color: #8f6645;');
    } catch (e) { /* no console */ }
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  renderSituationRoom();
  renderCalculator();
  renderDossiers();
  renderTimeline();
  renderTransmissions();

  Signal.init();
  initNav();
  initReveal();
  initFurniture();
  initEggs();
  Intro.bind();

  const replay = $('[data-replay]');
  if (replay) replay.addEventListener('click', () => {
    window.scrollTo(0, 0);
    if (motionOK()) Intro.play();
    else { const t = Signal.get($('.hero__title')); if (t) t.glitch(); }
  });

  // Console hook for the committee's technicians: CFNBroadcast.glitch()
  window.CFNBroadcast = {
    glitch: (sel) => { const s = Signal.get($(sel || '.hero__title')); if (s) s.glitch({ duration: 250 }); },
    tear,
    intro: () => Intro.play()
  };

  if (html.classList.contains('intro-on')) Intro.play();
  else Intro.finish(false);
})();
