import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Target, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { progress } = useStore();

  const recentHistory = progress.history.slice(0, 5);
  const chartData = [...progress.history].reverse().map((h, i) => ({
    name: `Test ${i + 1}`,
    score: (h.score / h.totalQuestions) * 100,
  }));

  const weakTopics = Object.entries(progress.topicPerformance)
    .map(([topic, stats]) => ({
      topic,
      accuracy: (stats.correct / stats.attempted) * 100,
      attempted: stats.attempted,
    }))
    .filter(t => t.attempted >= 5 && t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Quizzes</CardTitle>
            <Brain className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{progress.totalQuizzesAttempted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Mock Tests</CardTitle>
            <Target className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{progress.totalMockTestsAttempted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{progress.averageScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Questions</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {progress.history.reduce((acc, h) => acc + h.totalQuestions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Score Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No data available yet. Take a quiz to see your progress!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak Topics</CardTitle>
          </CardHeader>
          <CardContent>
            {weakTopics.length > 0 ? (
              <div className="space-y-4">
                {weakTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{topic.topic}</p>
                      <p className="text-sm text-slate-500">{topic.attempted} attempts</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {topic.accuracy.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
                <Link to="/practice" className="mt-4 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Practice these topics &rarr;
                </Link>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-8">
                Not enough data to identify weak topics. Keep practicing!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentHistory.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentHistory.map((attempt, i) => (
                <div key={i} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 capitalize">
                      {attempt.type === 'mock' ? 'Full Mock Test' : `Practice: ${attempt.topic}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(attempt.date).toLocaleDateString()} • {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {((attempt.score / attempt.totalQuestions) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-slate-500">
                      {attempt.score} / {attempt.totalQuestions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-center py-8">
              No recent activity.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
