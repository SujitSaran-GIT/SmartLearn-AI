// src/services/QuizService.ts
import { AppDataSource } from '../config/database';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { QuizAttempt } from '../models/QuizAttempt';
import { Answer } from '../models/Answer';
import { mcqQueue } from '../config/queue';
import { v4 as uuidv4 } from 'uuid';

export class QuizService {
  private quizRepository = AppDataSource.getRepository(Quiz);
  private questionRepository = AppDataSource.getRepository(Question);
  private attemptRepository = AppDataSource.getRepository(QuizAttempt);
  private answerRepository = AppDataSource.getRepository(Answer);

  async generateMCQs(
    userId: string,
    fileId: string,
    questionCount: number,
    prompt?: string
  ): Promise<Quiz> {
    // Validate question count
    if (questionCount > 50) {
      throw new Error('Maximum 50 questions allowed');
    }

    if (![10, 20, 50].includes(questionCount)) {
      throw new Error('Question count must be 10, 20, or 50');
    }

    const quiz = this.quizRepository.create({
      id: uuidv4(),
      userId,
      fileId,
      title: `MCQ Quiz - ${new Date().toLocaleDateString()}`,
      questionCount,
      status: 'generating',
      generationParams: {
        prompt,
        requestedAt: new Date(),
      },
    });

    await this.quizRepository.save(quiz);

    // Add job to queue
    await mcqQueue.add('generate-mcqs', {
      quizId: quiz.id,
      fileId,
      questionCount,
      prompt,
    });

    return quiz;
  }

  async getQuizById(quizId: string, userId: string): Promise<Quiz | null> {
    return this.quizRepository.findOne({
      where: { id: quizId, userId },
      relations: ['questions', 'file'],
    });
  }

  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    return this.quizRepository.find({
      where: { userId },
      relations: ['file'],
      order: { createdAt: 'DESC' },
    });
  }

  async createQuizAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    const quiz = await this.getQuizById(quizId, userId);
    if (!quiz || quiz.status !== 'ready') {
      throw new Error('Quiz not found or not ready');
    }

    const attempt = this.attemptRepository.create({
      id: uuidv4(),
      userId,
      quizId,
      status: 'in_progress',
      startedAt: new Date(),
    });

    await this.attemptRepository.save(attempt);
    return attempt;
  }

  async submitQuizAttempt(
    attemptId: string,
    userId: string,
    answers: Array<{ questionId: string; selectedOptionIndex: number }>
  ): Promise<QuizAttempt> {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId, userId },
      relations: ['quiz', 'quiz.questions'],
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    let correctCount = 0;

    // Evaluate each answer
    for (const userAnswer of answers) {
      const question = attempt.quiz.questions.find(
        q => q.id === userAnswer.questionId
      );

      if (!question) continue;

      const isCorrect = question.correctOptionIndex === userAnswer.selectedOptionIndex;
      if (isCorrect) correctCount++;

      const answerRecord = this.answerRepository.create({
        id: uuidv4(),
        attemptId,
        questionId: userAnswer.questionId,
        selectedOptionIndex: userAnswer.selectedOptionIndex,
        isCorrect,
      });

      await this.answerRepository.save(answerRecord);
    }

    const totalQuestions = attempt.quiz.questions.length;
    const score = (correctCount / totalQuestions) * 100;

    // Update attempt
    attempt.correctCount = correctCount;
    attempt.wrongCount = totalQuestions - correctCount;
    attempt.percentage = score;
    attempt.status = 'completed';
    attempt.submittedAt = new Date();

    await this.attemptRepository.save(attempt);
    return attempt;
  }

  async getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.find({
      where: { userId },
      relations: ['quiz', 'quiz.file'],
      order: { startedAt: 'DESC' },
    });
  }

  async getAttemptWithDetails(attemptId: string, userId: string): Promise<QuizAttempt | null> {
    return this.attemptRepository.findOne({
      where: { id: attemptId, userId },
      relations: [
        'quiz',
        'quiz.questions',
        'quiz.file',
        'answers',
        'answers.question'
      ],
    });
  }
}