"""
chat_service.py
==================
Business logic layer for the chat/QA pipeline.
"""

import logging
import re
import unicodedata
from typing import Optional, List, Dict

from app.core.config import settings
from app.services.ai.qa.retriever import retrieve_top_k_chunks
from app.services.ai.qa.model import extract_answer
import app.services.storage.storage_service as store

logger = logging.getLogger("chat_service")

NOT_FOUND_MSG = "Tôi không tìm thấy câu trả lời trong tài liệu."

def normalize_text(text: str) -> str:
    if not text: return ""
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'[^\w\s\.\!\?\-\,\:\;\(\)\'\"\/_]', '', text, flags=re.UNICODE)
    return " ".join(text.split()).lower()

def _expand_to_full_sentence(answer: str, context: str) -> str:
    if not answer or not context: return answer
    norm_answer = normalize_text(answer)
    sentences = [s.strip() for s in re.split(r"(?<=[.!?\n])\s+|\n+", context) if s.strip()]
    for sentence in sentences:
        if norm_answer in normalize_text(sentence): return sentence
    words = norm_answer.split()
    if len(words) >= 2:
        prefix = " ".join(words[:2])
        for sentence in sentences:
            if prefix in normalize_text(sentence): return sentence
    return answer

def _truncate_answer(answer: str, max_chars: int = settings.QA_MAX_ANSWER_CHARS) -> str:
    if len(answer) <= max_chars: return answer
    truncated = answer[:max_chars]
    last_period = max(truncated.rfind("."), truncated.rfind("!"), truncated.rfind("?"))
    if last_period > max_chars // 2: return truncated[: last_period + 1]
    return truncated.rstrip() + "…"

def process_chat(question: str, project_id: str, document_ids: List[str], conversation_id: Optional[str] = None) -> Dict:
    normalized_question = normalize_text(question)
    if conversation_id: store.add_message(project_id, conversation_id, "user", question)
    
    try:
        all_chunks_scored: List[tuple] = []
        for doc_id in document_ids:
            try:
                chunks = retrieve_top_k_chunks(normalized_question, doc_id, top_k=settings.QA_TOP_K)
                all_chunks_scored.extend(chunks)
            except ValueError as e:
                logger.warning(f"Retriever skip doc '{doc_id}': {e}")

        if not all_chunks_scored:
            ans, score, context = NOT_FOUND_MSG, 0.0, ""
        else:
            all_chunks_scored.sort(key=lambda x: x[1], reverse=True)
            top_chunks = all_chunks_scored[: settings.QA_TOP_K]
            context = "\n\n".join([c[0] for c in top_chunks])

            best_answer, best_score, best_final_score, best_source = "", 0.0, 0.0, ""
            for chunk_text, sim in top_chunks:
                if sim < 0.05: continue
                result = extract_answer(normalized_question, chunk_text)
                ans_cand, score_cand = result["answer"], result["score"]
                final_score = (0.3 * sim) + (0.7 * score_cand)
                
                is_valid = bool(ans_cand and len(ans_cand.strip()) > 5 and score_cand >= settings.QA_SCORE_THRESHOLD and normalize_text(ans_cand) in normalize_text(chunk_text))
                if is_valid and final_score > best_final_score:
                    best_final_score, best_score, best_answer, best_source = final_score, score_cand, ans_cand, chunk_text
            
            if not best_answer: ans, score = NOT_FOUND_MSG, 0.0
            else:
                ans = _expand_to_full_sentence(best_answer, best_source)
                ans = _truncate_answer(ans)
                score = best_score

        response = {"answer": ans, "confidence": round(score, 4), "context": context[:300] if context else "", "source": "extractive_qa"}
        if conversation_id: store.add_message(project_id, conversation_id, "assistant", ans)
        return response
    except Exception as e:
        logger.error(f"Error in process_chat: {e}", exc_info=True)
        if conversation_id: store.add_message(project_id, conversation_id, "assistant", f"Lỗi: {str(e)}")
        raise
