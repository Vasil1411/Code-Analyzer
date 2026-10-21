import { apiClient } from '@/services/api';
import { AuthResponse, User } from '@/app/types';

export const userService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async verifyInviteToken(token: string): Promise<{ success: boolean; email: string; role: string }> {
    return apiClient<{ success: boolean; email: string; role: string }>(`/invites/verify/${token}`, {
      method: 'GET',
    });
  },

  
  async registerByInvite(data: { token: string; password: string }): Promise<any> {
    return apiClient<any>('/auth/register-by-invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getAllUsers(token: string): Promise<{ success: boolean; users: User[] }> {
    return apiClient<{ success: boolean; users: User[] }>('/admin/users', {
      method: 'GET',
      token,
    });
  },
};