import type { z } from "zod";
import { apiServiceCall } from "../apiServiceCall";
import {
  createAlertRequestSchema,
  getAlertsResponseSchema,
} from "./alertSchema";

import $bus, { eventTypes } from "@/eventBus/events";

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
    `/dashboard`,
    "post",
    data,
    createAlertRequestSchema
  );

  $bus.$emit(eventTypes.created_alert);

  return response;
};
