import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SOLUTIONS_LIST } from './data';

interface SolutionsSectionProps {
  sectionRef: React.RefObject<HTMLElement | null>;
  reducedMotion?: boolean;
  onSelectSolutionQuote: (quoteCategory: string) => void;
}

export function SolutionsSection({
  sectionRef,
  reducedMotion = false,
  onSelectSolutionQuote,
}: SolutionsSectionProps) {
  const [revealed, setRevealed] = useState(reducedMotion);
  const [activeSolIdx, setActiveSolIdx] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.16 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion, sectionRef]);

  // Auto-cycle through solutions every 4.2 seconds
  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setSlideDir('right');
      setActiveSolIdx((prev) => (prev + 1) % SOLUTIONS_LIST.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reducedMotion, activeSolIdx]);

  const goToSlide = (newIdx: number) => {
    if (newIdx === activeSolIdx) return;
    setSlideDir(newIdx > activeSolIdx ? 'right' : 'left');
    setActiveSolIdx(newIdx);
  };

  const nextSlide = () => {
    setSlideDir('right');
    setActiveSolIdx((prev) => (prev + 1) % SOLUTIONS_LIST.length);
  };

  const prevSlide = () => {
    setSlideDir('left');
    setActiveSolIdx((prev) => (prev - 1 + SOLUTIONS_LIST.length) % SOLUTIONS_LIST.length);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Detect intentional horizontal swipe (min 35px, primarily horizontal, fast gesture)
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2 && dt < 500) {
      if (dx < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const spotlight = SOLUTIONS_LIST[activeSolIdx] ?? SOLUTIONS_LIST[0];

  return (
    <section
      id="solutions"
      ref={sectionRef}
      aria-label="Network, CCTV and Software Solutions"
      className="relative bg-[#191a1e] text-[#f0e8e0] px-5 sm:px-10 lg:px-14 py-20 lg:py-28 overflow-hidden"
    >
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#c99364] mb-3">
              Network Solutions · CCTV · Software Solutions
            </p>
            <h2 className={`disp text-4xl sm:text-6xl lg:text-7xl text-[#f0e8e0] leading-[0.92] ${revealed ? 'revealed' : ''}`}>
              <span className="reveal-line-mask">
                <span className="reveal-line-inner">NETWORK &amp;</span>
              </span>
              <span className="reveal-line-mask">
                <span className="reveal-line-inner">SOFTWARE SOLUTIONS</span>
              </span>
            </h2>
          </div>
          <p
            className="font-mono text-sm text-[#f0e8e0]/80 max-w-lg leading-relaxed transition-all duration-700"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            JB IT engineers provide full Network Solutions &amp; installation, structured cabling, ATM booth links &amp; CC camera setups — alongside custom Software Solutions for POS billing, inventory &amp; office automation.
          </p>
        </div>

        {/* Animated Active Solution Spotlight Banner with Touch Swipe */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="rounded-3xl bg-[#22242c] border border-white/12 p-6 sm:p-9 mb-6 transition-all duration-700 select-none touch-pan-y"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            {/* Desktop / Tablet Tabs */}
            <div className="hidden sm:flex items-center gap-2" role="tablist" aria-label="Featured solution tracks">
              {SOLUTIONS_LIST.map((sol, idx) => (
                <button
                  key={sol.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeSolIdx}
                  onClick={() => goToSlide(idx)}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                    idx === activeSolIdx
                      ? 'bg-[#c99364] text-[#191a1e] font-semibold'
                      : 'border border-white/15 text-[#f0e8e0]/70 hover:text-white'
                  }`}
                >
                  {sol.indexLabel}. {sol.categoryTag}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSelectSolutionQuote(spotlight.quoteCategory)}
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[#8fa8a3] hover:text-white transition-colors cursor-pointer ml-auto sm:ml-0"
            >
              <span>Inquire About {spotlight.categoryTag}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="grid overflow-hidden">
            {SOLUTIONS_LIST.map((sol, idx) => {
              const isActive = idx === activeSolIdx;
              return (
                <div
                  key={sol.id}
                  className="col-start-1 row-start-1"
                  aria-hidden={!isActive}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? 'translateX(0)'
                      : slideDir === 'right'
                        ? 'translateX(18px)'
                        : 'translateX(-18px)',
                    transition: reducedMotion
                      ? 'none'
                      : 'opacity 0.45s cubic-bezier(0.22, 0.8, 0.24, 1), transform 0.45s cubic-bezier(0.22, 0.8, 0.24, 1)',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <h3 className="disp text-2xl sm:text-4xl lg:text-5xl text-[#f0e8e0] leading-[0.96] mb-3">
                    {sol.title}
                  </h3>
                  <p className="text-base sm:text-lg text-[#f0e8e0]/82 max-w-3xl leading-relaxed mb-5">
                    {sol.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs sm:text-sm text-[#8fa8a3]">
                    {sol.deliverables.map((item, dIdx) => (
                      <span key={item} className="inline-flex items-center gap-3">
                        <span>{item}</span>
                        {dIdx < sol.deliverables.length - 1 && (
                          <span aria-hidden="true" className="opacity-40">
                            ·
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Solution Carousel Indicator (Option B: Bottom Centered) */}
          <div
            className="flex sm:hidden justify-center items-center gap-2.5 pt-6 pb-1"
            role="tablist"
            aria-label="Solution slide pagination"
          >
            {SOLUTIONS_LIST.map((sol, idx) => {
              const isActive = idx === activeSolIdx;
              return (
                <button
                  key={sol.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to ${sol.categoryTag}`}
                  onClick={() => goToSlide(idx)}
                  className="py-2 px-1 flex items-center justify-center cursor-pointer group"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ease-out ${
                      isActive
                        ? 'w-7 h-2 bg-[#c99364] shadow-[0_0_10px_rgba(201,147,100,0.6)]'
                        : 'w-2 h-2 bg-white/35 group-hover:bg-white/70'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
