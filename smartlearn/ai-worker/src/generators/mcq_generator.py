import json
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def generate_mcq_questions(
    llm_client,
    text: str,
    question_count: int,
    difficulty: str = 'medium'
) -> List[Dict]:
    '''Generate MCQ questions from text using LLM'''
    
    # Truncate text if too long (keep first 8000 chars for context)
    if len(text) > 8000:
        text = text[:8000] + "..."
    
    prompt = f'''Based on the following educational content, generate EXACTLY {question_count} multiple choice questions.

Content:
{text}

Requirements:
1. Create {question_count} high-quality multiple choice questions
2. Difficulty level: {difficulty}
3. Each question must have exactly 4 options (A, B, C, D)
4. Clearly indicate the correct answer
5. Provide a brief explanation for the correct answer
6. Include a relevant snippet from the source text

Return ONLY a valid JSON object with this exact structure:
{{
  "questions": [
    {{
      "questionText": "Question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation of why this is correct",
      "sourceSnippet": "Relevant text from source",
      "difficulty": "{difficulty}"
    }}
  ]
}}

Generate all {question_count} questions now:'''

    try:
        logger.info(f"Generating {question_count} questions with {difficulty} difficulty")
        
        response = llm_client.generate_completion(prompt, temperature=0.3)
        
        # Parse JSON response
        result = json.loads(response)
        questions = result.get('questions', [])
        
        if len(questions) != question_count:
            logger.warning(f"Expected {question_count} questions, got {len(questions)}")
            
            # If we got fewer questions, try to generate more
            if len(questions) < question_count:
                remaining = question_count - len(questions)
                logger.info(f"Generating {remaining} more questions")
                additional = generate_mcq_questions(
                    llm_client, 
                    text, 
                    remaining, 
                    difficulty
                )
                questions.extend(additional)
        
        return questions[:question_count]  # Return exactly the requested count
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response: {e}")
        raise Exception("LLM returned invalid JSON")
    except Exception as e:
        logger.error(f"MCQ generation error: {e}")
        raise