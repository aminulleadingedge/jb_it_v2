import { useRef, useState, useEffect } from 'react';
import { ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildWhatsAppUrl, FLAVOURS, type Flavour, type ProductCategoryId } from './data';

interface PingPongTextProps {
  text: string;
  className?: string;
}

function PingPongText({ text, className = '' }: PingPongTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [overflowDist, setOverflowDist] = useState(0);

  // Reset when text changes (e.g. changing active category)
  useEffect(() => {
    setIsHovered(false);
    setOverflowDist(0);
  }, [text]);

  const handleMouseEnter = () => {
    if (!containerRef.current || !textRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const scrollWidth = textRef.current.scrollWidth;
    const overflow = scrollWidth - containerWidth;
    if (overflow > 3) {
      setOverflowDist(overflow + 8);
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isScrolling = isHovered && overflowDist > 0;
  // Calculate pleasant scroll duration: between 3.2s and 5.5s
  const duration = Math.max(3.2, Math.min(5.5, overflowDist / 22));

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="ping-pong-track min-w-0 flex-1"
    >
      <span
        ref={textRef}
        style={
          isScrolling
            ? ({
                '--scroll-offset': `-${overflowDist}px`,
                '--scroll-duration': `${duration}s`,
              } as React.CSSProperties)
            : undefined
        }
        className={`ping-pong-content ${
          isScrolling ? 'is-animating' : 'truncate'
        } ${className}`}
      >
        {text}
      </span>
    </div>
  );
}

interface InsideSectionProps {
  activeFlavour: number;
  insideRef: React.RefObject<HTMLElement | null>;
  backFrameRef: React.RefObject<HTMLDivElement | null>;
  inBarRef: React.RefObject<HTMLDivElement | null>;
  numRef?: React.RefObject<HTMLDivElement | null>;
  frontLayerRef: React.RefObject<HTMLDivElement | null>;
  frontFrameRef: React.RefObject<HTMLDivElement | null>;
  onPrevProduct: () => void;
  onNextProduct: () => void;
  onRequestQuoteFor?: (flavour: Flavour) => void;
  onOpenProducts: (categoryId?: ProductCategoryId) => void;
}

export function InsideSection({
  activeFlavour,
  insideRef,
  backFrameRef,
  inBarRef,
  numRef,
  frontLayerRef,
  frontFrameRef,
  onPrevProduct,
  onNextProduct,
  onRequestQuoteFor,
  onOpenProducts,
}: InsideSectionProps) {
  const product = FLAVOURS[activeFlavour] ?? FLAVOURS[0];

  return (
    <>
      <section id="inside" ref={insideRef} aria-label="Active product details and specifications">
        <div className="pin">
          <div className="in-frame" ref={backFrameRef}>
            {/* Travelling 3D product cutout docks here on the left */}
            <div id="inBar" ref={inBarRef} aria-hidden="true" />
          </div>
        </div>
      </section>

      <div id="inFront" ref={frontLayerRef} aria-hidden={false}>
        <div className="in-frame" ref={frontFrameRef}>
          {/* Product Details displayed directly beside the travelling 3D cutout */}
          <div className="in-details pointer-events-auto">
            {/* Header: Prev/Next navigation + Mobile "View All" button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mb-1">
              <button
                type="button"
                onClick={() => onOpenProducts(product.id as ProductCategoryId)}
                className="sm:hidden px-3 py-1.5 rounded-full border border-[#1c1a1f]/35 text-[#1c1a1f] text-xs font-bold hover:bg-[#1c1a1f] hover:text-[#f0e8e0] transition-colors cursor-pointer shrink-0"
                title="View All Products"
              >
                <span>View All</span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onPrevProduct}
                  aria-label="Previous featured category"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#1c1a1f]/25 bg-white/40 hover:bg-white/75 text-[#1c1a1f] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onNextProduct}
                  aria-label="Next featured category"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#1c1a1f]/25 bg-white/40 hover:bg-white/75 text-[#1c1a1f] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Category Name / Title (sized to fit the longest category name without wrapping or truncating) */}
            <h2
              className="disp text-[#1c1a1f] text-2xl xs:text-3xl sm:text-4xl md:text-[50px] lg:text-[54px] leading-[0.94] tracking-tight shrink-0 my-1 sm:my-2"
            >
              {product.name}
            </h2>

            {/* Category Offerings Breakdown (on mobile: only shows primary category titles like "Surveillance Cameras", "NVR & Recording Systems"; on desktop: full 4-group specification layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-2 sm:gap-y-6 md:gap-y-8 border-t border-b border-[#1c1a1f]/20 py-2 sm:py-6 md:py-7 my-1.5 sm:my-auto">
              {product.offerings.groups.map((group, groupIdx) => (
                <div
                  key={group.title}
                  className={`flex flex-col min-w-0 ${groupIdx >= 2 ? 'hidden sm:flex' : 'flex'}`}
                >
                  <span
                    className="font-mono text-xs sm:text-xs md:text-sm uppercase tracking-[0.12em] sm:tracking-[0.14em] font-extrabold text-[#1c1a1f]/80 mb-0 sm:mb-3 flex items-center gap-2 min-w-0"
                  >
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#1c1a1f]/70 shrink-0 inline-block" aria-hidden="true" />
                    <PingPongText text={group.title} />
                  </span>
                  <ul className="hidden sm:block space-y-2 sm:space-y-2.5 md:space-y-3">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[17px] font-bold text-[#1c1a1f] flex items-center gap-2 sm:gap-2.5 min-w-0"
                      >
                        <span className="text-[#1c1a1f]/50 text-base sm:text-lg md:text-xl font-extrabold select-none shrink-0 leading-none">›</span>
                        <PingPongText text={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Action buttons (on mobile: primary quote button full-width; on desktop: side-by-side with View All) */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5 sm:pt-2 shrink-0">
              <a
                href={buildWhatsAppUrl(
                  product.name,
                  `please share the price, catalog and quotation details for: ${product.name}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onRequestQuoteFor?.(product)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3.5 md:py-4 rounded-full bg-[#1c1a1f] text-[#f0e8e0] text-xs sm:text-base md:text-[17px] font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer shrink-0"
              >
                <span className="whitespace-nowrap">Request Quote for {product.name}</span>
                <ArrowDownRight size={16} aria-hidden="true" className="shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => onOpenProducts(product.id as ProductCategoryId)}
                className="hidden sm:inline-flex px-5 sm:px-7 py-3 sm:py-3.5 md:py-4 rounded-full border border-[#1c1a1f]/35 text-[#1c1a1f] text-sm sm:text-base md:text-[17px] font-bold hover:bg-[#1c1a1f] hover:text-[#f0e8e0] transition-colors cursor-pointer shrink-0"
                title="View All Products"
              >
                <span>View All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
