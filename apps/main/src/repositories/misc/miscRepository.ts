import { apiServiceCall } from "../../services/api/apiServiceCall";
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
