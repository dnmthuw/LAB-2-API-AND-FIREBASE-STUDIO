import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Firebase Configuration
from app.core.firebase_config import initialize_firebase
initialize_firebase()

# Consolidated Routers
from app.routers.auth import router as auth_router
from app.routers.health import router as health_router
from app.routers.project_router import router as project_router

# State & Services
from app.dependencies.singleton import global_state
from app.services.storage.storage_service import run_global_cleanup

logging.basicConfig(
    level=logging.WARNING,
    format="[%(asctime)s] %(levelname)s — %(name)s — %(message)s",
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    run_global_cleanup()
    global_state.load_qa_model()
    yield

app = FastAPI(
    title="PDF Chatbot API",
    description="Refactored & Consolidated Project Workspace API",
    version="5.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for lab environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(project_router) # Handles /projects, sources, upload-pdf, chat, conversations
app.include_router(health_router)

@app.get("/")
def read_root():
    return {
        "system_info": {
            "app_name": "DocuMeow PDF Chatbot API",
            "version": "5.0.0",
            "status": "operational",
            "author": "Duong Ngoc Minh Thu",
            "student_id": "24120144",
            "framework": "FastAPI",
            "database": "Firebase Firestore",
            "features": ["Project Workspace", "PDF Analysis", "AI Chat", "Firebase Auth"]
        },
        "documentation": "/docs"
    }