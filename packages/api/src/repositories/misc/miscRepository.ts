import { apiServiceCall } from "./../../services/apiServiceCall.js";

import { getDashboardResponseSchema } from "./miscSchema.js";

export const getDashboard = async () => {
  return await apiServiceCall(
    `/dashboard`,
    "get",
    undefined,
    undefined,
    getDashboardResponseSchema
  );
};
