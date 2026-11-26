/**
 * ============================================================================
 * JB IT PRODUCTS CATALOG DATA
 * ============================================================================
 * 
 * HOW TO ADD A NEW PRODUCT:
 * 1. Place the product image in `/src/assets/products/`
 * 2. Add an entry to `PRODUCTS_CATALOG` below:
 *    {
 *      id: 'prod-my-unique-id',
 *      name: 'Full Name of the Product',
 *      category: 'ips-battery' | 'office-equipment' | 'it-accessories' | 'network-rack' | 'cctv-security',
 *      categoryLabel: 'Category Display Name',
 *      imageUrl: '/src/assets/products/my_product.png',
 *      specs: ['Spec 1', 'Spec 2', 'Spec 3'],
 *    }
 * ============================================================================
 */

import type { ProductCategoryTab, ProductCatalogItem, ProductCategoryId } from './types';

// Category Showcase Images (stored in /src/assets/products/)
export const IMG_OFFICE_PRINTER = '/src/assets/images/home_office_printer_.webp';
export const IMG_NETWORK_RACK = '/src/assets/images/home_router.webp';
export const IMG_CCTV_KIT = '/src/assets/images/home_cctv_kit.webp';
export const IMG_BUSINESS_LAPTOP = '/src/assets/products/product_business_laptop.jpg';

export * from './types';

export const PRODUCT_CATEGORIES: ProductCategoryTab[] = [
  { id: 'all', label: 'All Products' },
  { id: 'ips-battery', label: 'IPS & Battery' },
  { id: 'office-equipment', label: 'Office Equipment' },
  { id: 'it-accessories', label: 'IT Accessories' },
  { id: 'network-rack', label: 'Network Accessories' },
  { id: 'cctv-security', label: 'CCTV & Security' },
];

export const PRODUCTS_CATALOG: ProductCatalogItem[] = [
  // 1. IPS & Battery
  {
    id: 'prod-ips-inverter',
    name: 'Luminous EVO D 700',
    category: 'ips-battery',
    categoryLabel: 'IPS & Battery',
    imageUrl: '/src/assets/products/Luminous_EVO_D-700.webp',
    specs: [
      'Square Wave Output',
      '100V-280V Input voltage',
      '80-220Ah Battery Capacity',
      '600 VA Inverter Capacity',
      'Overloading & Overcharging Protection',
    ],
  },
  {
    id: 'prod-power-tech-pttb-220',
    name: 'Power Tech PTTB 220 Industrial Tall Tubular Battery',
    category: 'ips-battery',
    categoryLabel: 'IPS & Battery',
    imageUrl: '/src/assets/products/powerTechbattery.webp',
    specs: [
      'Industrial Tall Tubular Battery',
      'Long Life with High Backup',
      'Low Maintenance with Purified Ventilation',
      '30 Month Guarantee',
    ],
  },
  {
    id: 'prod-power-tech-pttb-250',
    name: 'Power Tech PTTB 250 Tubular Battery',
    category: 'ips-battery',
    categoryLabel: 'IPS & Battery',
    imageUrl: '/src/assets/products/powerTechbattery_pttb-250.webp',
    specs: [
      'Long Life with Higher Backup',
      'Low Maintenance and High Performance',
      'Suitable for Home, Office, and Industry',
      '30 Month Warranty',
    ],
  },

  // 2. Office Equipment
  {
    id: 'prod-office-printer',
    name: 'Enterprise Duplex Laser Multifunction Printer',
    category: 'office-equipment',
    categoryLabel: 'Office Equipment',
    imageUrl: IMG_OFFICE_PRINTER,
    specs: [
      'Automatic Double-Sided Duplex Printing',
      'High-Speed Output Up to 42 Pages Per Minute',
      'Gigabit Ethernet & Secure Wi-Fi Network Ready',
      'High-Yield Genuine OEM Toner Compatible',
    ],
  },

  // 3. IT Accessories
  {
    id: 'prod-keyboard-mouse_fg1112',
    name: 'A4TECH FG1112 Wireless Keyboard Mouse Combo',
    category: 'it-accessories',
    categoryLabel: 'IT Accessories',
    imageUrl: 'src/assets/products/keyboard-mouse_fg1112.webp',
    specs: [
      'Wireless 2.4G Hz',
      '1200 DPI',
      'Battery: 1AA Alkaline Batteries',
      'Warranty 1 year',
    ],
  },
  {
    id: 'prod-keyboard-mouse-3000n',
    name: 'A4TECH 3000N Black Wireless Keyboard & Mouse Combo with Bangla',
    category: 'it-accessories',
    categoryLabel: 'IT Accessories',
    imageUrl: 'src/assets/products/keyboard-mouse-3000n.webp',
    specs: [
      '10 Meter Bluetooth Range',
      '1200 DPI',
      'Battery Details 2 x AA (Keyboard), 1 x AAA (Mouse)',
      'Warranty 1 year',
    ],
  },

  // 4. Network Accessories
  {
    id: 'prod-network-router',
    name: 'High-Speed Dual-Band Gigabit Wi-Fi 6 Router',
    category: 'network-rack',
    categoryLabel: 'Network Accessories',
    imageUrl: IMG_NETWORK_RACK,
    specs: [
      'Full Gigabit WAN & 4x Gigabit LAN Ethernet Ports',
      '4x High-Gain Multi-Directional Antennas',
      'Hardware Firewall & WPA3 Enterprise Wireless Security',
      'Seamless Multi-Device Beamforming Technology',
    ],
  },

  // 5. CCTV & Security
  {
    id: 'prod-cctv-system',
    name: '4K Ultra HD PoE Security Camera System & NVR Box',
    category: 'cctv-security',
    categoryLabel: 'CCTV & Security',
    imageUrl: IMG_CCTV_KIT,
    specs: [
      'Ultra HD 4K (8MP) Crystal Clear Surveillance Resolution',
      'Single Cat6 Cable Transmits Both Power & 4K Video',
      '24/7 Mobile App Remote Live View & Instant Push Alerts',
      'Smart Motion Detection & Night Vision IR Cut Filter',
    ],
  },
];
