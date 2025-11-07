import React, { useState } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp, Users, Award, Target } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  score: number;
  quizzesTaken: number;
  accuracy: number;
  streak: number;
  avatar?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const Leaderboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const leaderboardData: LeaderboardUser[] = [
    {
      id: '1',
      rank: 1,
      name: 'Aarav Sharma',
      score: 2850,
      quizzesTaken: 42,
      accuracy: 94,
      streak: 12,
      level: 'expert'
    },
    {
      id: '2',
      rank: 2,
      name: 'Priya Patel',
      score: 2720,
      quizzesTaken: 38,
      accuracy: 91,
      streak: 8,
      level: 'expert'
    },
    {
      id: '3',
      rank: 3,
      name: 'Rohan Kumar',
      score: 2580,
      quizzesTaken: 35,
      accuracy: 89,
      streak: 15,
      level: 'advanced'
    },
    {
      id: '4',
      rank: 4,
      name: 'Ananya Singh',
      score: 2450,
      quizzesTaken: 31,
      accuracy: 87,
      streak: 6,
      level: 'advanced'
    },
    {
      id: '5',
      rank: 5,
      name: 'Vikram Joshi',
      score: 2320,
      quizzesTaken: 28,
      accuracy: 85,
      streak: 9,
      level: 'intermediate'
    },
    {
      id: '6',
      rank: 6,
      name: 'Neha Gupta',
      score: 2180,
      quizzesTaken: 25,
      accuracy: 82,
      streak: 4,
      level: 'intermediate'
    },
    {
      id: '7',
      rank: 7,
      name: 'Arjun Reddy',
      score: 2050,
      quizzesTaken: 22,
      accuracy: 79,
      streak: 7,
      level: 'intermediate'
    }
  ];

  const currentUser: LeaderboardUser = {
    id: 'current',
    rank: 12,
    name: 'You',
    score: 1850,
    quizzesTaken: 18,
    accuracy: 76,
    streak: 3,
    level: 'beginner'
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500 fill-current" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400 fill-current" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600 fill-current" />;
      default:
        return <span className="text-lg font-bold text-[var(--text-secondary)]">{rank}</span>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 10) return 'text-red-600';
    if (streak >= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Learning Leaderboard</h1>
          <p className="text-[var(--text-secondary)]">Compete with other learners and climb the ranks</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Your Rank</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">#{currentUser.rank}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Participants</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{leaderboardData.length + 1}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Your Score</p>
                <p className="text-2xl font-bold text-[var(--primary-600)]">{currentUser.score}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-[var(--border-primary)] mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[var(--text-primary)]">Time Period:</span>
              <div className="flex space-x-2">
                {['weekly', 'monthly', 'all-time'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFilter(period as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeFilter === period
                        ? 'bg-[var(--primary-500)] text-white shadow-md'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="web-dev">Web Development</option>
              <option value="data-science">Data Science</option>
              <option value="design">Design</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[var(--border-primary)] overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Quizzes</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Accuracy</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)]">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {leaderboardData.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`transition-colors ${
                      user.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' 
                        : 'hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(user.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)] flex items-center space-x-2">
                            <span>{user.name}</span>
                            {user.rank <= 3 && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                          </div>
                          <div className="text-sm text-[var(--text-tertiary)]">@{user.name.toLowerCase().replace(' ', '')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(user.level)}`}>
                        {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)]">{user.score.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{user.quizzesTaken}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-600">{user.accuracy}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${getStreakColor(user.streak)} flex items-center space-x-1`}>
                        <TrendingUp className="w-4 h-4" />
                        <span>{user.streak} days</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current User Card */}
        <div className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] rounded-xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                <span className="text-xl font-bold">#{currentUser.rank}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentUser.name}</h3>
                <p className="text-white text-opacity-80">Keep going! You're doing great</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentUser.score.toLocaleString()} pts</div>
              <div className="text-white text-opacity-80">{currentUser.accuracy}% accuracy</div>
            </div>
          </div>
          
          {/* Progress to next rank */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Rank #{currentUser.rank - 1}</span>
              <span>65%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: '65%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Motivational Section */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-[var(--border-primary)]">
            <Target className="w-12 h-12 text-[var(--primary-500)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Ready to Climb Higher?</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Take more quizzes, improve your accuracy, and build longer streaks to move up the leaderboard.
            </p>
            <button className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] text-white px-8 py-3 rounded-lg hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)] transition-all shadow-lg font-semibold">
              Take a Quiz Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;