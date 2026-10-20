export type UserRole = 'developer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface UserSession {
  access_token: string;
  token_type: string;
  user: User;
}