# JB IT Products Directory Guide

This folder contains all data and configuration for products shown on the **Products Catalog Page**.

## File Structure

```
src/
├── assets/
│   └── products/                  <-- Put your product images here (.png, .jpg, .webp)
└── products/
    ├── types.ts                   <-- TypeScript interfaces (ProductCatalogItem, categories)
    ├── productsData.ts            <-- All product details (name, category, image, specs)
    └── README.md                  <-- This guide
```

---

## How to Add a New Product

### Step 1: Add the Product Image
Save or drop your product image file into:
`src/assets/products/your_product_image.png`

### Step 2: Add the Product Entry
Open [productsData.ts](file:///d:/jb_it_v2/src/products/productsData.ts) and add your product into `PRODUCTS_CATALOG`:

```ts
{
  id: 'prod-unique-id',
  name: 'Your Product Name Here',
  category: 'ips-battery', // 'ips-battery' | 'office-equipment' | 'it-accessories' | 'network-rack' | 'cctv-security'
  categoryLabel: 'IPS & Battery',
  imageUrl: '/src/assets/products/your_product_image.png',
  specs: [
    'Feature or specification point 1',
    'Feature or specification point 2',
    'Feature or specification point 3',
  ],
},
```

That's it!
- The front of the card displays the **Image**, **Product Name**, and **WhatsApp Ask Price Button**.
- Clicking the transparent **Eye Icon** on the image smoothly flips the card to reveal the product's full **Specifications** with smooth scrolling.
