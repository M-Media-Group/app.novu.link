export interface Redirect {
  uuid: string;
  team_id: number;
  name: string;
  enable_analytics: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  todays_clicks_count: number;
  endpoints: Endpoint[];
}

export interface Endpoint {
  id: number;
  endpoint: string;
  is_default: boolean;
  preserve_query_parameters: boolean;
  redirect_uuid: string;
  order: number;
  created_at: Date;
  updated_at: Date;
  rule_groups: any[];
}
