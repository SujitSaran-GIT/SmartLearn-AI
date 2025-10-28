// src/workers/mcqGenerationWorker.ts
import { Job } from 'bullmq';
import { AppDataSource } from '../config/database';
import { File } from '../models/File';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { AIService } from '../services/AIService';
import { FileService } from '../services/FileService';
import { TextExtractionService } from './TextExtractionService';

const aiService = new AIService();
const fileService = new FileService();
const textExtractionService = new TextExtractionService();

export const MCQGenerationProcessor = async (job: Job) => {
  const { quizId, fileId, questionCount, prompt } = job.data;

  try {
    console.log(`Processing MCQ generation for quiz: ${quizId}`);

    // Get file and extract text
    const fileRepository = AppDataSource.getRepository(File);
    const file = await fileRepository.findOne({ where: { id: fileId } });

    if (!file) {
      throw new Error('File not found');
    }

    let extractedText = file.extractedText;
    if (!extractedText) {
      // Extract text from file
      const downloadUrl = await fileService.getFileDownloadUrl(fileId, file.userId);
      extractedText = await textExtractionService.extractTextFromUrl(downloadUrl);
      
      // Update file with extracted text
      await fileService.updateFileStatus(fileId, 'completed', extractedText);
    }

    // Generate MCQs using AI
    const mcqs = await aiService.generateMCQs(extractedText, questionCount);

    // Save questions to database
    const quizRepository = AppDataSource.getRepository(Quiz);
    const questionRepository = AppDataSource.getRepository(Question);

    const quiz = await quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const questionEntities = mcqs.map((mcq, index) =>
      questionRepository.create({
        id: mcq.id || `q${index + 1}`,
        quizId,
        questionText: mcq.question,
        options: mcq.options,
        correctOptionIndex: mcq.correctOptionIndex,
        explanation: mcq.explanation,
        sourceSnippet: mcq.sourceSnippet,
      })
    );

    await questionRepository.save(questionEntities);

    // Update quiz status
    quiz.status = 'ready';
    await quizRepository.save(quiz);

    console.log(`Successfully generated ${mcqs.length} MCQs for quiz: ${quizId}`);
    return { success: true, questionsGenerated: mcqs.length };

  } catch (error) {
    console.error(`MCQ generation failed for quiz ${quizId}:`, error);

    // Update quiz status to failed
    const quizRepository = AppDataSource.getRepository(Quiz);
    await quizRepository.update(quizId, { status: 'failed' });

    throw error;
  }
};