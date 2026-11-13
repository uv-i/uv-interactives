/* Invitation · audio (BGM + SFX). Loaded before app.js; exposes window.SND.
   BGM: the user's track, loop-edited offline (scripts/make_bgm_loop.py) and looped sample-exact in Web Audio.
   SFX: one table. 'rustle' slices come from the user's recording; everything else is synthesised (gdd.md: "SFX
   synthesized OK"), so there are no extra downloads. Everything is quiet and warm: this is an invitation, not a game.
   Browser rule: nothing plays before the first tap (S2). Mute is remembered; tab hidden = fade out + suspend. */
'use strict';
window.SND = (() => {
  const VOL = { master: 1, bgm: .42, sfx: .75 };            // tunables
  const FADE = { bgmIn: 2.5, mute: .5, unmute: 1, hide: .6, show: 1.2 };
  let ac = null, master, bgmBus, sfxBus, bgm = null, bgmBuf = null, rustle = null, started = false;
  let muted = (() => { try { return localStorage.getItem('mute') === '1'; } catch (e) { return false; } })();
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const now = () => ac.currentTime;
  const ramp = (g, v, sec) => { const t = now(); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + sec); };

  async function load(url) { const r = await fetch(url); return ac.decodeAudioData(await r.arrayBuffer()); }
  /* MP3 encoders pad silence at both ends; a looping buffer would hiccup there. Loop between the first and last
     non-silent samples instead (the track itself is loud at the seam, so any near-zero run is encoder padding). */
  function loopPoints(buf) {
    const d = buf.getChannelData(0), eps = 1e-4; let a = 0, b = d.length - 1;
    while (a < d.length && Math.abs(d[a]) < eps) a++;
    while (b > a && Math.abs(d[b]) < eps) b--;
    return [a / buf.sampleRate, (b + 1) / buf.sampleRate];
  }
  function startBgm() {
    if (!bgmBuf || bgm) return;
    const [ls, le] = loopPoints(bgmBuf);
    bgm = ac.createBufferSource(); bgm.buffer = bgmBuf; bgm.loop = true; bgm.loopStart = ls; bgm.loopEnd = le;
    bgm.connect(bgmBus); bgm.start(0, ls);
    bgmBus.gain.setValueAtTime(0, now()); ramp(bgmBus, muted ? 0 : VOL.bgm, FADE.bgmIn);
  }
  /* iOS (user 2026-11-13: no sound on iPhone): Safari only unlocks audio inside touchend/click (pointerdown is NOT a
     user-activation event there), and Web Audio obeys the silent switch unless the audio session is 'playback'.
     So: listen on touchend + click too, retry resume on every gesture until running, play a 1-sample silent buffer
     inside the gesture (the classic iOS unlock), and set navigator.audioSession.type (Safari 16.4+). */
  async function unlock() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = VOL.master; master.connect(ac.destination);
        bgmBus = ac.createGain(); bgmBus.gain.value = 0; bgmBus.connect(master);
        sfxBus = ac.createGain(); sfxBus.gain.value = muted ? 0 : VOL.sfx; sfxBus.connect(master);
      }
      if (ac.state !== 'running') {
        const s = ac.createBufferSource(); s.buffer = ac.createBuffer(1, 1, 22050); s.connect(ac.destination); s.start(0);
        await ac.resume();
      }
      if (ac.state === 'running' && !started) {
        started = true;
        bgmBuf = await load('a/bgm_loop.mp3'); startBgm();
        load('a/olai_rustle.mp3').then(b => rustle = b).catch(() => {});
      }
    } catch (e) { /* audio is decoration: never break the invitation */ }
  }
  ['touchend', 'click', 'pointerdown', 'keydown'].forEach(ev => addEventListener(ev, unlock, { passive: true }));

  function setMuted(m) {
    muted = m; try { localStorage.setItem('mute', m ? '1' : '0'); } catch (e) {}
    if (!ac) return;
    ramp(bgmBus, m ? 0 : VOL.bgm, m ? FADE.mute : FADE.unmute);
    ramp(sfxBus, m ? 0 : VOL.sfx, .15);
  }
  document.addEventListener('visibilitychange', () => {   // S2: tab hidden -> fade out + suspend; back -> resume + fade in
    if (!ac) return;
    if (document.hidden) { ramp(bgmBus, 0, FADE.hide); setTimeout(() => document.hidden && ac.suspend(), FADE.hide * 1000 + 50); }
    else { ac.resume().then(() => { if (!muted) ramp(bgmBus, VOL.bgm, FADE.show); }); }
  });

  // ---------------------------------------------------------------- synth voices
  function out(gain, at = 0) { const g = ac.createGain(); g.gain.value = 0; g.connect(sfxBus); return { g, t: now() + at, gain }; }
  function noise(dur) { const n = Math.max(1, Math.floor(ac.sampleRate * dur)), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; }
  /* bell: inharmonic partials of a small brass bell (temple-bell flavour), soft attack, long ring */
  function bell(f, { gain = .18, at = 0, decay = 1.6 } = {}) {
    const { g, t } = out(gain, at);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .008); g.gain.exponentialRampToValueAtTime(.0005, t + decay);
    [[1, 1], [2.0, .45], [2.76, .35], [4.07, .18], [5.4, .1]].forEach(([r, a]) => {
      const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.value = f * r; og.gain.value = a;
      og.gain.setValueAtTime(a, t); og.gain.exponentialRampToValueAtTime(.0005, t + decay / (r * .7)); o.connect(og).connect(g); o.start(t); o.stop(t + decay + .05); });
  }
  /* tok: a soft wooden tap for buttons */
  function tok({ gain = .16, f = 760, at = 0 } = {}) {
    const { g, t } = out(gain, at), o = ac.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .55, t + .07);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .003); g.gain.exponentialRampToValueAtTime(.0005, t + .11);
    o.connect(g); o.start(t); o.stop(t + .14);
  }
  /* swish: filtered air, for panels/sheets/whooshes */
  function swish({ dur = .32, gain = .12, f0 = 700, f1 = 3200, at = 0 } = {}) {
    const { g, t } = out(gain, at), s = noise(dur), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .7;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + dur * .35); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    s.connect(bp).connect(g); s.start(t); s.stop(t + dur + .02);
  }
  /* glitter: a few tiny high bells, scattered (the gold sparkle vfx) */
  function glitter({ n = 6, spread = .6, gain = .05, at = 0 } = {}) {
    for (let i = 0; i < n; i++) bell(2400 + Math.random() * 2600, { gain: gain * (.6 + Math.random() * .6), at: at + Math.random() * spread, decay: .5 + Math.random() * .5 });
  }
  /* pluck: a taut thread letting go (knot untie) */
  function pluck({ f = 330, gain = .2, at = 0 } = {}) {
    const { g, t } = out(gain, at), o = ac.createOscillator(), lp = ac.createBiquadFilter(); o.type = 'sawtooth'; lp.type = 'lowpass';
    o.frequency.setValueAtTime(f * 1.5, t); o.frequency.exponentialRampToValueAtTime(f, t + .03);
    lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(400, t + .35);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .004); g.gain.exponentialRampToValueAtTime(.0005, t + .5);
    o.connect(lp).connect(g); o.start(t); o.stop(t + .55);
  }
  /* rustle: slices of the user's leaf recording (lift = one of two bursts; restack = whole clip) */
  const SLICE = { lift: [[.04, .26], [.40, .40]], restack: [[0, 1.42]] };
  function leaf(kind = 'lift', { gain = .8, at = 0 } = {}) {
    if (!rustle) return swish({ dur: .18, gain: .08, f0: 2500, f1: 4200, at });
    const opts = SLICE[kind], [off, dur] = opts[Math.floor(Math.random() * opts.length)], t = now() + at;
    const s = ac.createBufferSource(); s.buffer = rustle; s.playbackRate.value = .93 + Math.random() * .14;
    const g = ac.createGain(), v = gain * (.85 + Math.random() * .3); g.connect(sfxBus);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .008); g.gain.setTargetAtTime(0, t + dur * .75, .03);
    s.connect(g); s.start(t, off, dur + .08);
  }

  // ---------------------------------------------------------------- the SFX table (Phase A wired now; Phase B uses the same names)
  const SFX = {
    tap: () => tok(),                                           // any secondary button
    lang: () => { tok({ f: 900 }); bell(1320, { gain: .06, at: .05, decay: .6 }); },   // language swap (with the cross-fade)
    open: () => swish({ dur: .28, gain: .09 }),                 // sheet / panel opens
    close: () => swish({ dur: .22, gain: .07, f0: 2800, f1: 900 }),
    expand: () => leaf('lift', { gain: .5 }),                   // 07b: the details panel slides up like a leaf
    cta: () => { tok({ f: 620, gain: .14 }); bell(988, { gain: .1, at: .04, decay: 1.2 }); },   // Add to calendar
    saved: () => { bell(1175, { gain: .1 }); bell(1568, { gain: .07, at: .09 }); },           // download / ics done
    toast: () => bell(1760, { gain: .045, decay: .5 }),
    arrive: () => { bell(659, { gain: .12, decay: 2.4 }); glitter({ n: 5, at: .15 }); },    // 01a: the card arrives
    petals: () => glitter({ n: 7, spread: 1.4, gain: .035 }),   // petals drifting
    mute: () => tok({ f: 520, gain: .1 }),
    // Phase B (intro) ---------------------------------------------------------------
    untie: () => { pluck(); glitter({ n: 8, at: .05 }); },      // 02 snap: thread lets go + gold sparkle
    lift: () => leaf('lift'),                                   // olai: one leaf swings up
    restack: () => leaf('restack', { gain: .7 }),
    trace: () => swish({ dur: .12, gain: .03, f0: 1800, f1: 2600 }),   // 03: chalk-on-stone grain while tracing (call per ~stroke step)
    kolam: () => { bell(523, { gain: .12, decay: 2.2 }); bell(784, { gain: .08, at: .12, decay: 2 }); glitter({ n: 6, at: .2 }); },
    detent: () => tok({ f: 1400, gain: .07 }),                  // 04: one click per day on the dial
    snap: () => { tok({ f: 300, gain: .18 }); bell(880, { gain: .12, at: .03, decay: 1.6 }); },   // dial locks on 22
    hold: () => { const { g, t } = out(.06), o = ac.createOscillator(); o.type = 'sine';      // 05: rising shimmer while holding the beacon (0.8 s)
      o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(1320, t + .8);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + .2); g.gain.linearRampToValueAtTime(0, t + .85); o.connect(g); o.start(t); o.stop(t + .9); },
    flyin: () => swish({ dur: .9, gain: .14, f0: 300, f1: 2400 }),
    fan: () => { swish({ dur: 1.1, gain: .16, f0: 400, f1: 2000 }); glitter({ n: 10, spread: 1.4, at: .5 }); },   // 06
    shower: () => { glitter({ n: 14, spread: 2.2, gain: .04 }); bell(523, { gain: .1, at: .1, decay: 2.6 }); bell(659, { gain: .08, at: .35, decay: 2.4 }); bell(784, { gain: .08, at: .6, decay: 2.4 }); },
  };
  function play(name) { if (!ac || ac.state !== 'running' || muted) return; try { SFX[name] && SFX[name](); } catch (e) {} }
  /* BGM swell for the big reveal (06): +4 dB for a few seconds, then back */
  function swell(sec = 4) { if (!ac || muted) return; const t = now(); bgmBus.gain.cancelScheduledValues(t);
    bgmBus.gain.setValueAtTime(bgmBus.gain.value, t); bgmBus.gain.linearRampToValueAtTime(VOL.bgm * 1.6, t + .8); bgmBus.gain.linearRampToValueAtTime(VOL.bgm, t + sec); }
  return { play, setMuted, get muted() { return muted; }, swell, unlock, get on() { return !!ac && ac.state === 'running'; } };
})();
