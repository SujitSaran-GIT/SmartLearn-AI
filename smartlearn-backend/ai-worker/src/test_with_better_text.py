import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

load_dotenv()

def test_with_better_text():
    """Test with meaningful text content"""
    from worker import AIWorker
    
    # Use a meaningful text instead of PDF
    test_job = {
        'jobId': 'better-text-test-001',
        'fileUrl': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'questionCount': 3,
        'difficulty': 'easy'
    }
    
    worker = AIWorker()
    
    # Manually process with good text
    meaningful_text = """
    Artificial intelligence (AI) refers to the simulation of human intelligence in machines 
    that are programmed to think like humans and mimic their actions. The term may also be 
    applied to any machine that exhibits traits associated with a human mind such as learning 
    and problem-solving. AI systems are capable of performing tasks that typically require 
    human intelligence, such as visual perception, speech recognition, decision-making, 
    and translation between languages.
    
    Machine learning is a subset of AI that focuses on the development of computer programs 
    that can access data and use it to learn for themselves. The process of learning begins 
    with observations or data, such as examples, direct experience, or instruction, in order 
    to look for patterns in data and make better decisions in the future.
    """
    
    print("🧪 Testing with meaningful text...")
    
    try:
        # Test just the MCQ generation part
        mcqs = worker.generate_mcqs(meaningful_text, 3, 'easy')
        print(f"✅ Generated {len(mcqs)} MCQs!")
        for i, mcq in enumerate(mcqs):
            print(f"\n{i+1}. {mcq['question']}")
            for j, option in enumerate(mcq['options']):
                print(f"   {'→' if j == mcq['correct_index'] else ' '} {option}")
            print(f"   Explanation: {mcq['explanation']}")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_with_better_text()