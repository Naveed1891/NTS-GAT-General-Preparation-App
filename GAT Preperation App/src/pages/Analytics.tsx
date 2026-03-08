import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Analytics() {
  const { progress } = useStore();

  const topicData = Object.entries(progress.topicPerformance)
    .map(([topic, stats]) => ({
      name: topic,
      accuracy: (stats.correct / stats.attempted) * 100,
      attempted: stats.attempted,
      correct: stats.correct,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const strongTopics = topicData.filter(t => t.attempted >= 5 && t.accuracy >= 70);
  const weakTopics = topicData.filter(t => t.attempted >= 5 && t.accuracy < 60);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
        <p className="text-slate-500 mt-2">Detailed breakdown of your strengths and weaknesses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Topic Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {topicData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={150} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.accuracy >= 70 ? '#10b981' : entry.accuracy < 60 ? '#ef4444' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Take some quizzes to see your topic accuracy.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Strong Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strongTopics.length > 0 ? (
                <ul className="space-y-3">
                  {strongTopics.map((topic, i) => (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">{topic.name}</span>
                      <span className="text-emerald-600 font-bold">{topic.accuracy.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Keep practicing to build your strengths!</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" /> Weak Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weakTopics.length > 0 ? (
                <ul className="space-y-3">
                  {weakTopics.map((topic, i) => (
                    <li key={i} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">{topic.name}</span>
                      <span className="text-red-600 font-bold">{topic.accuracy.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No major weaknesses identified yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
