import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, MessageCircle, RotateCcw, Search } from 'lucide-react';
import {
  buildWhatsAppUrl,
  PRODUCT_CATEGORIES,
  PRODUCTS_CATALOG,
  type ProductCategoryId,
} from './data';

interface ProductsPageProps {
  onBackHome: () => void;
  initialCategory?: ProductCategoryId;
}

export function ProductsPage({ onBackHome, initialCategory = 'all' }: ProductsPageProps) {
  const [category, setCategory] = useState<ProductCategoryId>(initialCategory);
  const [query, setQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCategory(initialCategory || 'all');
    setQuery('');
    setFlippedCards({});
  }, [initialCategory]);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS_CATALOG.filter((item) => {
      const catOk = category === 'all' || item.category === category;
      const textOk =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.specs && item.specs.some((s) => s.toLowerCase().includes(q)));
      return catOk && textOk;
    });
  }, [category, query]);

  return (
    <main
      id="products-page"
      aria-label="JB IT Products Directory"
      className="min-h-screen bg-[#f0e8e0] text-[#1c1a1f] pt-28 pb-32 md:pb-24 px-5 sm:px-10 lg:px-14"
    >
      <div className="max-w-[1320px] mx-auto">
        <div className="pb-5 border-b border-black/10">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#1c1a1f]/75 hover:text-[#1c1a1f] cursor-pointer"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Back to Home Showcase</span>
          </button>
        </div>

        <div className="products-filter-bar bg-[#f0e8e0]/95 backdrop-blur-md border-b border-black/10">
          <div className="flex flex-col gap-2 py-3 md:flex-row md:items-center">
            <div
              className="order-2 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto products-category-scroll md:order-1"
              role="group"
              aria-label="Filter products by category"
            >
              {PRODUCT_CATEGORIES.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${category === tab.id
                      ? 'bg-[#1c1a1f] text-[#f0e8e0]'
                      : 'bg-white/75 text-[#1c1a1f] border border-black/10 hover:bg-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <label className="relative order-1 block w-full shrink-0 md:order-2 md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1c1a1f]/50"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products or specs..."
                aria-label="Search products"
                className="w-full rounded-full bg-white border border-black/15 pl-10 pr-4 py-2.5 text-sm text-[#1c1a1f] placeholder:text-[#1c1a1f]/45 focus:outline-none focus:border-[#1c1a1f]"
              />
            </label>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white/75 border border-black/10 p-12 text-center">
            <p className="font-mono text-sm text-[#1c1a1f]/75 mb-4">
              No products matched your filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('all');
                setQuery('');
              }}
              className="px-5 py-2.5 rounded-full bg-[#1c1a1f] text-[#f0e8e0] text-xs font-mono uppercase tracking-[0.12em] cursor-pointer"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((product) => {
              const hasFailed = failedImages[product.id];
              const isFlipped = !!flippedCards[product.id];

              return (
                <div
                  key={product.id}
                  data-testid="product-card"
                  className="card-perspective h-[390px] w-full"
                >
                  <div
                    className={`card-flipper relative w-full h-full ${isFlipped ? 'card-is-flipped' : ''
                      }`}
                  >
                    {/* ========================================================= */}
                    {/* FRONT SIDE: Strictly Image, Name & WhatsApp Button */}
                    {/* ========================================================= */}
                    <article className="card-face absolute inset-0 w-full h-full rounded-2xl bg-white border border-black/10 overflow-hidden flex flex-col justify-between shadow-xs">
                      {/* 1. Product Image with Transparent Eye Icon */}
                      <div className="h-[235px] w-full bg-[#f7f4f0] relative flex items-center justify-center overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleFlip(product.id)}
                          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white backdrop-blur-md border border-white/30 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 group"
                          aria-label={`View specs for ${product.name}`}
                          title="View Specifications"
                        >
                          <Eye
                            size={18}
                            strokeWidth={2}
                            className="transition-transform group-hover:scale-110"
                          />
                        </button>

                        {hasFailed ? (
                          <div className="px-6 text-center font-mono text-xs text-[#1c1a1f]/55">
                            {product.name}
                          </div>
                        ) : (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({ ...prev, [product.id]: true }))
                            }
                          />
                        )}
                      </div>

                      {/* 2. Product Name + 3. WhatsApp Ask Price Button */}
                      <div className="p-6 flex flex-col flex-1 gap-3">
                        <h2
                          title={product.name}
                          className="h-12 shrink-0 line-clamp-2 text-lg font-bold leading-6 text-[#1c1a1f]"
                        >
                          {product.name}
                        </h2>

                        <a
                          href={buildWhatsAppUrl(product.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#25d366] text-[#111b21] font-semibold text-sm hover:opacity-95 transition-opacity whitespace-nowrap shadow-xs cursor-pointer"
                        >
                          <MessageCircle size={17} aria-hidden="true" />
                          <span>Ask Price on WhatsApp</span>
                        </a>
                      </div>
                    </article>

                    {/* ========================================================= */}
                    {/* BACK SIDE: Specifications with Scrollable Content Box     */}
                    {/* ========================================================= */}
                    <article className="card-face card-face-back absolute inset-0 w-full h-full rounded-2xl bg-white border border-black/10 overflow-hidden flex flex-col justify-between p-6 shadow-xs">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-black/10 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[#1c1a1f]/75">
                            SPECIFICATIONS
                          </span>
                          {product.categoryLabel && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black/5 text-[#1c1a1f]/60">
                              {product.categoryLabel}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFlip(product.id)}
                          className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#1c1a1f]/70 hover:text-[#1c1a1f] flex items-center justify-center transition-colors cursor-pointer"
                          title="Flip back to product photo"
                          aria-label="Flip back to product photo"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>

                      {/* Product Name on Back */}
                      <h3 className="font-bold text-sm text-[#1c1a1f] mt-3 line-clamp-2 shrink-0">
                        {product.name}
                      </h3>

                      {/* Scrollable Specs Content Box */}
                      <div className="flex-1 overflow-y-auto pr-1.5 my-3 custom-scrollbar">
                        {product.specs && product.specs.length > 0 ? (
                          <ul className="space-y-2 text-xs text-[#1c1a1f]/85">
                            {product.specs.map((spec, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 bg-[#f7f4f0]/80 p-2.5 rounded-lg border border-black/5 leading-relaxed"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1c1a1f]/60 shrink-0 mt-1.5" />
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[#1c1a1f]/50 italic py-6 text-center">
                            Inquire on WhatsApp for detailed specifications.
                          </p>
                        )}
                      </div>

                      {/* Footer Actions on Back */}
                      <div className="pt-3 border-t border-black/10 flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleFlip(product.id)}
                          className="px-3.5 py-3 rounded-full border border-black/15 text-[#1c1a1f] hover:bg-black/5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                          title="Flip back to photo"
                        >
                          Photo
                        </button>
                        <a
                          href={buildWhatsAppUrl(product.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#25d366] text-[#111b21] font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity whitespace-nowrap shadow-xs"
                        >
                          <MessageCircle size={16} aria-hidden="true" />
                          <span>Ask Price</span>
                        </a>
                      </div>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
