export interface CommonRuleProperties {
  name: string;
  description: string;
  allowedOperators: string[];
  valueType: string;
  seeAlsoLinks?: string[] | null;
  allowedValues?: string[] | Record<string, string | number> | null;
}

interface BrowserLanguage extends CommonRuleProperties {
  value: string;
}

interface Cookie extends CommonRuleProperties {
  value: Record<string, string>;
}

interface Country extends CommonRuleProperties {
  value: string;
}

interface DayOfWeek extends CommonRuleProperties {
  value: number;
}

interface HostNameByAddress extends CommonRuleProperties {
  value: string;
}

interface IP extends CommonRuleProperties {
  value: string;
}

interface QueryParameter extends CommonRuleProperties {
  value: string;
}

interface Referer extends CommonRuleProperties {
  value: string;
}

interface ScannedQr extends CommonRuleProperties {
  value: boolean;
}

interface Time extends CommonRuleProperties {
  value: string;
}

interface TotalTimesScanned extends CommonRuleProperties {
  value: number;
}

interface TotalTimesScannedPerIP extends CommonRuleProperties {
  value: number;
}

interface UserAgent extends CommonRuleProperties {
  value: string;
}

interface DeviceOrientation extends CommonRuleProperties {
  value: string;
}

interface SupportsGeolocation extends CommonRuleProperties {
  value: string;
}

interface UserTime extends CommonRuleProperties {
  value: string;
}

interface IsBot extends CommonRuleProperties {
  value: boolean;
}

interface DateRule extends CommonRuleProperties {
  value: string;
}

interface MoonPhase extends CommonRuleProperties {
  value: string;
}

interface OperatingSystem extends CommonRuleProperties {
  value: string;
}

interface DeviceMemory extends CommonRuleProperties {
  value: string;
}

interface PercentChance extends CommonRuleProperties {
  value: number;
}

export interface Rules {
  browser_language: BrowserLanguage;
  cookie: Cookie;
  country: Country;
  day_of_week: DayOfWeek;
  host_name_by_address: HostNameByAddress;
  i_p: IP;
  query_parameter: QueryParameter;
  referer: Referer;
  scanned_qr: ScannedQr;
  time: Time;
  total_times_scanned: TotalTimesScanned;
  total_times_scanned_per_i_p: TotalTimesScannedPerIP;
  user_agent: UserAgent;
  device_orientation: DeviceOrientation;
  supports_geolocation: SupportsGeolocation;
  user_time: UserTime;
  is_bot: IsBot;
  date: DateRule;
  moon_phase: MoonPhase;
  operating_system: OperatingSystem;
  device_memory: DeviceMemory;
  percent_chance: PercentChance;
}

export interface RuleGroups {
  rule_groups: RuleGroup[];
}

export interface RuleGroup {
  id: number;
  name: string | null;
  match_all: boolean;
  endpoint_id: number;
  created_at: Date;
  updated_at: Date;
  rules: Rule[];
}

export interface Rule {
  id: number;
  rule_group_id: number;
  // The rule can be any of the keys in the Rules interface
  rule: keyof Rules;
  operator: string;
  value: string;
  created_at: Date;
  updated_at: Date;
}

export type RuleModel = Pick<Partial<Rule>, "rule" | "operator" | "value">;
