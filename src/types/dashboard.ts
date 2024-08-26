export interface Dashboard {
  clicks: Clicks;
  bestRedirect: BestRedirect;
  hasPaymentMethodSet: boolean;
  hasBillableRedirects: boolean;
}

export interface BestRedirect {
  uuid: string;
  team_id: number;
  name: string;
  enable_analytics: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  clicks_count: number;
}

export interface Clicks {
  total: number;
  today: number;
}
