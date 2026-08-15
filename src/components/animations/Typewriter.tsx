import { useLayoutEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  as?: 'h1' | 'h2' | 'span';
  className?: string;
  /** milliseconds per character */
  speed?: number;
  /** delay before typing starts, in ms */
  delay?: number;
  /** show a blinking terminal caret while typing */
  caret?: boolean;
  /** keep the caret blinking after the text finishes (e.g. the hero) */
  keepCaret?: boolean;
}

/**
 * Typewriter — reveals `text` character by character, terminal style.
 *
 * The full text is server-rendered in the DOM (so SEO and no-JS visitors see
 * it intact); on hydration the span is cleared and retyped. Use `client:visible`
 * so a short section title starts typing exactly as it scrolls into view.
 * Honors `prefers-reduced-motion` by leaving the full text visible with no
 * caret.
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
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (caretRef.current) caretRef.current.style.display = 'none';
      return;
    }

    el.textContent = '';
    let i = 0;
    let timer = 0;

    const type = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) {
        timer = window.setTimeout(type, speed);
      } else if (!keepCaret && caretRef.current) {
        caretRef.current.style.display = 'none';
      }
    };

    const start = window.setTimeout(type, delay);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [text, speed, delay, keepCaret]);

  const Tag = as;
  return (
    <Tag className={className}>
      <span ref={textRef}>{text}</span>
      {caret && (
        <span ref={caretRef} className="tw-caret" aria-hidden="true">
          ▍
        </span>
      )}
    </Tag>
  );
}
