import { useEffect, useLayoutEffect, useRef } from 'react';
import { Facebook } from 'lucide-react';
import { COMPANY_BRAND } from './data';

export type NavSectionId = 'flavors' | 'products' | 'solutions' | 'about';
export type NavTheme = 'hero' | 'light' | 'dark';

interface NavBarProps {
  entered: boolean;
  pageView: 'home' | 'products';
  activeSection: NavSectionId;
  navTheme: NavTheme;
  onNavigateHome: (sectionId?: 'flavors' | 'inside' | 'shop' | 'solutions' | 'about' | 'quote') => void;
  onNavigateProducts: () => void;
}

const LINKS: Array<{ id: NavSectionId; label: string; href: string }> = [
  { id: 'flavors', label: 'Home', href: '#flavors' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'solutions', label: 'Solutions', href: '#solutions' },
  { id: 'about', label: 'About', href: '#about' },
];

export function NavBar({
  entered,
  pageView,
  activeSection,
  navTheme,
  onNavigateHome,
  onNavigateProducts,
}: NavBarProps) {
  const pillRef = useRef<HTMLDivElement | null>(null);
  const hlRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<NavSectionId, HTMLAnchorElement | null>>({
    flavors: null,
    products: null,
    solutions: null,
    about: null,
  });

  const currentTab: NavSectionId = pageView === 'products' ? 'products' : activeSection;

  const updateHighlight = () => {
    const pill = pillRef.current;
    const hl = hlRef.current;
    const activeEl = linkRefs.current[currentTab];
    if (!pill || !hl || !activeEl) return;
    const pr = pill.getBoundingClientRect();
    const ar = activeEl.getBoundingClientRect();
    hl.style.left = `${ar.left - pr.left}px`;
    hl.style.width = `${ar.width}px`;
  };

  useLayoutEffect(() => {
    updateHighlight();
  }, [currentTab, entered, pageView]);

  useEffect(() => {
    const onResize = () => updateHighlight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [currentTab]);

  const effectiveTheme = pageView === 'products' ? 'light' : navTheme;
  const themeClass = effectiveTheme === 'dark' ? 'dark' : effectiveTheme === 'light' ? 'light' : '';

  return (
    <header className={`nav ${entered ? 'entered' : ''} ${themeClass}`}>
      <a
        href="/"
        className="brand bg-[#fdfbf9] px-3 py-1.5 rounded-full shadow-xs border border-black/10"
        aria-label={`${COMPANY_BRAND.name} Home`}
        onClick={(e) => {
          e.preventDefault();
          onNavigateHome('flavors');
        }}
      >
        <img
          src={COMPANY_BRAND.logoUrl}
          alt={`${COMPANY_BRAND.banglaName} ${COMPANY_BRAND.name} — ${COMPANY_BRAND.tagline}`}
          width={65}
          height={36}
          className="h-8 md:h-9 w-auto aspect-[553/306] object-contain block"
          referrerPolicy="no-referrer"
        />
      </a>

      <nav className="nav-pill" ref={pillRef} aria-label="Primary navigation">
        <div className="nav-hl" ref={hlRef} aria-hidden="true" />
        {LINKS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              ref={(el) => {
                linkRefs.current[item.id] = el;
              }}
              className={`nav-link ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (item.id === 'products') {
                  onNavigateProducts();
                } else {
                  onNavigateHome(item.id);
                }
              }}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="nav-right">
        <a
          href={COMPANY_BRAND.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-fb"
          aria-label={`${COMPANY_BRAND.name} Facebook Page`}
          title="Visit JB IT on Facebook"
        >
          <Facebook size={18} fill="currentColor" strokeWidth={0} />
        </a>

        <button
          type="button"
          className="nav-dibs"
          onClick={() => onNavigateHome('quote')}
        >
          Request Quote
        </button>
      </div>
    </header>
  );
}
