import apiService from "@/services/apiClient";
import {
  handleError,
  isUnifiedError,
} from "@/services/api/apiServiceErrorHandler";
import type { ZodSchema } from "zod";

export const apiServiceCall = async <
  ReqSchema extends ZodSchema<any> | undefined,
  ResSchema extends ZodSchema<any> | undefined
>(
  url: string,
  method: keyof Omit<typeof apiService, "getCsrfToken">,
  data?: ReqSchema extends ZodSchema<infer ReqType>
    ? Partial<ReqType>
    : undefined,
  requestSchema?: ReqSchema,
  responseSchema?: ResSchema,
  clientOptions?: object
): Promise<ResSchema extends ZodSchema<infer ResType> ? ResType : any> => {
  try {
    const parsedData = requestSchema ? requestSchema.parse(data) : data;

    const response = await apiService[method]<
      ResSchema extends ZodSchema<infer ResType> ? ResType : any
    >(url, parsedData, clientOptions);

    return responseSchema ? responseSchema.parse(response) : response;
  } catch (error) {
    if (isUnifiedError(error)) {
      throw error;
    }
    handleError(error, "register");
    throw error; // rethrow to satisfy return type
  }
};
