'use client';

import { Activity } from '@/types/activity';
import { getChartData, getCategoryColor } from '@/lib/activityUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Empty } from '@/components/ui/empty';

interface ChartsPanelProps {
  activities: Activity[];
}

export function ChartsPanel({ activities }: ChartsPanelProps) {
  if (activities.length === 0) {
    return (
      <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>View your activity trends and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty
            icon="📊"
            title="No analytics available"
            description="Log some activities to see your analytics"
          />
        </CardContent>
      </Card>
    );
  }

  const weekData = getChartData(activities, 7);
  const monthData = getChartData(activities, 30);

  // Calculate category breakdown
  const categoryData = Object.entries(
    activities.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + a.duration;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, duration]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: duration,
    fill: getCategoryColor(category),
  }));

  return (
    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>View your activity trends and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="duration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="duration">Duration Trend</TabsTrigger>
            <TabsTrigger value="calories">Calories Trend</TabsTrigger>
            <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="duration" className="mt-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Duration (min)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="calories" className="mt-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="calories" fill="#f59e0b" name="Calories Burned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <div className="flex h-80 w-full items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}m`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
