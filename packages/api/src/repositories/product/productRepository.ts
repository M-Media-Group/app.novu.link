import type { z } from "zod";
import { apiServiceCall } from "../../../../apps/main/src/services/api/apiServiceCall";
import {
  createOrderRequestSchema,
  getProductRequestSchema,
  getProductResponseSchema,
  getProductsRequestSchema,
} from "./productSchema";
import { baseUrl } from "@/services/apiClient";
import { parseStreamedResponse } from "@/helpers/streamers";

import $bus from "@/eventBus/events";

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

  const url = new URL("/api/v1/products", baseUrl);

  const params = new URLSearchParams();
  parsedData.page && params.set("page", parsedData.page.toString());
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
  $bus.$emit("created_product_order");
  return response;
};
