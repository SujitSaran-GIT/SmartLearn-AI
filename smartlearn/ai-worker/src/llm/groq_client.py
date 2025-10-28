import os
from groq import Groq
import logging

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self):
        self.client = Groq(api_key=os.getenv('GROQ_API_KEY'))
        self.model = os.getenv('DEFAULT_MODEL', 'llama3-70b-8192')
    
    def generate_completion(self, prompt: str, temperature: float = 0.3) -> str:
        '''Generate completion using Groq'''
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert educational content creator specializing in creating high-quality multiple choice questions."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=temperature,
                max_tokens=4096,
                response_format={"type": "json_object"}
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise Exception(f"LLM generation failed: {str(e)}")