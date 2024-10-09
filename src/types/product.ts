export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  short_description: string;
  brand?: string;
  model?: string;
  merchant: string;
  locale: string;
  is_in_stock: boolean;
  quantities: Quantities;
  attributes: Attribute[];
  attributes_filtered: Attribute[];
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
  stock: any;
}

export interface Variant {
  sku: string;
  name: string;
  imageUrl: string;
  is_physical: boolean;
  height: any;
  width: any;
  depth: any;
  weight: any;
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
  discountedPrice: any;
  priceWithTax: number;
  discountedPriceWithTax: any;
  taxRate: number;
  taxValue: number;
  currencyCode: string;
  billingCycle: string;
}

export interface Stock {
  quantity: any;
  inStock: boolean;
  allowBackOrder: boolean;
  storageLocation: string;
}
