export interface CommonRuleProperties {
  name: string;
  description: string;
  allowedOperators: string[];
  valueType: string;
  seeAlsoLinks: string[];
  allowedValues?: any[] | Record<string, string | number>;
}

interface BrowserLanguage extends CommonRuleProperties {
  value: string;
}

interface Cookie extends CommonRuleProperties {
  value: any[];
}

interface Country extends CommonRuleProperties {
  value: any;
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
  value: any;
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
  value: any;
}

interface SupportsGeolocation extends CommonRuleProperties {
  value: any;
}

interface UserTime extends CommonRuleProperties {
  value: any;
}

interface IsBot extends CommonRuleProperties {
  value: boolean;
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
}

export interface RuleModel {
  selectedRuleKey: keyof Rules | null;
  selectedOperator: string | null;
  selectedValue: string | null;
}
