export type DivisionIconKind =
  | 'battery'
  | 'printer'
  | 'accessories'
  | 'server'
  | 'cctv';

export interface SpecRow {
  label: string;
  value: string;
  bold: boolean;
}

export interface CategoryOfferingGroup {
  title: string;
  items: string[];
}

export interface CategoryOffering {
  categoryTitle: string;
  scopeTag: string;
  summary: string;
  groups: CategoryOfferingGroup[];
  brands: string[];
  highlights?: string[];
}

export interface Flavour {
  index: number;
  id: string;
  name: string;
  shortTag: string;
  lines: [string, string];
  color: string;
  accentColor: string;
  iconKind: DivisionIconKind;
  imageUrl: string;
  bitIndex: number;
  headlineMetric: string;
  subLabel: string;
  featuredPackage: string;
  ingredients: string;
  specs: SpecRow[];
  offerings: CategoryOffering;
  barcodeDigits: string;
}

export const COMPANY_BRAND = {
  name: 'JB IT',
  banglaName: 'জেবি আইটি',
  tagline: 'Committed to Quality',
  logoUrl: '/assets/aistudio/image_afac6c6c.png',
  /** WhatsApp phone number in international format without + or spaces */
  whatsappPhone: '8801712273333',
  displayPhone: '+880 1712-273333',
  displayPhoneAlt: '+880 1961-400415',
  facebookUrl: 'https://www.facebook.com/people/JB-IT/61571665919795/',
  email: 'jbitdhaka@gmail.com',
  emailAlt: 'rupdasfp@gmail.com',
  location: 'Rahmania Int\'l Complex (Ground Floor), 28/1/C Toyenbee Circular Road, Motijheel C/A, Dhaka-1000',
  established: 'December 2022',
} as const;

export function buildWhatsAppUrl(productName: string, customNote?: string): string {
  const baseMessage = customNote
    ? `Hello JB IT, ${customNote}`
    : `Hello JB IT, please share the price and availability for: ${productName}`;
  return `https://wa.me/${COMPANY_BRAND.whatsappPhone}?text=${encodeURIComponent(baseMessage)}`;
}

export const BAR_ASPECT_H = 1.72;

export const IMG_IPS_BATTERY = '/src/assets/images/home_ips.webp';
export const IMG_OFFICE_PRINTER = '/src/assets/images/home_office_printer_.webp';
export const IMG_NETWORK_RACK = '/src/assets/images/home_router.webp';
export const IMG_IT_ACCESSORIES = '/src/assets/images/home_it_accessories.webp';
export const IMG_CCTV_KIT = '/src/assets/images/home_cctv_kit.webp';
export const IMG_BUSINESS_LAPTOP = '/src/assets/products/product_business_laptop.jpg';

export const FLAVOURS: Flavour[] = [
  {
    index: 0,
    id: 'ips-battery',
    name: 'IPS & Battery',
    shortTag: 'POWER BACKUP',
    lines: ['IPS &', 'BATTERY'],
    color: '#c28554',
    accentColor: '#faebd7',
    iconKind: 'battery',
    imageUrl: IMG_IPS_BATTERY,
    bitIndex: 0,
    headlineMetric: 'ZELIO 1700',
    subLabel: 'PURE SINE WAVE',
    featuredPackage: 'Luminous Zelio Pure Sine IPS Inverter & Battery',
    ingredients: 'Luminous Zelio pure sine wave inverters, smart digital LCD display, deep-cycle tubular batteries, on-site setup.',
    specs: [
      { label: 'Model', value: 'Luminous Zelio', bold: true },
      { label: 'Output Wave', value: 'Pure Sine', bold: true },
      { label: 'Display', value: 'Intelligent LCD', bold: false },
      { label: 'Transfer Time', value: '< 10 ms', bold: false },
      { label: 'Battery Cell', value: 'Tubular / Flat', bold: false },
      { label: 'Backup Range', value: '4–12 hrs', bold: false },
      { label: 'Warranty', value: '24 months', bold: false },
    ],
    offerings: {
      categoryTitle: 'Power Backup & Solar Inverters',
      scopeTag: 'IPS & BATTERY DIVISION',
      summary: 'Complete uninterrupted power systems, pure sine wave inverters, and heavy-duty storage batteries for homes, corporate offices, server rooms, and retail branches.',
      groups: [
        {
          title: 'IPS & Inverter Types',
          items: [
            'Pure Sine Wave & Solar Hybrid Inverters',
            'Modified Sine Wave IPS & Online/Offline UPS',
          ],
        },
        {
          title: 'Battery Technologies',
          items: [
            'Tall Tubular Long-Life Batteries (100–230Ah)',
            'SMF / VRLA Sealed Gel & Heavy-Duty Flat Plate',
          ],
        },
        {
          title: 'Capacity & Applications',
          items: [
            'Home & Retail Backups (600VA–1200VA)',
            'Corporate, Server & ATM Systems (1.5kVA–10kVA+)',
          ],
        },
        {
          title: 'Turnkey Services',
          items: [
            'Complimentary Load Calculation & Battery Racks',
            'On-Site Electrical Wiring & Replacement Warranty',
          ],
        },
      ],
      brands: ['Luminous', 'Enerpower', 'Microtek', 'Exide', 'Hamko', 'Eastern', 'Voltaic'],
    },
    barcodeDigits: '8 941100 201014',
  },
  {
    index: 1,
    id: 'office-equipment',
    name: 'Office Equipment',
    shortTag: 'PRINTER & TONER',
    lines: ['OFFICE', 'EQUIPMENT'],
    color: '#82a89f',
    accentColor: '#e0f3ee',
    iconKind: 'printer',
    imageUrl: IMG_OFFICE_PRINTER,
    bitIndex: 1,
    headlineMetric: '42 PPM',
    subLabel: 'LASER & TONER',
    featuredPackage: 'Multifunction Duplex Laser Printer + OEM Toners',
    ingredients: 'Office laser & ink tank printers, genuine OEM toner cartridges, duplex scanners, refill service.',
    specs: [
      { label: 'Print Speed', value: 'Up to 42 ppm', bold: true },
      { label: 'Consumables', value: 'OEM Toners', bold: true },
      { label: 'Connectivity', value: 'Wi-Fi / LAN', bold: false },
      { label: 'Duty Cycle', value: '80k / mo', bold: false },
      { label: 'Delivery', value: 'Same Day', bold: false },
      { label: 'Warranty', value: '12 months', bold: false },
      { label: 'Toner Refill', value: 'On-Call', bold: false },
    ],
    offerings: {
      categoryTitle: 'Printers, Scanners & Consumables',
      scopeTag: 'OFFICE AUTOMATION DIVISION',
      summary: 'Enterprise document workflows, heavy-duty copiers, high-speed document scanners, and guaranteed monthly consumable supply agreements.',
      groups: [
        {
          title: 'Printers & Copiers',
          items: [
            'Multifunction Duplex Laser & Digital Copiers',
            'Continuous High-Yield Ink Tank Systems (CISS)',
          ],
        },
        {
          title: 'Consumables & Toners',
          items: [
            '100% Genuine OEM Toner Cartridges & Inks',
            'Imaging Drum Units & Maintenance Roller Kits',
          ],
        },
        {
          title: 'Scanning & Plotters',
          items: [
            'High-Speed Sheetfed & Flatbed Scanners',
            'Large-Format Architectural & CAD Plotters',
          ],
        },
        {
          title: 'Corporate Fleet Support',
          items: [
            'Monthly Supply & Emergency Refill Contracts',
            'On-Site Fleet Maintenance & Standby Units',
          ],
        },
      ],
      brands: ['HP', 'Canon', 'Epson', 'Brother', 'Ricoh', 'Pantum', 'Konica Minolta'],
    },
    barcodeDigits: '8 941100 202028',
  },
  {
    index: 2,
    id: 'it-accessories',
    name: 'IT Accessories',
    shortTag: 'KEYBOARD · HDD',
    lines: ['IT', 'ACCESSORIES'],
    color: '#5e8594',
    accentColor: '#d6edf7',
    iconKind: 'accessories',
    imageUrl: IMG_IT_ACCESSORIES,
    bitIndex: 2,
    headlineMetric: 'LOGITECH',
    subLabel: 'KEYBOARD & MOUSE',
    featuredPackage: 'Logitech Wireless Keyboard & Optical Mouse Combo',
    ingredients: 'Genuine Logitech wireless keyboard, silent optical mouse, 2.4GHz nano receiver, external HDD & SSD.',
    specs: [
      { label: 'Brand & Model', value: 'Logitech Combo', bold: true },
      { label: 'Connectivity', value: '2.4GHz Wireless', bold: true },
      { label: 'Layout', value: 'Full-size + Numpad', bold: false },
      { label: 'Mouse Sensor', value: 'Optical Tracking', bold: false },
      { label: 'Battery Life', value: 'Up to 36 Months', bold: false },
      { label: 'Warranty', value: '1–3 Years', bold: false },
      { label: 'QA Check', value: 'Tested Genuine', bold: false },
    ],
    offerings: {
      categoryTitle: 'Workstation Gear & Storage',
      scopeTag: 'IT HARDWARE & ACCESSORIES',
      summary: 'Authentic enterprise computer peripherals, high-speed solid-state drives, memory upgrades, and workstation docking hubs for modern commercial offices.',
      groups: [
        {
          title: 'Input & Peripherals',
          items: [
            'Wireless Keyboard & Optical Mouse Combos',
            'Silent Office Keyboards & Conference Presenters',
          ],
        },
        {
          title: 'Storage & Memory',
          items: [
            'PCIe Gen4 NVMe M.2 & SATA III Solid State Drives',
            'External Portable HDDs & DDR4/DDR5 RAM Modules',
          ],
        },
        {
          title: 'Computers & Workstations',
          items: [
            'Corporate Business Laptops & Desktop Towers',
            'All-in-One Office Desktops & POS Terminals',
          ],
        },
        {
          title: 'Cables & Power Hubs',
          items: [
            'Multiport USB-C Docks & Display Cables',
            'Heavy-Duty Surge Protectors & Power Adapters',
          ],
        },
      ],
      brands: ['Logitech', 'Western Digital', 'Seagate', 'Kingston', 'Transcend', 'Dell', 'HP', 'Lenovo'],
    },
    barcodeDigits: '8 941100 204046',
  },
  {
    index: 3,
    id: 'network-rack',
    name: 'Network Accessories',
    shortTag: 'ROUTER · SWITCH',
    lines: ['NETWORK', 'ACCESSORIES'],
    color: '#8f83b0',
    accentColor: '#ede8fa',
    iconKind: 'server',
    imageUrl: IMG_NETWORK_RACK,
    bitIndex: 3,
    headlineMetric: 'GIGABIT WI-FI',
    subLabel: 'ROUTER & SWITCH',
    featuredPackage: 'High-Speed Gigabit Dual-Band Wi-Fi Router & Switch',
    ingredients: 'Dual-band Gigabit Wi-Fi routers, 4 high-gain antennas, PoE switches, Cat6A patch cabling & network racks.',
    specs: [
      { label: 'Wi-Fi Speed', value: 'Dual-Band Gigabit', bold: true },
      { label: 'Antennas', value: '4 High-Gain Omni', bold: true },
      { label: 'LAN/WAN Ports', value: 'Full Gigabit RJ45', bold: false },
      { label: 'Coverage', value: 'Multi-Room Beamforming', bold: false },
      { label: 'Security', value: 'WPA3 / SPI Firewall', bold: false },
      { label: 'Warranty', value: '1–2 Years', bold: false },
      { label: 'QA Check', value: 'Tested Genuine', bold: false },
    ],
    offerings: {
      categoryTitle: 'Networking & Infrastructure',
      scopeTag: 'ENTERPRISE CABLING & RACKS',
      summary: 'Gigabit network switching, high-gain routing, enterprise server enclosures, and certified high-bandwidth structured cabling for corporate branches.',
      groups: [
        {
          title: 'Active Network Hardware',
          items: [
            'Dual-Band Gigabit & High-Speed Wi-Fi 6 Routers',
            'Managed & Unmanaged PoE/PoE+ Enterprise Switches',
          ],
        },
        {
          title: 'Server Racks & Cabinets',
          items: [
            'Wall-Mount Network Racks (4U, 6U, 9U, 12U)',
            'Floor-Standing Server Cabinets (15U to 42U) & PDUs',
          ],
        },
        {
          title: 'Structured Cabling',
          items: [
            'Cat6 / Cat6A Bulk Certified Cable Rolls',
            '24 & 48-Port Patch Panels & Fiber Patch Cords',
          ],
        },
        {
          title: 'Deployment & Setup',
          items: [
            'Professional Cable Dressing & Channeling',
            'VLAN Config, Multi-SSID & Bank ATM Links',
          ],
        },
      ],
      brands: ['Cisco', 'TP-Link', 'MikroTik', 'D-Link', 'Toten', 'Rosenberger', 'Schneider / Clipsal'],
    },
    barcodeDigits: '8 941100 203032',
  },
  {
    index: 4,
    id: 'cctv-security',
    name: 'CCTV & Security',
    shortTag: 'SURVEILLANCE',
    lines: ['CCTV', 'SYSTEMS'],
    color: '#b57b8a',
    accentColor: '#f7e4eb',
    iconKind: 'cctv',
    imageUrl: IMG_CCTV_KIT,
    bitIndex: 4,
    headlineMetric: '4K POE',
    subLabel: 'CAMERA & NVR',
    featuredPackage: '4K PoE Dome & Bullet CC Camera Setup + NVR Box',
    ingredients: 'Indoor dome & weatherproof bullet CC cameras, PoE NVR recorders, surveillance HDDs, mobile view.',
    specs: [
      { label: 'Resolution', value: '4K Ultra HD', bold: true },
      { label: 'Night Vision', value: 'IR + Color', bold: true },
      { label: 'NVR Storage', value: '2–16 TB RAID', bold: false },
      { label: 'Power Link', value: 'Single Cat6 PoE', bold: false },
      { label: 'Remote View', value: 'Mobile + Desktop', bold: false },
      { label: 'Weatherproof', value: 'IP67 Rated', bold: false },
      { label: 'Site Setup', value: 'Full Install', bold: false },
    ],
    offerings: {
      categoryTitle: 'Surveillance & Security Systems',
      scopeTag: 'CCTV & ACCESS CONTROL DIVISION',
      summary: 'Round-the-clock high-definition surveillance, AI motion detection, centralized NVR storage, and mobile remote monitoring setups for commercial & residential premises.',
      groups: [
        {
          title: 'Surveillance Cameras',
          items: [
            'Indoor Dome Cameras & ColorVu Night Vision',
            'IP67 Weatherproof Bullets & 360° PTZ Domes',
          ],
        },
        {
          title: 'NVR & Recording Systems',
          items: [
            '4 / 8 / 16 / 32 / 64-Channel PoE NVR Recorders',
            'Surveillance RAID Hard Drives (WD Purple 2–16TB)',
          ],
        },
        {
          title: 'Power & Transmission',
          items: [
            'Dedicated Multi-Channel PoE Network Switches',
            'Single Cat6 PoE Cable Runs & Power Supplies',
          ],
        },
        {
          title: 'Setup & Monitoring',
          items: [
            'Concealed Conduit Cabling & Camera Alignment',
            'Real-Time Push Alerts on iOS, Android & PC',
          ],
        },
      ],
      brands: ['Hikvision', 'Dahua', 'Uniview (UNV)', 'WD Purple', 'Seagate SkyHawk', 'CP Plus', 'ZKTeco'],
    },
    barcodeDigits: '8 941100 205050',
  },
];

export interface HardwareBitSpec {
  id: number;
  label: string;
  imageUrl: string;
  tint: string;
}

export const HARDWARE_BITS: HardwareBitSpec[] = [
  { id: 0, label: 'Luminous Zelio IPS', imageUrl: IMG_IPS_BATTERY, tint: '#e4b78a' },
  { id: 1, label: 'Laser Printer & Toner', imageUrl: IMG_OFFICE_PRINTER, tint: '#b0cfc8' },
  { id: 2, label: 'Wireless Keyboard & Mouse', imageUrl: IMG_IT_ACCESSORIES, tint: '#9ebec9' },
  { id: 3, label: 'Gigabit Wi-Fi Router', imageUrl: IMG_NETWORK_RACK, tint: '#bfb4d9' },
  { id: 4, label: '4K CCTV & NVR', imageUrl: IMG_CCTV_KIT, tint: '#d4abb6' },
];

export interface HeroBitSpec {
  xFrac: number;
  yFrac: number;
  sizeU: number;
  rot: number;
  bitIndex: number;
  hideOnPhone?: boolean;
}

export const HERO_BITS: HeroBitSpec[] = [
  { xFrac: 0.12, yFrac: 0.2, sizeU: 98, rot: -14, bitIndex: 0 },
  { xFrac: 0.86, yFrac: 0.18, sizeU: 86, rot: 18, bitIndex: 3, hideOnPhone: true },
  { xFrac: 0.07, yFrac: 0.74, sizeU: 80, rot: 10, bitIndex: 2 },
  { xFrac: 0.655, yFrac: 0.15, sizeU: 74, rot: -8, bitIndex: 4, hideOnPhone: true },
  { xFrac: 0.205, yFrac: 0.885, sizeU: 68, rot: 22, bitIndex: 1, hideOnPhone: true },
];

export interface InsideStep {
  num: string;
  headlineLines: string[];
  captionLines: string[];
  ry: number;
}

export const INSIDE_STEPS: InsideStep[] = [
  {
    num: '01',
    headlineLines: ['PURE', 'POWER'],
    captionLines: ['LUMINOUS ZELIO IPS & TUBULAR BATTERIES.', 'INSTALLED & TESTED ON SITE.'],
    ry: 0,
  },
  {
    num: '02',
    headlineLines: ['GENUINE', 'HARDWARE'],
    captionLines: ['PRINTERS, TONERS, HDD & LAPTOPS.', 'OFFICIAL WARRANTY BACKED.'],
    ry: 180,
  },
  {
    num: '03',
    headlineLines: ['ROUTER &', 'CCTV'],
    captionLines: ['GIGABIT ROUTERS, ATM & CC CAMERAS.', 'STRUCTURED CABLING INCLUDED.'],
    ry: 360,
  },
  {
    num: '04',
    headlineLines: ['COMMITTED', 'QUALITY'],
    captionLines: ['SUPPLY, NETWORK & SOFTWARE.', 'ONE RELIABLE PARTNER.'],
    ry: 720,
  },
];

export type {
  ProductCategoryId,
  ProductCategoryTab,
  ProductCatalogItem,
} from '../products/productsData';
export {
  PRODUCT_CATEGORIES,
  PRODUCTS_CATALOG,
} from '../products/productsData';

export interface SolutionItem {
  id: string;
  indexLabel: string;
  categoryTag: string;
  title: string;
  summary: string;
  deliverables: string[];
  quoteCategory: string;
}

export const SOLUTIONS_LIST: SolutionItem[] = [
  {
    id: 'sol-server-rack',
    indexLabel: '01',
    categoryTag: 'NETWORK SOLUTION',
    title: 'Server Rack Installation & Structured Networking',
    summary:
      'On-site engineering for 6U–42U server cabinets dressed with Cat6A/fiber patch panels, managed PoE switches, router/firewall configuration, ATM branch links, and rack backup UPS.',
    deliverables: ['Server Installation', 'LAN & Fiber Cabling', 'Router & Firewall', 'ATM Booth Links'],
    quoteCategory: 'Network & Accessories',
  },
  {
    id: 'sol-cctv-install',
    indexLabel: '02',
    categoryTag: 'SURVEILLANCE SOLUTION',
    title: 'CC Camera & NVR Security Installation',
    summary:
      'Clean architectural PoE conduit runs with indoor dome and IP67 night-vision cameras, continuous RAID NVR storage, and secure multi-branch mobile viewing.',
    deliverables: ['4K PoE Cameras', 'NVR Recording', 'Remote Mobile App', 'Site Wiring'],
    quoteCategory: 'CC Camera Setup',
  },
  {
    id: 'sol-software-build',
    indexLabel: '03',
    categoryTag: 'SOFTWARE SOLUTION',
    title: 'Custom Business Software & Automation',
    summary:
      'Tailored POS billing, stock inventory ERP, HR attendance hardware sync, and multi-office cloud software built and maintained around your exact business workflow.',
    deliverables: ['POS & Billing Software', 'Inventory ERP', 'Office Automation', 'Ongoing Support'],
    quoteCategory: 'Software Build Solution',
  },
];

export const ABOUT_CONTENT = {
  eyebrow: 'About JB IT',
  headlineLines: ['COMMITTED', 'TO QUALITY', 'HARDWARE & IT'],
  leadParagraph:
    'JB IT is a well reputed supplier for ICT products and Office Equipment in Bangladesh, located in Motijheel — the heart of Dhaka\'s commercial district. Incepted on 1st December 2022, JB IT is built on 24 years of senior management experience at FLORA LIMITED, one of the country\'s leading ICT companies.',
  bodyParagraph:
    'With a vast portfolio of world-renowned ICT brands, we serve Foreign Organizations, NGOs, UN Organizations, Multinational Companies, Local Group of Companies, and Government Organizations. Our proprietor\'s deep expertise in IT Hardware, Networking & Communication Solutions plays an important role in driving digitization across Bangladesh.',
  mottoParagraph:
    'It is our motto to give maximum level of satisfaction to our customers by providing the best service and support with honesty, integrity, and sincerity.',
  transitionPhrases: [
    'Serving Retail, Corporate & Project customers since December 2022.',
    'World-renowned ICT brands for complete Office Automation.',
    'Trusted by NGOs, UN agencies, multinationals & government organizations.',
    'Built on 24 years of ICT industry leadership & expertise.',
  ],
  pillars: [
    { label: '01. Our Heritage', detail: 'Founded in December 2022, backed by 24 years of senior ICT leadership at FLORA LIMITED — one of Bangladesh\'s most reputed ICT companies.' },
    { label: '02. Our Mission', detail: 'To play an important role in developing our country\'s ICT sector by providing the best technological support across all relevant fields.' },
    { label: '03. Our Values', detail: 'Maximum customer satisfaction through honest, dependable service — serving Foreign Organizations, NGOs, UN bodies, MNCs, and Government Organizations.' },
  ],
} as const;
