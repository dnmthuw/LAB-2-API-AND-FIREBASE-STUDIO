"""
project_router.py
=================
Consolidated router for all Project-related actions:
- Project Management (CRUD)
- Source Management (PDF Upload, Text, Delete)
- Conversation Management (CRUD)
- Chat Actions (Query, Message Management)
"""

import os
import logging
import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel

from app.services.ai.qa.chat_service import process_chat
from app.services.ai.pdf.loader import extract_text_from_pdf
from app.services.ai.pdf.chunking import chunk_text_and_store
from app.core.config import settings
from app.dependencies.singleton import global_state
from app.dependencies.auth import get_current_user
from app.schemas.user_schema import User
import app.services.storage.storage_service as store

logger = logging.getLogger("project_router")
router = APIRouter(prefix="/projects", tags=["projects"])

# ── Request Schemas ────────────────────────────────────────────────────────────

class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = ""

class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class AddTextRequest(BaseModel):
    name: str
    content: str

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Conversation"

class UpdateConversationRequest(BaseModel):
    title: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    document_ids: Optional[List[str]] = []

# ── Project CRUD ──────────────────────────────────────────────────────────────

@router.get("")
def list_projects(current_user: User = Depends(get_current_user)):
    projects = store.get_all_projects(user_id=current_user.uid)
    result = []
    for p in projects:
        result.append({
            "id": p["id"],
            "name": p["name"],
            "description": p.get("description", ""),
            "created_at": p.get("created_at"),
            "source_count": len(p.get("sources", [])),
            "conversation_count": len(p.get("conversations", {})),
        })
    return {"projects": result}

@router.post("", status_code=201)
def create_project(req: CreateProjectRequest, current_user: User = Depends(get_current_user)):
    try:
        return store.create_project(name=req.name, description=req.description, user_id=current_user.uid)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{project_id}")
def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@router.put("/{project_id}")
def update_project(project_id: str, req: UpdateProjectRequest, current_user: User = Depends(get_current_user)):
    try:
        proj = store.update_project(project_id, name=req.name, description=req.description, user_id=current_user.uid)
        if not proj:
            raise HTTPException(status_code=404, detail="Project not found")
        return proj
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    if not store.delete_project(project_id, user_id=current_user.uid):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# ── Source Management ─────────────────────────────────────────────────────────

@router.get("/{project_id}/sources")
def list_sources(project_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"sources": proj.get("sources", [])}

@router.delete("/{project_id}/sources/{source_id}")
def remove_source(project_id: str, source_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if not store.remove_source_from_project(project_id, source_id):
        raise HTTPException(status_code=404, detail="Source not found")
    return {"message": "Source removed"}

@router.post("/{project_id}/add-text", status_code=201)
def add_text_source(project_id: str, req: AddTextRequest, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not req.name.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="Name and content cannot be empty")
        
    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    global_state.invalidate_document(doc_id)
    
    try:
        num_chunks = chunk_text_and_store(req.content, doc_id)
        source_meta = store.add_source_to_project(
            project_id=project_id,
            name=req.name,
            source_type="text",
            size_bytes=len(req.content.encode('utf-8')),
            content=req.content,
            document_id=doc_id
        )
        return {"document_id": doc_id, "name": req.name, "num_chunks": num_chunks, "source_id": source_meta["id"]}
    except Exception as e:
        logger.error(f"Error adding text source: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/upload-pdf", status_code=201)
async def upload_pdf(project_id: str, file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > settings.MAX_PDF_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
    upload_path = os.path.join(settings.UPLOAD_DIR, doc_id)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    try:
        with open(upload_path, "wb") as f:
            f.write(content)

        global_state.invalidate_document(doc_id)
        full_text = extract_text_from_pdf(upload_path)
        num_chunks = chunk_text_and_store(full_text, doc_id)

        source_meta = store.add_source_to_project(
            project_id=project_id,
            name=file.filename,
            source_type="pdf",
            size_bytes=len(content),
            document_id=doc_id
        )
        return {"document_id": doc_id, "filename": file.filename, "num_chunks": num_chunks, "source_id": source_meta["id"]}
    except Exception as e:
        logger.error(f"PDF upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(upload_path):
            os.remove(upload_path)

# ── Conversation & Chat ───────────────────────────────────────────────────────

@router.get("/{project_id}/conversations")
def list_conversations(project_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    convs = store.get_all_conversations(project_id)
    convs.sort(key=lambda c: c.get("updated_at", ""), reverse=True)
    return {"conversations": convs}

@router.post("/{project_id}/conversations", status_code=201)
def create_conversation(project_id: str, req: CreateConversationRequest, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return store.create_conversation(project_id, title=req.title)

@router.get("/{project_id}/conversations/{conv_id}")
def get_conversation(project_id: str, conv_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    conv = store.get_conversation(project_id, conv_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.put("/{project_id}/conversations/{conv_id}")
def rename_conversation(project_id: str, conv_id: str, req: UpdateConversationRequest, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    conv = store.update_conversation_title(project_id, conv_id, req.title)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.delete("/{project_id}/conversations/{conv_id}")
def delete_conversation(project_id: str, conv_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if not store.delete_conversation(project_id, conv_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}

@router.post("/{project_id}/chat")
async def chat(project_id: str, req: ChatRequest, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    doc_ids = req.document_ids or [s.get("document_id") for s in proj.get("sources", []) if s.get("document_id")]
    
    # Auto-rename "New Conversation" on first message
    if req.conversation_id:
        cid = req.conversation_id
        conv = store.get_conversation(project_id, cid)
        if conv and conv.get("title") == "New Conversation":
            store.update_conversation_title(project_id, cid, req.message[:50])
    else:
        cid = store.create_conversation(project_id, title=req.message[:50])["id"]

    if not doc_ids:
        ans = "Vui lòng upload tài liệu trước khi đặt câu hỏi."
        store.add_message(project_id, cid, "user", req.message)
        store.add_message(project_id, cid, "assistant", ans)
        return {"answer": ans, "conversation_id": cid}

    try:
        result = process_chat(question=req.message, project_id=project_id, document_ids=doc_ids, conversation_id=cid)
        result["conversation_id"] = cid
        return result
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{project_id}/conversations/{conv_id}/messages/{msg_id}")
def delete_message(project_id: str, conv_id: str, msg_id: str, current_user: User = Depends(get_current_user)):
    proj = store.get_project(project_id, user_id=current_user.uid)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if not store.delete_message(project_id, conv_id, msg_id):
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted"}
