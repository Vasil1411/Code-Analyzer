from fastapi import APIRouter, HTTPException, Depends
from auth import verify_admin_token
from database import (get_connection, delete_user_with_cascade, update_user_role)
from schemas.schemas import RoleUpdatePayload

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])


@router.get("/users")
def admin_get_all_users(admin_id: str = Depends(verify_admin_token)):
    """Защитен администраторски ендпоинт. Връща списък с всички потребители."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role, created_at FROM users")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"success": True, "admin_id": admin_id, "total_users": len(users), "users": users}

@router.delete("/users/{target_user_id}")
def admin_delete_user(target_user_id: str, admin_id: str = Depends(verify_admin_token)):
    """Изтрива потребител и всички негови проекти/анализи (само за админи)."""
    success, message = delete_user_with_cascade(target_user_id, admin_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"success": True, "message": message}

@router.patch("/users/{target_user_id}/role")
def admin_update_user_role(
    target_user_id: str, 
    payload: RoleUpdatePayload, 
    admin_id: str = Depends(verify_admin_token)
):
    """Променя ролята на даден потребител (напр. от developer на admin)."""
    success, message = update_user_role(target_user_id, payload.role, admin_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    return {"success": True, "message": message}