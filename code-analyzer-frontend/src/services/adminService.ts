import { apiClient } from '@/services/api';
import { User } from '@/app/types';

export const adminService = {
  async getAllUsers(): Promise<{ success: boolean; admin_id?: string; total_users: number; users: User[] }> {
    return apiClient<{ success: boolean; admin_id?: string; total_users: number; users: User[] }>('/admin/users', {
      method: 'GET',
    });
  },
};