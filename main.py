from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth_router import router as auth_router
from routers.projects_router import router as projects_router
from routers.admin_router import router as admin_router
from routers.invite_router import router as invite_router
from dotenv import load_dotenv



load_dotenv()  

app = FastAPI(title="SaaS Code Analyzer Enterprise Backend", version="7.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(admin_router)
app.include_router(invite_router)