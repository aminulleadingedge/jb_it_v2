import { useEffect, useRef, useState } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { FLAVOURS, type Flavour } from './data';
import { getProductCutoutDataUrl } from './hardwareArtwork';
import { hexToRgba } from './math';

interface ShopSectionProps {
  activeFlavour: number;
  reducedMotion: boolean;
  shopRef: React.RefObject<HTMLElement | null>;
  cardsRef: React.RefObject<HTMLDivElement | null>;
  pkRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  cardTiltsRef: React.MutableRefObject<Array<{ x: number; y: number }>>;
  onPokeLiveBar: () => void;
  onRequestQuoteFor: (flavour: Flavour) => void;
  onOpenProducts: () => void;
}

export function ShopSection({
  activeFlavour,
  reducedMotion,
  shopRef,
  cardsRef,
  pkRefs,
  cardTiltsRef,
  onPokeLiveBar,
  onRequestQuoteFor,
  onOpenProducts,
}: ShopSectionProps) {
  const [revealed, setRevealed] = useState(false);
  const [pokedCard, setPokedCard] = useState<number | null>(null);
  const [unitUrls, setUnitUrls] = useState<string[]>(() =>
    FLAVOURS.map((f) => f.imageUrl),
  );
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const isFinePointer = useRef(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(FLAVOURS.map((_, i) => getProductCutoutDataUrl(i))).then(
      (urls) => {
        if (!cancelled) setUnitUrls(urls);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    isFinePointer.current =
      typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

    if (reducedMotion) {
      setRevealed(true);
      return;
    }

    const el = shopRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion, shopRef]);

  const handleCardPointerMove = (i: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !isFinePointer.current || e.pointerType !== 'mouse') return;
    const card = cardRefs.current[i];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardTiltsRef.current[i] = { x, y };
    card.classList.add('tilting');
    card.style.transform = `translateY(-8px) rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`;
  };

  const handleCardPointerLeave = (i: number) => {
    const card = cardRefs.current[i];
    cardTiltsRef.current[i] = { x: 0, y: 0 };
    if (!card) return;
    card.classList.remove('tilting', 'pressing');
    card.style.transform = '';
  };

  const handleCardClick = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.card-add')) return;
    if (i === activeFlavour) {
      onPokeLiveBar();
    } else {
      setPokedCard(null);
      window.requestAnimationFrame(() => setPokedCard(i));
      window.setTimeout(() => {
        setPokedCard((curr) => (curr === i ? null : curr));
      }, 520);
    }
  };

  return (
    <section id="shop" ref={shopRef} aria-label="Featured 3D hardware lines">
      <div className="flex items-center justify-end mb-4">
        <button
          type="button"
          onClick={() => onOpenProducts()}
          className="text-xs font-mono uppercase tracking-[0.14em] px-4 py-2 rounded-full border border-[#1c1a1f] text-[#1c1a1f] hover:bg-[#1c1a1f] hover:text-[#f0e8e0] transition-colors whitespace-nowrap cursor-pointer"
        >
          View All Products
        </button>
      </div>

      <div className={`cards ${revealed ? 'revealed' : ''}`} ref={cardsRef}>
        {FLAVOURS.map((flav, i) => {
          const isLive = i === activeFlavour;
          return (
            <div
              key={flav.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`card ${isLive ? 'live' : ''}`}
              style={{
                backgroundColor: hexToRgba(flav.color, 0.45),
                transitionDelay: revealed ? `${i * 80}ms` : '0ms',
              }}
              onPointerMove={(e) => handleCardPointerMove(i, e)}
              onPointerLeave={() => handleCardPointerLeave(i)}
              onPointerDown={() => cardRefs.current[i]?.classList.add('pressing')}
              onPointerUp={() => cardRefs.current[i]?.classList.remove('pressing')}
              onClick={(e) => handleCardClick(i, e)}
            >
              <h3 className="card-name disp">
                {flav.lines[0]}
                <br />
                {flav.lines[1]}
              </h3>

              <div
                ref={(el) => {
                  pkRefs.current[i] = el;
                }}
                className={`pk ${pokedCard === i ? 'poke' : ''}`}
                style={{
                  backgroundImage: `url("${unitUrls[i]}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                }}
                aria-hidden="true"
              />

              <button
                type="button"
                className="card-add"
                aria-label={`Chat on WhatsApp for ${flav.name}`}
                title={`Chat on WhatsApp for ${flav.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestQuoteFor(flav);
                }}
              >
                <WhatsAppIcon size={20} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
