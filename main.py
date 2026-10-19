from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from analyzer import analyze_python_code

# Създаваме нашето FastAPI приложение
app = FastAPI(title="Code Analyzer API", version="1.0")

class CodePayload(BaseModel):
    code: str

# Пробен ендпоинт за проверка
@app.get("/")
def read_root():
    return {"message": "Здравей! FastAPI бекендът работи успешно! 🚀"}

@app.post("/api/analyze")
def analyze_code(payload: CodePayload):
    # Извикваме нашата AST логика
    result = analyze_python_code(payload.code)
    return result