'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/services/projectService';
import { Project, CreateProjectDTO } from '@/app/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Зареждане на проектите
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data.projects || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Грешка при зареждане на проектите');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Създаване на проект
  const createProject = async (data: CreateProjectDTO) => {
    try {
      setError(null);
      await projectService.createProject(data);
      await fetchProjects(); // Обновяваме списъка
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Грешка при създаване на проекта';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Редактиране на проект (PUT)
  const updateProject = async (id: string, data: CreateProjectDTO) => {
    try {
      setError(null);
      await projectService.updateProject(id, data);
      await fetchProjects(); // Обновяваме списъка
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Грешка при обновяване на проекта';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Изтриване на проект
  const deleteProject = async (id: string) => {
    try {
      setError(null);
      await projectService.deleteProject(id);
      await fetchProjects(); // Обновяваме списъка
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Грешка при изтриване на проекта';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}