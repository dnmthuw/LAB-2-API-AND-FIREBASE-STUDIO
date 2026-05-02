from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.schemas.user_schema import User

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Dependency to get the current user from Firebase token.
    Uses dependency injection to automatically extract and verify token.
    """
    token = credentials.credentials
    try:
        # Verify the Firebase token
        decoded_token = auth.verify_id_token(token)
        # Return user details
        return User(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email"),
            display_name=decoded_token.get("name")
        )
    except Exception as e:
        # Token is invalid or expired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )