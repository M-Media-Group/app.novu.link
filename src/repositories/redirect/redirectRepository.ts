import { z } from "zod";
import {
  createRedirectRequestSchema,
  createRedirectResponseSchema,
  getRedirectResponseSchema,
  getRedirectsResponseSchema,
} from "./redirectSchema";
import { apiServiceCall } from "../apiServiceCall";

export const createRedirect = async (
  /**
   * @NOTE we can enforce stronger types by not using partial here and removing  (? Partial<ReqType>) from teh apiServiceCall, but this would discourage developers from using the Zod validation, as they would be expected to pass nearly all valid data beforehand, and forcing them to implement their own validation
   */
  data: Partial<z.infer<typeof createRedirectRequestSchema>>
) => {
  return await apiServiceCall(
    "/redirects",
    "post",
    data,
    createRedirectRequestSchema,
    createRedirectResponseSchema
  );
};

export const getRedirects = async () => {
  return await apiServiceCall(
    "/api/v1/redirects",
    "get",
    undefined,
    undefined,
    getRedirectsResponseSchema
  );
};

export const getRedirect = async (uuid: string) => {
  return await apiServiceCall(
    `/api/v1/redirects/${uuid}`,
    "get",
    undefined,
    undefined,
    getRedirectResponseSchema
  );
};
