'use client';

import { useEffect, useRef, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function GlitchText({
  text,
  className = '',
  delay = 0,
  speed = 30,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(text);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const startTyping = () => {
      if (hasRun.current) return;
      hasRun.current = true;
      setDisplayed('');
      setTimeout(() => {
        setStarted(true);
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setDisplayed(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(interval);
            setTimeout(() => setDone(true), 800);
          }
        }, speed);
      }, delay);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTyping();
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(el);

    const fallbackTimer = setTimeout(startTyping, delay + 300);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [text, speed, delay]);

  return (
    <span ref={ref} className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <span aria-hidden="true" style={{ visibility: 'hidden', whiteSpace: 'pre-wrap' }}>
        {text}
      </span>
      <span
        aria-live="polite"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {started ? displayed : text}
        {started && !done && (
          <span
            style={{
              display: 'inline-block',
              width: '0.06em',
              height: '0.85em',
              backgroundColor: 'currentColor',
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'tw-blink 0.7s step-end infinite',
            }}
          />
        )}
      </span>
      <style>{`
        @keyframes tw-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

export default GlitchText;
