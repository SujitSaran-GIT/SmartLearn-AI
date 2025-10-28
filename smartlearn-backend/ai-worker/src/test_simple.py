import os
import sys
from dotenv import load_dotenv

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

load_dotenv()

def test_basic_imports():
    """Test if basic imports work"""
    try:
        from llm.groq_client import GroqClient
        from llm.fallback_client import FallbackClient
        print("✅ Basic imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_groq_api():
    """Test Groq API connection"""
    try:
        from llm.groq_client import GroqClient
        groq = GroqClient(os.getenv('GROQ_API_KEY', 'test'))
        print("✅ Groq client initialized")
        return True
    except Exception as e:
        print(f"❌ Groq client error: {e}")
        return False

def test_fallback():
    """Test fallback client"""
    try:
        from llm.fallback_client import FallbackClient
        fallback = FallbackClient()
        mcqs = fallback.generate_mcqs("This is a test text about artificial intelligence.", 2)
        print(f"✅ Fallback client generated {len(mcqs)} MCQs")
        return True
    except Exception as e:
        print(f"❌ Fallback client error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing AI Worker Setup...")
    test_basic_imports()
    test_groq_api()
    test_fallback()
    print("🎉 Basic setup test completed!")