from fastapi import APIRouter, HTTPException, Depends
from auth import verify_admin_token
from services.invite_service import create_and_send_invitation
from schemas.schemas import InvitePayload
from database import (get_all_invitations_from_db, get_invitation_by_token)
from datetime import datetime

router = APIRouter(prefix="/api/invites", tags=["Invitations Management"])



@router.post("/send")
def send_invitation_endpoint(payload: InvitePayload, admin_id: str = Depends(verify_admin_token)):
    """Защитен ендпоинт: Само администратор може да генерира и изпраща покани."""
    success, message = create_and_send_invitation(payload.email, payload.role)
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    return {"success": True, "message": message}

@router.get("", dependencies=[Depends(verify_admin_token)])
def get_all_invitations_endpoint(admin_id: str = Depends(verify_admin_token)):
    """Само администратор може да вижда списъка с всички изпратени покани."""
    invitations = get_all_invitations_from_db()
    return {
        "success": True,
        "total": len(invitations),
        "invitations": invitations
    }

@router.get("/verify/{token}")
def verify_invitation_token(token: str):
    """Публичен ендпоинт: Проверява токена и срока му (24 часа)."""
    inv = get_invitation_by_token(token)
    if not inv:
        raise HTTPException(status_code=400, detail="Invalid or expired invitation token.")
    
    # Проверка за срок от 24 часа
    expires_at_dt = datetime.fromisoformat(inv["expires_at"])
    if datetime.utcnow() > expires_at_dt or inv.get("status") == "expired":
        raise HTTPException(status_code=400, detail="This invitation link has expired.")

    return {
        "success": True,
        "email": inv["email"],
        "role": inv["role"]
    }