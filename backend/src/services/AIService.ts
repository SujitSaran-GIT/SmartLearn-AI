// src/services/AIService.ts
import OpenAI from 'openai';
import { ENV } from '../config/env';

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  sourceSnippet: string;
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: ENV.OPENAI_API_KEY!,
    });
  }

  async generateMCQs(
    documentText: string,
    questionCount: number,
    focusAreas?: string[]
  ): Promise<MCQ[]> {
    const prompt = this.buildMCQPrompt(documentText, questionCount, focusAreas);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate high-quality multiple-choice questions based on the provided text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      const parsedResponse = JSON.parse(content);
      return parsedResponse.questions || [];
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate MCQs');
    }
  }

  async generateExplanation(
    question: string,
    correctAnswer: string,
    context: string
  ): Promise<string> {
    const prompt = `
      Question: ${question}
      Correct Answer: ${correctAnswer}
      Context: ${context}
      
      Please provide a clear and concise explanation for why this answer is correct, based on the provided context.
      Keep the explanation under 100 words.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful tutor explaining answers to students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      return response.choices[0]?.message?.content || 'Explanation not available.';
    } catch (error) {
      console.error('Explanation generation error:', error);
      return 'Unable to generate explanation at this time.';
    }
  }

  private buildMCQPrompt(
    documentText: string,
    questionCount: number,
    focusAreas?: string[]
  ): string {
    const focusInstruction = focusAreas?.length 
      ? `Focus on these areas: ${focusAreas.join(', ')}.`
      : 'Cover key concepts from the entire document.';

    return `
      DOCUMENT TEXT:
      ${documentText.substring(0, 12000)} // Limit context size

      TASK: Generate exactly ${questionCount} high-quality multiple-choice questions based on the document text.
      ${focusInstruction}

      REQUIREMENTS:
      - Each question must have 4 options (A, B, C, D)
      - Questions should test understanding, not just recall
      - Include one clearly correct answer
      - Provide a brief explanation (max 40 words)
      - Include the exact text snippet from the document that supports the answer

      OUTPUT FORMAT (JSON):
      {
        "questions": [
          {
            "id": "q1",
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOptionIndex": 0,
            "explanation": "Brief explanation...",
            "sourceSnippet": "Exact text from document..."
          }
        ]
      }

      IMPORTANT: Return ONLY valid JSON. No other text.
    `;
  }
}