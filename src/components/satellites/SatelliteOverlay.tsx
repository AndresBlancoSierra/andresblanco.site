import { useEffect, useRef } from 'react';
import { SATELLITES, type Satellite } from '../../lib/satellites';

interface Pass {
  satellite: Satellite;
  fromLeft: boolean;
  yPct: number;
  t0: number;
  dur: number;
}

const MIN_INTERVAL = 18_000;
const MAX_INTERVAL = 32_000;
const OPACITY = 1;

/**
 * Foreground overlay: real historical satellites crossing the viewport slowly
 * in a straight horizontal line, rendered above all site text at full opacity
 * (no fade — the image simply enters and exits the screen). The images are
 * transparent PNGs so they float without a box. Disabled under
 * `prefers-reduced-motion`.
 */
export function SatelliteOverlay() {
  const imgRef = useRef<HTMLImageElement>(null);
  const passRef = useRef<Pass | null>(null);
  const nextAtRef = useRef(0);
  const enabledRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    enabledRef.current = true;
    nextAtRef.current = performance.now() + 6_000 + Math.random() * 8_000;

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
        pass = {
          satellite,
          fromLeft: Math.random() < 0.5,
          yPct: 0.08 + Math.random() * 0.78,
          t0: now,
          dur: 26_000 + Math.random() * 12_000,
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
      const x = pass.fromLeft ? q * 100 : 100 - q * 100;
      const y = window.innerHeight * pass.yPct;

      img.style.transform = `translate3d(calc(${x}vw - 50%), ${y}px, 0)`;
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
          height: 'clamp(70px, 16vh, 150px)',
          width: 'auto',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
