import { useEffect, useRef } from 'react';
import { SATELLITES, type Satellite } from '../../lib/satellites';

interface Pass {
  satellite: Satellite;
  fromLeft: boolean;
  /** start top-left y, in px */
  y0: number;
  /** end top-left y, in px */
  y1: number;
  /** displayed width, in px */
  w: number;
  t0: number;
  dur: number;
}

const MIN_INTERVAL = 7_000;
const MAX_INTERVAL = 14_000;
const OPACITY = 1;
const BRIGHTNESS = 0.7;
const MIN_H = 40;
const MAX_H = 88;

/** CSS clamp equivalent for the displayed height, in px. */
function displayHeight(vh: number): number {
  return Math.min(MAX_H, Math.max(MIN_H, vh * 0.09));
}

/**
 * Foreground overlay: real historical satellites crossing the viewport in a
 * straight line at a random diagonal (direction, slope and height are random),
 * rendered above all site text at full opacity. The trajectory runs from fully
 * off one edge to fully off the other, so the image emerges from the screen
 * edge and exits completely — no opacity fade. A `brightness` filter keeps the
 * exposure subtle without touching transparency. Images are preloaded so the
 * first pass never pops in late. Disabled under `prefers-reduced-motion`.
 */
export function SatelliteOverlay() {
  const imgRef = useRef<HTMLImageElement>(null);
  const passRef = useRef<Pass | null>(null);
  const nextAtRef = useRef(0);
  const enabledRef = useRef(false);
  const dimsRef = useRef<Map<string, { w: number; h: number }>>(new Map());

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    enabledRef.current = true;
    nextAtRef.current = performance.now() + 6_000 + Math.random() * 8_000;

    // warm the image cache so the first pass has its natural dimensions ready
    const dims = dimsRef.current;
    for (const s of SATELLITES) {
      const pre = new Image();
      pre.onload = () => dims.set(s.id, { w: pre.naturalWidth, h: pre.naturalHeight });
      pre.src = s.image;
    }

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const img = imgRef.current;
      if (!img || !enabledRef.current) return;

      const now = performance.now();
      let pass = passRef.current;

      if (!pass) {
        if (now < nextAtRef.current) {
          img.style.opacity = '0';
          img.style.visibility = 'hidden';
          return;
        }
        const satellite = SATELLITES[Math.floor(Math.random() * SATELLITES.length)];
        const natural = dims.get(satellite.id);
        const h = displayHeight(window.innerHeight);
        const w = natural && natural.h > 0 ? (natural.w / natural.h) * h : h;
        pass = {
          satellite,
          fromLeft: Math.random() < 0.5,
          y0: window.innerHeight * (0.08 + Math.random() * 0.82),
          y1: window.innerHeight * (0.08 + Math.random() * 0.82),
          w,
          t0: now,
          dur: 8_700 + Math.random() * 4_000,
        };
        passRef.current = pass;
        img.src = pass.satellite.image;
        img.style.visibility = 'visible';
      }

      const t = now - pass.t0;
      if (t >= pass.dur) {
        passRef.current = null;
        img.style.opacity = '0';
        img.style.visibility = 'hidden';
        nextAtRef.current = now + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
        return;
      }

      const q = t / pass.dur;
      const screenW = window.innerWidth;
      // travel the top-left corner from fully off one edge to fully off the other
      const x = pass.fromLeft ? -pass.w + q * (screenW + pass.w) : screenW - q * (screenW + pass.w);
      const y = pass.y0 + (pass.y1 - pass.y0) * q;

      img.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      img.style.opacity = String(OPACITY);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      <img
        ref={imgRef}
        alt=""
        draggable={false}
        className="select-none"
        style={{
          height: `clamp(${MIN_H}px, 9vh, ${MAX_H}px)`,
          width: 'auto',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
          filter: `brightness(${BRIGHTNESS})`,
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
