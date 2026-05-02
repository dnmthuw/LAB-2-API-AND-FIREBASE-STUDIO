import logging
from typing import List
from app.core.config import settings
from app.dependencies.singleton import global_state

logger = logging.getLogger("pdf_chunking")

def chunk_text_and_store(text: str, document_id: str) -> int:
    """
    Split text into character-based chunks with specific overlap and word-boundary preservation.
    Then store them in global_state and persist to disk.
    """
    if not text:
        return 0
    
    CHUNK_SIZE = settings.CHUNK_SIZE
    CHUNK_OVERLAP = settings.CHUNK_OVERLAP
    
    chunks = []
    text_len = len(text)
    start = 0
    
    while start < text_len:
        end = start + CHUNK_SIZE
        
        # If not the end of the text, try to find a space near the limit to avoid cutting words
        if end < text_len:
            # Look back up to 20 chars for a space
            search_start = max(start, end - 20)
            space_index = text.rfind(' ', search_start, end)
            if space_index != -1:
                end = space_index
        
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        
        # Calculate next start with overlap
        if end >= text_len:
            break
            
        start = end - CHUNK_OVERLAP
        # Safety: ensure start always advances
        if start <= (end - CHUNK_SIZE):
            start = end
            
    # Save to global state
    global_state.document_chunks[document_id] = chunks
    
    # ST embeddings are recomputed lazily or on demand in the retriever.
    # To keep this fast, we just invalidate the ST cache.
    global_state.invalidate_document(document_id)
    
    # Save to disk
    global_state.save_to_storage(document_id, chunks)
    
    logger.info(f"Chunked document '{document_id}' into {len(chunks)} chunks.")
    return len(chunks)
