import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildWhatsAppUrl,
  FLAVOURS,
  type Flavour,
  type ProductCategoryId,
} from './stride/data';
import {
  clamp,
  computeSection2Metrics,
  computeTravellerPose,
  easeEntrance,
  easeInOutSine,
  easeSlide,
  evalArcPose,
  lerp,
  modFlavour,
  type BarPose,
} from './stride/math';
import { StrideThreeEngine } from './stride/threeEngine';
import { IntroOverlay } from './stride/IntroOverlay';
import { NavBar, type NavSectionId, type NavTheme } from './stride/NavBar';
import { HeroSection } from './stride/HeroSection';
import { InsideSection } from './stride/InsideSection';
import { ShopSection } from './stride/ShopSection';
import { SolutionsSection } from './stride/SolutionsSection';
import { AboutSection } from './stride/AboutSection';
import { QuoteSection } from './stride/QuoteSection';
import { ProductsPage } from './stride/ProductsPage';

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  const [pageView, setPageView] = useState<'home' | 'products'>(() => {
    if (typeof window === 'undefined') return 'home';
    return window.location.pathname === '/products' ? 'products' : 'home';
  });
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategoryId>('all');
  const [skipIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('autostart') === '1' ||
      window.location.pathname === '/products' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  const [entered, setEntered] = useState(false);
  const [activeFlavour, setActiveFlavour] = useState(0);
  const [titleTrigger, setTitleTrigger] = useState<{
    flavour: number;
    dir: 1 | -1;
    seq: number;
  }>({ flavour: 0, dir: 1, seq: 0 });
  const [autoplay, setAutoplay] = useState(() =>
    typeof window !== 'undefined'
      ? !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : true,
  );
  const [activeSection, setActiveSection] = useState<NavSectionId>('flavors');
  const [navTheme, setNavTheme] = useState<NavTheme>('hero');
  const [quotePreset, setQuotePreset] = useState<
    { category: string; seq: number } | undefined
  >(undefined);

  // Section & DOM refs
  const heroRef = useRef<HTMLElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const arcRef = useRef<HTMLDivElement | null>(null);
  const insideRef = useRef<HTMLElement | null>(null);
  const backFrameRef = useRef<HTMLDivElement | null>(null);
  const inBarRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLDivElement | null>(null);
  const frontLayerRef = useRef<HTMLDivElement | null>(null);
  const frontFrameRef = useRef<HTMLDivElement | null>(null);
  const shopRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const pkRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardTiltsRef = useRef<Array<{ x: number; y: number }>>(
    FLAVOURS.map(() => ({ x: 0, y: 0 })),
  );
  const solutionsRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const quoteRef = useRef<HTMLElement | null>(null);

  // Mutable animation state refs
  const engineRef = useRef<StrideThreeEngine | null>(null);
  const enteredRef = useRef(false);
  const pageViewRef = useRef<'home' | 'products'>(pageView);
  const reducedMotionRef = useRef(reducedMotion);
  const autoplayRef = useRef(autoplay);
  const activeFlavourRef = useRef(0);
  const activeSectionRef = useRef<NavSectionId>('flavors');
  const navThemeRef = useRef<NavTheme>('hero');

  const posRef = useRef(skipIntro ? 0 : -2.6);
  const targetRef = useRef(0);
  const posTweenRef = useRef<{
    active: boolean;
    from: number;
    to: number;
    start: number;
    dur: number;
    ease: (t: number) => number;
    swapped: boolean;
    dir: 1 | -1;
    pendingFlavour: number;
  }>({
    active: false,
    from: 0,
    to: 0,
    start: 0,
    dur: 650,
    ease: easeSlide,
    swapped: true,
    dir: 1,
    pendingFlavour: 0,
  });

  const revealAnimRef = useRef<{
    active: boolean;
    start: number;
    dur: number;
    color: string;
  }>({
    active: false,
    start: 0,
    dur: 420,
    color: FLAVOURS[0].color,
  });

  const pokeRef = useRef<{ active: boolean; start: number }>({
    active: false,
    start: 0,
  });

  const phoneCardScrolledRef = useRef(false);
  const lastInteractRef = useRef(performance.now());
  const draggingRef = useRef(false);
  const titleSeqRef = useRef(0);

  reducedMotionRef.current = reducedMotion;
  autoplayRef.current = autoplay;
  pageViewRef.current = pageView;

  useEffect(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.canvas.style.display = pageView === 'products' ? 'none' : 'block';
    }
    if (frontLayerRef.current && pageView === 'products') {
      frontLayerRef.current.style.visibility = 'hidden';
    }
    document.body.dataset.view = pageView;
  }, [pageView]);

  useEffect(() => {
    const onPopState = () => {
      const next = window.location.pathname === '/products' ? 'products' : 'home';
      setPageView(next);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) setAutoplay(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const finishRunningReveal = useCallback(() => {
    const rv = revealAnimRef.current;
    if (!rv.active) return;
    rv.active = false;
    document.documentElement.style.setProperty('--flav', rv.color);
    const el = revealRef.current;
    if (el) {
      el.style.setProperty('--rv', 'transparent');
      el.style.maskImage = '';
      el.style.webkitMaskImage = '';
    }
  }, []);

  const triggerFlavourVisuals = useCallback(
    (newFlavour: number, dir: 1 | -1) => {
      const color = FLAVOURS[newFlavour].color;
      activeFlavourRef.current = newFlavour;
      setActiveFlavour(newFlavour);
      titleSeqRef.current += 1;
      setTitleTrigger({ flavour: newFlavour, dir, seq: titleSeqRef.current });

      if (reducedMotionRef.current) {
        finishRunningReveal();
        document.documentElement.style.setProperty('--flav', color);
        return;
      }

      finishRunningReveal();
      const el = revealRef.current;
      if (el) {
        el.style.setProperty('--rv', color);
      }
      revealAnimRef.current = {
        active: true,
        start: performance.now(),
        dur: 420,
        color,
      };
    },
    [finishRunningReveal],
  );

  const goTo = useCallback(
    (nextTarget: number, overrideDur?: number) => {
      const now = performance.now();
      lastInteractRef.current = now;

      const prevTarget = targetRef.current;
      const dir: 1 | -1 = nextTarget >= prevTarget ? 1 : -1;
      const newFlavour = modFlavour(nextTarget, FLAVOURS.length);
      targetRef.current = nextTarget;

      if (reducedMotionRef.current) {
        posRef.current = nextTarget;
        posTweenRef.current.active = false;
        triggerFlavourVisuals(newFlavour, dir);
        return;
      }

      const dist = Math.abs(nextTarget - posRef.current);
      const dur = overrideDur ?? 650 + Math.max(0, dist - 1) * 160;
      posTweenRef.current = {
        active: true,
        from: posRef.current,
        to: nextTarget,
        start: now,
        dur,
        ease: easeSlide,
        swapped: false,
        dir,
        pendingFlavour: newFlavour,
      };
    },
    [triggerFlavourVisuals],
  );

  const handleEnterHero = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setEntered(true);
    lastInteractRef.current = performance.now();

    if (skipIntro || reducedMotionRef.current) {
      posRef.current = 0;
      targetRef.current = 0;
      posTweenRef.current.active = false;
      return;
    }

    posRef.current = -2.6;
    targetRef.current = 0;
    posTweenRef.current = {
      active: true,
      from: -2.6,
      to: 0,
      start: performance.now(),
      dur: 1700,
      ease: easeEntrance,
      swapped: true,
      dir: 1,
      pendingFlavour: 0,
    };
  }, [skipIntro]);

  useEffect(() => {
    const engine = new StrideThreeEngine(() => {
      document.documentElement.classList.add('gl');
      lastInteractRef.current = performance.now();
      if (pageViewRef.current === 'products') {
        engine.canvas.style.display = 'none';
      }
    });
    engineRef.current = engine;

    const scrollState = {
      active: false,
      target: window.scrollY,
      current: window.scrollY,
    };

    const isTouchDevice = () =>
      'ontouchstart' in window &&
      navigator.maxTouchPoints > 0 &&
      window.matchMedia('(pointer: coarse)').matches;

    const onWheel = (e: WheelEvent) => {
      if (
        e.ctrlKey ||
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ||
        isTouchDevice() ||
        reducedMotionRef.current ||
        document.body.classList.contains('locked') ||
        pageViewRef.current === 'products'
      ) {
        return;
      }
      e.preventDefault();
      if (!scrollState.active) {
        scrollState.current = window.scrollY;
        scrollState.target = window.scrollY;
      }
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      scrollState.target = clamp(scrollState.target + e.deltaY, 0, maxScroll);
      scrollState.active = true;
    };

    const cancelWheel = () => {
      scrollState.active = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        ['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)
      ) {
        scrollState.active = false;
      }
      if (
        pageViewRef.current === 'products' ||
        document.body.classList.contains('locked')
      ) {
        return;
      }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const hr = heroEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const visibleH = Math.max(0, Math.min(hr.bottom, vh) - Math.max(hr.top, 0));
      if (visibleH >= hr.height * 0.5) {
        e.preventDefault();
        goTo(targetRef.current + (e.key === 'ArrowRight' ? 1 : -1));
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerdown', cancelWheel);
    window.addEventListener('keydown', onKeyDown);

    const onResize = () => {
      engine.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    document.body.dataset.flavour = FLAVOURS[activeFlavourRef.current].id;

    let frameId = 0;
    let timerId = 0;
    let lastTime = performance.now();
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(64, Math.max(1, now - lastTime));
      lastTime = now;

      if (pageViewRef.current === 'products') {
        if (engine.isSoftwareGl) {
          timerId = window.setTimeout(tick, 140);
        } else {
          frameId = window.requestAnimationFrame(tick);
        }
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // 1. Desktop smooth wheel glide
      if (scrollState.active) {
        const diff = scrollState.target - scrollState.current;
        if (Math.abs(diff) < 0.5) {
          scrollState.current = scrollState.target;
          window.scrollTo(0, scrollState.current);
          scrollState.active = false;
        } else {
          scrollState.current += diff * (1 - Math.exp(-dt / 120));
          window.scrollTo(0, scrollState.current);
        }
      }

      // 2. Autoplay check
      if (
        autoplayRef.current &&
        enteredRef.current &&
        !draggingRef.current &&
        !document.hidden &&
        !reducedMotionRef.current &&
        heroRef.current
      ) {
        const hr = heroRef.current.getBoundingClientRect();
        const visible = Math.max(0, Math.min(hr.bottom, vh) - Math.max(hr.top, 0));
        if (visible >= hr.height * 0.6 && now - lastInteractRef.current >= 3200) {
          goTo(targetRef.current + 1);
        }
      }

      // 3. Hero arc pos tween
      const pt = posTweenRef.current;
      if (pt.active) {
        const t = clamp((now - pt.start) / Math.max(1, pt.dur), 0, 1);
        posRef.current = lerp(pt.from, pt.to, pt.ease(t));
        if (!pt.swapped && t >= 0.12) {
          pt.swapped = true;
          if (pt.pendingFlavour !== activeFlavourRef.current) {
            triggerFlavourVisuals(pt.pendingFlavour, pt.dir);
          }
        }
        if (t >= 1) {
          posRef.current = pt.to;
          pt.active = false;
        }
      }

      // 4. Radial colour reveal mask
      const heroEl = heroRef.current;
      const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;
      const heroH = heroRect ? heroRect.height : vh;
      const isPhone = vw < 820;
      const u = isPhone ? Math.min(vw / 560, heroH / 980) : Math.min(vw / 1440, vh / 900);
      const xSpread = isPhone ? 1.02 : 1;
      const cx = vw * 0.5;
      const cy = isPhone ? heroH * 0.4 : heroH * 0.5 - 78 * u;

      const rv = revealAnimRef.current;
      if (rv.active && revealRef.current) {
        const t = clamp((now - rv.start) / rv.dur, 0, 1);
        const R =
          1.45 *
          Math.hypot(Math.max(cx, vw - cx), Math.max(cy, heroH - cy));
        const r = R * easeSlide(t);
        const f = Math.max(60, 0.35 * r);
        const mask = `radial-gradient(circle at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, #000 ${Math.max(0, r - f).toFixed(1)}px, transparent ${r.toFixed(1)}px)`;
        revealRef.current.style.maskImage = mask;
        revealRef.current.style.webkitMaskImage = mask;
        if (t >= 1) {
          finishRunningReveal();
        }
      }

      // 5. Nav active link + theme
      const insideEl = insideRef.current;
      const shopEl = shopRef.current;
      const solutionsEl = solutionsRef.current;
      const aboutEl = aboutRef.current;
      const quoteEl = quoteRef.current;

      const insideRect = insideEl ? insideEl.getBoundingClientRect() : null;
      const shopRect = shopEl ? shopEl.getBoundingClientRect() : null;
      const solutionsRect = solutionsEl ? solutionsEl.getBoundingClientRect() : null;
      const aboutRect = aboutEl ? aboutEl.getBoundingClientRect() : null;
      const quoteRect = quoteEl ? quoteEl.getBoundingClientRect() : null;

      let nextSec: NavSectionId = 'flavors';
      const threshold = vh * 0.35;
      if (solutionsRect && solutionsRect.top <= threshold) nextSec = 'solutions';
      if (aboutRect && aboutRect.top <= threshold) nextSec = 'about';
      if (nextSec !== activeSectionRef.current) {
        activeSectionRef.current = nextSec;
        setActiveSection(nextSec);
      }

      let nextTheme: NavTheme = 'hero';
      if (quoteRect && quoteRect.top <= 48) nextTheme = 'dark';
      else if (aboutRect && aboutRect.top <= 48) nextTheme = 'light';
      else if (solutionsRect && solutionsRect.top <= 48) nextTheme = 'dark';
      else if (shopRect && shopRect.top <= 48) nextTheme = 'light';

      if (nextTheme !== navThemeRef.current) {
        navThemeRef.current = nextTheme;
        setNavTheme(nextTheme);
      }

      // 6. Section 2 pin & details fade (single crisp scroll stage; storm sub-scroll removed)
      let sec2P = 0;
      if (insideRect) {
        const { p, pinY } = computeSection2Metrics(
          insideRect.top,
          insideRect.height,
          vh,
        );
        sec2P = p;

        const kScale = isPhone
          ? Math.min(vw / 390, vh / 780)
          : Math.min(vw / 1440, vh / 900);
        const frameTransform = `translate(-50%, -50%) scale(${kScale})`;
        if (backFrameRef.current) backFrameRef.current.style.transform = frameTransform;
        if (frontFrameRef.current) {
          frontFrameRef.current.style.transform = frameTransform;
          const enterFade = clamp((1 - insideRect.top / vh) * 1.45 - 0.15, 0, 1);
          frontFrameRef.current.style.opacity = String(enterFade);
        }
        if (numRef.current) {
          numRef.current.style.opacity = '1';
        }

        if (frontLayerRef.current) {
          const isVis = insideRect.bottom > 0 && insideRect.top < vh;
          frontLayerRef.current.style.visibility = isVis ? 'visible' : 'hidden';
        }
      }

      // 7. Place 3D cards (Hero arc pool + Traveller)
      const pos = posRef.current;
      const jT = Math.round(targetRef.current);
      const activeFlav = activeFlavourRef.current;
      const heroYOff = heroRect ? heroRect.top : 0;

      const p1 = insideRect ? clamp(1 - insideRect.top / vh, 0, 1) : 0;
      const p3 = shopRect ? clamp((vh - shopRect.top) / (0.8 * vh), 0, 1) : 0;

      // Fade cleanly away once scrolled past Featured Shop into Solutions
      const pastShopFade = solutionsRect
        ? clamp((solutionsRect.top - vh * 0.15) / (vh * 0.45), 0, 1)
        : 1;

      if (p1 > 0.12 && revealAnimRef.current.active) {
        finishRunningReveal();
      }

      if (isPhone && p3 > 0 && !phoneCardScrolledRef.current && cardsRef.current) {
        phoneCardScrolledRef.current = true;
        const cardEl = cardsRef.current.children[activeFlav] as HTMLElement | undefined;
        if (cardEl) {
          const cr = cardEl.getBoundingClientRect();
          const sr = cardsRef.current.getBoundingClientRect();
          const diff = (cr.left - sr.left) - (sr.width - cr.width) * 0.5;
          if (Math.abs(diff) > 30) {
            cardsRef.current.scrollTo({
              left: Math.max(0, cardsRef.current.scrollLeft + diff),
              behavior: 'smooth',
            });
          }
        }
      }
      if (p3 === 0) {
        phoneCardScrolledRef.current = false;
      }

      const baseJ = Math.floor(pos) - 5;
      const poolFade = 1 - clamp(1.6 * p1, 0, 1);

      for (let idx = 0; idx < 11; idx++) {
        const j = baseJ + idx;
        if (j === jT || poolFade <= 0.01) {
          engine.hidePoolBar(idx);
          continue;
        }
        const floatPhase = (now / 4600) * Math.PI * 2 + 1.37 * j;
        const pose = evalArcPose(
          j - pos,
          cx,
          cy + heroYOff,
          u,
          xSpread,
          floatPhase,
          reducedMotionRef.current,
        );
        pose.op *= poolFade;
        engine.placeBar(engine.getPoolBar(idx), modFlavour(j, 5), j, pose, vw, vh);
      }

      const floatPhaseT = (now / 4600) * Math.PI * 2 + 1.37 * jT;
      const poseA = evalArcPose(
        jT - pos,
        cx,
        cy + heroYOff,
        u,
        xSpread,
        floatPhaseT,
        reducedMotionRef.current,
      );

      const inBarRect = inBarRef.current?.getBoundingClientRect();
      const bobY = reducedMotionRef.current
        ? 0
        : Math.sin((now / 2600) * Math.PI * 2) * 6;
      const swayRy = reducedMotionRef.current
        ? 0
        : 360 + Math.sin(sec2P * Math.PI) * 14;
      const poseB: BarPose = inBarRect
        ? {
            x: inBarRect.left + inBarRect.width * 0.5,
            y: inBarRect.top + inBarRect.height * 0.5 + bobY,
            h: inBarRect.height,
            rz: 3,
            ry: swayRy,
            rx: 0,
            z: 0,
            op: 1,
            sx: 1,
            sy: 1,
            shadow: 1,
          }
        : poseA;

      const livePkRect = pkRefs.current[activeFlav]?.getBoundingClientRect();
      const tilt = cardTiltsRef.current[activeFlav] || { x: 0, y: 0 };

      let pokeSx = 1;
      let pokeSy = 1;
      if (pokeRef.current.active && !reducedMotionRef.current) {
        const ptT = clamp((now - pokeRef.current.start) / 500, 0, 1);
        if (ptT < 0.3) {
          const k = easeInOutSine(ptT / 0.3);
          pokeSx = lerp(1, 1.06, k);
          pokeSy = lerp(1, 0.93, k);
        } else if (ptT < 0.6) {
          const k = easeInOutSine((ptT - 0.3) / 0.3);
          pokeSx = lerp(1.06, 0.97, k);
          pokeSy = lerp(0.93, 1.04, k);
        } else {
          const k = easeInOutSine((ptT - 0.6) / 0.4);
          pokeSx = lerp(0.97, 1, k);
          pokeSy = lerp(1.04, 1, k);
        }
        if (ptT >= 1) pokeRef.current.active = false;
      }

      const wholeTurnB = 720;
      const poseC: BarPose = livePkRect
        ? {
            x: livePkRect.left + livePkRect.width * 0.5,
            y: livePkRect.top + livePkRect.height * 0.5,
            h: livePkRect.height,
            rz: 0,
            ry: wholeTurnB + tilt.x * 14,
            rx: -tilt.y * 14,
            z: 30,
            op: pastShopFade,
            sx: pokeSx,
            sy: pokeSy,
            shadow: 0.7 * pastShopFade,
          }
        : poseB;

      const travellerPose = computeTravellerPose(poseA, poseB, poseC, p1, p3);
      const travellerCardAlpha = 1 - clamp(p3 * 1.25, 0, 1);
      engine.placeBar(
        engine.travellerBar,
        activeFlav,
        jT,
        travellerPose,
        vw,
        vh,
        travellerCardAlpha,
      );

      document.body.dataset.flavour = FLAVOURS[activeFlav].id;
      document.body.dataset.entered = String(enteredRef.current);

      engine.render();

      if (engine.isSoftwareGl) {
        timerId = engine.afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (engine.isSoftwareGl) {
      timerId = window.setTimeout(tick, 16);
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', cancelWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, [finishRunningReveal, goTo, triggerFlavourVisuals]);

  // Hero arc pointer drag / flick / tap / hover cursor (re-runs when returning to home view)
  useEffect(() => {
    if (pageView !== 'home') return;
    const arcEl = arcRef.current;
    if (!arcEl) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startPos = 0;
    let lastTime = 0;
    let vel = 0;
    let lastHoverCheck = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (document.body.classList.contains('locked')) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startPos = posRef.current;
      lastTime = performance.now();
      vel = 0;
      draggingRef.current = false;
      lastInteractRef.current = lastTime;
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (pointerId === null) {
        if (e.pointerType === 'mouse' && now - lastHoverCheck > 40 && engineRef.current) {
          lastHoverCheck = now;
          const hit = engineRef.current.raycastHeroBar(
            e.clientX,
            e.clientY,
            window.innerWidth,
            window.innerHeight,
          );
          arcEl.classList.toggle('bar-hover', hit !== null);
        }
        return;
      }

      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;

      if (!draggingRef.current && Math.abs(dx) > 6) {
        draggingRef.current = true;
        posTweenRef.current.active = false;
        document.body.classList.add('dragging');
        try {
          arcEl.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      if (draggingRef.current) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const heroH = heroRef.current?.getBoundingClientRect().height || vh;
        const isPhone = vw < 820;
        const u = isPhone ? Math.min(vw / 560, heroH / 980) : Math.min(vw / 1440, vh / 900);
        const xSpread = isPhone ? 1.02 : 1;
        const slotPx = Math.max(40, 324 * u * xSpread);

        const nextPos = startPos - dx / slotPx;
        const dt = Math.max(1, now - lastTime);
        const instVel = (nextPos - posRef.current) / dt;
        vel = vel * 0.6 + instVel * 0.4;
        posRef.current = nextPos;
        lastTime = now;
        lastInteractRef.current = now;
      }
    };

    const finishDrag = (isCancel: boolean, clientX: number, clientY: number) => {
      if (pointerId === null) return;
      const wasDragging = draggingRef.current;
      pointerId = null;
      draggingRef.current = false;
      document.body.classList.remove('dragging');

      if (wasDragging) {
        if (isCancel && Math.abs(posRef.current - Math.round(posRef.current)) <= 0.02) {
          posRef.current = Math.round(posRef.current);
          return;
        }
        const snapTo = Math.round(posRef.current + clamp(vel * 220, -2, 2));
        const dur = Math.max(380, 650 * Math.min(1, Math.abs(snapTo - posRef.current) + 0.35));
        goTo(snapTo, dur);
      } else if (!isCancel && engineRef.current) {
        const hitSlot = engineRef.current.raycastHeroBar(
          clientX,
          clientY,
          window.innerWidth,
          window.innerHeight,
        );
        if (hitSlot !== null) {
          const k = hitSlot - targetRef.current;
          if (k !== 0) {
            goTo(targetRef.current + k);
          }
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      finishDrag(false, e.clientX, e.clientY);
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      finishDrag(true, e.clientX, e.clientY);
    };

    arcEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      arcEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.body.classList.remove('dragging');
    };
  }, [goTo, pageView]);

  const handleNavigateHome = useCallback(
    (sectionId?: 'flavors' | 'inside' | 'shop' | 'solutions' | 'about' | 'quote') => {
      if (pageView !== 'home') {
        window.history.pushState({}, '', '/');
        setPageView('home');
        window.setTimeout(() => {
          if (sectionId && sectionId !== 'flavors') {
            document.getElementById(sectionId)?.scrollIntoView({
              behavior: reducedMotion ? 'auto' : 'smooth',
              block: 'start',
            });
          } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        }, 40);
        return;
      }

      if (!sectionId || sectionId === 'flavors') {
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
        return;
      }
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [pageView, reducedMotion],
  );

  const handleNavigateProducts = useCallback(
    (targetCategory?: unknown) => {
      if (typeof targetCategory === 'string' && targetCategory !== 'all') {
        setSelectedProductCategory(targetCategory as ProductCategoryId);
      } else {
        setSelectedProductCategory('all');
      }
      if (pageView !== 'products') {
        window.history.pushState({}, '', '/products');
        setPageView('products');
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [pageView],
  );

  const handlePrevProduct = useCallback(() => {
    goTo(targetRef.current - 1);
  }, [goTo]);

  const handleNextProduct = useCallback(() => {
    goTo(targetRef.current + 1);
  }, [goTo]);

  const handleRequestQuoteForCategory = useCallback(
    (categoryName: string) => {
      setQuotePreset((prev) => ({ category: categoryName, seq: (prev?.seq ?? 0) + 1 }));
      handleNavigateHome('quote');
    },
    [handleNavigateHome],
  );

  const handleRequestQuoteForFlavour = useCallback(
    (flav: Flavour) => {
      const waUrl = buildWhatsAppUrl(
        flav.name,
        `please share the price, catalog and quotation details for: ${flav.name}`,
      );
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    },
    [],
  );

  return (
    <>
      <IntroOverlay skipImmediately={skipIntro} onEnterHero={handleEnterHero} />

      <NavBar
        entered={entered}
        pageView={pageView}
        activeSection={activeSection}
        navTheme={navTheme}
        onNavigateHome={handleNavigateHome}
        onNavigateProducts={handleNavigateProducts}
      />

      {pageView === 'products' ? (
        <ProductsPage
          initialCategory={selectedProductCategory}
          onBackHome={() => handleNavigateHome('flavors')}
        />
      ) : (
        <main>
          <HeroSection
            entered={entered}
            activeFlavour={activeFlavour}
            titleTrigger={titleTrigger}
            autoplay={autoplay}
            reducedMotion={reducedMotion}
            heroRef={heroRef}
            revealRef={revealRef}
            arcRef={arcRef}
            onNext={() => goTo(targetRef.current + 1)}
            onToggleAutoplay={() => {
              lastInteractRef.current = performance.now();
              setAutoplay((a) => !a);
            }}
          />

          <InsideSection
            activeFlavour={activeFlavour}
            insideRef={insideRef}
            backFrameRef={backFrameRef}
            inBarRef={inBarRef}
            numRef={numRef}
            frontLayerRef={frontLayerRef}
            frontFrameRef={frontFrameRef}
            onPrevProduct={handlePrevProduct}
            onNextProduct={handleNextProduct}
            onRequestQuoteFor={handleRequestQuoteForFlavour}
            onOpenProducts={handleNavigateProducts}
          />

          <ShopSection
            activeFlavour={activeFlavour}
            reducedMotion={reducedMotion}
            shopRef={shopRef}
            cardsRef={cardsRef}
            pkRefs={pkRefs}
            cardTiltsRef={cardTiltsRef}
            onPokeLiveBar={() => {
              pokeRef.current = { active: true, start: performance.now() };
            }}
            onRequestQuoteFor={handleRequestQuoteForFlavour}
            onOpenProducts={handleNavigateProducts}
          />

          <SolutionsSection
            sectionRef={solutionsRef}
            reducedMotion={reducedMotion}
            onSelectSolutionQuote={handleRequestQuoteForCategory}
          />

          <AboutSection sectionRef={aboutRef} reducedMotion={reducedMotion} />

          <QuoteSection sectionRef={quoteRef} quotePreset={quotePreset} />
        </main>
      )}
    </>
  );
}
