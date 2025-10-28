import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_backend_connection():
    """Test if AI worker can connect to backend"""
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:3000')
    worker_secret = os.getenv('AI_WORKER_SECRET')
    
    print(f"🧪 Testing connection to: {backend_url}")
    print(f"🔑 Using secret: {'***' + worker_secret[-4:] if worker_secret else 'MISSING'}")
    
    # Test 1: Basic health check
    try:
        response = requests.get(f"{backend_url}/health", timeout=10)
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Progress update endpoint
    try:
        test_job_id = "test-connection-001"
        progress_data = {
            "progress": 50,
            "status": "processing", 
            "message": "Connection test"
        }
        
        response = requests.patch(
            f"{backend_url}/api/mcq/jobs/{test_job_id}/progress",
            json=progress_data,
            headers={"Authorization": f"Bearer {worker_secret}"},
            timeout=10
        )
        
        print(f"📊 Progress endpoint: {response.status_code}")
        if response.status_code != 200:
            print(f"   Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Progress endpoint failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_backend_connection()
    if success:
        print("\n🎉 Backend connection test passed!")
    else:
        print("\n💥 Backend connection test failed!")