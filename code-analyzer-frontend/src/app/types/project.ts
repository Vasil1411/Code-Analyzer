export type ProjectCategory = 'Security' | 'Clean Code' | 'Performance' | 'Architecture';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  category: ProjectCategory;
  description?: string;
  created_at: string;
}

export interface CreateProjectDTO {
  name: string;
  category: ProjectCategory;
  description?: string;
}