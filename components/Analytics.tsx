'use client';

import { useState, useMemo } from 'react';
import { Activity } from '@/types/activity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Trophy,
  Target,
  Flame,
  Clock,
  Activity as ActivityIcon,
  Award,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityLineGraph } from './ActivityLineGraph';
import { ActivitySectorView } from './ActivitySectorView';

interface AnalyticsProps {
  activities: Activity[];
}

export function Analytics({ activities }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'duration' | 'activities'>('duration');

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodActivities = activities.filter(a => new Date(a.timestamp) >= startDate);
    
    // Calculate trends (compare with previous period)
    const periodMultiplier = selectedPeriod === 'week' ? 14 : selectedPeriod === 'month' ? 60 : 730;
    const previousPeriodStart = new Date(now.getTime() - periodMultiplier * 24 * 60 * 60 * 1000);
    const previousPeriodActivities = activities.filter(a => {
      const date = new Date(a.timestamp);
      return date >= previousPeriodStart && date < startDate;
    });

    const currentTotal = periodActivities.reduce((acc, a) => {
      switch (selectedMetric) {
        case 'duration': return acc + a.duration;
        case 'activities': return acc + 1;
        default: return acc;
      }
    }, 0);

    const previousTotal = previousPeriodActivities.reduce((acc, a) => {
      switch (selectedMetric) {
        case 'duration': return acc + a.duration;
        case 'activities': return acc + 1;
        default: return acc;
      }
    }, 0);

    const trend = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Find most frequent activity
    const activityFrequency = periodActivities.reduce((acc, activity) => {
      acc[activity.name] = (acc[activity.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentActivity = Object.entries(activityFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    // Calculate personal records
    const personalRecords = {
      longestSession: Math.max(...periodActivities.map(a => a.duration), 0),
      mostActiveDay: calculateMostActiveDay(periodActivities)
    };

    return {
      currentTotal,
      trend,
      mostFrequentActivity,
      personalRecords,
      periodActivities,
      averagePerDay: currentTotal / Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    };
  }, [activities, selectedPeriod, selectedMetric]);

  function calculateMostActiveDay(activities: Activity[]) {
    const dayCounts = activities.reduce((acc, activity) => {
      const day = new Date(activity.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dayCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  }

  const insightCards = [
    {
      title: 'Total This Period',
      value: selectedMetric === 'duration' ? `${Math.floor(analytics.currentTotal / 60)}h ${analytics.currentTotal % 60}m` :
            selectedMetric === 'activities' ? analytics.currentTotal.toString() : '',
      icon: selectedMetric === 'duration' ? Clock : ActivityIcon,
      color: 'from-blue-500 to-cyan-500',
      trend: analytics.trend
    },
    {
      title: 'Daily Average',
      value: selectedMetric === 'duration' ? `${Math.floor(analytics.averagePerDay / 60)}h ${Math.floor(analytics.averagePerDay % 60)}m` :
            analytics.averagePerDay.toFixed(1),
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Favorite Activity',
      value: analytics.mostFrequentActivity?.[0] || 'None',
      icon: Trophy,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Most Active Day',
      value: analytics.personalRecords.mostActiveDay,
      icon: Calendar,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const personalRecordsCards = [
    {
      title: 'Longest Session',
      value: `${analytics.personalRecords.longestSession} min`,
      icon: Clock,
      color: 'from-blue-500/20 to-cyan-500/20',
      accent: 'text-blue-400'
    },
    ,
    {
      title: 'Current Streak',
      value: '7 days', // This would be calculated from actual data
      icon: Zap,
      color: 'from-purple-500/20 to-pink-500/20',
      accent: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analytics</h2>
          <p className="text-white/60">Track your progress and discover insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Metric Selector */}
          <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
            <TabsList className="bg-black/20 border border-white/10">
              <TabsTrigger value="duration" className="text-white/60 data-[state=active]:text-white">
                Duration
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-white/60 data-[state=active]:text-white">
                Activities
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Period Selector */}
          <div className="bg-black/20 border border-white/10 rounded-xl p-1">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "rounded-lg transition-all duration-200",
                  selectedPeriod === period 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
                    : "text-white/60 hover:text-white"
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insightCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm rounded-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center",
                    card.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {card.trend !== undefined && (
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      card.trend > 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {card.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(card.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ActivityLineGraph 
                activityName={analytics.mostFrequentActivity?.[0] || 'Activity'}
                activities={analytics.periodActivities}
                compact={false}
              />
            </div>
          </CardContent>
        </Card>

              </div>

      {/* Personal Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personalRecordsCards.map((record) => {
          const Icon = record.icon;
          return (
            <Card
              key={record.title}
              className={cn(
                "bg-gradient-to-br border border-white/10 backdrop-blur-sm rounded-2xl",
                record.color
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Icon className={cn("w-6 h-6", record.accent)} />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{record.title}</p>
                    <p className={cn("text-2xl font-bold", record.accent)}>{record.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Insights */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Weekly Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-1">Peak Performance Day</p>
              <p className="text-lg font-semibold text-white">Wednesday</p>
              <p className="text-white/50 text-sm">You're most active mid-week</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/60 text-sm mb-1">Improvement Area</p>
              <p className="text-lg font-semibold text-white">Weekend Consistency</p>
              <p className="text-white/50 text-sm">Try adding weekend activities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
