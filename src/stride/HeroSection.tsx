import { useEffect, useRef, useState } from 'react';
import { FLAVOURS, HERO_BITS } from './data';
import { getProductCutoutDataUrl } from './hardwareArtwork';

interface HeroSectionProps {
  entered: boolean;
  activeFlavour: number;
  titleTrigger: { flavour: number; dir: 1 | -1; seq: number };
  autoplay: boolean;
  reducedMotion: boolean;
  heroRef: React.RefObject<HTMLElement | null>;
  revealRef: React.RefObject<HTMLDivElement | null>;
  arcRef: React.RefObject<HTMLDivElement | null>;
  onNext: () => void;
  onToggleAutoplay: () => void;
}

let measureCanvas: HTMLCanvasElement | null = null;
function measureArchivoText(text: string): number {
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return text.length * 60;
  ctx.font = '400 100px "Archivo Black", sans-serif';
  return ctx.measureText(text).width;
}

function buildTitleFragment(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const words = text.toUpperCase().split(' ');
  words.forEach((word) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    for (const ch of word) {
      const chSpan = document.createElement('span');
      chSpan.className = 'ch';
      chSpan.textContent = ch;
      wordSpan.appendChild(chSpan);
    }
    frag.appendChild(wordSpan);
  });
  return frag;
}

export function HeroSection({
  entered,
  activeFlavour,
  titleTrigger,
  autoplay,
  reducedMotion,
  heroRef,
  revealRef,
  arcRef,
  onNext,
  onToggleAutoplay,
}: HeroSectionProps) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const bitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bitsStartedRef = useRef(false);
  const prevSeqRef = useRef(-1);
  const [cutouts, setCutouts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(FLAVOURS.map((_, i) => getProductCutoutDataUrl(i))).then((urls) => {
      if (!cancelled) setCutouts(urls);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyTitleSize = (flavourIdx: number) => {
    const el = titleRef.current;
    if (!el) return;
    const name = FLAVOURS[flavourIdx].name.toUpperCase();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw < 820) {
      const words = name.split(' ');
      let maxW = 1;
      for (const w of words) {
        maxW = Math.max(maxW, measureArchivoText(w));
      }
      const basePx = Math.min(64, Math.max(40, vw * 0.125));
      const fitPx = ((vw - 36) * 100) / maxW;
      el.style.fontSize = `${Math.min(basePx, fitPx)}px`;
    } else {
      const u = Math.min(vw / 1440, vh / 900);
      const w = Math.max(1, measureArchivoText(name));
      el.style.fontSize = `${Math.min(96 * u, (760 * u * 100) / w)}px`;
    }
  };

  useEffect(() => {
    const el = titleRef.current;
    if (el && !el.hasChildNodes()) {
      el.appendChild(buildTitleFragment(FLAVOURS[activeFlavour].name));
      applyTitleSize(activeFlavour);
    }

    const onResize = () => applyTitleSize(titleTrigger.flavour);
    window.addEventListener('resize', onResize);
    document.fonts.ready.then(() => applyTitleSize(titleTrigger.flavour));
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (prevSeqRef.current === -1) {
      prevSeqRef.current = titleTrigger.seq;
      applyTitleSize(titleTrigger.flavour);
      return;
    }
    if (prevSeqRef.current === titleTrigger.seq) return;
    prevSeqRef.current = titleTrigger.seq;

    const el = titleRef.current;
    const newName = FLAVOURS[titleTrigger.flavour].name;

    if (reducedMotion) {
      if (el) {
        el.replaceChildren(buildTitleFragment(newName));
        applyTitleSize(titleTrigger.flavour);
      }
      return;
    }

    if (el) {
      const oldChars = Array.from(el.querySelectorAll('.ch')) as HTMLElement[];
      const dir = titleTrigger.dir;
      const outTarget = dir > 0 ? '-110%' : '110%';
      const inStart = dir > 0 ? '110%' : '-110%';

      oldChars.forEach((ch, idx) => {
        ch.animate(
          [
            { transform: 'translateY(0%)', opacity: 1 },
            { transform: `translateY(${outTarget})`, opacity: 0 },
          ],
          {
            duration: 180,
            delay: idx * 8,
            easing: 'cubic-bezier(0.45, 0, 0.75, 0.3)',
            fill: 'forwards',
          },
        );
      });

      window.setTimeout(() => {
        el.replaceChildren(buildTitleFragment(newName));
        applyTitleSize(titleTrigger.flavour);
        const newChars = Array.from(el.querySelectorAll('.ch')) as HTMLElement[];
        newChars.forEach((ch, idx) => {
          ch.style.opacity = '0';
          ch.style.transform = `translateY(${inStart})`;
          ch.animate(
            [
              { transform: `translateY(${inStart})`, opacity: 0 },
              { transform: 'translateY(0%)', opacity: 1 },
            ],
            {
              duration: 480,
              delay: 15 + idx * 14,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'forwards',
            },
          );
        });
      }, 80);
    }
  }, [titleTrigger, reducedMotion]);

  useEffect(() => {
    if (!entered || bitsStartedRef.current) return;
    bitsStartedRef.current = true;

    HERO_BITS.forEach((_, i) => {
      const el = bitRefs.current[i];
      if (!el) return;

      if (reducedMotion) {
        el.style.opacity = '0.58';
        return;
      }

      el.animate([{ opacity: 0 }, { opacity: 0.68 }], {
        duration: 900,
        delay: 300 + 90 * i,
        easing: 'ease-out',
        fill: 'forwards',
      });

      const dx = (i % 2 === 0 ? 1 : -1) * (12 + (i % 3));
      const dy = -(22 + 3 * i);
      const dRot = (i % 2 === 0 ? 1 : -1) * (10 + (i % 3));

      el.animate(
        [
          { transform: 'translate3d(0px, 0px, 0px) rotate(0deg)' },
          { transform: `translate3d(${dx}px, ${dy}px, 0px) rotate(${dRot}deg)` },
          { transform: 'translate3d(0px, 0px, 0px) rotate(0deg)' },
        ],
        {
          duration: 7000 + 900 * i,
          easing: 'ease-in-out',
          iterations: Infinity,
          composite: 'add',
        },
      );
    });
  }, [entered, reducedMotion]);

  return (
    <section id="flavors" ref={heroRef} aria-label="JB IT hardware showcase">
      <div className="reveal" ref={revealRef} aria-hidden="true" />
      <div className={`rings ${entered ? 'entered' : ''}`} aria-hidden="true" />

      <div className="bits" aria-hidden="true">
        {HERO_BITS.map((bit, i) => {
          const src = cutouts[bit.bitIndex];
          return (
            <div
              key={i}
              ref={(el) => {
                bitRefs.current[i] = el;
              }}
              className={`bit ${bit.hideOnPhone ? 'hidden md:block' : ''}`}
              style={{
                left: `${bit.xFrac * 100}%`,
                top: `${bit.yFrac * 100}%`,
                width: `calc(${bit.sizeU} * var(--u))`,
                height: `calc(${bit.sizeU} * var(--u))`,
                transform: `translate(-50%, -50%) rotate(${bit.rot}deg)`,
              }}
            >
              {src && (
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-contain drop-shadow-md"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="arc" ref={arcRef} />

      <button
        type="button"
        id="play"
        className={entered ? 'entered' : ''}
        onClick={onNext}
        aria-label="Next product"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3.5 10H16.5M11.5 5L16.5 10L11.5 15"
            stroke="#1c1a1f"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1 id="title" ref={titleRef} className="disp" aria-live="polite" />

      <button
        type="button"
        id="heroScrollDown"
        className={`hero-scroll-btn ${entered ? 'entered' : ''}`}
        onClick={() => {
          const el = document.getElementById('inside');
          if (el) {
            el.scrollIntoView({
              behavior: reducedMotion ? 'auto' : 'smooth',
              block: 'start',
            });
          }
        }}
        aria-label="Scroll to product specifications"
      >
        <span>EXPLORE</span>
        <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
          <path
            d="M2.5 5.5L7 10L11.5 5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        type="button"
        id="auto"
        className={entered ? 'entered' : ''}
        aria-pressed={autoplay}
        onClick={onToggleAutoplay}
      >
        <span className="auto-ring" aria-hidden="true">
          {autoplay ? (
            <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
              <rect x="2.4" y="2" width="2.4" height="8" rx="1.1" />
              <rect x="7.2" y="2" width="2.4" height="8" rx="1.1" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
              <path d="M3.2 2.2L9.8 6L3.2 9.8V2.2Z" />
            </svg>
          )}
        </span>
        <span>AUTOPLAY</span>
      </button>
    </section>
  );
}
