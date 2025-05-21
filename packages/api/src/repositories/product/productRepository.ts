import type { z } from "zod";
import { apiServiceCall } from "./../../services/apiServiceCall.js";

import {
  createOrderRequestSchema,
  getProductRequestSchema,
  getProductResponseSchema,
  getProductsRequestSchema,
} from "./productSchema.js";
import { getBaseUrl } from "./../../services/apiClient.js";
import { parseStreamedResponse } from "@novulink/helpers/streamers";

import { getEventBus } from "./../../services/apiClient.js";

export const getProduct = async (
  data?: z.infer<typeof getProductRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/products/${data?.id}`,
    "get",
    data,
    getProductRequestSchema,
    getProductResponseSchema
  );
};

export const streamProducts = async (
  data?: z.infer<typeof getProductsRequestSchema>,
  productsArray: unknown[] = []
) => {
  const parsedData = getProductsRequestSchema.parse(data);

  const url = new URL("/api/v1/products", getBaseUrl());

  const params = new URLSearchParams();
  if (parsedData.page) {
    params.set("page", parsedData.page.toString());
  }
  params.set("stream", "true");

  if (parsedData.categories?.length) {
    for (const category of parsedData.categories) {
      params.append("categories[]", category);
    }
  }

  url.search = params.toString();

  const config = {
    headers: { Accept: "application/json" },
  };
  const response = await fetch(url.toString(), config);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const reader = response.body?.getReader();
  if (reader) {
    // @ts-expect-error the productsArray may be a partial array
    await parseStreamedResponse(reader, productsArray); // Pass local products array for streaming
  }
  return productsArray;
};

export const createOrder = async (
  data: Partial<z.infer<typeof createOrderRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/products/${data.product_id}/orders`,
    "post",
    data,
    createOrderRequestSchema
  );
  getEventBus()?.$emit("created_product_order");
  return response;
};
