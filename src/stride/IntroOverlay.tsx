import { useEffect, useRef, useState } from 'react';
import { COMPANY_BRAND } from './data';

interface IntroOverlayProps {
  skipImmediately: boolean;
  onEnterHero: () => void;
}

export function IntroOverlay({ skipImmediately, onEnterHero }: IntroOverlayProps) {
  const [phase, setPhase] = useState<'stamp' | 'done'>(skipImmediately ? 'done' : 'stamp');
  const enteredRef = useRef(skipImmediately);

  useEffect(() => {
    if (skipImmediately) {
      document.body.classList.remove('locked');
      onEnterHero();
      return;
    }

    document.body.classList.add('locked');
    const timer = window.setTimeout(() => {
      if (enteredRef.current) return;
      enteredRef.current = true;
      setPhase('done');
      document.body.classList.remove('locked');
      onEnterHero();
    }, 1150);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove('locked');
    };
  }, [skipImmediately, onEnterHero]);

  if (phase === 'done' && skipImmediately) {
    return null;
  }

  const handleSkip = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setPhase('done');
    document.body.classList.remove('locked');
    onEnterHero();
  };

  return (
    <div
      id="intro"
      className={phase === 'done' ? 'cream done' : 'cream'}
      aria-hidden={phase === 'done'}
    >
      <button
        type="button"
        className="intro-skip"
        onClick={handleSkip}
        aria-label="Skip intro"
      >
        Skip intro
      </button>
      <div className="intro-stamp show" aria-hidden="true">
        <div className="rounded-3xl bg-white px-8 py-6 shadow-md border border-black/10">
          <img
            src={COMPANY_BRAND.logoUrl}
            alt={`${COMPANY_BRAND.name} ${COMPANY_BRAND.tagline}`}
            className="h-24 md:h-32 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}
