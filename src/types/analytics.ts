export interface Analytics {
  uuid: string;
  team_id: number;
  name: string;
  enable_analytics: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  clicks_count: number;
  endpoints_count: number;
  unique_clicks_count: number;
  todays_clicks_count: number;
  clicks_by_time_of_day?: ClicksByTimeOfDay[];
  click_referers?: ClickReferer[];
  click_countries?: ClickCountry[];
  languages?: Language[];
}

export interface ClicksByTimeOfDay {
  redirect_uuid?: string;
  datetime: string;
  click_count: number;
}

export interface ClickReferer {
  referer: string | null;
  redirect_uuid: string;
  referer_count: number;
}

export interface ClickCountry {
  country: string;
  redirect_uuid: string;
  click_count: number;
}

export interface Language {
  redirect_uuid: string;
  language_code: string;
  count: number;
}
