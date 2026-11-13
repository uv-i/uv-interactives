/* Invitation · app (stage 7, Phase A). Grown out of comps/screen.html (approved stage-4 renderer).
   Phase A: 00 loading · 01a ambient intro (first visit only) · 07 card (+07b/07c/07d) · 08 poster · 09 share · 10 calendar
   · S1 language · S3 reduced motion. Phase B (the olai intro, 01–06) is added to this same page later.
   Tunables are in TUNE; every visible string is in content.json (inlined by the build). */
'use strict';
const TUNE = {
  design: [360, 740],          // the locked comp's design box; scaled to fit every screen
  ambientMs: 1900,             // 01a: feathers settle + petals drift before the card arrives
  slowMs: 4000,                // 00: show "Loading…" after this
  giveUpMs: 7000,              // 00: reveal the card anyway (text works without art)
  countdownEveryMs: 30000,
};
const C = JSON.parse(document.getElementById('content').textContent);
const Q = new URLSearchParams(location.search), H = new URLSearchParams(location.hash.slice(1));
const RENDER = H.get('render');                                   // build-time: 'poster' | 'og'
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || !!RENDER;
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const $ = s => document.querySelector(s);
const el = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

// ---------------------------------------------------------------- language (S1)
let LANG = H.get('lang') || store.get('lang') || ((navigator.language || '').toLowerCase().startsWith('ta') ? 'ta' : 'en');
const t = k => (C[LANG] && C[LANG][k] != null ? C[LANG][k] : C.en[k]);      /* missing ta -> en, never blank */

function heartPath(cx, cy, s = 1) {
  const P = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `M${P(0,95)} C${P(-30,70)} ${P(-110,22)} ${P(-105,-35)} C${P(-100,-86)} ${P(-36,-96)} ${P(0,-50)} C${P(36,-96)} ${P(100,-86)} ${P(105,-35)} C${P(110,22)} ${P(30,70)} ${P(0,95)} Z`;
}
let HID = 0;
const HEART = () => { const id = 'hg' + (HID++);   /* the kolam heart, gold foil + ink edge (screens.md v12) */
  return `<svg class="heart" viewBox="-118 -104 236 210" aria-label="&amp;"><defs><linearGradient id="${id}" x1="0" y1="-100" x2="0" y2="100" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#F2D27A"/><stop offset=".5" stop-color="#C8913A"/><stop offset="1" stop-color="#8A5A18"/></linearGradient></defs>
    <path d="${heartPath(0, 0)}" fill="url(#${id})" stroke="#4A2E14" stroke-width="13" stroke-linejoin="round"/>
    <path d="${heartPath(0, 4, .5)}" fill="none" stroke="#FFF2C4" stroke-width="9" opacity=".9"/></svg>`; };

/* style.json type.names: single line, step down until it fits (never wrap, never clip) */
function stepDown(root) {
  root.querySelectorAll('.names, .t1, .d, .cd, .ink .fit').forEach(n => {
    n.style.fontSize = '';
    const ps = getComputedStyle(n.parentElement), box = n.parentElement.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight) - 2;
    let fs = parseFloat(getComputedStyle(n).fontSize);
    const d = n.style.display; n.style.display = 'inline-block';
    const floor = n.matches('.ink .fit') ? 8 : 10;
    while (n.getBoundingClientRect().width / scale > box && fs > floor) { fs -= .5; n.style.fontSize = fs + 'px'; }
    n.style.display = d;
  });
}

function applyLang() {
  document.documentElement.lang = LANG;
  document.body.classList.toggle('ta', LANG === 'ta');
  document.title = t('page_title');
  document.querySelectorAll('[data-t]').forEach(n => { n.textContent = t(n.dataset.t); n.classList.add('lx'); });
  $('#names').innerHTML = $('#names2').innerHTML = `${t('bride')} ${HEART()} ${t('groom')}`;
  $('#lang .en').classList.toggle('on', LANG === 'en'); $('#lang .ta').classList.toggle('on', LANG === 'ta');
  tickCountdown();
  stepDown($('#stage'));
}
$('#lang').onclick = () => {
  SND.play('lang');
  document.body.classList.add('swap');
  setTimeout(() => { LANG = LANG === 'en' ? 'ta' : 'en'; store.set('lang', LANG); applyLang(); document.body.classList.remove('swap'); }, RM ? 0 : 250);
};

// ---------------------------------------------------------------- fit: design box scaled into any screen
let scale = 1;
const FRAME = [['b',180,160,150,-34,1],['a',180,160,162,-17,1],['c',180,160,172,0,1],['a',180,160,162,17,1],['b',180,160,150,34,1],
  ['b',46,540,230,-96,1],['a',314,540,230,96,1],['a',-14,6,150,138,4],['c',6,-6,135,158,4],['b',374,6,150,-138,4],['a',354,-6,135,-158,4],
  ['c',-30,868,310,12,4],['a',-22,826,235,31,4],['b',-12,800,182,50,4],['a',390,868,310,-12,4],['c',382,826,235,-31,4],['b',372,800,182,-50,4]];
/* landscape edges: quills off-screen, eyes pointing in; y as a fraction of the screen height (screens.md v6) */
const SIDE = [['c',-24,1.07,340,38],['a',-44,.76,300,68],['b',-44,.49,280,92],['a',-34,.23,260,116],['c',-20,-.04,240,142]];
const F = { a:'a/feather_eye.webp', b:'a/feather_eye_b.webp', c:'a/feather_eye_c.webp' };
function feather(host, v, x, y, h, rot, z, cls = '') {
  const im = new Image(); im.src = F[v]; im.className = 'f ' + cls; im.alt = ''; const w = h * .45;
  Object.assign(im.style, { height: h + 'px', width: w + 'px', left: (x - w / 2) + 'px', top: (y - h) + 'px', transform: `rotate(${rot}deg)`, zIndex: z });
  im.dataset.rot = rot; host.appendChild(im); return im;
}
function fit() {
  const vw = innerWidth, vh = innerHeight, [dw, dh] = TUNE.design;
  const land = vw > vh * 1.05 && RENDER !== 'poster';
  document.body.classList.toggle('land', land);
  scale = RENDER === 'og' ? vh / 624 * .94 : Math.min(vw / dw, vh / dh);
  const oy = RENDER === 'og' ? -370 * scale + (370 - 370) : -dh / 2 * scale;      /* og: the card is centred (card spans y 58..682) */
  $('#stage').style.transform = `translate(${-dw / 2 * scale}px, ${oy}px) scale(${scale})`;
  const side = $('#side'); side.innerHTML = '';
  if (land) for (const [v, x, fy, h, rot] of SIDE) {
    feather(side, v, x * scale, fy * vh, h * scale, rot, 1);
    feather(side, v, vw - x * scale, fy * vh, h * scale, -rot, 1);
  }
  document.querySelectorAll('#stage > .f.side-only').forEach(f => f.hidden = land);   /* portrait-edge feathers float mid-screen in landscape */
}
addEventListener('resize', () => { fit(); stepDown($('#stage')); });

// ---------------------------------------------------------------- countdown (07 / 07c / 07d)
const NOW = () => (Q.get('now') ? new Date(Q.get('now')) : new Date());     /* ?now=2026-11-22T09:00+05:30 for QA */
const istDay = d => new Date(d.getTime() + 5.5 * 3600e3).toISOString().slice(0, 10);
function tickCountdown() {
  const now = NOW(), E = C.events, wed = new Date(E.wedding.start), thanks = new Date(E.thanks_after), cd = $('#cd'), today = istDay(now);
  let txt;
  if (now >= thanks) { txt = t('thanks'); $('#cta').hidden = true; }
  else if (today === '2026-11-22') txt = t('today_wed');
  else { const ms = wed - now, d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    txt = (d > 0 ? t('cd_days') : t('cd_hours')).replace('{d}', d).replace('{h}', h).replace('{m}', m);
    if (LANG === 'en') txt = txt.replace(/1 days/, '1 day').replace(/1 hrs/, '1 hr'); }
  cd.textContent = txt;
}

// ---------------------------------------------------------------- 07b expand / collapse
function expand(on) { SND.play(on ? 'expand' : 'close'); $('#panel').hidden = !on; $('#txt').style.visibility = on ? 'hidden' : ''; if (on) stepDown($('#panel')); }
$('#more').onclick = () => expand(true); $('#less').onclick = () => expand(false);

// ---------------------------------------------------------------- toast
let toastT;
function toast(msg) { SND.play('toast'); const n = $('#toast'); n.textContent = msg; n.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => n.hidden = true, 2600); }

// ---------------------------------------------------------------- 10 calendar
const inApp = /FBAN|FBAV|Instagram|WhatsApp|Line\/|; wv\)/i.test(navigator.userAgent);
const z = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
function gcal(key) {
  const e = C.events[key], p = new URLSearchParams({ action: 'TEMPLATE', text: t('ev_wed'),
    dates: `${z(e.start)}/${z(e.end)}`, location: t('venue'), details: C.map });
  return 'https://calendar.google.com/calendar/render?' + p;
}
function ics() {
  const ev = (key, uid) => ['BEGIN:VEVENT', `UID:${uid}@priya-dinesh`, `DTSTAMP:${z(Date.now())}`, `DTSTART:${z(C.events[key].start)}`, `DTEND:${z(C.events[key].end)}`,
    `SUMMARY:${t('ev_wed')}`, `LOCATION:${t('venue')}`, `DESCRIPTION:${C.map}`,
    'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM', 'END:VEVENT'];
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//uv-i//invitation//EN', 'CALSCALE:GREGORIAN', ...ev('wedding', 'wed'), 'END:VCALENDAR'].join('\r\n');
}
function download(href, name) { const a = el(`<a download="${name}" href="${href}"></a>`); document.body.appendChild(a); a.click(); a.remove(); }
$('#cta').onclick = () => { SND.play('cta'); setTimeout(() => SND.play('open'), 120); $('#gWed').href = gcal('wedding'); $('#sheet').hidden = false; };
$('#ics').onclick = () => {
  if (inApp) toast(t('ics_blocked'));                     /* in-app browsers often block .ics; the Google links still work */
  download(URL.createObjectURL(new Blob([ics()], { type: 'text/calendar' })), 'Priya-Dinesh.ics'); SND.play('saved');
};

// ---------------------------------------------------------------- 08 save poster
$('#save').onclick = () => {
  SND.play('open'); const src = `poster_${LANG}.jpg`;
  $('#posterImg').src = src; $('#poster').hidden = false;  /* full-screen: long-press saves everywhere, incl. iOS / in-app */
  if (!inApp && !/iPhone|iPad/.test(navigator.userAgent)) { download(src, `Priya-Dinesh-invitation-${LANG}.jpg`); toast(t('saved')); }
};

// ---------------------------------------------------------------- 09 share
$('#share').onclick = async () => {
  SND.play('tap');
  const data = { title: t('page_title'), text: t('share_text'), url: location.href.split('#')[0] };
  if (navigator.share) { try { await navigator.share(data); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(data.url); toast(t('copied')); }
  catch (e) { open('https://wa.me/?text=' + encodeURIComponent(`${data.text} ${data.url}`), '_blank', 'noopener'); }
};

// ---------------------------------------------------------------- close any overlay
document.querySelectorAll('.opt[href]').forEach(a => a.addEventListener('click', () => SND.play('saved')));
$('#dir').addEventListener('click', () => SND.play('tap'));
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) { SND.play('close'); $('#sheet').hidden = true; $('#poster').hidden = true; } });

// ---------------------------------------------------------------- 01a ambient intro + replay
function petalDrift(n = 10) {
  const st = $('#stage'), kinds = ['petal_rose', 'petal_marigold', 'petal_jasmine'];
  for (let i = 0; i < n; i++) {
    const p = el(`<img class="petal" src="a/${kinds[i % 3]}.webp" alt="">`), x = 20 + Math.random() * 320, r0 = Math.random() * 360;
    p.style.left = x + 'px'; p.style.top = '-30px'; st.appendChild(p);
    p.animate([{ transform: `translate(0,0) rotate(${r0}deg)`, opacity: 0 }, { opacity: 1, offset: .15 },
               { transform: `translate(${(Math.random() - .5) * 120}px, ${600 + Math.random() * 200}px) rotate(${r0 + 260}deg)`, opacity: 0 }],
      { duration: 3200 + Math.random() * 1600, delay: Math.random() * 900, easing: 'cubic-bezier(.3,.2,.6,1)' }).finished.then(() => p.remove());
  }
}
function ambient() {
  const card = $('#card'), fs = [...document.querySelectorAll('#stage > .f')];
  if (RM) return;
  $('#skip').hidden = false;
  card.animate([{ opacity: 0, transform: 'translateY(14px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: TUNE.ambientMs - 700, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  fs.forEach((f, i) => f.animate([{ transform: `rotate(${f.dataset.rot * 1.3}deg)`, opacity: 0 }, { transform: `rotate(${f.dataset.rot}deg)`, opacity: 1 }],
    { duration: 1100, delay: i * 45, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
  petalDrift();
  SND.play('petals'); setTimeout(() => SND.play('arrive'), TUNE.ambientMs - 600);   /* sounds only once the guest has tapped (browser rule) */
  setTimeout(() => $('#skip').hidden = true, TUNE.ambientMs + 300);
}
$('#skip').onclick = () => { SND.play('tap'); if (window.INTRO && INTRO.running) return INTRO.skip(); document.getAnimations().forEach(a => a.finish()); $('#skip').hidden = true; };
$('#replay').onclick = () => { expand(false); window.INTRO ? INTRO.start() : ambient(); };   /* Phase B: replay = the olai intro */
// ---------------------------------------------------------------- S2 mute (remembered); BGM starts on the first tap anywhere
function muteIcon() { $('#mute img').src = SND.muted ? 'a/ic_sound_off.png' : 'a/ic_sound_on.png'; }
$('#mute').onclick = () => { SND.setMuted(!SND.muted); muteIcon(); SND.play('mute'); };
muteIcon();     /* Phase A replay; Phase B replays the olai intro */

// ---------------------------------------------------------------- boot (00 loading)
function build() {
  const st = $('#stage');
  FRAME.forEach(([v, x, y, h, rot, zi], i) => feather(st, v, x, y, h, rot, zi, (i === 5 || i === 6 ? 'side-only ' : '') + (i >= 11 ? 'corner' : '')));
  for (const [x, y, d] of [[70,92,0],[290,120,1.1],[60,380,2.0],[300,420,.6],[180,60,1.6],[110,600,2.4],[250,640,.3],[320,300,1.9]])
    st.appendChild(el(`<span class="tw" style="left:${x}px;top:${y}px;animation-delay:${d}s"></span>`));
  $('#dir').href = C.map; $('#footer').href = C.games;
  if (RENDER) document.body.classList.add('r-' + RENDER);
}
function whenImages(sel, ms) {
  const imgs = [...document.querySelectorAll(sel)].map(i => i.tagName === 'image' ? i.href.baseVal : i.src).filter(Boolean);
  const bed = 'a/petal_bed_portrait.webp';
  return Promise.race([Promise.all([...imgs, bed].map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s; })).concat(document.fonts.ready)),
                       new Promise(r => setTimeout(r, ms))]);
}
(async () => {
  build(); fit(); applyLang();
  if (!store.get('seen') && window.INTRO) INTRO.preload();   /* bundle sprites load with the card */
  const slow = setTimeout(() => { $('#slow').textContent = t('loading'); $('#slow').hidden = false; }, TUNE.slowMs);
  await whenImages('#hero image, #hero img, #stage > .f', TUNE.giveUpMs);
  clearTimeout(slow);
  applyLang();                                            /* fonts are in: re-measure the step-down */
  document.body.classList.add('loaded');
  const first = !store.get('seen') || Q.has('intro');
  if (first && !RENDER) (window.INTRO ? INTRO.start() : ambient());   /* first visit: the olai intro; returning: straight to the card (screens.md) */
  store.set('seen', '1');
  setInterval(tickCountdown, TUNE.countdownEveryMs);
  document.body.dataset.ready = '1';
})();
