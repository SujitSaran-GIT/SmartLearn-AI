import React from 'react';
import type { PageType } from '../../types';
import { calculateScoreColor } from '../../utils/formating';
import { DashboardLayout } from '../../components/Shared/DashboardLayout';
import { BookOpen, CheckCircle, Clock, TrendingUp, Trophy, XCircle } from 'lucide-react';


interface ResultsPageProps {
  onNavigate: (page: PageType, params?: any) => void;
  resultId: string;
  score: number;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate, resultId, score }) => {
  // Mock data - in real app, this would come from API
  const mockResults = {
    totalQuestions: 50,
    correctAnswers: Math.round(score / 100 * 50),
    timeSpent: '45:30',
    percentile: 85,
    topicPerformance: [
      { topic: 'Object-Oriented Programming', score: 92 },
      { topic: 'Data Structures', score: 78 },
      { topic: 'Algorithms', score: 85 },
      { topic: 'Java Basics', score: 90 }
    ]
  };

  const scoreColor = calculateScoreColor(score);

  return (
    <DashboardLayout currentPage="results" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Results</h1>
          <p className="text-gray-600">Core Java - Module 1 Assessment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className={`w-20 h-20 ${scoreColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{score}%</h3>
            <p className="text-gray-600">Overall Score</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">{mockResults.correctAnswers}</p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {mockResults.totalQuestions - mockResults.correctAnswers}
                  </p>
                  <p className="text-sm text-gray-600">Incorrect</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Time Spent</span>
                </div>
                <span className="font-semibold text-gray-800">{mockResults.timeSpent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Percentile</span>
                </div>
                <span className="font-semibold text-gray-800">Top {mockResults.percentile}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Questions</span>
                </div>
                <span className="font-semibold text-gray-800">{mockResults.totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Topic Performance</h3>
          <div className="space-y-4">
            {mockResults.topicPerformance.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{topic.topic}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${topic.score}%` }}
                    ></div>
                  </div>
                  <span className={`w-12 text-right font-semibold ${calculateScoreColor(topic.score)}`}>
                    {topic.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => onNavigate('review', { resultId })}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center space-x-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>Review Answers</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};