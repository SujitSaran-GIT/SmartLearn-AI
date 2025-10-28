import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
    
    # Supabase
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    # LLM
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    DEFAULT_MODEL = os.getenv('DEFAULT_MODEL', 'llama3-70b-8192')
    
    # Worker
    CONCURRENT_JOBS = int(os.getenv('CONCURRENT_JOBS', 2))
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))
    JOB_TIMEOUT = int(os.getenv('JOB_TIMEOUT', 300))
    
    # Backend API
    BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:3000')
    INTERNAL_SECRET = os.getenv('INTERNAL_SECRET', 'your-internal-secret')
    
    @staticmethod
    def validate():
        required = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'REDIS_URL'
        ]
        
        missing = [key for key in required if not os.getenv(key)]
        
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        if not (os.getenv('GROQ_API_KEY') or os.getenv('GEMINI_API_KEY')):
            raise ValueError("At least one LLM API key (GROQ or GEMINI) is required")

config = Config()