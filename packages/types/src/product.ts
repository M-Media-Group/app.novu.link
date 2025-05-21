export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  short_description: string;
  brand?: string | null | undefined;
  model?: string | null | undefined;
  merchant: string;
  locale: string;
  is_in_stock: boolean;
  quantities: Quantities;
  attributes: Attribute[];
  attributes_filtered?: Attribute[] | undefined;
  variants: Variant[];
  prices: {
    min: Price;
    max: Price;
    shipping: number;
    currency: string;
  };
}

export interface Quantities {
  min: number;
  max: number;
  stock: number | null;
}

export interface Variant {
  sku: string;
  name: string;
  imageUrl: string | null;
  is_physical: boolean;
  height: number | null;
  width: number | null;
  depth: number | null;
  weight: number | null;
  attributes: Attribute[];
  prices: Price[];
  stocks: Stock[];
}

export interface Attribute {
  name: string;
  value: string | string[];
}

export interface Price {
  price: number;
  discountedPrice: number | null;
  priceWithTax: number;
  discountedPriceWithTax: number | null;
  taxRate: number;
  taxValue: number;
  currencyCode: string;
  billingCycle: string;
}

export interface Stock {
  quantity: number | null;
  inStock: boolean;
  allowBackOrder: boolean;
  storageLocation: string;
}
