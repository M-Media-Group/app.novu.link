export interface User {
  id?: number;
  username?: string;
  name: string;
  email: string;
  phone_number: string | null;
  email_verified_at: Date | null;
  phone_number_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
  personal_access_tokens?: PersonalAccessToken[];
}

export interface PersonalAccessToken {
  id: number;
  tokenable_id: number;
  name: string | null;
  abilities: string[];
  created_at: Date;
  updated_at: Date;
  last_used_at: Date | null;
}

export interface Client {
  id: number;
  user_id: null;
  name: string;
  provider: null;
  redirect: string;
  personal_access_client: boolean;
  password_client: boolean;
  revoked: boolean;
  created_at: Date;
  updated_at: Date;
}
