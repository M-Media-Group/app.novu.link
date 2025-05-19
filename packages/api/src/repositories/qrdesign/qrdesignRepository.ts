import { z } from "zod";
import { apiServiceCall } from "../../../../apps/main/src/services/api/apiServiceCall";

import {
  createQrDesignRequestSchema,
  getQrDesignLogosResponseSchema,
} from "./qrdesignSchema";

import $bus from "@/eventBus/events";

export const createQrDesign = async (
  data: Partial<z.infer<typeof createQrDesignRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/qr-designs`,
    "post",
    data,
    createQrDesignRequestSchema
  );

  $bus.$emit("created_qr_design");

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
