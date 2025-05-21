import { z } from "zod";
import { apiServiceCall } from "./../../services/apiServiceCall.js";


import {
  createQrDesignRequestSchema,
  getQrDesignLogosResponseSchema,
} from "./qrdesignSchema.js";

import { getEventBus } from "./../../services/apiClient.js";

export const createQrDesign = async (
  data: Partial<z.infer<typeof createQrDesignRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/qr-designs`,
    "post",
    data,
    createQrDesignRequestSchema
  );

  getEventBus()?.$emit("created_qr_design");

  return response;
};

export const getQrDesignLogos = async () => {
  return await apiServiceCall(
    `/qr-designs/logos`,
    "get",
    undefined,
    undefined,
    getQrDesignLogosResponseSchema
  );
};
