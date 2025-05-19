import type { ClicksByTimeOfDay } from "./analytics";

export interface Dashboard {
  clicks: Clicks;
  bestRedirect: BestRedirect | null;
  hasPaymentMethodSet: boolean;
  hasBillableRedirects: boolean;
  clicksByMinuteLast30: ClicksByTimeOfDay[];
}

export interface BestRedirect {
  uuid: string;
  team_id: number;
  name: string;
  enable_analytics: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  clicks_count: number;
}

export interface Clicks {
  total: number;
  today: number;
}
