from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    uid: str
    email: Optional[str] = None
    display_name: Optional[str] = None
