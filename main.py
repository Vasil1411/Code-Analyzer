from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from analyzer import analyze_python_code
from database import (
    create_project_in_db, 
    get_user_projects, 
    get_project_analyses, 
    save_analysis_to_db, 
    delete_project_with_cascade,
    get_connection,
    update_project_in_db,
    get_single_analysis_from_db,
    get_user_by_id
)
from auth import verify_token, verify_admin_token, register_user, login_user

# --- PYDANTIC МОДЕЛИ (ДЕФИНИРАНИ ПРЕДИ FastAPI ПРИЛОЖЕНИЕТО) ---
ALLOWED_CATEGORIES = ["Security", "Clean Code", "Performance", "Architecture"]

class RegisterPayload(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    role: Optional[str] = Field(default="developer", description="User role")

class LoginPayload(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50, description="Project name (3-50 chars)")
    category: str = Field(..., description="Project category")
    description: Optional[str] = Field(default="", max_length=200)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in ALLOWED_CATEGORIES:
            raise ValueError(f"Invalid category. Must be one of: {', '.join(ALLOWED_CATEGORIES)}")
        return v

class CodePayload(BaseModel):
    code: str = Field(..., min_length=1, description="Python source code to analyze")
   

# --- ИНИЦИАЛИЗАЦИЯ НА FASTAPI ---
app = FastAPI(title="SaaS Code Analyzer Enterprise Backend", version="6.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    user = get_user_by_id(user_id)
    # Ако е админ, връщаме ВСИЧКИ проекти в системата! Ако е обикновен девелопър - само неговите.
    if user and user.get("role") == "admin":
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects")
        projects = [dict(row) for row in cursor.fetchall()]
        conn.close()
    else:
        projects = get_user_projects(user_id)
        
    return {"success": True, "count": len(projects), "projects": projects}
    """Връща всички проекти на автентицирания потребител."""
    projects = get_user_projects(user_id)
    return {"success": True, "count": len(projects), "projects": projects}

@app.put("/api/projects/{project_id}")
def update_project(
    project_id: str, 
    project_update: ProjectCreate, 
    user_id: str = Depends(verify_token)
):
    """Редактира съществуващ проект на автентицирания потребител."""
    success, message = update_project_in_db(
        project_id, 
        user_id, 
        project_update.name, 
        project_update.category, 
        project_update.description
    )
    if not success:
        raise HTTPException(status_code=404, detail=message)
    
    return {
        "success": True,
        "message": message
    }
    

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, user_id: str = Depends(verify_token)):
    """Изтрива проект и свързаните с него анализи (Cascade Delete)."""
    success, message = delete_project_with_cascade(project_id, user_id)
    if not success:
        raise HTTPException(status_code=403, detail=message)
        
    return {"success": True, "message": message}

# --- 3. АНАЛИЗ НА КОД ---
@app.post("/api/projects/{project_id}/analyze")
def analyze_project_code_endpoint(
    project_id: str, 
    payload: CodePayload, # Съдържа само полето "code"
    user_id: str = Depends(verify_token)
):
    """Професионален ендпоинт: Анализира Python код за конкретен проект по ID в URL."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Проверяваме дали проектът съществува и принадлежи на потребителя
    cursor.execute("SELECT id FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
    project_row = cursor.fetchone()
    conn.close()
    
    if not project_row:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")
    
    # Изпълняваме анализа
    result = analyze_python_code(payload.code)
    if result["success"]:
        analysis_id = save_analysis_to_db(payload.code, result["issues"], project_id, user_id)
        result["analysis_id"] = analysis_id

    return result


@app.get("/api/projects/{project_id}/analyses")
def get_analyses_for_project(project_id: str, user_id: str = Depends(verify_token)):
    """Връща историята на анализите за даден проект."""
    analyses = get_project_analyses(project_id)
    return {"success": True, "count": len(analyses), "analyses": analyses}


@app.get("/api/projects/{project_id}/analyses/{analysis_id}")
def get_single_analysis_endpoint(
    project_id: str, 
    analysis_id: str, 
    user_id: str = Depends(verify_token)
):
    """Връща детайли за конкретен анализ на конкретен проект."""
    analysis = get_single_analysis_from_db(project_id, analysis_id, user_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found or unauthorized.")
    return {"success": True, "analysis": analysis}


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