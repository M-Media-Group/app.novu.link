import { z } from "zod";

export const quantitiesSchema = z.object({
  min: z.number(),
  max: z.number(),
  stock: z.number().nullable(),
});

export const attributeSchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
});

export const priceSchema = z.object({
  price: z.number(),
  discountedPrice: z.number().nullable(),
  priceWithTax: z.number(),
  discountedPriceWithTax: z.number().nullable(),
  taxRate: z.number(),
  taxValue: z.number(),
  currencyCode: z.string(),
  billingCycle: z.string(),
});

export const stockSchema = z.object({
  quantity: z.number().nullable(),
  inStock: z.boolean(),
  allowBackOrder: z.boolean(),
  storageLocation: z.string(),
});

export const variantSchema = z.object({
  sku: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  is_physical: z.boolean(),
  height: z.number().nullable(),
  width: z.number().nullable(),
  depth: z.number().nullable(),
  weight: z.number().nullable(),
  attributes: z.array(attributeSchema),
  prices: z.array(priceSchema),
  stocks: z.array(stockSchema),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  description: z.string(),
  short_description: z.string(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  merchant: z.string(),
  locale: z.string(),
  is_in_stock: z.boolean(),
  quantities: quantitiesSchema,
  attributes: z.array(attributeSchema),
  attributes_filtered: z.array(attributeSchema).optional(),
  variants: z.array(variantSchema),
  prices: z.object({
    min: priceSchema,
    max: priceSchema,
    shipping: z.number(),
    currency: z.string(),
  }),
});

export const getProductRequestSchema = z.object({
  id: z.string(),
  merchant: z.string().optional(),
});

export const getProductResponseSchema = productSchema;

export const getProductsRequestSchema = z.object({
  page: z.number().optional(),
  categories: z.array(z.string()).optional(),
  query: z.string().optional(),
});

export const createOrderRequestSchema = z.object({
  redirect_uuid: z.string(),
  quantity: z.number(),
  merchant: z.string(), // Replace with a more specific schema if you know the shape
  include_qr_code_subscription: z.boolean(),
  include_consultation: z.boolean(),
  attributes: z.array(
    z.record(z.string(), z.union([z.string(), z.array(z.string())]))
  ), // Replace with a more specific schema if known
  product_id: z.string().or(z.number()),
});
