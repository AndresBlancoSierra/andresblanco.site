import { useLayoutEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  as?: 'h1' | 'h2' | 'span';
  className?: string;
  /** milliseconds per character */
  speed?: number;
  /** delay before typing starts, in ms */
  delay?: number;
  /** show a thin blinking caret while typing */
  caret?: boolean;
  /** keep the caret blinking after the text finishes (e.g. the hero) */
  keepCaret?: boolean;
}

/**
 * Typewriter — reveals `text` character by character, terminal style.
 *
 * The full text is server-rendered in the DOM (SEO and no-JS visitors see it
 * intact) but hidden until hydration (`html.js .tw-typewriter`). On hydration
 * an IntersectionObserver waits until the title crosses the vertical center of
 * the viewport, then the reveal starts from empty — so it types exactly as the
 * reader lands on it, never flashing the finished title first. Honors
 * `prefers-reduced-motion` by showing the full text with no caret.
 */
export default function Typewriter({
  text,
  as = 'span',
  className,
  speed = 45,
  delay = 0,
  caret = true,
  keepCaret = false,
}: TypewriterProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.style.visibility = 'visible';
      if (caretRef.current) caretRef.current.style.display = 'none';
      return;
    }

    let i = 0;
    let timer = 0;
    let startTimer = 0;

    const type = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        timer = window.setTimeout(type, speed);
      } else if (!keepCaret && caretRef.current) {
        caretRef.current.style.display = 'none';
      }
    };

    const start = () => {
      host.style.visibility = 'visible';
      el.textContent = '';
      startTimer = window.setTimeout(type, delay);
    };

    // trigger once the title passes the vertical center of the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: '0px 0px -50% 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(startTimer);
    };
  }, [text, speed, delay, keepCaret]);

  const Tag = as;
  return (
    <Tag className={`${className ?? ''} tw-typewriter`.trim()}>
      <span ref={textRef}>{text}</span>
      {caret && <span ref={caretRef} className="tw-caret" aria-hidden="true" />}
    </Tag>
  );
}
