import { z } from 'zod';

export const mcqGenerationSchema = z.object({
  fileId: z.string().uuid(),
  questionCount: z.number().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  focusAreas: z.array(z.string()).optional()
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedIndex: z.number().min(0)
  }))
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.errors
        });
      }
      next(err);
    }
  };
};
