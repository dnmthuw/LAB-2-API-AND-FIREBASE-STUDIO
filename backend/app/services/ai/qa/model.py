import torch
import logging
from typing import Dict
from app.dependencies.singleton import global_state, DEVICE

logger = logging.getLogger("qa_model")

def extract_answer(question: str, context: str) -> Dict:
    """
    Extract answer from context given a question using the loaded model.
    Returns: {"answer": str, "score": float, "start": int, "end": int}
    """
    if not global_state.tokenizer or not global_state.model:
        raise RuntimeError("QA Model not loaded. Call global_state.load_qa_model() first.")

    inputs = global_state.tokenizer(question, context, return_tensors="pt", truncation=True, max_length=512)
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = global_state.model(**inputs)

    start_logits = outputs.start_logits
    end_logits = outputs.end_logits

    # Find the tokens with the highest `start` and `end` scores
    start_idx = torch.argmax(start_logits)
    end_idx = torch.argmax(end_logits)

    # Get the score (confidence)
    # Simple heuristic: sum of logits for start/end
    score = float(torch.softmax(start_logits, dim=-1)[0, start_idx] * 
                  torch.softmax(end_logits, dim=-1)[0, end_idx])

    # Convert tokens to string answer
    # If end < start, it means no answer found or model is confused
    if end_idx < start_idx:
        return {"answer": "", "score": 0.0}

    all_tokens = global_state.tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    answer_tokens = all_tokens[start_idx : end_idx + 1]
    
    # Filter out [CLS], [SEP] or special tokens if they leaked into the span
    answer = global_state.tokenizer.convert_tokens_to_string(answer_tokens)
    
    # Post-clean: XLM-RoBERTa can sometimes return subword tokens correctly 
    # but with leading spaces or artifacts.
    answer = answer.strip()
    
    # Filter out common hallucination patterns or empty answers
    if answer == "<s>" or answer == "</s>" or not answer:
        return {"answer": "", "score": 0.0}

    return {
        "answer": answer,
        "score": score,
    }
