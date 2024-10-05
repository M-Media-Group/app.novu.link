export interface Product {
  // Any
  id: string;
  name: string;
  image: string;
  description: string;
  shortDescription: string;
  prices: {
    price: number;
    formattedPrice?: string;
    shipping: number;
    formattedShipping?: string;
    currency: string;
  };
  sizes?: string[];
}
