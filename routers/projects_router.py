from fastapi import APIRouter, HTTPException, Depends
from schemas.schemas import ProjectCreate, CodePayload
from auth import verify_token
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

router = APIRouter(tags=["Projects"])

@router.post("/api/projects")
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

@router.get("/api/projects")
def get_my_projects(user_id: str = Depends(verify_token)):
    """Връща всички проекти на потребителя или всички проекти, ако е админ."""
    user = get_user_by_id(user_id)
    if user and user.get("role") == "admin":
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects")
        projects = [dict(row) for row in cursor.fetchall()]
        conn.close()
    else:
        projects = get_user_projects(user_id)
        
    return {"success": True, "count": len(projects), "projects": projects}

@router.put("/api/projects/{project_id}")
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

@router.delete("/api/projects/{project_id}")
def delete_project(project_id: str, user_id: str = Depends(verify_token)):
    """Изтрива проект и свързаните с него анализи (Cascade Delete)."""
    success, message = delete_project_with_cascade(project_id, user_id)
    if not success:
        raise HTTPException(status_code=403, detail=message)
        
    return {"success": True, "message": message}

# --- Analysis ---
@router.post("/api/projects/{project_id}/analyze")
def analyze_project_code_endpoint(
    project_id: str, 
    payload: CodePayload, 
    user_id: str = Depends(verify_token)
):
    """Професионален ендпоинт: Анализира Python код за конкретен проект по ID в URL."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
    project_row = cursor.fetchone()
    conn.close()
    
    if not project_row:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized.")
    
    result = analyze_python_code(payload.code)
    if result["success"]:
        analysis_id = save_analysis_to_db(payload.code, result["issues"], project_id, user_id)
        result["analysis_id"] = analysis_id

    return result

@router.get("/api/projects/{project_id}/analyses")
def get_analyses_for_project(project_id: str, user_id: str = Depends(verify_token)):
    """Връща историята на анализите за даден проект."""
    analyses = get_project_analyses(project_id)
    return {"success": True, "count": len(analyses), "analyses": analyses}

@router.get("/api/projects/{project_id}/analyses/{analysis_id}")
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