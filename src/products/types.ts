export type ProductCategoryId =
  | 'all'
  | 'ips-battery'
  | 'office-equipment'
  | 'it-accessories'
  | 'network-rack'
  | 'cctv-security';

export interface ProductCategoryTab {
  id: ProductCategoryId;
  label: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  category: ProductCategoryId;
  imageUrl: string;
  categoryLabel?: string;
  specs?: string[];
}
