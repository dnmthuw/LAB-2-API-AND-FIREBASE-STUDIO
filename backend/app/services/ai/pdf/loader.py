import os
import pypdf
import logging
from typing import Optional

logger = logging.getLogger("pdf_loader")

def extract_text_from_pdf(file_path: str) -> str:
    """Extract full text from a PDF file using pypdf."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at {file_path}")
    
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise ValueError(f"Could not read PDF: {e}")
    
    return text
