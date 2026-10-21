import { apiClient } from '@/services/api';
import { User } from '@/app/types';
import { Invitation } from '@/app/types';

export const adminService = {
  async getAllUsers(): Promise<{ success: boolean; admin_id?: string; total_users: number; users: User[] }> {
    return apiClient<{ success: boolean; admin_id?: string; total_users: number; users: User[] }>('/admin/users', {
      method: 'GET',
    });
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateUserRole(userId: string, newRole: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });
  },

  async inviteUser(email: string, role: string): Promise<{ success: boolean; message: string }> {
    
    return apiClient<{ success: boolean; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password: 'TemporaryPassword123!', // temporary password, can be changed later
        role,
      }),
    });
  },


  async sendInvitation(email: string, role: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>('/invites/send', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  
  async getAllInvitations(): Promise<{ success: boolean; total: number; invitations: Invitation[] }> {
    return apiClient<{ success: boolean; total: number; invitations: Invitation[] }>('/invites', {
      method: 'GET',
    });
  },

};