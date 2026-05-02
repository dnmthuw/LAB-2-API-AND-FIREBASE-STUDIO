from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageSchema(BaseModel):
    id: str
    role: str # "user" | "assistant"
    content: str
    timestamp: str

class ConversationSchema(BaseModel):
    id: str
    title: str
    created_at: str
    messages: List[MessageSchema] = []

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Conversation"

class UpdateMessageRequest(BaseModel):
    content: str

class ChatMessageRequest(BaseModel):
    question: Optional[str] = None
    message: Optional[str] = None
    document_id: Optional[str] = None
    context: Optional[str] = None
    conversation_id: Optional[str] = None
