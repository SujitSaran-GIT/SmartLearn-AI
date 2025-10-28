import os
import json
import time
from dotenv import load_dotenv
from redis import Redis
from rq import Worker, Queue, Connection
from extractors.pdf_extractor import extract_text_from_pdf
from generators.mcq_generator import generate_mcq_questions
from llm.groq_client import GroqClient
from utils.validation import validate_mcq_output
import logging

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Redis connection
redis_conn = Redis.from_url(
    os.getenv('REDIS_URL'),
    decode_responses=True
)

def process_mcq_job(job_data):
    '''Process MCQ generation job'''
    try:
        job_id = job_data['jobId']
        file_id = job_data['fileId']
        user_id = job_data['userId']
        question_count = job_data['questionCount']
        difficulty = job_data.get('difficulty', 'medium')
        
        logger.info(f"Processing job {job_id} for file {file_id}")
        
        # Update job status to processing
        update_job_status(job_id, 'processing', 10)
        
        # 1. Download file from Supabase
        file_path = download_file_from_storage(file_id, user_id)
        update_job_status(job_id, 'processing', 20)
        
        # 2. Extract text from PDF
        logger.info(f"Extracting text from {file_path}")
        extracted_text = extract_text_from_pdf(file_path)
        update_job_status(job_id, 'processing', 40)
        
        # 3. Generate MCQ questions using LLM
        logger.info(f"Generating {question_count} questions")
        llm_client = GroqClient()
        questions = generate_mcq_questions(
            llm_client, 
            extracted_text, 
            question_count,
            difficulty
        )
        update_job_status(job_id, 'processing', 70)
        
        # 4. Validate output
        validated_questions = validate_mcq_output(questions, question_count)
        
        # 5. Store questions in database
        quiz_id = store_quiz_in_database(
            job_id,
            file_id,
            user_id,
            validated_questions,
            file_path
        )
        update_job_status(job_id, 'processing', 90)
        
        # 6. Mark job as completed
        complete_job(job_id, quiz_id)
        
        logger.info(f"Job {job_id} completed successfully. Quiz ID: {quiz_id}")
        
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return {'status': 'success', 'quizId': quiz_id}
        
    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}")
        fail_job(job_id, str(e))
        raise

def update_job_status(job_id, status, progress):
    '''Update job status via API'''
    import requests
    api_url = os.getenv('BACKEND_API_URL', 'http://localhost:3000')
    try:
        requests.patch(
            f"{api_url}/api/internal/jobs/{job_id}",
            json={'status': status, 'progress': progress},
            headers={'X-Internal-Secret': os.getenv('INTERNAL_SECRET')}
        )
    except Exception as e:
        logger.error(f"Failed to update job status: {e}")

def download_file_from_storage(file_id, user_id):
    '''Download file from Supabase Storage'''
    from supabase import create_client
    
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    # Get file metadata from database
    import requests
    api_url = os.getenv('BACKEND_API_URL', 'http://localhost:3000')
    response = requests.get(
        f"{api_url}/api/internal/files/{file_id}",
        headers={'X-Internal-Secret': os.getenv('INTERNAL_SECRET')}
    )
    file_data = response.json()
    
    # Download from Supabase
    storage_key = file_data['storageKey']
    file_bytes = supabase.storage.from_('pdf-uploads').download(storage_key)
    
    # Save temporarily
    temp_path = f"/tmp/{file_id}.pdf"
    with open(temp_path, 'wb') as f:
        f.write(file_bytes)
    
    return temp_path

def store_quiz_in_database(job_id, file_id, user_id, questions, filename):
    '''Store quiz and questions in database via API'''
    import requests
    import uuid
    
    api_url = os.getenv('BACKEND_API_URL', 'http://localhost:3000')
    
    quiz_data = {
        'jobId': job_id,
        'fileId': file_id,
        'userId': user_id,
        'title': f"Quiz from {filename}",
        'questions': questions
    }
    
    response = requests.post(
        f"{api_url}/api/internal/quizzes",
        json=quiz_data,
        headers={'X-Internal-Secret': os.getenv('INTERNAL_SECRET')}
    )
    
    return response.json()['quizId']

def complete_job(job_id, quiz_id):
    '''Mark job as completed'''
    import requests
    api_url = os.getenv('BACKEND_API_URL', 'http://localhost:3000')
    
    requests.patch(
        f"{api_url}/api/internal/jobs/{job_id}",
        json={
            'status': 'completed',
            'progress': 100,
            'quizId': quiz_id,
            'completedAt': time.time()
        },
        headers={'X-Internal-Secret': os.getenv('INTERNAL_SECRET')}
    )

def fail_job(job_id, error_message):
    '''Mark job as failed'''
    import requests
    api_url = os.getenv('BACKEND_API_URL', 'http://localhost:3000')
    
    requests.patch(
        f"{api_url}/api/internal/jobs/{job_id}",
        json={
            'status': 'failed',
            'error': error_message
        },
        headers={'X-Internal-Secret': os.getenv('INTERNAL_SECRET')}
    )

if __name__ == '__main__':
    with Connection(redis_conn):
        worker = Worker(['mcq-generation'], connection=redis_conn)
        logger.info("Worker started. Listening for jobs...")
        worker.work()