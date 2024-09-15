import type { ClicksByTimeOfDay } from "./analytics";

export interface Redirect {
  uuid: string;
  team_id: number;
  name: string;
  enable_analytics: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  todays_clicks_count: number;
  yesterdays_clicks_up_to_now_count?: number;
  endpoints: Endpoint[];
  sources?: Placement[];
  subscribed_at: Date | null;
  remaining_clicks: number;
}

export interface Endpoint {
  id?: number;
  endpoint: string;
  is_default?: boolean;
  preserve_query_parameters?: boolean;
  redirect_uuid?: string;
  order?: number;
  created_at?: Date;
  updated_at?: Date;
  rule_groups?: any[];
  clicks?: Click[];
  clicks_by_time_of_day?: ClicksByTimeOfDay[];
  clicks_by_minute?: ClicksByTimeOfDay[];
  last_http_code?: number;
}

export interface Click {
  id: number;
  redirect_uuid: string;
  matched_endpoint_id: number;
  referer: string | null;
  ip: string;
  user_agent: string;
  language: string;
  final_url: string;
  data: Data;
  is_bot: number;
  created_at: Date;
}

export interface Data {
  ruleData: RuleData;
}

export interface RuleData {
  country: string | null;
  scanned_qr_code: boolean;
  source_query_string: string;
}

export interface Placement {
  id: number;
  description: any;
  redirect_uuid: string;
  created_by_user_id: any;
  url: string;
  is_physical: boolean;
  should_scrape: boolean;
  last_confirmed_at: string;
  can_scrape: boolean;
  created_at: string;
  updated_at: string;
}
