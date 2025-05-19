export interface Team {
  id: number;
  user_id?: number;
  name: string;
  personal_team?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  is_billing_exempt?: boolean;
  stripe_id?: string | null;
  pm_type?: string | null;
  pm_last_four?: string | null;
  trial_ends_at?: Date | null;
  is_active?: boolean | null;
}
