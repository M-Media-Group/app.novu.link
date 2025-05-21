import { z } from "zod";

const booleanLikeToString = z
  .union([z.boolean(), z.enum(["yes", "no", "true", "false", "1", "0"])])
  .transform((val) => {
    if (typeof val === "boolean") return val;

    const normalized = val.trim().toLowerCase();
    if (["yes", "true", "1"].includes(normalized)) return "true";
    if (["no", "false", "0"].includes(normalized)) return "false";

    throw new Error(`Invalid boolean value: ${val}`);
  });

const CommonRuleProperties = z.object({
  name: z.string(),
  description: z.string(),
  allowedOperators: z.array(z.string()),
  valueType: z.string(),
  seeAlsoLinks: z.array(z.string()).nullable(),
  allowedValues: z
    .union([z.array(z.any()), z.record(z.union([z.string(), z.number()]))])
    .nullable()
    .optional(),
});

const BrowserLanguage = CommonRuleProperties.extend({
  value: z.string(),
});

const Cookie = CommonRuleProperties.extend({
  value: z.string().or(z.record(z.string(), z.string().nullable())),
});

const Country = CommonRuleProperties.extend({
  value: z.string(),
});

const DayOfWeek = CommonRuleProperties.extend({
  value: z.coerce.number(),
});

const HostNameByAddress = CommonRuleProperties.extend({
  value: z.string(),
});

const IP = CommonRuleProperties.extend({
  value: z.string(),
});

const QueryParameter = CommonRuleProperties.extend({
  value: z.string(),
});

const Referer = CommonRuleProperties.extend({
  value: z.string(),
});

const ScannedQr = CommonRuleProperties.extend({
  value: booleanLikeToString,
});

const Time = CommonRuleProperties.extend({
  value: z.string(),
});

const TotalTimesScanned = CommonRuleProperties.extend({
  value: z.coerce.number().transform((val) => `${val}`),
});

const TotalTimesScannedPerIP = CommonRuleProperties.extend({
  value: z.coerce.number().transform((val) => `${val}`),
});

const UserAgent = CommonRuleProperties.extend({
  value: z.string(),
});

const DeviceOrientation = CommonRuleProperties.extend({
  value: z.string(),
});

const SupportsGeolocation = CommonRuleProperties.extend({
  value: booleanLikeToString,
});

const UserTime = CommonRuleProperties.extend({
  value: z.string(),
});

const IsBot = CommonRuleProperties.extend({
  value: booleanLikeToString,
});

const Date = CommonRuleProperties.extend({
  value: z.coerce.date(),
});

const MoonPhase = CommonRuleProperties.extend({
  value: z.string(),
});

const OperatingSystem = CommonRuleProperties.extend({
  value: z.string(),
});

const DeviceMemory = CommonRuleProperties.extend({
  value: z.coerce.number(),
});

const PercentChance = CommonRuleProperties.extend({
  value: z.coerce.number().min(0).max(100),
});

export const RulesSchema = z.object({
  browser_language: BrowserLanguage,
  cookie: Cookie,
  country: Country,
  date: Date,
  day_of_week: DayOfWeek,
  device_orientation: DeviceOrientation,
  host_name_by_address: HostNameByAddress,
  i_p: IP,
  is_bot: IsBot,
  moon_phase: MoonPhase,
  operating_system: OperatingSystem,
  query_parameter: QueryParameter,
  referer: Referer,
  scanned_qr: ScannedQr,
  supports_geolocation: SupportsGeolocation,
  time: Time,
  total_times_scanned: TotalTimesScanned,
  total_times_scanned_per_i_p: TotalTimesScannedPerIP,
  user_agent: UserAgent,
  user_time: UserTime,
  device_memory: DeviceMemory,
  percent_chance: PercentChance,
});

export const ruleKeys = RulesSchema.keyof();
type RuleKeyLiteral = z.infer<typeof ruleKeys>;

export const makeRuleSchemaUnion = () => {
  const shape = RulesSchema.shape;

  const entries = Object.entries(shape);

  if (entries.length === 0) {
    throw new Error("RulesSchema has no keys, cannot build union.");
  }

  // Collect all individual schemas into an array first
  const individualRuleSchemas = entries.map(([ruleKey, ruleSchema]) => {
    const valueSchema = (ruleSchema as z.ZodObject<typeof CommonRuleProperties.shape & { value: z.ZodTypeAny }>).shape.value;
    return z.object({
      rule: z.literal(ruleKey as RuleKeyLiteral),
      operator: z.string(),
      value: valueSchema,
    });
  });

  // Check the number of collected schemas
  if (individualRuleSchemas.length === 0) {
    // This case is already handled by the initial check, but kept for clarity
    throw new Error("RulesSchema has no keys, cannot build schema.");
  }

  // Use z.discriminatedUnion for 2 or more schemas; return single schema for 1
  if (individualRuleSchemas.length >= 2) {
    // If there are 2 or more rule types, create a discriminated union
    // Using 'as any' is necessary here because Zod's discriminatedUnion type expects
    // a tuple with a minimum length of 2, which is hard to satisfy with a dynamic array.
    return z.discriminatedUnion(
      "rule",
      individualRuleSchemas as [
        z.ZodObject<{
          rule: z.ZodLiteral<RuleKeyLiteral>;
          operator: z.ZodString;
          value: z.ZodTypeAny;
        }>,
        z.ZodObject<{
          rule: z.ZodLiteral<RuleKeyLiteral>;
          operator: z.ZodString;
          value: z.ZodTypeAny;
        }>,
        ...z.ZodObject<{
          rule: z.ZodLiteral<RuleKeyLiteral>;
          operator: z.ZodString;
          value: z.ZodTypeAny;
        }>[]
      ]
    );
  } else {
    // individualRuleSchemas.length === 1
    // If there's only one rule type, return the single object schema directly.
    // Zod's discriminatedUnion cannot be correctly typed or created with only one option.
    return individualRuleSchemas[0];
  }
};

export const RuleCheckSchema = makeRuleSchemaUnion();

export const testRuleRequestSchema = z.intersection(
  z.object({
    redirectId: z.string(),
  }),
  RuleCheckSchema
);

export const testRuleResponseSchema = z.object({
  passes: z.coerce.boolean(),
});

export const getRulesRequestSchema = z.object({
  redirectId: z.string().optional(),
});

// The response is an array. The array keys are the rule names, and the value looks like:
// {
//   "name": "IsBot",
//   "description": "",
//   "allowedOperators": [
//     "="
//   ],
//   "valueType": "text",
//   "seeAlsoLinks": null,
//   "allowedValues": [
//     "true",
//     "false"
//   ],
//   "value": false
// }

export const getRulesResponseSchema = z.record(
  ruleKeys,
  CommonRuleProperties.extend({
    value: z.union([
      z.number(),
      z.boolean(),
      z.null(),
      z.string(),
      z.record(z.string(), z.string().nullable()),
    ]),
  })
);
