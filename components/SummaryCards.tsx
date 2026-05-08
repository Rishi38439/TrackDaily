'use client';

import { Activity, ActivityStats } from '@/types/activity';
import { calculateStats, formatDuration } from '@/lib/activityUtils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, Target } from 'lucide-react';

interface SummaryCardsProps {
  activities: Activity[];
}

export function SummaryCards({ activities }: SummaryCardsProps) {
  const stats = calculateStats(activities);

  const cards = [
    {
      title: 'Total Activities',
      value: stats.totalActivities.toString(),
      icon: Target,
      color: 'from-blue-500/20 to-cyan-500/20',
      accent: 'text-blue-400',
    },
    {
      title: 'Total Duration',
      value: formatDuration(stats.totalDuration),
      icon: Clock,
      color: 'from-purple-500/20 to-pink-500/20',
      accent: 'text-purple-400',
    },
    {
      title: 'Avg. Duration',
      value: formatDuration(stats.averageDuration),
      icon: TrendingUp,
      color: 'from-green-500/20 to-emerald-500/20',
      accent: 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} backdrop-blur-md`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/60">{card.title}</p>
                  <p className={`mt-2 text-3xl font-bold ${card.accent}`}>{card.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${card.accent} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
