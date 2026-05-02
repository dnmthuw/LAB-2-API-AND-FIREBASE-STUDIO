from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.schemas.user_schema import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
def get_user_info(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's information based on their Firebase token.
    """
    return {
        "status": "success",
        "user": current_user.model_dump()
    }
