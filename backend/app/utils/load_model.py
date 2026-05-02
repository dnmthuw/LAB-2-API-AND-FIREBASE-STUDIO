import logging
import torch
import time
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from sentence_transformers import SentenceTransformer
from typing import Dict, List, Any

logger = logging.getLogger("load_model")

MODEL_NAME = "deepset/xlm-roberta-base-squad2"
EMBEDDING_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
DEVICE = torch.device("cpu")
MAX_SEQ_LENGTH = 512

class GlobalState:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.embedding_model = None
        self._ready = False
        
        # In-memory storage for chunks and embeddings
        # In production, this should be in a real database/FAISS
        self.document_chunks: Dict[str, List[str]] = {}
        self.document_embeddings: Dict[str, Any] = {}

    def load_qa_model(self):
        if self._ready:
            return
        t0 = time.time()
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForQuestionAnswering.from_pretrained(MODEL_NAME)
        self.model.to(DEVICE)
        self.model.eval()
        
        t1 = time.time()
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME, device=str(DEVICE))
        
        self._ready = True

global_state = GlobalState()
