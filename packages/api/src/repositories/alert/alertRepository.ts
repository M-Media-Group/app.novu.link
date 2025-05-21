import type { z } from "zod";
import { apiServiceCall } from "./../../services/apiServiceCall.js";
import {
  createAlertRequestSchema,
  getAlertsResponseSchema,
} from "./alertSchema.js";
import { getEventBus } from "./../../services/apiClient.js";

export const getAlerts = async () => {
  return await apiServiceCall(
    "/api/v1/alerts",
    "get",
    undefined,
    undefined,
    getAlertsResponseSchema
  );
};

export const createAlert = async (
  data: Partial<z.infer<typeof createAlertRequestSchema>>
) => {
  const response = await apiServiceCall(
    `/api/v1/alerts`,
    "post",
    data,
    createAlertRequestSchema
  );


  getEventBus()?.$emit("created_alert");


  return response;
};
