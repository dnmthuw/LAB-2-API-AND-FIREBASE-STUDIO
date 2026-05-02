from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str
    document_id: str

class AskResponse(BaseModel):
    answer: str
    confidence: float
    context: str
    source: str = "extractive_qa"

class ExtractRequest(BaseModel):
    question: str
    context: str

class ExtractResponse(BaseModel):
    answer: str
    score: float
    start: int
    end: int
