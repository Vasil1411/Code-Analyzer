'use client';

import { useState, useCallback } from 'react';
import { analyzerService, AnalyzeResponse } from '@/services/analyzerService';
import { Analysis } from '@/app/types';

export function useAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  // Изпълнява анализ на код към конкретен проект
  const analyzeCode = async (projectId: string, code: string): Promise<AnalyzeResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyzerService.analyzeCode(projectId, code);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Възникна грешка при анализа на кода.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Зарежда историята на анализите за даден проект
  const fetchAnalyses = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyzerService.getProjectAnalyses(projectId);
      setAnalyses(response.analyses || []);
      return response.analyses;
    } catch (err: any) {
      setError(err.message || 'Грешка при зареждането на историята.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalysisById = async (projectId: string, analysisId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzerService.getAnalysisById(projectId, analysisId);
      return res.analysis;
    } catch (err: any) {
      setError(err.message || 'Грешка при зареждане на анализа.');
      throw err;
    } finally {
      setLoading(false);
    }
  };



  return {
    analyzeCode,
    fetchAnalyses,
    fetchAnalysisById,
    analyses,
    loading,
    error,
  };
}