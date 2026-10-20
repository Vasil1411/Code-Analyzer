import { apiClient } from '@/services/api';
import { AuthResponse, User } from '@/app/types';

export const userService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(data: { email: string; password: string; role?: string }): Promise<any> {
    return apiClient<any>('/auth/register', {
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