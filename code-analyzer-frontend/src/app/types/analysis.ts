export interface Issue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line: number;
}

export interface Analysis {
  id: string;
  project_id: string;
  user_id: string;
  code: string;
  issues: Issue[]; 
  issues_count: number;
  timestamp: string;
}

export interface CreateAnalysisDTO {
  project_id: string;
  code: string;
}