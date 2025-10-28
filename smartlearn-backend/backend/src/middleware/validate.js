import { z } from 'zod';

export const mcqGenerationSchema = z.object({
  fileId: z.string().uuid('Invalid file ID'),
  questionCount: z.number().min(1).max(50, 'Maximum 50 questions allowed'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  focusAreas: z.array(z.string()).max(5).optional().default([])
});

export const quizSubmissionSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    selectedIndex: z.number().min(0).max(3, 'Selected index must be between 0-3')
  })).min(1, 'At least one answer is required')
});

export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required')
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Check if body exists
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required',
          code: 'VALIDATION_ERROR',
          details: [{ field: 'body', message: 'Request body is required' }]
        });
      }

      console.log('🔍 Validating request body:', JSON.stringify(req.body, null, 2));
      
      const result = schema.parse(req.body);
      req.validatedData = result;
      next();
      
    } catch (err) {
      console.error('❌ Validation error:', err);
      
      // Handle Zod errors
      if (err instanceof z.ZodError) {
        const errorDetails = Array.isArray(err.errors) 
          ? err.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          : [{ field: 'unknown', message: 'Validation failed' }];

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errorDetails
        });
      }
      
      // Handle other unexpected errors
      console.error('💥 Unexpected validation error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? { message: err.message } : undefined
      });
    }
  };
};