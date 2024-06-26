export interface Team {
  id: number;
  user_id?: number;
  name: string;
  personal_team?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  is_billing_exempt?: boolean;
  stripe_id?: string;
  pm_type?: string;
  pm_last_four?: string;
  trial_ends_at?: null;
  is_active?: boolean;
}
