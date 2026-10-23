import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_invitation_email(to_email: str, invite_link: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print("❌ SMTP credentials not found in environment variables.")
        return False

    subject = "Invitation to SaaS Code Analyzer Platform"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 30px;">
          <h2 style="color: #58a6ff; margin-top: 0;">You've been invited!</h2>
          <p>Hello,</p>
          <p>You have been invited to join the <strong>SaaS Code Analyzer</strong> platform. Click the button below to complete your registration (valid for 24 hours):</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{invite_link}" style="background-color: #238636; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
          </div>
          
          <p style="font-size: 0.85rem; color: #8b949e;">Or copy this link:</p>
          <p style="font-size: 0.85rem; color: #58a6ff; word-break: break-all;">{invite_link}</p>
        </div>
      </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = SMTP_USER
    message["To"] = to_email
    message.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, message.as_string())
        print(f"✅ Real email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ SMTP Error: {e}")
        return False