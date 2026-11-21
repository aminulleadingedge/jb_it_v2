import { useCallback, useEffect, useRef, useState } from 'react';
import { ABOUT_CONTENT, COMPANY_BRAND } from './data';

interface AboutSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}

export function AboutSection({ sectionRef, reducedMotion }: AboutSectionProps) {
  const [isInView, setIsInView] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const localSectionRef = useRef<HTMLElement | null>(null);

  const setMergedRef = useCallback(
    (node: HTMLElement | null) => {
      localSectionRef.current = node;
      if (sectionRef && 'current' in sectionRef) {
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [sectionRef],
  );

  /* Track when the About section enters / leaves viewport */
  useEffect(() => {
    if (reducedMotion) {
      setIsInView(false);
      return;
    }

    const el = localSectionRef.current || (sectionRef && sectionRef.current) || document.getElementById('about');
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsInView(true);
          setAnimKey((k) => k + 1);
        } else {
          setIsInView(false);
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion, sectionRef]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ABOUT_CONTENT.transitionPhrases.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  return (
    <section
      id="about"
      ref={setMergedRef}
      aria-label="About JB IT"
      className="relative bg-[#f0e8e0] text-[#1c1a1f] px-5 sm:px-10 lg:px-14 py-20 lg:py-28 border-t border-black/10"
    >
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-6">
            <h2
              key={animKey}
              className={`disp text-4xl sm:text-6xl leading-[0.9] text-[#1c1a1f] about-headline-loop ${
                isInView ? 'is-looping' : ''
              }`}
            >
              {ABOUT_CONTENT.headlineLines.map((line, i) => (
                <span key={line} className="reveal-line-mask">
                  <span
                    className="about-line-loop-inner"
                    style={{
                      animationDelay: isInView ? `${i * 140}ms` : '0ms',
                    }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>
            <p className="text-lg sm:text-xl pt-3 leading-relaxed text-[#1c1a1f]/90 font-medium">
              {ABOUT_CONTENT.leadParagraph}
            </p>
          </div>

          <div className="lg:col-span-6 space-y-6 pt-2">
            <p className="text-base sm:text-lg leading-relaxed text-[#1c1a1f]/75">
              {ABOUT_CONTENT.bodyParagraph}
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-[#1c1a1f]/65 italic">
              {ABOUT_CONTENT.mottoParagraph}
            </p>

            {/* Smooth Kinetic Transition Text Statement */}
            <div
              className="rounded-2xl bg-white/75 border border-black/10 p-6 min-h-[120px] flex flex-col justify-between gap-4"
              aria-live="polite"
            >
              <p
                key={phraseIndex}
                className="text-base sm:text-lg font-semibold text-[#1c1a1f] transition-all duration-500"
                style={{
                  animation: reducedMotion ? 'none' : 'aboutFadeSlide 480ms cubic-bezier(0.22, 0.8, 0.24, 1)',
                }}
              >
                {ABOUT_CONTENT.transitionPhrases[phraseIndex]}
              </p>

              <div className="flex items-center gap-2" role="group" aria-label="Company highlight statements">
                {ABOUT_CONTENT.transitionPhrases.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhraseIndex(idx)}
                    aria-label={`Highlight ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      phraseIndex === idx ? 'w-8 bg-[#1c1a1f]' : 'w-2.5 bg-[#1c1a1f]/25 hover:bg-[#1c1a1f]/45'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 pt-10 border-t border-black/10">
          {ABOUT_CONTENT.pillars.map((pillar) => (
            <div key={pillar.label} className="space-y-2">
              <h3 className="font-mono text-xs uppercase tracking-[0.14em] font-semibold text-[#1c1a1f]">
                {pillar.label}
              </h3>
              <p className="text-sm leading-relaxed text-[#1c1a1f]/75">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
