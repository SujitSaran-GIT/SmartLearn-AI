import os
import sys
from dotenv import load_dotenv

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

load_dotenv()

def test_manual_processing():
    """Test the AI worker processing manually"""
    from worker import AIWorker
    
    # Create a test job
    test_job = {
        'jobId': 'manual-test-001',
        'fileUrl': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'questionCount': 3,
        'difficulty': 'easy'
    }
    
    worker = AIWorker()
    print("🧪 Testing manual job processing...")
    
    try:
        result = worker.process_job_data(test_job)
        print(f"✅ Manual test successful! Generated {len(result['mcqs'])} MCQs")
        for i, mcq in enumerate(result['mcqs']):
            print(f"  {i+1}. {mcq['question']}")
    except Exception as e:
        print(f"❌ Manual test failed: {e}")

if __name__ == "__main__":
    test_manual_processing()