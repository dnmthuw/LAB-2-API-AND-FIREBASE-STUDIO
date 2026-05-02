import logging
import numpy as np
from typing import List, Tuple, Any
from sentence_transformers import SentenceTransformer, util
from app.dependencies.singleton import global_state

logger = logging.getLogger("retriever")

def _get_st_model() -> SentenceTransformer:
    """Lazily load the SentenceTransformer model."""
    if global_state._st_model is None:
        from app.core.config import settings
        logger.info(f"Loading SentenceTransformer: {settings.ST_MODEL_NAME}")
        global_state._st_model = SentenceTransformer(settings.ST_MODEL_NAME)
    return global_state._st_model

def retrieve_top_k_chunks(query: str, document_id: str, top_k: int = 3) -> List[Tuple[str, float]]:
    """
    Retrieve top-k relevant chunks for a query from a specific document.
    Uses Sentence-Transformers (Cosine Similarity) with lazy embedding computation.
    """
    chunks = global_state.document_chunks.get(document_id)
    if not chunks:
        # Try loading from Firestore
        import app.services.storage.storage_service as store
        chunks = store.get_chunks(document_id)
        if chunks:
            global_state.document_chunks[document_id] = chunks
        else:
            logger.warning(f"No chunks found for document '{document_id}'")
            return []

    model = _get_st_model()
    
    # 1. Get or compute embeddings for chunks
    chunk_embeddings = global_state.get_st_embeddings(document_id)
    if chunk_embeddings is None:
        logger.info(f"Computing ST embeddings for document '{document_id}' ({len(chunks)} chunks)...")
        chunk_embeddings = model.encode(chunks, convert_to_tensor=True)
        global_state.set_st_embeddings(document_id, chunk_embeddings)
    
    # 2. Compute query embedding
    query_embedding = model.encode(query, convert_to_tensor=True)
    
    # 3. Compute cosine similarity
    cos_scores = util.cos_sim(query_embedding, chunk_embeddings)[0]
    
    # 4. Get top results
    top_results = np.argpartition(-cos_scores.cpu(), range(min(top_k, len(chunks))))[:top_k]
    
    results = []
    for idx in top_results:
        idx = int(idx)
        score = float(cos_scores[idx])
        results.append((chunks[idx], score))
    
    # Sort results by score descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    return results
