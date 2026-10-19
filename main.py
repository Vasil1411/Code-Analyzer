from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from analyzer import analyze_python_code
from database import (
    create_project_in_db, 
    get_user_projects, 
    get_project_analyses, 
    save_analysis_to_db, 
    delete_project_with_cascade,
    get_connection
)
from auth import verify_token, verify_admin_token, register_user, login_user

app = FastAPI(title="SaaS Code Analyzer Enterprise Backend", version="6.5")

# Pydantic Модели
class RegisterPayload(BaseModel):
    email: str
    password: str
    role: Optional[str] = "developer"  # "developer" или "admin"

class LoginPayload(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = ""

class CodePayload(BaseModel):
    code: str
    project_id: str

@app.get("/")
def read_root():
    return {"message": "SaaS Code Analyzer Enterprise Backend is running with SQLite & JWT! 🚀"}

# --- 1. АВТЕНТИКАЦИЯ ---
@app.post("/api/auth/register")
def api_register(payload: RegisterPayload):
    """Регистрира нов потребител в SQLite и връща JWT токен с ролята."""
    return register_user(payload.email, payload.password, payload.role)

@app.post("/api/auth/login")
def api_login(payload: LoginPayload):
    """Автентицира потребителя и връща JWT access token."""
    return login_user(payload.email, payload.password)

# --- 2. УПРАВЛЕНИЕ НА ПРОЕКТИ ---
@app.post("/api/projects")
def create_project(project: ProjectCreate, user_id: str = Depends(verify_token)):
    """Създава нов проект за автентициран потребител."""
    project_id = create_project_in_db(user_id, project.name, project.category, project.description)
    if not project_id:
        raise HTTPException(status_code=500, detail="Failed to create project.")
    
    return {
        "success": True,
        "project_id": project_id,
        "message": f"Project '{project.name}' created under category '{project.category}'."
    }

@app.get("/api/projects")
def get_my_projects(user_id: str = Depends(verify_token)):
    """Връща всички проекти на автентицирания потребител."""
    projects = get_user_projects(user_id)
    return {"success": True, "count": len(projects), "projects": projects}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, user_id: str = Depends(verify_token)):
    """Изтрива проект и свързаните с него анализи (Cascade Delete)."""
    success, message = delete_project_with_cascade(project_id, user_id)
    if not success:
        raise HTTPException(status_code=403, detail=message)
        
    return {"success": True, "message": message}

# --- 3. АНАЛИЗ НА КОД ---
@app.post("/api/analyze-project-code")
def analyze_project_code(payload: CodePayload, user_id: str = Depends(verify_token)):
    """Анализира Python код и го записва към съответния проект."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM projects WHERE id = ?", (payload.project_id,))
    project_row = cursor.fetchone()
    conn.close()
    
    if not project_row:
        raise HTTPException(status_code=404, detail="Project not found.")
    
    result = analyze_python_code(payload.code)
    if result["success"]:
        analysis_id = save_analysis_to_db(payload.code, result["issues"], payload.project_id, user_id)
        result["analysis_id"] = analysis_id

    return result

@app.get("/api/projects/{project_id}/analyses")
def get_analyses_for_project(project_id: str, user_id: str = Depends(verify_token)):
    """Връща историята на анализите за даден проект."""
    analyses = get_project_analyses(project_id)
    return {"success": True, "count": len(analyses), "analyses": analyses}

# --- 4. АДМИНИСТРАТИВЕН ЕНДПОИНТ (САМО ЗА АДМИНИ) ---
@app.get("/api/admin/users")
def admin_get_all_users(admin_id: str = Depends(verify_admin_token)):
    """Защитен администраторски ендпоинт. Връща списък с всички потребители."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, created_at FROM users")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"success": True, "admin_id": admin_id, "total_users": len(users), "users": users}