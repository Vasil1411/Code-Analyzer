from fastapi import FastAPI

# Създаваме нашето FastAPI приложение
app = FastAPI(title="Code Analyzer API", version="1.0")

# Пробен ендпоинт за проверка
@app.get("/")
def read_root():
    return {"message": "Здравей! FastAPI бекендът работи успешно! 🚀"}