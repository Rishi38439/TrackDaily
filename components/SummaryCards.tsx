'use client';

import { useMemo } from 'react';
import { Activity } from '@/types/activity';
import { calculateStats, formatDuration } from '@/lib/activityUtils';
import { calculateStreakStats } from '@/lib/streakUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy, TrendingUp, Clock, Target } from 'lucide-react';

interface SummaryCardsProps {
  activities: Activity[];
}

export function SummaryCards({ activities }: SummaryCardsProps) {
  const stats = useMemo(() => calculateStats(activities), [activities]);
  const streakStats = useMemo(() => calculateStreakStats(activities), [activities]);

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
    {
      title: 'Current Streak',
      value: `${streakStats.currentStreak} Days`,
      icon: Flame,
      color: 'from-blue-500/20 to-cyan-500/20',
      accent: 'text-cyan-300',
      subValue: `Longest ${streakStats.longestStreak} Days`,
      subIcon: Trophy,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const SubIcon = 'subIcon' in card ? card.subIcon : undefined;
        return (
          <Card
            key={card.title}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${card.color} backdrop-blur-md`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/60">{card.title}</p>
                  <p className={`mt-1.5 text-2xl font-bold ${card.accent}`}>{card.value}</p>
                  {'subValue' in card && card.subValue && SubIcon ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                      <SubIcon className="h-3.5 w-3.5 text-yellow-300/90" />
                      <span>{card.subValue}</span>
                    </div>
                  ) : null}
                </div>
                <Icon className={`h-7 w-7 ${card.accent} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
