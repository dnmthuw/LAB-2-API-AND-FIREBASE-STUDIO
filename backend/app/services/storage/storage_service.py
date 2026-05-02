"""
storage_service.py
==================
Firestore-based storage service.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import uuid

from app.core.config import settings
from app.core.firebase_config import get_firestore_client
from firebase_admin import firestore

logger = logging.getLogger("storage_service")
db = get_firestore_client()

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

# ── Project CRUD ─────────────────────────────────────────────────────────────

def get_all_projects(user_id: str = None) -> List[dict]:
    try:
        if user_id:
            docs = db.collection("projects").where("user_id", "==", user_id).stream()
        else:
            docs = db.collection("projects").stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"Firestore error: {e}")
        return []

def get_project(project_id: str, user_id: str = None) -> Optional[dict]:
    doc = db.collection("projects").document(project_id).get()
    if doc.exists:
        proj = doc.to_dict()
        if user_id and proj.get("user_id") != user_id:
            return None
        if "sources" not in proj: proj["sources"] = []
        if "conversations" not in proj: proj["conversations"] = {}
        return proj
    return None

def create_project(name: str, description: str = "", user_id: str = None) -> dict:
    # Check for duplicate names
    query = db.collection("projects").where("name", "==", name)
    if user_id:
        query = query.where("user_id", "==", user_id)
    existing = query.limit(1).get()
    if existing:
        raise ValueError(f"Project with name '{name}' already exists.")

    pid = _generate_id("PRJ")
    project = {
        "id": pid, "name": name, "description": description,
        "created_at": _now_iso(), "sources": [], "conversations": {},
    }
    if user_id:
        project["user_id"] = user_id
    db.collection("projects").document(pid).set(project)
    return project

def update_project(project_id: str, name: Optional[str] = None, description: Optional[str] = None, user_id: str = None) -> Optional[dict]:
    proj_ref = db.collection("projects").document(project_id)
    doc = proj_ref.get()
    if not doc.exists or (user_id and doc.to_dict().get("user_id") != user_id):
        return None
        
    updates = {}
    if name is not None:
        query = db.collection("projects").where("name", "==", name)
        if user_id:
            query = query.where("user_id", "==", user_id)
        existing = query.limit(1).get()
        if existing and existing[0].id != project_id:
            raise ValueError(f"Project with name '{name}' already exists.")
        updates["name"] = name
    if description is not None:
        updates["description"] = description
    if updates:
        proj_ref.update(updates)
    return get_project(project_id, user_id)

def delete_project(project_id: str, user_id: str = None) -> bool:
    try:
        proj_ref = db.collection("projects").document(project_id)
        doc = proj_ref.get()
        if not doc.exists or (user_id and doc.to_dict().get("user_id") != user_id):
            return False
        proj_ref.delete()
        return True
    except Exception: return False

# ── Sources ──────────────────────────────────────────────────────────────────

def add_source_to_project(project_id: str, name: str, source_type: str, size_bytes: int = 0, content: str = "", document_id: str = "") -> Optional[dict]:
    source_meta = {
        "id": _generate_id("SRC"), "name": name, "type": source_type,
        "size_bytes": size_bytes, "content": content, "document_id": document_id,
        "uploaded_at": _now_iso(),
    }
    db.collection("projects").document(project_id).update({
        "sources": firestore.ArrayUnion([source_meta])
    })
    return source_meta

def remove_source_from_project(project_id: str, source_id: str) -> bool:
    proj = get_project(project_id)
    if not proj: return False
    target = next((s for s in proj.get("sources", []) if s.get("id") == source_id), None)
    if not target: return False
    
    # Delete chunks from Firestore if document_id exists
    doc_id = target.get("document_id")
    if doc_id:
        delete_chunks(doc_id)
        
    db.collection("projects").document(project_id).update({
        "sources": firestore.ArrayRemove([target])
    })
    return True

# ── Conversations ─────────────────────────────────────────────────────────────

def get_all_conversations(project_id: str) -> List[dict]:
    proj = get_project(project_id)
    return list(proj.get("conversations", {}).values()) if proj else []

def get_conversation(project_id: str, conv_id: str) -> Optional[dict]:
    proj = get_project(project_id)
    if not proj: return None
    conv_meta = proj.get("conversations", {}).get(conv_id)
    if not conv_meta: return None
    msgs_ref = db.collection("projects").document(project_id)\
                 .collection("conversations").document(conv_id)\
                 .collection("messages").order_by("timestamp")
    conv_meta["messages"] = [doc.to_dict() for doc in msgs_ref.stream()]
    return conv_meta

def create_conversation(project_id: str, title: str = "New Conversation") -> Optional[dict]:
    cid = _generate_id("CONV")
    now = _now_iso()
    conv = {"id": cid, "title": title, "created_at": now, "updated_at": now}
    db.collection("projects").document(project_id).update({f"conversations.{cid}": conv})
    db.collection("projects").document(project_id).collection("conversations").document(cid).set({"active": True})
    return conv

def delete_conversation(project_id: str, conv_id: str) -> bool:
    try:
        db.collection("projects").document(project_id).update({f"conversations.{conv_id}": firestore.DELETE_FIELD})
        return True
    except Exception: return False

def update_conversation_title(project_id: str, conv_id: str, title: str) -> Optional[dict]:
    now = _now_iso()
    db.collection("projects").document(project_id).update({
        f"conversations.{conv_id}.title": title, f"conversations.{conv_id}.updated_at": now
    })
    return get_conversation(project_id, conv_id)

# ── Messages ──────────────────────────────────────────────────────────────────

def add_message(project_id: str, conv_id: str, role: str, content: str) -> Optional[dict]:
    mid = _generate_id("MSG")
    now = _now_iso()
    msg = {"id": mid, "role": role, "content": content, "timestamp": now}
    db.collection("projects").document(project_id).collection("conversations").document(conv_id).collection("messages").document(mid).set(msg)
    db.collection("projects").document(project_id).update({f"conversations.{conv_id}.updated_at": now})
    return msg

def delete_message(project_id: str, conv_id: str, msg_id: str) -> bool:
    try:
        db.collection("projects").document(project_id).collection("conversations").document(conv_id).collection("messages").document(msg_id).delete()
        return True
    except Exception: return False

# ── Chunks (Firestore-backed) ──────────────────────────────────────────────────

def save_chunks(document_id: str, chunks: List[str]):
    """Store chunks in a dedicated Firestore collection."""
    try:
        db.collection("chunks").document(document_id).set({
            "chunks": chunks,
            "updated_at": _now_iso()
        })
    except Exception as e:
        logger.error(f"Error saving chunks to Firestore: {e}")

def get_chunks(document_id: str) -> List[str]:
    """Retrieve chunks from Firestore."""
    try:
        doc = db.collection("chunks").document(document_id).get()
        if doc.exists:
            return doc.to_dict().get("chunks", [])
    except Exception as e:
        logger.error(f"Error loading chunks from Firestore: {e}")
    return []

def delete_chunks(document_id: str):
    """Delete chunks from Firestore when a source is removed."""
    try:
        db.collection("chunks").document(document_id).delete()
    except Exception as e:
        logger.error(f"Error deleting chunks from Firestore: {e}")

def run_global_cleanup(): pass
