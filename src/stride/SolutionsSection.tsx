import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveSolIdx((prev) => (prev + 1) % SOLUTIONS_LIST.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

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
            JB IT engineers provide full Network Solutions & installation, structured cabling, ATM booth links &amp; CC camera setups — alongside custom Software Solutions for POS billing, inventory &amp; office automation.
          </p>
        </div>

        {/* Animated Active Solution Spotlight Banner */}
        <div
          className="rounded-3xl bg-[#22242c] border border-white/12 p-6 sm:p-9 mb-6 transition-all duration-700"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="hidden sm:flex items-center gap-2" role="tablist" aria-label="Featured solution tracks">
              {SOLUTIONS_LIST.map((sol, idx) => (
                <button
                  key={sol.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeSolIdx}
                  onClick={() => setActiveSolIdx(idx)}
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
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[#8fa8a3] hover:text-white transition-colors cursor-pointer"
            >
              <span>Inquire About {spotlight.categoryTag}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>

          <div className="grid">
            {SOLUTIONS_LIST.map((sol, idx) => {
              const isActive = idx === activeSolIdx;
              return (
                <div
                  key={sol.id}
                  className="col-start-1 row-start-1"
                  aria-hidden={!isActive}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                    transition: reducedMotion ? 'none' : 'opacity 0.45s var(--ease), transform 0.45s var(--ease)',
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
        </div>

        {/* Staggered Animated Text Cards for Network, CCTV & Software Solutions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SOLUTIONS_LIST.map((sol, idx) => {
            const isActive = idx === activeSolIdx;
            return (
              <article
                key={sol.id}
                onMouseEnter={() => setActiveSolIdx(idx)}
                className={`rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-700 border ${
                  isActive
                    ? 'bg-[#262933] border-[#c99364]/65 shadow-lg -translate-y-1'
                    : 'bg-[#22242c] border-white/10 hover:border-white/25'
                }`}
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? undefined : 'translateY(28px)',
                  transitionDelay: revealed ? `${idx * 110}ms` : '0ms',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <span className="font-mono text-xs text-[#c99364] tracking-[0.12em]">
                      {sol.indexLabel}. {sol.categoryTag}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectSolutionQuote(sol.quoteCategory)}
                      className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-[#f0e8e0] hover:text-[#c99364] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <span>Quote</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-[#f0e8e0] mb-2">
                    {sol.title}
                  </h3>
                  <p className="text-sm text-[#f0e8e0]/75 leading-relaxed">
                    {sol.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-[#8fa8a3] pt-2 border-t border-white/10">
                  {sol.deliverables.map((item, dIdx) => (
                    <span key={item} className="inline-flex items-center gap-2.5">
                      <span>{item}</span>
                      {dIdx < sol.deliverables.length - 1 && (
                        <span aria-hidden="true" className="opacity-45">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div> */}
      </div>
    </section>
  );
}
