import logging
import torch
import time
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, List, Any, Optional
import json
import os
from app.core.config import settings

logger = logging.getLogger("singleton")

DEVICE = torch.device("cpu")

class GlobalState:
    def __init__(self):
        # QA model (xlm-roberta)
        self.tokenizer = None
        self.model = None
        self._ready = False

        # TF-IDF retrieval state (per document)
        self.document_chunks: Dict[str, List[str]] = {}
        self.document_vectorizers: Dict[str, TfidfVectorizer] = {}
        self.document_tfidf_matrices: Dict[str, Any] = {}

        # Sentence-Transformers retrieval cache (per document)
        # Key: document_id → numpy ndarray of shape (n_chunks, embedding_dim)
        self._st_embeddings: Dict[str, Any] = {}
        # The SentenceTransformer model instance (loaded lazily in retriever)
        self._st_model = None

        self._load_from_storage()

    # ── Persistence ────────────────────────────────────────────────────────────

    def _load_from_storage(self):
        """
        Chunks are now loaded on-demand from Firestore in the retriever 
        to ensure they are always up-to-date and consistent across instances.
        We no longer load everything on startup.
        """
        pass

    def save_to_storage(self, document_id: str, chunks: List[str]):
        """Persist chunks to Firestore."""
        import app.services.storage.storage_service as store
        store.save_chunks(document_id, chunks)

    # ── ST Embedding Cache ─────────────────────────────────────────────────────

    def get_st_embeddings(self, document_id: str) -> Optional[Any]:
        """Return cached ST embeddings for a document, or None if not yet computed."""
        return self._st_embeddings.get(document_id)

    def set_st_embeddings(self, document_id: str, embeddings: Any):
        """Cache ST embeddings for a document."""
        self._st_embeddings[document_id] = embeddings

    def invalidate_document(self, document_id: str):
        """
        Call this when re-uploading a document to clear all stale cached state
        (chunks, TF-IDF index, ST embeddings).
        """
        self.document_chunks.pop(document_id, None)
        self.document_vectorizers.pop(document_id, None)
        self.document_tfidf_matrices.pop(document_id, None)
        self._st_embeddings.pop(document_id, None)

    # ── QA Model ──────────────────────────────────────────────────────────────

    def load_qa_model(self):
        """Load the extractive QA model into RAM (once). Thread-safe via _ready flag."""
        if self._ready:
            return
        t0 = time.time()
        self.tokenizer = AutoTokenizer.from_pretrained(settings.MODEL_NAME)
        self.model = AutoModelForQuestionAnswering.from_pretrained(settings.MODEL_NAME)
        self.model.to(DEVICE)
        self.model.eval()
        self._ready = True


global_state = GlobalState()
