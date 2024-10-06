export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  short_description: string;
  merchant: string;
  locale: string;
  is_in_stock: boolean;
  quantities: Quantities;
  attributes: Attributes;
  attributes_filtered: Attributes;
  variants: Variant[];
  prices: {
    min: number;
    max: number;
    shipping: number;
    currency: string;
  };
}

export interface Quantities {
  min: number;
  max: number;
  stock: any;
}

export interface Attributes {
  [key: string]: string[];
}

export interface Variant {
  sku: string;
  name: string;
  imageUrl: string;
  isPhysical: boolean;
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
  value: string;
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
