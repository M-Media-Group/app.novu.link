import type { Redirect } from "./redirect";
import type { Team } from "./team";

export interface SupportedIntegration {
  name: string;
  pretty_name: string;
  url: string;
  debug_url?: string;
  fields: SupportedIntegrationFields;
}

export interface SupportedIntegrationFields {
  id: string;
  secret: string;
  debug_code?: string;
}

export interface AnalyticsIntegration {
  id: number;
  name: string | null;
  team_id: Team["id"];
  type: string;
  external_id: string;
  user_id: number;
  debug: boolean;
  debug_code: string | null;
  created_at: Date;
  updated_at: Date;
  redirects?: Redirect[];
  team?: Team;
}
