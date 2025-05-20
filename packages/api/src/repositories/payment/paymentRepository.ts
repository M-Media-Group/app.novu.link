import { z } from "zod";

import $bus from "@/eventBus/events";
import { apiServiceCall } from "src/services/apiServiceCall";

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
  $bus.$emit("added_payment_method");
  return response;
};
