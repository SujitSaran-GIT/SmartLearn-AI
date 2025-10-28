import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

def validate_mcq_output(questions: List[Dict], expected_count: int) -> List[Dict]:
    '''Validate and clean MCQ output'''
    validated = []
    
    for i, q in enumerate(questions):
        try:
            # Validate required fields
            if not q.get('questionText'):
                logger.warning(f"Question {i} missing questionText")
                continue
            
            options = q.get('options', [])
            if not isinstance(options, list) or len(options) != 4:
                logger.warning(f"Question {i} has invalid options")
                continue
            
            correct_index = q.get('correctIndex')
            if correct_index is None or not (0 <= correct_index <= 3):
                logger.warning(f"Question {i} has invalid correctIndex")
                continue
            
            # Build validated question
            validated_q = {
                'questionText': q['questionText'].strip(),
                'options': [opt.strip() for opt in options],
                'correctIndex': int(correct_index),
                'explanation': q.get('explanation', '').strip() or 'No explanation provided',
                'sourceSnippet': q.get('sourceSnippet', '').strip() or '',
                'difficulty': q.get('difficulty', 'medium')
            }
            
            validated.append(validated_q)
            
        except Exception as e:
            logger.error(f"Error validating question {i}: {e}")
            continue
    
    if len(validated) < expected_count:
        logger.warning(f"Only {len(validated)} valid questions out of {expected_count}")
    
    return validated