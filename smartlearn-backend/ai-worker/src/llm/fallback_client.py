import logging
import random
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class FallbackClient:
    """Fallback MCQ generator for when LLM APIs are unavailable"""
    
    def __init__(self):
        self.question_templates = [
            "What is the main topic discussed in the text?",
            "According to the text, what is the primary focus?",
            "Which concept is central to understanding this content?",
            "What would be an accurate summary of this material?",
            "Based on the text, what is the key takeaway?",
            "What is the relationship between the main ideas presented?",
            "Which statement best captures the author's perspective?",
            "What evidence or examples support the main arguments?",
            "How are the key concepts interconnected in this text?",
            "What implications or conclusions can be drawn from this content?"
        ]
        
        self.option_patterns = [
            "Directly supported by the text content",
            "Contradicts the information presented", 
            "Related but not explicitly discussed",
            "Completely unrelated to the text topic"
        ]
    
    def generate_mcqs(self, text: str, question_count: int = 5, difficulty: str = "medium") -> List[Dict[str, Any]]:
        """Generate fallback MCQs based on text analysis"""
        
        logger.info(f"🔄 Generating {question_count} fallback MCQs")
        
        # Extract potential topics from text
        topics = self._extract_key_phrases(text)
        
        mcqs = []
        templates_used = self.question_templates.copy()
        random.shuffle(templates_used)
        
        for i in range(min(question_count, len(templates_used))):
            # Use available topic or generic one
            topic = topics[i % len(topics)] if topics else "the main content"
            
            mcq = {
                "question": templates_used[i].format(topic=topic) if "{topic}" in templates_used[i] else templates_used[i],
                "options": self._generate_options(difficulty),
                "correct_index": 0,
                "explanation": self._generate_explanation(topic)
            }
            mcqs.append(mcq)
        
        # Ensure we have exactly the requested number
        while len(mcqs) < question_count:
            base_mcq = random.choice(mcqs)
            new_mcq = base_mcq.copy()
            new_mcq["question"] = new_mcq["question"] + " (Additional)"
            mcqs.append(new_mcq)
        
        logger.info(f"✅ Generated {len(mcqs)} fallback MCQs")
        return mcqs
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract potential topic phrases from text"""
        words = text.split()
        phrases = []
        
        # Look for capitalized phrases (potential proper nouns/titles)
        for i in range(len(words) - 1):
            if (words[i] and words[i][0].isupper() and 
                len(words[i]) > 2 and 
                (i == 0 or words[i-1][-1] in '.!?')):
                
                # Try to build 2-3 word phrases
                phrase = words[i]
                if i + 1 < len(words) and words[i + 1] and words[i + 1][0].isupper():
                    phrase += " " + words[i + 1]
                    if i + 2 < len(words) and words[i + 2] and words[i + 2][0].isupper():
                        phrase += " " + words[i + 2]
                
                if phrase not in phrases:
                    phrases.append(phrase)
        
        # Fallback topics if no good phrases found
        if not phrases:
            phrases = [
                "key concepts", "main ideas", "primary findings",
                "central themes", "important details", "fundamental principles",
                "core arguments", "significant points", "major topics"
            ]
        
        return phrases[:8]  # Limit to 8 topics
    
    def _generate_options(self, difficulty: str) -> List[str]:
        """Generate options based on difficulty"""
        base_options = [
            "Accurately reflects the text content",
            "Contradicts the information presented",
            "Related concept but not directly addressed", 
            "Unrelated to the text subject matter"
        ]
        
        if difficulty == "easy":
            return base_options
        elif difficulty == "hard":
            # More nuanced options for hard difficulty
            return [
                "Directly supported by specific evidence in the text",
                "Implied but not explicitly stated in the content",
                "Plausible but contradicted by key details", 
                "Fundamentally misinterprets the main arguments"
            ]
        else:  # medium
            return base_options
    
    def _generate_explanation(self, topic: str) -> str:
        """Generate explanation for correct answer"""
        explanations = [
            f"This option correctly represents the discussion of {topic} in the text.",
            f"The text provides clear support for this answer regarding {topic}.",
            f"This choice aligns with the key points made about {topic}.",
            f"The content explicitly addresses this aspect of {topic}.",
            f"This answer captures the essential information about {topic} presented in the text."
        ]
        return random.choice(explanations)