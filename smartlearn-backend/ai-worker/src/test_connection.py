import os
import redis
from bullmq import Queue
from dotenv import load_dotenv

load_dotenv()

def test_redis_connection():
    """Test Redis connection"""
    try:
        redis_client = redis.from_url(os.getenv('REDIS_URL'))
        redis_client.ping()
        print("✅ Redis connection successful")
        return True
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def test_bullmq_queue():
    """Test BullMQ queue connection"""
    try:
        queue = Queue("mcq-generation", {"connection": os.getenv('REDIS_URL')})
        print("✅ BullMQ queue connection successful")
        return True
    except Exception as e:
        print(f"❌ BullMQ queue connection failed: {e}")
        return False

def test_backend_connection():
    """Test backend API connection"""
    import requests
    try:
        response = requests.get(f"{os.getenv('BACKEND_URL')}/health", timeout=10)
        if response.status_code == 200:
            print("✅ Backend connection successful")
            return True
        else:
            print(f"❌ Backend connection failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing AI Worker Connections...")
    test_redis_connection()
    test_bullmq_queue()
    test_backend_connection()