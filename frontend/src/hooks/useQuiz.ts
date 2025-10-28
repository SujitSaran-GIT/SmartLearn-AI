import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { Question } from '../types';

export const useQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const generateQuiz = useCallback(async (fileId: string, questionCount: number, prompt?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { jobId } = await api.mcq.generate(fileId, questionCount, prompt);
      
      // Poll for job completion
      let jobStatus = 'processing';
      while (jobStatus === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const job = await api.mcq.getJob(jobId);
        jobStatus = job.status;
        
        if (job.status === 'done' && job.quizId) {
          const quizData = await api.quiz.get(job.quizId);
          setQuestions(quizData.questions);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitQuiz = useCallback(async (quizId: string): Promise<{ resultId: string; score: number }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.quiz.submit(quizId, answers);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [answers]);

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(index, questions.length - 1)));
  }, [questions.length]);

  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    questions,
    currentQuestionIndex,
    answers,
    
    // Actions
    generateQuiz,
    submitQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    resetQuiz,
    
    // Computed
    currentQuestion: questions[currentQuestionIndex],
    isLastQuestion: currentQuestionIndex === questions.length - 1,
    isFirstQuestion: currentQuestionIndex === 0,
    totalQuestions: questions.length,
    answeredQuestions: Object.keys(answers).length,
    progress: questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0
  };
};