import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, BarChart3 } from 'lucide-react';

interface QuizAttempt {
  id: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  date: string;
  duration: string;
  status: 'completed' | 'failed' | 'incomplete';
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const quizAttempts: QuizAttempt[] = [
    {
      id: '1',
      quizName: 'JavaScript Fundamentals',
      score: 85,
      totalQuestions: 20,
      date: '2024-01-15',
      duration: '25:30',
      status: 'completed',
      topic: 'Programming',
      difficulty: 'medium'
    },
    {
      id: '2',
      quizName: 'React Advanced Concepts',
      score: 92,
      totalQuestions: 15,
      date: '2024-01-14',
      duration: '30:15',
      status: 'completed',
      topic: 'Web Development',
      difficulty: 'hard'
    },
    {
      id: '3',
      quizName: 'CSS Grid Layout',
      score: 45,
      totalQuestions: 10,
      date: '2024-01-13',
      duration: '15:20',
      status: 'failed',
      topic: 'Web Design',
      difficulty: 'easy'
    },
    {
      id: '4',
      quizName: 'Node.js Backend',
      score: 78,
      totalQuestions: 25,
      date: '2024-01-12',
      duration: '45:10',
      status: 'completed',
      topic: 'Backend',
      difficulty: 'medium'
    },
    {
      id: '5',
      quizName: 'Python Data Structures',
      score: 0,
      totalQuestions: 30,
      date: '2024-01-11',
      duration: '10:05',
      status: 'incomplete',
      topic: 'Programming',
      difficulty: 'hard'
    }
  ];

  const filteredAttempts = quizAttempts.filter(attempt => {
    const matchesSearch = attempt.quizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || attempt.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || attempt.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'incomplete':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'hard':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateSuccessRate = () => {
    const completed = quizAttempts.filter(a => a.status === 'completed').length;
    return Math.round((completed / quizAttempts.length) * 100);
  };

  const averageScore = Math.round(
    quizAttempts.filter(a => a.status === 'completed')
      .reduce((acc, curr) => acc + curr.score, 0) / 
    quizAttempts.filter(a => a.status === 'completed').length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Quiz History</h1>
          <p className="text-[var(--text-secondary)]">Track your learning progress and quiz attempts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Attempts</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{quizAttempts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{calculateSuccessRate()}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">{averageScore}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Completed</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {quizAttempts.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)] mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-tertiary)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search quizzes or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="incomplete">Incomplete</option>
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-4 py-3 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
              >
                <option value="all">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] transition-colors">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Attempts Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[var(--border-primary)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Quiz Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Topic</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(attempt.status)}
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{attempt.quizName}</div>
                          <div className="text-sm text-[var(--text-tertiary)]">
                            {attempt.totalQuestions} questions
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{attempt.topic}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(attempt.difficulty)}`}>
                        {attempt.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-semibold ${getScoreColor(attempt.score)}`}>
                        {attempt.score}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{attempt.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(attempt.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attempt.status)}`}>
                        {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttempts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[var(--text-tertiary)] mb-4">No quiz attempts found</div>
              <div className="text-sm text-[var(--text-secondary)]">
                Try adjusting your search or filters
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {quizAttempts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-[var(--primary-100)] to-[var(--secondary-100)] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-[var(--primary-600)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Quiz History Yet</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Start taking quizzes to track your progress and build your learning history.
            </p>
            <button className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white px-6 py-3 rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all shadow-lg">
              Take Your First Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;