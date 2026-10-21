import uuid
from datetime import datetime, timedelta
from database import create_invitation_in_db

def create_and_send_invitation(email: str, role: str):
    """Генерира уникален токен за покана (валиден 24 часа) и я записва."""
    token = str(uuid.uuid4())
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    
    
    invitation_id = create_invitation_in_db(email, role, token, expires_at)
    
    if not invitation_id:
        return False, "The email is already invited or the invitation could not be created."
        
    
    invite_link = f"http://localhost:3000/register?token={token}"
    
    
    print(f"\n==========================================")
    print(f"[EMAIL SERVICE] 📧 Sent invitation to: {email}")
    print(f"[EMAIL SERVICE] 🔑 Role: {role}")
    print(f"[EMAIL SERVICE] 🔗 Registration link: {invite_link}")
    print(f"==========================================\n")
    
    return True, f"Invitation sent successfully: {invite_link}"