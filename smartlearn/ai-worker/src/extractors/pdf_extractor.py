import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: str) -> str:
    '''Extract text from PDF file'''
    try:
        doc = fitz.open(pdf_path)
        text = ""
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text()
            text += "\n\n---PAGE BREAK---\n\n"
        
        doc.close()
        
        # Clean up text
        text = text.strip()
        
        if not text:
            raise ValueError("No text extracted from PDF")
        
        logger.info(f"Extracted {len(text)} characters from {len(doc)} pages")
        return text
        
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def chunk_text(text: str, max_chunk_size: int = 4000) -> list:
    '''Split text into chunks for LLM processing'''
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    
    for word in words:
        word_size = len(word) + 1
        if current_size + word_size > max_chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_size = word_size
        else:
            current_chunk.append(word)
            current_size += word_size
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks