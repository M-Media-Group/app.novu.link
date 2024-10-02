export interface SupportedIntegration {
  name: string;
  pretty_name: string;
  url: string;
  fields: SupportedIntegrationFields;
}

export interface SupportedIntegrationFields {
  id: string;
  secret: string;
}

export interface AnalyticsIntegration {
  id: number;
  name: string;
  team_id: number;
  type: string;
  external_id: string;
  user_id: number;
  debug: boolean;
  created_at: Date;
  updated_at: Date;
}
