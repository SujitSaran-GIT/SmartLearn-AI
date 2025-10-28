import os
import json
import asyncio
import logging
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
import requests
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('ai-worker.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

class AIWorker:
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL')
        self.backend_url = os.getenv('BACKEND_URL', 'http://localhost:3000')
        self.worker_secret = os.getenv('AI_WORKER_SECRET')
        
        if not all([self.redis_url, self.backend_url, self.worker_secret]):
            logger.error("❌ Missing required environment variables")
            raise ValueError("Missing required environment variables")
        
        # Initialize LLM client
        self.llm_client = self.setup_llm_client()
        logger.info("✅ AI Worker initialized successfully")
    
    def setup_llm_client(self):
        """Setup LLM client with fallback options"""
        try:
            groq_api_key = os.getenv('GROQ_API_KEY')
            if groq_api_key and groq_api_key != 'your-groq-api-key':
                from llm.groq_client import GroqClient
                logger.info("🤖 Using Groq LLM provider")
                return GroqClient(groq_api_key)
            
            # Fallback to local generator
            from llm.fallback_client import FallbackClient
            logger.info("🔄 Using fallback MCQ generator")
            return FallbackClient()
            
        except ImportError as e:
            logger.error(f"❌ Failed to setup LLM client: {e}")
            from llm.fallback_client import FallbackClient
            return FallbackClient()
    
    def download_file(self, file_url: str) -> Optional[bytes]:
        """Download file from URL"""
        try:
            logger.info(f"📥 Downloading file: {file_url[:100]}...")
            response = requests.get(file_url, timeout=30)
            response.raise_for_status()
            
            file_size = len(response.content)
            logger.info(f"✅ File downloaded: {file_size} bytes")
            return response.content
            
        except Exception as e:
            logger.error(f"❌ Failed to download file: {e}")
            return None
    
    def extract_text_from_pdf(self, pdf_content: bytes) -> Optional[str]:
        """Extract text from PDF content"""
        try:
            import fitz  # PyMuPDF
            
            logger.info("📄 Extracting text from PDF...")
            doc = fitz.open(stream=pdf_content, filetype="pdf")
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
            
            doc.close()
            
            text = text.strip()
            if not text:
                logger.warning("⚠️ No text extracted from PDF")
                return None
            
            logger.info(f"✅ Extracted {len(text)} characters from PDF")
            return text
            
        except Exception as e:
            logger.error(f"❌ PDF text extraction failed: {e}")
            return None
    
    def preprocess_text(self, text: str) -> str:
        """Optimize text for processing"""
        # Clean and truncate text
        text = ' '.join(text.split())
        
        if len(text) > 2000:
            # Keep important parts
            beginning = text[:1000]
            end = text[-1000:]
            text = beginning + "\n\n...\n\n" + end
            logger.info(f"📝 Text truncated to {len(text)} characters")
            
        return text
    
    def update_job_progress(self, job_id: str, progress: int, status: str, message: str = None):
        """Update job progress via backend API"""
        try:
            data = {"progress": progress, "status": status}
            if message:
                data["message"] = message
            
            response = requests.patch(
                f"{self.backend_url}/api/mcq/jobs/{job_id}/progress",
                json=data,
                headers={
                    "Authorization": f"Bearer {self.worker_secret}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"📊 Progress: {progress}% - {message}")
            else:
                logger.warning(f"⚠️ Progress update failed: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            logger.error(f"❌ Cannot connect to backend at {self.backend_url}")
        except Exception as e:
            logger.error(f"❌ Progress update error: {e}")
    
    def send_job_result(self, job_id: str, result: Dict[str, Any], endpoint: str):
        """Send job result to backend"""
        try:
            response = requests.post(
                f"{self.backend_url}/api/mcq/jobs/{job_id}/{endpoint}",
                json=result,
                headers={
                    "Authorization": f"Bearer {self.worker_secret}",
                    "Content-Type": "application/json"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Result sent to backend: {endpoint}")
                return True
            else:
                logger.error(f"❌ Failed to send result: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending result: {e}")
            return False
    
    def process_job(self, job_data: Dict[str, Any]):
        """Process a single MCQ generation job"""
        job_id = job_data.get('jobId')
        file_url = job_data.get('fileUrl')
        question_count = job_data.get('questionCount', 5)
        difficulty = job_data.get('difficulty', 'medium')
        
        logger.info(f"🎯 Starting job: {job_id}")
        start_time = time.time()
        
        try:
            # Step 1: Download file
            self.update_job_progress(job_id, 10, "processing", "Downloading file")
            pdf_content = self.download_file(file_url)
            if not pdf_content:
                raise Exception("File download failed")
            
            # Step 2: Extract text
            self.update_job_progress(job_id, 30, "processing", "Extracting text from PDF")
            text_content = self.extract_text_from_pdf(pdf_content)
            if not text_content:
                raise Exception("Text extraction failed")
            
            # Step 3: Generate MCQs
            self.update_job_progress(job_id, 60, "processing", "Generating questions with AI")
            processed_text = self.preprocess_text(text_content)
            mcqs = self.llm_client.generate_mcqs(processed_text, question_count, difficulty)
            
            if not mcqs:
                raise Exception("MCQ generation failed")
            
            # Step 4: Send results
            self.update_job_progress(job_id, 90, "processing", "Saving results")
            result = {
                'job_id': job_id,
                'status': 'completed',
                'mcqs': mcqs,
                'total_questions': len(mcqs),
                'text_length': len(text_content),
                'processed_at': datetime.now().isoformat()
            }
            
            if self.send_job_result(job_id, result, "complete"):
                self.update_job_progress(job_id, 100, "completed", "Job completed successfully")
                processing_time = time.time() - start_time
                logger.info(f"✅ Job {job_id} completed in {processing_time:.1f}s with {len(mcqs)} MCQs")
            else:
                raise Exception("Failed to send results to backend")
            
        except Exception as e:
            error_msg = f"Job failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            
            # Notify backend about failure
            error_result = {
                'job_id': job_id,
                'status': 'failed',
                'error': error_msg,
                'failed_at': datetime.now().isoformat()
            }
            self.send_job_result(job_id, error_result, "fail")
            self.update_job_progress(job_id, 0, "failed", error_msg)
    
    def start_worker(self):
        """Start the worker with available method"""
        try:
            # Try BullMQ first
            from bullmq import Worker
            logger.info("🚀 Starting BullMQ Worker...")
            
            worker = Worker(
                "mcq-generation",
                lambda job: self.process_job(job.data),
                {"connection": self.redis_url, "concurrency": 2}
            )
            
            logger.info("✅ BullMQ Worker started successfully")
            asyncio.get_event_loop().run_forever()
            
        except ImportError:
            # Fallback to Redis pub/sub
            logger.info("🔄 Starting Redis Pub/Sub Worker...")
            import redis
            
            redis_client = redis.from_url(self.redis_url, decode_responses=True)
            pubsub = redis_client.pubsub()
            pubsub.subscribe('mcq_jobs')
            
            logger.info("✅ Listening for jobs on 'mcq_jobs' channel")
            
            try:
                for message in pubsub.listen():
                    if message['type'] == 'message':
                        try:
                            job_data = json.loads(message['data'])
                            # Process in background thread to avoid blocking
                            import threading
                            thread = threading.Thread(target=self.process_job, args=(job_data,))
                            thread.daemon = True
                            thread.start()
                        except Exception as e:
                            logger.error(f"❌ Error processing message: {e}")
            except KeyboardInterrupt:
                logger.info("🛑 Worker stopped by user")
            except Exception as e:
                logger.error(f"💥 Worker crashed: {e}")
            finally:
                pubsub.close()

if __name__ == "__main__":
    try:
        worker = AIWorker()
        worker.start_worker()
    except Exception as e:
        logger.error(f"💥 Failed to start worker: {e}")