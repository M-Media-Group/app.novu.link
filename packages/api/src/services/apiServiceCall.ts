import {
  handleError,
  isUnifiedError,
} from "./apiServiceErrorHandler.js";
import type { ZodTypeAny, input, output } from "zod";
import { getApiClient } from './apiClient.js';
import { HttpClient } from "./clients/genericHttpClient.js";

export const apiServiceCall = async <
  ReqSchema extends ZodTypeAny | undefined,
  ResSchema extends ZodTypeAny | undefined
>(
  url: string,
  method: keyof Omit<HttpClient, "getCsrfToken">,
  data?: ReqSchema extends ZodTypeAny ? Partial<input<ReqSchema>> : undefined,
  requestSchema?: ReqSchema,
  responseSchema?: ResSchema,
  clientOptions?: object
): Promise<ResSchema extends ZodTypeAny ? output<ResSchema> : unknown> => {
  try {
    const parsedData = requestSchema ? requestSchema.parse(data) : data;

    const apiClient = getApiClient();

    const response = await apiClient[method]<
      ResSchema extends ZodTypeAny ? output<ResSchema> : unknown
    >(url, parsedData, clientOptions);

    if (!responseSchema) {
      return response;
    }

    return responseSchema.parse(response);
  } catch (error) {
    if (isUnifiedError(error)) {
      throw error;
    }
    handleError(error, "api-call");
    throw error;
  }
};
