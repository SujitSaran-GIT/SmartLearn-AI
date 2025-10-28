import os
import json
import logging
from typing import List, Dict, Any
import requests

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self, api_key: str):
        if not api_key or api_key == 'your-groq-api-key':
            raise ValueError("Invalid Groq API key")
        
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1"
        self.default_model = "llama-3.1-8b-instant"  # Fast and reliable
        
    def generate_mcqs(self, text: str, question_count: int = 5, difficulty: str = "medium") -> List[Dict[str, Any]]:
        """Generate MCQs using Groq API"""
        
        # Validate input
        if not text or len(text.strip()) < 20:
            logger.warning("Text too short for meaningful questions")
            return self._generate_fallback_mcqs(question_count)
        
        # Prepare prompt
        prompt = self._create_prompt(text, question_count, difficulty)
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.default_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert educational assistant. Generate multiple-choice questions based on the provided text. Always return valid JSON format."
                        },
                        {
                            "role": "user", 
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"}
                },
                timeout=45
            )
            
            # Handle API errors
            if response.status_code != 200:
                error_msg = f"API error {response.status_code}"
                if response.status_code == 400:
                    error_msg = "Bad request - check prompt format"
                elif response.status_code == 401:
                    error_msg = "Invalid API key"
                elif response.status_code == 429:
                    error_msg = "Rate limit exceeded"
                
                logger.error(f"❌ Groq API: {error_msg}")
                return self._generate_fallback_mcqs(question_count)
            
            # Parse response
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            if not content:
                logger.warning("Empty response from Groq API")
                return self._generate_fallback_mcqs(question_count)
            
            # Parse JSON
            try:
                result = json.loads(content)
                mcqs = result.get('mcqs', [])
            except json.JSONDecodeError:
                logger.error("❌ Failed to parse JSON response")
                return self._generate_fallback_mcqs(question_count)
            
            # Validate and filter MCQs
            valid_mcqs = []
            for i, mcq in enumerate(mcqs):
                if self._is_valid_mcq(mcq):
                    valid_mcqs.append(mcq)
                else:
                    logger.warning(f"Skipping invalid MCQ at index {i}")
            
            if valid_mcqs:
                logger.info(f"✅ Generated {len(valid_mcqs)} valid MCQs")
                return valid_mcqs[:question_count]  # Ensure we don't return more than requested
            else:
                logger.warning("No valid MCQs generated, using fallback")
                return self._generate_fallback_mcqs(question_count)
            
        except requests.exceptions.Timeout:
            logger.error("❌ Groq API timeout")
            return self._generate_fallback_mcqs(question_count)
        except Exception as e:
            logger.error(f"❌ Groq API error: {e}")
            return self._generate_fallback_mcqs(question_count)
    
    def _is_valid_mcq(self, mcq: Dict) -> bool:
        """Validate MCQ structure"""
        return (isinstance(mcq, dict) and
                'question' in mcq and isinstance(mcq['question'], str) and
                'options' in mcq and isinstance(mcq['options'], list) and
                len(mcq['options']) == 4 and
                'correct_index' in mcq and
                isinstance(mcq['correct_index'], int) and
                0 <= mcq['correct_index'] <= 3)
    
    def _create_prompt(self, text: str, question_count: int, difficulty: str) -> str:
        """Create prompt for MCQ generation"""
        return f"""
Generate {question_count} multiple-choice questions based on the text below.

TEXT:
{text}

DIFFICULTY: {difficulty}

INSTRUCTIONS:
- Create exactly {question_count} diverse questions
- Each question must have exactly 4 options
- Mark correct answer with correct_index (0-3, where 0=first option)
- Include brief explanation for each answer
- Questions should test comprehension of key concepts

RESPONSE FORMAT (JSON only):
{{
    "mcqs": [
        {{
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_index": 0,
            "explanation": "Brief explanation"
        }}
    ]
}}

Return ONLY valid JSON.
"""
    
    def _generate_fallback_mcqs(self, question_count: int) -> List[Dict[str, Any]]:
        """Generate fallback MCQs when API fails"""
        logger.info("⚡ Using fallback MCQ generator")
        
        mcqs = []
        for i in range(question_count):
            mcq = {
                "question": f"Question {i+1}: What is a key concept from the text?",
                "options": [
                    "A main idea discussed in the text",
                    "An unrelated topic",
                    "A secondary detail mentioned briefly", 
                    "General knowledge not specific to the text"
                ],
                "correct_index": 0,
                "explanation": "This option reflects the primary content discussed in the provided text."
            }
            mcqs.append(mcq)
        
        return mcqs