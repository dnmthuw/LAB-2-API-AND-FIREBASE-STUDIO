from fastapi import APIRouter
from app.dependencies.singleton import global_state
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": global_state._ready,
        "model_name": settings.MODEL_NAME,
        "documents_in_memory": list(global_state.document_chunks.keys()),
    }
