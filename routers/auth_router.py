from fastapi import APIRouter
from schemas.schemas import RegisterPayload, LoginPayload, InviteRegisterPayload
from auth import register_user, login_user
from database import get_invitation_by_token, get_user_by_email, create_user_in_db, mark_invitation_as_accepted
from passlib.context import CryptContext


router = APIRouter(prefix="/api/auth", tags=["Authentication"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/register")
def api_register(payload: RegisterPayload):
    """Регистрира нов потребител в SQLite и връща JWT токен с ролята."""
    return register_user(payload.email, payload.password, payload.role)

@router.post("/login")
def api_login(payload: LoginPayload):
    """Автентицира потребителя и връща JWT access token."""
    return login_user(payload.email, payload.password)


@router.post("/register-by-invite")
def api_register_by_invite(payload: InviteRegisterPayload):
    """Регистрира нов потребител строго чрез покана (токен) от базата данни."""
    # 1. Проверяваме токена в таблицата с покани
    inv = get_invitation_by_token(payload.token)
    if not inv:
        raise HTTPException(status_code=400, detail="Invalid or expired invitation token.")
    
    email = inv["email"]
    role = inv["role"] # Ролята се взима автоматично от поканата!

    # 2. Проверяваме дали вече има такъв потребител
    existing_user = get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # 3. Хешираме паролата и създаваме потребителя
    password_hash = pwd_context.hash(payload.password)
    new_user = create_user_in_db(email, password_hash, role)
    if not new_user:
        raise HTTPException(status_code=400, detail="Failed to create user in database.")

    # 4. Маркираме поканата като приета (accepted)
    mark_invitation_as_accepted(payload.token)

    return {
        "success": True,
        "message": f"Account successfully created as {role}!",
        "user": new_user
    }