import uuid
from datetime import datetime, timedelta
from database import create_invitation_in_db
from services.email_service import send_invitation_email

def create_and_send_invitation(email: str, role: str):
    """Генерира уникален токен за покана (валиден 24 часа), записва я и изпраща реален имейл."""
    token = str(uuid.uuid4())
    # Задаваме точен срок от 24 часа
    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()
    
    invitation_id = create_invitation_in_db(email, role, token, expires_at)
    
    if not invitation_id:
        return False, "The email is already invited or the invitation could not be created."
        
    invite_link = f"http://localhost:3000/register?token={token}"
    
    # Изпращане на истинския имейл през SMTP (email_service)
    email_sent = send_invitation_email(email, invite_link)
    
    if not email_sent:
        return False, "Invitation created in DB, but failed to send email via SMTP."
    
    print(f"\n==========================================")
    print(f"[EMAIL SERVICE] 📧 Real email sent to: {email}")
    print(f"[EMAIL SERVICE] 🔑 Role: {role}")
    print(f"[EMAIL SERVICE] 🔗 Registration link: {invite_link}")
    print(f"==========================================\n")
    
    return True, f"Invitation successfully sent to {email}!"