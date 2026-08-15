import { useEffect, useRef } from 'react';
import { SATELLITES } from '../../lib/satellites';

interface Pass {
  fromLeft: boolean;
  /** start top-left y of the sharp image, in px */
  y0: number;
  /** end top-left y of the sharp image, in px */
  y1: number;
  /** displayed width of the sharp image, in px */
  w: number;
  /** canvas placement offset (streak margin), in px */
  ox: number;
  oy: number;
  t0: number;
  dur: number;
}

const MIN_INTERVAL = 7_000;
const MAX_INTERVAL = 14_000;
const OPACITY = 1;
const BRIGHTNESS = 0.7;
const MIN_H = 40;
const MAX_H = 88;
const BLUR_SAMPLES = 6;
const BLUR_FACTOR = 0.15;
const BLUR_MIN = 3;
const BLUR_MAX_RATIO = 0.8;

/** CSS clamp equivalent for the displayed height, in px. */
function displayHeight(vh: number): number {
  return Math.min(MAX_H, Math.max(MIN_H, vh * 0.09));
}

/**
 * Directional motion blur: stamps the satellite several times along `-dir`
 * (trailing the motion) with a falling alpha, producing a streak behind the
 * sharp leading copy. The result is baked into the canvas buffer at `dpr`
 * resolution. Returns the canvas placement offset so the sharp copy aligns
 * with the trajectory point.
 */
function bakeBlur(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  dx: number,
  dy: number,
  blurLen: number,
  dpr: number,
): { ox: number; oy: number } {
  const streakX = -dx * blurLen;
  const streakY = -dy * blurLen;
  const minX = Math.min(0, streakX);
  const minY = Math.min(0, streakY);
  const cwCss = Math.ceil(Math.max(w, w + streakX) - minX);
  const chCss = Math.ceil(Math.max(h, h + streakY) - minY);

  const canvas = ctx.canvas;
  canvas.width = Math.ceil(cwCss * dpr);
  canvas.height = Math.ceil(chCss * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cwCss, chCss);

  for (let i = 0; i <= BLUR_SAMPLES; i++) {
    const f = i / BLUR_SAMPLES;
    ctx.globalAlpha = 0.2 + 0.8 * f;
    ctx.drawImage(img, -minX + streakX * (1 - f), -minY + streakY * (1 - f), w, h);
  }
  ctx.globalAlpha = 1;

  canvas.style.width = `${cwCss}px`;
  canvas.style.height = `${chCss}px`;
  return { ox: minX, oy: minY };
}

/**
 * Foreground overlay: real historical satellites crossing the viewport in a
 * straight line at a random diagonal (direction, slope and height are random),
 * rendered above all site text at full opacity. The trajectory runs from fully
 * off one edge to fully off the other, so the image emerges from the screen
 * edge and exits completely — no opacity fade. A directional motion blur bakes
 * a subtle streak behind each satellite, and a `brightness` filter keeps the
 * exposure low without touching transparency. Images are preloaded so the first
 * pass never pops in late. Disabled under `prefers-reduced-motion`.
 */
export function SatelliteOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const passRef = useRef<Pass | null>(null);
  const nextAtRef = useRef(0);
  const enabledRef = useRef(false);
  const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    enabledRef.current = true;
    nextAtRef.current = performance.now() + 6_000 + Math.random() * 8_000;

    // warm the image cache so the first pass has its source and dimensions ready
    for (const s of SATELLITES) {
      const pre = new Image();
      pre.onload = () => cacheRef.current.set(s.id, pre);
      pre.src = s.image;
    }

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const canvas = canvasRef.current;
      if (!canvas || !enabledRef.current) return;

      const now = performance.now();
      let pass = passRef.current;

      if (!pass) {
        if (now < nextAtRef.current) {
          canvas.style.opacity = '0';
          canvas.style.visibility = 'hidden';
          return;
        }
        const satellite = SATELLITES[Math.floor(Math.random() * SATELLITES.length)];
        const img = cacheRef.current.get(satellite.id);
        if (!img || !img.complete) {
          nextAtRef.current = now + 1_500;
          return;
        }

        const h = displayHeight(window.innerHeight);
        const w = img.naturalHeight > 0 ? (img.naturalWidth / img.naturalHeight) * h : h;
        const screenW = window.innerWidth;
        const fromLeft = Math.random() < 0.5;
        const y0 = window.innerHeight * (0.08 + Math.random() * 0.82);
        const y1 = window.innerHeight * (0.08 + Math.random() * 0.82);
        const dur = 8_700 + Math.random() * 4_000;

        const sx = fromLeft ? 1 : -1;
        const travelX = screenW + w;
        const slope = (y1 - y0) / travelX;
        const len = Math.hypot(sx, slope);
        const speed = (travelX / dur) * 1000; // px per second
        const blurLen = Math.max(BLUR_MIN, Math.min(w * BLUR_MAX_RATIO, speed * BLUR_FACTOR));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let ox = 0;
        let oy = 0;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const placed = bakeBlur(ctx, img, w, h, sx / len, slope / len, blurLen, dpr);
          ox = placed.ox;
          oy = placed.oy;
        }

        pass = { fromLeft, y0, y1, w, ox, oy, t0: now, dur };
        passRef.current = pass;
        canvas.style.visibility = 'visible';
      }

      const t = now - pass.t0;
      if (t >= pass.dur) {
        passRef.current = null;
        canvas.style.opacity = '0';
        canvas.style.visibility = 'hidden';
        nextAtRef.current = now + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
        return;
      }

      const q = t / pass.dur;
      const screenW = window.innerWidth;
      // travel the sharp image's top-left from fully off one edge to fully off the other
      const x = pass.fromLeft ? -pass.w + q * (screenW + pass.w) : screenW - q * (screenW + pass.w);
      const y = pass.y0 + (pass.y1 - pass.y0) * q;

      canvas.style.transform = `translate3d(${x + pass.ox}px, ${y + pass.oy}px, 0)`;
      canvas.style.opacity = String(OPACITY);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="select-none"
        style={{
          width: '1px',
          height: '1px',
          opacity: 0,
          visibility: 'hidden',
          willChange: 'transform, opacity',
          filter: `brightness(${BRIGHTNESS})`,
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
