import { apiClient } from '@/services/api';
import { Project, CreateProjectDTO } from '@/app/types';

export const projectService = {
  // Връща всички проекти на потребителя
  async getProjects(): Promise<{ success: boolean; count: number; projects: Project[] }> {
    return apiClient<{ success: boolean; count: number; projects: Project[] }>('/projects', {
      method: 'GET',
    });
  },

  // Създава нов проект
  async createProject(data: CreateProjectDTO): Promise<{ success: boolean; project_id: string; message: string }> {
    return apiClient<{ success: boolean; project_id: string; message: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Редактира съществуващ проект (PUT)
  async updateProject(projectId: string, data: CreateProjectDTO): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Изтрива проект
  async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
};