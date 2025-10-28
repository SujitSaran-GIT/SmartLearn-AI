import React, { useState } from 'react';
import { DashboardLayout } from '../components/Shared/DashboardLayout';
import { QuestionCard } from '../components/Quiz/QuestionCard';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import type { PageType, Question } from '../types';

interface ReviewPageProps {
  onNavigate: (page: PageType, params?: any) => void;
  resultId: string;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ onNavigate, resultId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Mock data - in real app, this would come from API
  const mockQuestions: Question[] = Array.from({ length: 50 }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Which of the following best describes the concept being tested in question ${i + 1}?`,
    options: [
      'Option A - This is the first possible answer',
      'Option B - This is the second possible answer',
      'Option C - This is the third possible answer',
      'Option D - This is the fourth possible answer'
    ],
    correctOptionIndex: Math.floor(Math.random() * 4),
    selectedOptionIndex: Math.floor(Math.random() * 4),
    explanation: 'This explanation provides detailed insight into why the correct answer is accurate and why other options are incorrect.',
    sourceSnippet: 'Relevant text from the source document that supports this question and provides additional context for understanding the concept.'
  }));

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const isCorrect = currentQuestion.selectedOptionIndex === currentQuestion.correctOptionIndex;

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(prev + 1, mockQuestions.length - 1));
  };

  const prevQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <DashboardLayout currentPage="review" onNavigate={onNavigate}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Answer Review</h1>
          <p className="text-gray-600">Core Java - Module 1 • Detailed explanations for each question</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
                    Question {currentQuestionIndex + 1} of {mockQuestions.length}
                  </span>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Previous question"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === mockQuestions.length - 1}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Next question"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={mockQuestions.length}
                selectedOption={currentQuestion.selectedOptionIndex}
                onSelectOption={() => {}}
                showCorrectAnswer={true}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Question Navigator</span>
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {mockQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                      index === currentQuestionIndex
                        ? 'bg-indigo-600 text-white'
                        : question.selectedOptionIndex === question.correctOptionIndex
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">Correct</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-gray-600">Incorrect</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Review Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Read explanations carefully</li>
                <li>• Note patterns in mistakes</li>
                <li>• Review source material</li>
                <li>• Focus on weak areas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
