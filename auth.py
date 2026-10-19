import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from database import get_user_by_email, create_user_in_db

SECRET_KEY = "my_super_secret_jwt_key_change_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 часа

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Автоматична схема за Authorization: Bearer <token> в FastAPI/Swagger
security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    safe_password = password[:72]
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password[:72], hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(credentials: Optional[HTTPAuthorizationCredentials]) -> dict:
    """Помощна функция за валидиране на JWT токена от HTTP Header."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=401, 
            detail="Missing Authorization token. Please authenticate via 'Authorize' or pass a Bearer token."
        )
    
    token = credentials.credentials.strip()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authorization token.")

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> str:
    """Проверява токена за общ потребител/разработчик и връща user_id."""
    payload = decode_token(credentials)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload.")
    return user_id

def verify_admin_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> str:
    """Проверява токена и стриктно изисква роля 'admin'."""
    payload = decode_token(credentials)
    user_id: str = payload.get("sub")
    role: str = payload.get("role")
    
    if role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required.")
        
    return user_id

def register_user(email: str, password: str, role: str = "developer"):
    hashed = hash_password(password)
    user = create_user_in_db(email, hashed, role)
    if not user:
        raise HTTPException(status_code=400, detail="Email already registered")
    token = create_access_token({"sub": user["id"], "email": email, "role": role})
    return {"access_token": token, "token_type": "bearer", "user_id": user["id"], "role": role}

def login_user(email: str, password: str):
    user = get_user_by_email(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token = create_access_token({"sub": user["id"], "email": email, "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user_id": user["id"], "role": user["role"]}