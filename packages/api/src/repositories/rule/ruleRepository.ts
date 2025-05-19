import { z } from "zod";

import {
  getRulesRequestSchema,
  getRulesResponseSchema,
  testRuleRequestSchema,
  testRuleResponseSchema,
} from "./ruleSchema";
import { apiServiceCall } from "src/services/apiServiceCall";

export const testRule = async (
  data: Partial<z.infer<typeof testRuleRequestSchema>>
) => {
  return await apiServiceCall(
    `/api/v1/rules/${data.rule}/test`,
    "post",
    data,
    testRuleRequestSchema,
    testRuleResponseSchema,
    // Note we may need to unset the Accept-Language header due to how the backend checks/tests for language. It needs to be set to the language of the user/browser
    {
      headers: {
        "Accept-Language": undefined,
      },
    }
  );
};

export const getRules = async (
  data?: z.infer<typeof getRulesRequestSchema>
) => {
  return await apiServiceCall(
    `/api/v1/rules`,
    "get",
    data,
    getRulesRequestSchema,
    getRulesResponseSchema
  );
};
