import { z } from "zod";

import { apiServiceCall } from "./../../services/apiServiceCall.js";
import { getEventBus } from "./../../services/apiClient.js";

export const getPaymentIntent = async () => {
  return await apiServiceCall(
    `/user/payment-intent`,
    "get",
    undefined,
    undefined,
    z.object({
      client_secret: z.string(),
    })
  );
};

export const getPaymentMethods = async () => {
  return await apiServiceCall(`/api/v1/payment-methods`, "get");
};

const interf = z.object({
  payment_method: z.string(),
});

export const addPaymentMethod = async (data: z.infer<typeof interf>) => {
  const response = await apiServiceCall(
    `/api/v1/payment-methods`,
    "post",
    data,
    interf
  );
  getEventBus()?.$emit("added_payment_method");
  return response;
};
