'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Central GSAP setup. Import { gsap, ScrollTrigger } from here so the plugin
 * is registered exactly once and only on the client.
 *
 * ponytail: ScrollTrigger retained intentionally -- planned for scroll-triggered
 * 3D scene reveals (camera moves, stage entrances). No .create() calls yet.
 * Drop it here if those reveals ship via a different mechanism.
 */
let registered = false;
if (typeof window !== 'undefined' && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
