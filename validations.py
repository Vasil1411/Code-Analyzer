from pydantic import BaseModel, Field, field_validator
from typing import Optional

# Разрешени категории за проектите
ALLOWED_CATEGORIES = ["Security", "Clean Code", "Performance", "Architecture"]

class RegisterPayload(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")

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
    project_id: str = Field(..., min_length=5, description="Valid Firebase project ID")