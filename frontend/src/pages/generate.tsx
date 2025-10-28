import React, { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { Brain, FileText, Settings } from 'lucide-react';
import type { PageType } from '../types';
import { DashboardLayout } from '../components/Shared/DashboardLayout';

interface GeneratePageProps {
  onNavigate: (page: PageType, params?: any) => void;
}

export const GeneratePage: React.FC<GeneratePageProps> = ({ onNavigate }) => {
  const [questionCount, setQuestionCount] = useState<10 | 20 | 50>(10);
  const [customPrompt, setCustomPrompt] = useState('');
  const { generateQuiz, loading, error } = useQuiz();

  const handleGenerate = async () => {
    try {
      // In a real app, we would get fileId from context or params
      const fileId = 'mock-file-id';
      await generateQuiz(fileId, questionCount, customPrompt);
      onNavigate('quiz', { quizId: 'new-quiz' });
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <DashboardLayout currentPage="generate" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Generate MCQ Quiz</h1>
          <p className="text-gray-600">Create a customized quiz from your uploaded materials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quiz Configuration</h2>
              
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[10, 20, 50].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count as 10 | 20 | 50)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        questionCount === count 
                          ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                          : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-3xl font-bold text-gray-800 mb-1">{count}</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add specific instructions for question generation (e.g., 'Focus on object-oriented programming concepts', 'Include questions about data structures')"
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {customPrompt.length}/500 characters
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" />
                  <span>Generate {questionCount} Questions</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">Generation Settings</h3>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Question Type</span>
                  <span className="font-medium text-gray-800">Multiple Choice</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Options per Question</span>
                  <span className="font-medium text-gray-800">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Source Material</span>
                  <span className="font-medium text-gray-800">Core Java - Module 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Time</span>
                  <span className="font-medium text-gray-800">{questionCount * 1.5} min</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Tips for Better Results</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Use clear, specific instructions</li>
                <li>• Mention key topics to focus on</li>
                <li>• Specify difficulty level if needed</li>
                <li>• Include practical scenario requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};