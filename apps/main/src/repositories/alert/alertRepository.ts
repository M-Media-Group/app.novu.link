import type { z } from "zod";
import { apiServiceCall } from "../../services/api/apiServiceCall";
import {
  createAlertRequestSchema,
  getAlertsResponseSchema,
} from "./alertSchema";

import $bus from "@/eventBus/events";

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

  $bus.$emit("created_alert");

  return response;
};
