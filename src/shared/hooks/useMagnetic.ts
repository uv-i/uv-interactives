import { useRef, useEffect } from 'react';

/**
 * Magnetic hover — element drifts toward cursor, springs back on leave.
 * Writes --gx / --gy CSS vars for child glow effects.
 * Includes press state: scale(0.94) on mousedown, spring-back on mouseup.
 * Sets data-magnetic so CSS :active rule doesn't double-apply a transform.
 * ponytail: direct DOM mutation, zero re-renders.
 */
export function useMagnetic(strength = 0.24) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.dataset.magnetic = '1';

    let tx = 0, ty = 0, pressed = false;

    const apply = (transition: string) => {
      el.style.transition = transition;
      const s = pressed ? ' scale(0.94)' : '';
      el.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)' + s;
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width  / 2) * strength;
      ty = (e.clientY - r.top  - r.height / 2) * strength;
      apply('transform 80ms ease-out');
      el.style.setProperty('--gx', ((e.clientX - r.left) / r.width  * 100) + '%');
      el.style.setProperty('--gy', ((e.clientY - r.top)  / r.height * 100) + '%');
    };
    const onLeave = () => {
      tx = 0; ty = 0; pressed = false;
      apply('transform 650ms cubic-bezier(0.25, 1, 0.5, 1)');
    };
    const onDown = () => {
      pressed = true;
      apply('transform 80ms ease-in');
    };
    const onUp = () => {
      pressed = false;
      apply('transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)');
    };

    el.addEventListener('mousemove',  onMove,  { passive: true });
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousedown',  onDown);
    el.addEventListener('mouseup',    onUp);
    el.addEventListener('mouseleave', onUp);

    return () => {
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousedown',  onDown);
      el.removeEventListener('mouseup',    onUp);
      el.removeEventListener('mouseleave', onUp);
    };
  }, [strength]);
  return ref;
}
