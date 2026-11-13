/* Invitation · Phase B intro (screens 01–06). Loaded after app.js: uses its globals ($, el, t, HEART, stepDown,
   scale, RM, store, SND, expand). Ported 1:1 from the approved stage-4 renderer (comps/screen.html, screens.md v12).
   Flow: 01 arrival (tap knot) → 02 untie (cover lifts: title) → 03 heart kolam (trace: names) → 04 dial (turn to 22:
   events) → 05 globe (hold the beacon: venue) → 06 feather fans sweep aside → 07 card. Every gesture can't fail:
   6 s idle or the auto rule finishes it. Skip (01–05) → 07. */
'use strict';
window.INTRO = (() => {
  const IT = {                                   // tunables
    idleMs: 6000, hintMs: 2000, skipMs: 3500, traceSnapPx: 34, traceAhead: 70, traceDone: .6,
    dialSnapDeg: 15, holdMs: 800, globeFps: 20, globeTimeoutMs: 3000, settleMs: 650,
  };
  const A = 'a/';
  let layer, bundleEl, lifted = 0, running = false, timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const wait = ms => new Promise(r => later(r, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  /* capture is a nicety: it throws for pointers the browser isn't tracking, and a throw here would kill the gesture */
  const cap = (n, e) => { try { n.setPointerCapture(e.pointerId); } catch (err) {} };
  const toDesign = e => { const r = $('#stage').getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; };

  // ---------------------------------------------------------------- olai bundle (stack model, screens.md v10)
  const U = 80, BX = 8, TOP = 318;   /* cover = 349 px: fits the 360 design box (84 overflowed by 15 px) */
  const W = { leaf_plain: 4.1629, leaf_title: 4.1626, leaf_cover: 4.368, knot: 2.4348 / 1.3 };
  const PX = { leaf_plain: [1872, 256], leaf_title: [1872, 372], leaf_cover: [1964, 396], knot: [1096, 900] };
  const sz = id => { const w = W[id] * U; return [w, w * PX[id][1] / PX[id][0]]; };
  const STACK = [['cover', 'leaf_cover'], ['L1', 'leaf_title'], ['L2', 'leaf_title'], ['L3', 'leaf_title'], ['L4', 'leaf_title'], ['L5', 'leaf_plain'], ['L6', 'leaf_plain']];
  const FACT = { L1: () => `<div class="fit big">${t('title')}</div>`,
                 L2: () => `<div class="fit big">${t('bride')} ${HEART()} ${t('groom')}</div><div class="wrap2">${t('welcome')}</div>`,
                 L3: () => `<div class="fit"><b>${t('wedL')}</b></div><div class="two">${t('wedS')}</div>`,   /* wedding only (user: no engagement) */
                 L4: () => `<div class="fit"><b>${LANG === 'ta' ? 'இடம்' : 'VENUE'}</b></div><div class="two">${t('venue')}</div>`   /* elders: wrap to 2 big lines instead of shrinking */ };
  const LIFT0 = -58, SHOW = 6;
  const step = (p, q) => { const [wq, hq] = sz(STACK[q][1]), hp = sz(STACK[p][1])[1];
    return Math.asin(Math.min(.5, ((hp - hq) / 2 + SHOW) / (wq * .9))) * 180 / Math.PI; };
  const pose = (k, up) => {
    if (k < up) { let a = LIFT0; for (let j = 1; j <= k; j++) a += step(j - 1, j); return { a, b: 1 }; }
    let a = 0; for (let j = up + 1; j <= k; j++) a += step(j - 1, j); return { a, b: 1 - (k - up) * .05 };
  };
  /* fit a leaf's text to the leaf, both ways, whatever the phone does to font size (Android boosting, accessibility
     text scaling): scale the lines down together until nothing spills; never clip, never cut words. */
  function fitInk(ink) {
    if (!ink) return;
    const kids = [...ink.children]; let z = 1;
    kids.forEach(k => k.style.zoom = 1);
    const over = () => ink.scrollHeight > ink.clientHeight + 1 || ink.scrollWidth > ink.clientWidth + 1 || kids.some(k => k.scrollWidth > k.clientWidth + 1);
    while (over() && z > .45) { z -= .03; kids.forEach(k => k.style.zoom = z.toFixed(2)); }
    ink.dataset.fit = z.toFixed(2);
  }
  const tf = q => `rotate(${q.a.toFixed(2)}deg)`, lf = q => `brightness(${q.b}) drop-shadow(0 1.6px 1.2px rgba(40,20,5,.5))`;
  function buildBundle() {
    const b = el(`<div class="bundle" style="left:${BX}px;top:${TOP}px"></div>`); layer.appendChild(b);
    const H0 = sz('leaf_cover')[1], piv = sz('leaf_cover')[0] * .0868;
    STACK.forEach(([role, id], k) => {
      const [w, h] = sz(id), q = pose(k, 0), txt = FACT[role] ? `<div class="ink front">${FACT[role]()}</div>` : '';
      b.appendChild(el(`<div class="leaf" data-k="${k}" style="width:${w}px;top:${(H0 - h) / 2}px;z-index:${30 - k};transform-origin:${(piv / w * 100).toFixed(2)}% 50%;transform:${tf(q)};filter:${lf(q)}"><img src="${A}${id}.webp" alt="">${txt}</div>`));
    });
    b.querySelectorAll('.ink').forEach(n => n.style.opacity = 0);
    b.appendChild(el(`<svg class="thread" style="left:${piv - 40}px;top:${H0 / 2 - 30}px" width="80" height="90">
      <g fill="none" stroke-linecap="round"><path d="M40 30 C14 10 -2 34 12 52 C22 64 36 54 40 36 M40 32 C34 54 26 70 30 84" stroke="#6A4316" stroke-width="4.2"/>
      <path d="M40 30 C14 10 -2 34 12 52 C22 64 36 54 40 36 M40 32 C34 54 26 70 30 84" stroke="#E7BE62" stroke-width="2.6"/></g>
      <circle cx="40" cy="31" r="3.6" fill="#D9A84A" stroke="#6A4316" stroke-width="1"/><circle cx="30" cy="86" r="3.4" fill="#B0182A"/></svg>`));
    const [kw] = sz('knot'), kx = sz('leaf_cover')[0] * .27;
    b.appendChild(el(`<div class="wrap" style="left:${kx - 3}px;top:-6px;height:${H0 + 18}px"></div>`));
    b.appendChild(el(`<button class="knot" type="button" aria-label="Untie" style="left:${kx - kw / 2}px;top:${H0 / 2 - kw * .27}px;width:${kw}px"><img src="${A}knot.webp" alt=""></button>`));
    bundleEl = b; lifted = 0;
    return { x: BX + kx, y: TOP + H0 / 2 };
  }
  /* one reveal: the hand lifts the top leaf of the unread stack; the next leaf's fact is uncovered */
  async function lift() {
    const leaves = [...bundleEl.querySelectorAll('.leaf')].sort((x, y) => x.dataset.k - y.dataset.k);
    const top = leaves[lifted], q = pose(lifted, lifted + 1), ink = k => leaves[k] && leaves[k].querySelector('.ink');
    SND.play('lift');
    const t1 = ink(lifted + 1);
    if (t1) { stepDown(t1); fitInk(t1); const an = t1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RM ? 1 : 380, delay: RM ? 0 : 260, fill: 'forwards' }); an.finished.then(() => { t1.style.opacity = 1; an.cancel(); }); }
    const set = (l, q2, dur, delay = 0, settle = false) => (RM ? Promise.resolve() : l.animate(
      settle ? [{ transform: l.style.transform }, { transform: tf({ ...q2, a: q2.a * 1.01 }), offset: .85 }, { transform: tf(q2) }]
             : [{ transform: l.style.transform }, { transform: tf(q2) }],
      { duration: dur, delay, easing: 'cubic-bezier(.35,.6,.25,1)', fill: 'forwards' }).finished).then(() => { l.style.transform = tf(q2); l.style.filter = lf(q2); });
    await Promise.all([set(top, q, 780, 0, true), ...leaves.slice(lifted + 1).map((l, r) => set(l, pose(lifted + 1 + r, lifted + 1), 420, 200 + r * 45))]);
    const old = ink(lifted); if (old) old.style.opacity = 0;
    lifted++;
  }

  // ---------------------------------------------------------------- hint glyph over the active object
  function hint(icon, x, y) { const h = el(`<div class="hint" style="left:${x}px;top:${y}px"><img src="${A}${icon}.png" alt=""></div>`); layer.appendChild(h); return h; }
  function petals(n = 10, ms = 3600, spread = 900) {
    const kinds = ['petal_rose', 'petal_marigold', 'petal_jasmine'];
    for (let i = 0; i < n; i++) {
      const p = el(`<img class="petal" src="${A}${kinds[i % 3]}.webp" alt="">`), r0 = Math.random() * 360;
      p.style.left = 20 + Math.random() * 320 + 'px'; p.style.top = '-30px'; $('#stage').appendChild(p);
      p.animate([{ transform: `translate(0,0) rotate(${r0}deg)`, opacity: 0 }, { opacity: 1, offset: .12 },
                 { transform: `translate(${(Math.random() - .5) * 140}px, ${640 + Math.random() * 200}px) rotate(${r0 + 300}deg)`, opacity: 0 }],
        { duration: ms + Math.random() * 1500, delay: Math.random() * spread, easing: 'cubic-bezier(.3,.2,.6,1)' }).finished.then(() => p.remove());
    }
  }
  function sparkle(x, y) {
    const s = el(`<div class="burst" style="left:${x - 60}px;top:${y - 60}px"><img src="${A}beacon_1.webp" class="ring" alt="">${[[60,30,30],[34,8,62],[28,80,20],[22,70,84]].map(([w, a, b]) => `<img src="${A}beacon_2.webp" style="width:${w}px;left:${a}px;top:${b}px" alt="">`).join('')}</div>`);
    layer.appendChild(s); s.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)', offset: .3 }, { opacity: 0, transform: 'scale(1.3)' }], { duration: 900, easing: 'ease-out' }).finished.then(() => s.remove());
  }

  // ---------------------------------------------------------------- 01 arrival + 02 untie
  function arrival() {
    return new Promise(res => {
      const k = buildBundle(), knot = bundleEl.querySelector('.knot');
      let h = null; later(() => h = hint('ic_hint_tap', k.x + 28, k.y - 36), IT.hintMs);
      const go = () => { finishStep = null; knot.onclick = null; if (h) h.remove(); res(); };
      knot.onclick = go; finishStep = go;                         // the knot tap is also the first gesture: audio.js starts the BGM on it
      later(go, IT.idleMs);                      // no input for 6 s -> unties itself
    });
  }
  async function untie() {
    const knot = bundleEl.querySelector('.knot'), wrap = bundleEl.querySelector('.wrap'), r = knot.getBoundingClientRect(), s = $('#stage').getBoundingClientRect();
    SND.play('untie'); try { navigator.vibrate && navigator.vibrate(18); } catch (e) {}
    sparkle((r.left - s.left + r.width / 2) / scale, (r.top - s.top + r.height / 2) / scale);
    await Promise.all([knot, wrap].map(n => n.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.25)' }], { duration: RM ? 1 : 450, fill: 'forwards' }).finished));
    knot.remove(); wrap.remove();
    await lift();                                // reveal 1: only the cover lifts -> "Wedding Invitation"
    await wait(1500);
  }

  // ---------------------------------------------------------------- 03 heart kolam (who)
  function heartPath(cx, cy, s = 1) {
    const P = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
    return `M${P(0,95)} C${P(-30,70)} ${P(-110,22)} ${P(-105,-35)} C${P(-100,-86)} ${P(-36,-96)} ${P(0,-50)} C${P(36,-96)} ${P(100,-86)} ${P(105,-35)} C${P(110,22)} ${P(30,70)} ${P(0,95)} Z`;
  }
  function kolam() {
    const cx = 180, cy = 560, d = heartPath(cx, cy) + ' ' + heartPath(cx, cy + 4, .52);
    const hp = new Path2D(heartPath(cx, cy, .93)), ip = new Path2D(heartPath(cx, cy + 4, .6)), cv = document.createElement('canvas').getContext('2d');
    const dots = []; for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x = cx + i * 30, y = cy - 8 + j * 30;
      if (cv.isPointInPath(hp, x, y) && !cv.isPointInPath(ip, x, y)) dots.push([x, y]); }
    dots.push([cx, cy + 6]);
    const svg = el(`<svg class="kolam" width="360" height="740" viewBox="0 0 360 740">
      <defs><filter id="kg"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <ellipse cx="${cx}" cy="${cy}" rx="134" ry="122" fill="rgba(6,14,20,.42)"/>
      <path class="glow" d="${d}" fill="none" stroke="#F2D27A" stroke-width="8" opacity="0" filter="url(#kg)"/>
      <path class="ghost" d="${d}" fill="none" stroke="#F2D27A" stroke-width="1.2" opacity=".22" stroke-dasharray="3 6"/>
      <path class="line lo" d="${heartPath(cx, cy)}" fill="none" stroke="#F2D27A" stroke-width="2.8" stroke-linecap="round"/>
      <path class="line li" d="${heartPath(cx, cy + 4, .52)}" fill="none" stroke="#F2D27A" stroke-width="2.8" stroke-linecap="round"/>
      ${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#F2D27A"/>`).join('')}
      <rect x="40" y="430" width="280" height="270" fill="transparent" class="hit"/></svg>`);
    layer.appendChild(svg);
    /* two separate paths with one progress value: SVG restarts the dash pattern on every SUBPATH, so a single
       outer+inner path drew the inner heart while the finger was still on the outer one */
    const lo = svg.querySelector('.lo'), li = svg.querySelector('.li'), Lo = lo.getTotalLength(), Li = li.getTotalLength(), L = Lo + Li;
    const at = l => (l <= Lo ? lo.getPointAtLength(l) : li.getPointAtLength(l - Lo));
    const line = lo;                                   /* the demo traces the start of the outer heart */
    const pts = []; for (let l = 0; l <= L; l += 4) { const p = at(l); pts.push([p.x, p.y, l]); }
    /* demo (user 2026-11-13): a ghost finger traces the first stretch of the heart from a pulsing start point and leaves a
       fading gold trail, on a loop, until the guest's own finger takes over. Shows "touch here and move along" with no text. */
    const demo = (() => {
      const p0 = line.getPointAtLength(0), seg = L * .28;
      const ring = el(`<svg xmlns="http://www.w3.org/2000/svg"><circle cx="${p0.x}" cy="${p0.y}" r="7" fill="none" stroke="#FFF2C4" stroke-width="2.5">
        <animate attributeName="r" values="6;18" dur="1.3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".95;0" dur="1.3s" repeatCount="indefinite"/></circle>
        <circle cx="${p0.x}" cy="${p0.y}" r="5" fill="#F2D27A"/></svg>`).firstElementChild;
      const dotEl = ring.nextElementSibling; svg.appendChild(ring); svg.appendChild(dotEl);
      const trail = line.cloneNode(); trail.setAttribute('class', 'trail'); trail.setAttribute('stroke-width', '4.5'); trail.style.opacity = 0; svg.insertBefore(trail, line);
      const g = el(`<div class="hint ghost"><img src="${A}ic_hint_tap.png" alt=""></div>`); layer.appendChild(g);
      let alive = true;
      (async () => { await wait(500);
        while (alive) {
          await new Promise(r => { const t0 = performance.now(), dur = RM ? 1 : 1800;
            const tick = n => { if (!alive) return r(); const k = Math.min(1, (n - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, l = e * seg, pt = line.getPointAtLength(l);
              g.style.left = pt.x + 'px'; g.style.top = pt.y + 'px'; g.style.opacity = k < .08 ? k / .08 : k > .9 ? (1 - k) / .1 : 1;
              trail.style.strokeDasharray = `${l} ${Lo + 1}`; trail.style.opacity = .55 * (k > .85 ? (1 - k) / .15 : 1);
              k < 1 ? requestAnimationFrame(tick) : r(); };
            requestAnimationFrame(tick); });
          await wait(450);
        } })();
      return { remove() { alive = false; g.remove(); trail.remove(); ring.remove(); dotEl.remove(); } };
    })();
    let prog = 0, lastMove = performance.now(), lastSfx = 0, done = false, h = demo;
    const draw = () => { const pl = prog * L; lo.style.strokeDasharray = `${Math.min(pl, Lo)} ${Lo + 1}`; li.style.strokeDasharray = `${Math.max(0, pl - Lo)} ${Li + 1}`; };
    draw();
    return new Promise(res => {
      const finish = async () => {
        if (done) return; done = true; finishStep = null; svg.onpointerdown = svg.onpointermove = null; if (h) h.remove();
        await new Promise(r => { const p0 = prog, t0 = performance.now(), dur = RM ? 1 : 900 * (1 - p0) + 100;   /* draws on outer, then inner */
          const tick = n => { const k = Math.min(1, (n - t0) / dur); prog = p0 + (1 - p0) * k; draw(); k < 1 ? requestAnimationFrame(tick) : r(); };
          requestAnimationFrame(tick); });
        prog = 1; draw(); SND.play('kolam'); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
        svg.querySelector('.glow').animate([{ opacity: 0 }, { opacity: .7 }], { duration: 500, fill: 'forwards' });
        petals(8, 3000); res();
      };
      finishStep = finish;
      const move = e => {
        if (done) return; const [x, y] = toDesign(e), at = prog * L; let best = null;
        for (const [px, py, l] of pts) if (l >= at - 8 && l <= at + IT.traceAhead) { const dd = Math.hypot(px - x, py - y); if (dd < IT.traceSnapPx && (!best || l > best)) best = l; }
        if (best != null && best / L > prog) { prog = best / L; draw(); lastMove = performance.now();
          if (h) { h.remove(); h = null; }
          const n = performance.now(); if (n - lastSfx > 110) { SND.play('trace'); lastSfx = n; } }
        if (prog >= IT.traceDone) finish();
      };
      svg.onpointerdown = e => { cap(svg, e); svg.onpointermove = move; move(e); };
      svg.onpointerup = () => { svg.onpointermove = null; };
      const idle = () => { if (done) return; if (performance.now() - lastMove > IT.idleMs) finish(); else later(idle, 400); };
      later(idle, 400);
    });
  }

  // ---------------------------------------------------------------- 04 dial (when): turn the disc until 22 sits under the pointer
  function dial() {
    const DU = 120 * .9, R = 2.1112 * DU, D = 1.768 * DU, N = 30, cx = 180, cy = 590;
    const box = el(`<div class="dial" style="left:${cx - R / 2}px;top:${cy - R / 2}px;width:${R}px;height:${R}px"></div>`);
    let days = '';
    for (let k = 0; k < N; k++) { const a = (k + .5) / N * 2 * Math.PI, r = D / 2 * .7;
      if (k === 21) days += `<div class="jewel" style="width:${30 * .9}px;height:${30 * .9}px;transform:translate(-50%,-50%) translate(${r * Math.sin(a)}px,${-r * Math.cos(a)}px)"></div>`;
      days += `<div class="dday" style="transform:translate(-50%,-50%) translate(${r * Math.sin(a)}px,${-r * Math.cos(a)}px) rotate(${a}rad)">${k + 1}</div>`; }
    box.innerHTML = `<div class="disc"><img src="${A}dial_disc.webp" style="width:${D}px" alt="">${days}</div><img class="ring" src="${A}dial_ring.webp" style="width:${R}px" alt="">`;
    layer.appendChild(box);
    box.animate([{ opacity: 0, transform: 'translateY(40px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: RM ? 1 : 600, easing: 'cubic-bezier(.2,.8,.2,1)' });
    const disc = box.querySelector('.disc');
    const TARGET = 102;                                   /* disc angle that puts day 22 under the pointer (clockwise turn, like the hint) */
    let ang = -6, lastDay = 1, lastMove = performance.now(), done = false, grab = null;
    const set = a => { ang = a; disc.style.transform = `rotate(${a}deg)`; const day = ((Math.round((-a) / 12 + .5) % N) + N) % N || N;
      if (day !== lastDay) { lastDay = day; SND.play('detent'); } };
    set(ang);
    /* hint (user 2026-11-13): a bigger arc OUTSIDE the brass ring, from beside the 22 jewel to the pointer, with a bead
       running along it on a loop: "turn this way". The bead rides the arc's own path (animateMotion), so it can't drift off it. */
    const r = R / 2 + 15, rad = d => d * Math.PI / 180, at = deg => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))];
    const a0 = 258 + ang + 6, a1 = 346, [x0, y0] = at(a0), [x1, y1] = at(a1);
    const dir = [Math.cos(rad(a1)), Math.sin(rad(a1))], nrm = [Math.sin(rad(a1)), -Math.cos(rad(a1))];   /* tangent (clockwise) + outward normal at the tip */
    const tip = [x1 + dir[0] * 9, y1 + dir[1] * 9], w1 = [tip[0] - dir[0] * 16 + nrm[0] * 9, tip[1] - dir[1] * 16 + nrm[1] * 9], w2 = [tip[0] - dir[0] * 16 - nrm[0] * 9, tip[1] - dir[1] * 16 - nrm[1] * 9];
    const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    const arc = el(`<svg class="arc" width="360" height="740">
      <path d="${d}" fill="none" stroke="#2A1424" stroke-width="7.5" stroke-linecap="round" opacity=".55"/>
      <path d="${d}" fill="none" stroke="#F2D27A" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M${w1[0].toFixed(1)} ${w1[1].toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)} L${w2[0].toFixed(1)} ${w2[1].toFixed(1)}" fill="none" stroke="#2A1424" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
      <path d="M${w1[0].toFixed(1)} ${w1[1].toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)} L${w2[0].toFixed(1)} ${w2[1].toFixed(1)}" fill="none" stroke="#F2D27A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle r="6" fill="#FFF2C4" stroke="#C8913A" stroke-width="1.5"><animateMotion dur="1.5s" repeatCount="indefinite" path="${d}" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .35 1"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.85;1" dur="1.5s" repeatCount="indefinite"/></circle></svg>`);
    layer.appendChild(arc); let h = null;
    const off = a => { let d = ((a - TARGET) % 360 + 540) % 360 - 180; return d; };   /* signed distance to the target, -180..180 */
    return new Promise(res => {
      const snap = async (auto = false) => {
        if (done) return; done = true; finishStep = null; box.onpointerdown = box.onpointermove = null; arc.remove(); if (h) h.remove();
        const from = ang, to = ang - off(ang);
        await new Promise(r2 => { const t0 = performance.now(), dur = RM ? 1 : (auto ? 1600 : 280);
          const tick = n => { const k = Math.min(1, (n - t0) / dur), e = 1 - Math.pow(1 - k, 3); set(from + (to - from) * e); k < 1 ? requestAnimationFrame(tick) : r2(); };
          requestAnimationFrame(tick); });
        SND.play('snap'); try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
        res(box);
      };
      finishStep = () => snap();
      box.onpointerdown = e => { cap(box, e); const [x, y] = toDesign(e); grab = Math.atan2(y - cy, x - cx) * 180 / Math.PI;
        box.onpointermove = ev => { const [mx, my] = toDesign(ev), a = Math.atan2(my - cy, mx - cx) * 180 / Math.PI; let da = a - grab; da = (da + 540) % 360 - 180; grab = a;
          set(ang + da); lastMove = performance.now(); if (arc.style.opacity !== '0.25') arc.style.opacity = .25;
          if (Math.abs(off(ang)) < IT.dialSnapDeg) snap(); }; };
      box.onpointerup = () => { box.onpointermove = null; };
      const idle = () => { if (done) return; if (performance.now() - lastMove > IT.idleMs) snap(true); else later(idle, 400); };
      later(idle, 400);
    });
  }

  // ---------------------------------------------------------------- 05 globe (where): hold the only light on it
  const FR = [...Array(16)].map((_, i) => `${A}globe_${String(i).padStart(2, '0')}.webp`);
  let globeReady = null;
  function preloadGlobe() {
    if (globeReady) return globeReady;
    globeReady = Promise.all([...FR, `${A}globe.webp`].map(s => new Promise((ok, no) => { const i = new Image(); i.onload = ok; i.onerror = no; i.src = s; })));
    return globeReady;
  }
  async function globe() {
    const cx = 180, cy = 600, S = 290 * .85;
    let ok = true;
    try { await Promise.race([preloadGlobe(), new Promise((_, no) => later(no, IT.globeTimeoutMs))]); } catch (e) { ok = false; }
    if (!ok) return pinFallback();                       // 05b
    const g = el(`<div class="globe" style="left:${cx - S / 2}px;top:${cy - S / 2}px;width:${S}px;height:${S}px"><img src="${FR[0]}" alt=""></div>`);
    layer.appendChild(g); const img = g.querySelector('img');
    for (let i = 0; i < FR.length; i++) { img.src = FR[i]; await wait(RM ? 0 : 1000 / IT.globeFps); }
    const beacon = el(`<div class="beacon" style="left:${cx}px;top:${cy}px"><span class="b0"></span><span class="b1"></span><span class="b2"></span></div>`);
    const ring = el(`<svg class="hold" style="left:${cx - 34}px;top:${cy - 34}px" width="68" height="68"><circle cx="34" cy="34" r="30" fill="none" stroke="#F2D27A55" stroke-width="3"/><circle class="p" cx="34" cy="34" r="30" fill="none" stroke="#F2D27A" stroke-width="3.5" stroke-linecap="round" pathLength="1" stroke-dasharray="0 1" transform="rotate(-90 34 34)"/></svg>`);
    layer.append(beacon, ring); let h = hint('ic_hint_hold', cx + 34, cy + 40);
    const p = ring.querySelector('.p');
    return new Promise(res => {
      let anim = null, done = false, lastTouch = performance.now();
      const complete = async () => {
        if (done) return; done = true; finishStep = null; g.onpointerdown = null; if (h) h.remove();
        p.style.strokeDasharray = '1 1'; ring.remove(); beacon.remove();
        SND.play('flyin');                               // fly-in: zoom into Vadipatti, the globe dissolves to gold
        img.src = `${A}globe.webp`;
        const gold = el('<div class="gold"></div>'); layer.appendChild(gold);
        await Promise.all([g.animate([{ transform: 'scale(1)' }, { transform: 'scale(3.2)' }], { duration: RM ? 1 : 1100, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' }).finished,
                           gold.animate([{ opacity: 0 }, { opacity: .85, offset: .7 }, { opacity: 0 }], { duration: RM ? 1 : 1500 }).finished]);
        g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }); gold.remove();
        res();
      };
      finishStep = complete;
      const start = () => { if (done) return; lastTouch = performance.now(); SND.play('hold');
        anim = p.animate([{ strokeDasharray: '0 1' }, { strokeDasharray: '1 1' }], { duration: IT.holdMs, fill: 'forwards' }); anim.finished.then(complete).catch(() => {}); };
      const stop = () => { if (anim && !done) { anim.cancel(); anim = null; } };
      g.onpointerdown = e => { cap(g, e); start(); };   // any touch on the globe counts (gdd no-fail rule)
      g.onpointerup = g.onpointercancel = stop;
      const idle = () => { if (done) return; if (!anim && performance.now() - lastTouch > IT.idleMs) start(); else later(idle, 400); };
      later(idle, 400);
    });
  }
  function pinFallback() {                               // 05b: same hold gesture on a brass map-pin (copper glyph stand-in)
    return new Promise(res => {
      const pin = el(`<button class="pin glass" type="button" style="left:150px;top:540px"><img src="${A}ic_map_pin.png" alt=""></button>`), h = hint('ic_hint_hold', 196, 610);
      layer.appendChild(pin); let tm = null;
      const go = () => { finishStep = null; pin.onpointerdown = null; h.remove(); pin.remove(); res(); };
      finishStep = go;
      pin.onpointerdown = () => { SND.play('hold'); tm = setTimeout(go, IT.holdMs); };
      pin.onpointerup = () => clearTimeout(tm);
      later(go, IT.idleMs);
    });
  }

  // ---------------------------------------------------------------- 06 fan reveal → 07
  function fanList(k, spread) {
    const out = [];
    for (const [h, n, a0, a1] of [[660, 9, -42, 22], [470, 8, -38, 26], [300, 6, -30, 30]])
      for (let i = 0; i < n; i++) { const a = (a0 + (a1 - a0) * i / (n - 1)) * k - spread;
        out.push(['abc'[i % 3], 30, 790, h, a]); out.push(['abc'[(i + 1) % 3], 330, 790, h, -a]); }
    return out;
  }
  async function fanReveal() {
    const st = $('#stage'), fs = fanList(1, 0).map(([v, x, y, h, a]) => { const f = feather(st, v, x, y, h, a, 40, 'fan'); f.style.transform = `rotate(${a * .2}deg) scale(.35)`; return [f, a]; });
    SND.play('fan'); SND.swell(5);
    if (RM) { fs.forEach(([f]) => f.remove()); return reveal(); }
    await Promise.all(fs.map(([f, a], i) => f.animate([{ transform: `rotate(${a * .2}deg) scale(.35)`, opacity: 0 }, { transform: `rotate(${a}deg) scale(1)`, opacity: 1 }],
      { duration: 1200, delay: i * 18, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }).finished));
    reveal(true);                                        // under full cover: swap the intro for the card
    await wait(350);
    SND.play('shower'); petals(80, 4200, 2600);   /* user: 5x the shower, spread over 2.6 s */
    await Promise.all(fs.map(([f, a]) => { const sp = a > 0 ? -70 : 70;   /* part like curtains toward the edges */
      return f.animate([{ transform: `rotate(${a}deg)` }, { transform: `rotate(${a - Math.sign(a || 1) * 70}deg)`, opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).finished; }));
    fs.forEach(([f]) => f.remove());
  }
  /* Skip (user 2026-11-13): never on screen at a step's start. During a hand-played step (knot, kolam, dial, globe) it
     fades in once the step has run skipMs with no touch — after the 2 s hint, before the 6 s auto-complete. Any touch hides
     it and restarts the clock. Cinematic beats (untie, leaf lifts, fan reveal) are never skippable from here. */
  let skippable = false, stepT0 = 0, lastTouch = 0, skipWatch = null, finishStep = null;   /* finishStep: the current step's own auto-complete */
  const armSkip = on => { skippable = on; stepT0 = performance.now(); hideSkip(); };
  const hideSkip = () => { $('#skip').hidden = true; };
  document.addEventListener('pointerdown', e => { lastTouch = performance.now(); if (running && !e.target.closest('#skip')) hideSkip(); }, true);
  function watchSkip() {
    clearInterval(skipWatch);
    skipWatch = setInterval(() => {
      const sk = $('#skip'), n = performance.now();
      if (!running) { clearInterval(skipWatch); return; }
      if (skippable && finishStep && sk.hidden && n - Math.max(stepT0, lastTouch) > IT.skipMs) {   /* only while the step can still be skipped */
        sk.hidden = false;
        if (!RM) sk.animate([{ opacity: 0, transform: 'translate(-50%, 8px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 450, easing: 'ease-out' });
      }
    }, 250);
  }
  /* instruction captions (user playtest 2026-11-13: gestures alone weren't understood): one short line per step, shown
     at the step's start, centred above the object you act on; it rides the language toggle like every other string. */
  let sayEl = null;
  function say(key, y) {
    unsay();
    sayEl = el(`<div class="say glass" style="top:${y}px"><span data-t="say_${key}">${t('say_' + key)}</span></div>`);
    layer.appendChild(sayEl); stepDown(sayEl);
    if (!RM) sayEl.animate([{ opacity: 0, transform: 'translate(-50%, 6px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 400, easing: 'ease-out' });
  }
  function unsay() { if (!sayEl) return; const s = sayEl; sayEl = null;
    s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 1 : 250, fill: 'forwards' }).finished.then(() => s.remove()); }
  function reveal(instant) {
    clearInterval(skipWatch); skippable = false;
    layer.remove(); layer = null; running = false; clearTimers();
    document.body.classList.remove('intro');
    $('#skip').hidden = true;
    if (!instant && !RM) $('#card').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
  }

  // ---------------------------------------------------------------- run
  async function start() {
    if (running) return; running = true; clearTimers();
    expand(false);
    document.body.classList.add('intro');                // hides the card + card-only feathers; corners + bed stay
    layer = el('<div id="intro"></div>'); $('#stage').appendChild(layer);
    layer.addEventListener('contextmenu', e => e.preventDefault());   /* Android long-press menu on the globe */
    hideSkip(); watchSkip();
    try {
      say('knot', 256); armSkip(true); await arrival(); armSkip(false); unsay(); await untie();
      preloadGlobe();                                    // fetch the globe while the guest traces
      say('kolam', 426); armSkip(true); await kolam(); armSkip(false); unsay(); await wait(IT.settleMs); await lift(); await wait(900);
      layer.querySelector('.kolam').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
      say('dial', 414); armSkip(true); const db = await dial(); armSkip(false); unsay(); await wait(300); await lift();
      db.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(60px) scale(.8)' }], { duration: 500, fill: 'forwards' }); await wait(900);
      say('globe', 432); armSkip(true); await globe(); armSkip(false); unsay(); await lift(); await wait(1300);
      await fanReveal();
    } catch (e) { console.error('intro aborted ->', e); if (layer) reveal(); }   /* never strand a guest; but never hide why */
  }
  /* Skip (user 2026-11-13): completes ONLY the current step, through the same path its idle auto-complete uses. */
  function skip() { if (!running || !finishStep) return; const f = finishStep; finishStep = null; $('#skip').hidden = true; f(); }
  function preload() {                                   // first visit: fetch the bundle sprites while the loader shows
    ['leaf_cover', 'leaf_title', 'leaf_plain', 'knot', 'dial_disc', 'dial_ring', 'beacon_0', 'beacon_1', 'beacon_2']
      .forEach(id => { const i = new Image(); i.src = `${A}${id}.webp`; });
  }
  return { start, skip, preload, get running() { return running; } };
})();
