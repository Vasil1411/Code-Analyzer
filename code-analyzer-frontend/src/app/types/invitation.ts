export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
}