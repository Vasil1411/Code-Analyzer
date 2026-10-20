import { apiClient } from '@/services/api';
import { Analysis, Issue } from '@/app/types';

export interface AnalyzeResponse {
  success: boolean;
  analysis_id: string;
  issues: Issue[];
  issues_count: number;
}

export const analyzerService = {
  // Стартира анализ за конкретен проект (/projects/{projectId}/analyze)
  async analyzeCode(projectId: string, code: string): Promise<AnalyzeResponse> {
    return apiClient<AnalyzeResponse>(`/projects/${projectId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  // Извлича историята на анализите за даден проект (/projects/{projectId}/analyses)
  async getProjectAnalyses(projectId: string): Promise<{ success: boolean; count: number; analyses: Analysis[] }> {
    return apiClient<{ success: boolean; count: number; analyses: Analysis[] }>(
      `/projects/${projectId}/analyses`,
      {
        method: 'GET',
      }
    );
  },

  async getAnalysisById(projectId: string, analysisId: string): Promise<any> {
    return apiClient<any>(`/projects/${projectId}/analyses/${analysisId}`, {
      method: 'GET',
    });
  },


};