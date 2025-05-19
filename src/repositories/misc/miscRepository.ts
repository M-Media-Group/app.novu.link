import { apiServiceCall } from "../apiServiceCall";
import { getDashboardResponseSchema } from "./miscSchema";

export const getDashboard = async () => {
  return await apiServiceCall(
    `/dashboard`,
    "get",
    undefined,
    undefined,
    getDashboardResponseSchema
  );
};
