'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Clock, Search, Edit, Trash2, SortAsc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types/activity';
import { calculateStreakStats } from '@/lib/streakUtils';

interface ActivityHistoryProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
}

export function ActivityHistory({ activities, onDeleteActivity }: ActivityHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const streakStats = useMemo(() => calculateStreakStats(activities), [activities]);

  const dayKey = (timestamp: number) => {
    const date = new Date(timestamp);
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const todayKey = dayKey(Date.now());
  const weekCutoff = todayKey - 6 * 24 * 60 * 60 * 1000;
  const monthCutoff = todayKey - 29 * 24 * 60 * 60 * 1000;

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    const filtered = activities.filter(activity => {
      const activityDay = dayKey(activity.timestamp);
      const matchesDateFilter =
        dateFilter === 'all' ||
        (dateFilter === 'today' && activityDay === todayKey) ||
        (dateFilter === 'week' && activityDay >= weekCutoff) ||
        (dateFilter === 'month' && activityDay >= monthCutoff);

      const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (activity.notes && activity.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDateFilter && matchesSearch;
    });

    // Sort activities
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [activities, searchQuery, sortBy, sortOrder, dateFilter, todayKey, weekCutoff, monthCutoff]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = filteredActivities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, typeof filteredActivities>);

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [filteredActivities]);

  const handleDeleteClick = (activityId: string) => {
    setActivityToDelete(activityId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (activityToDelete && onDeleteActivity) {
      onDeleteActivity(activityToDelete);
      setActivityToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold leading-none text-white">Activity History</h2>
              <p className="text-sm text-white/50">Browse activity logs with compact filters and dense cards.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="border border-blue-500/20 bg-blue-500/10 text-blue-300">
                🔥 {streakStats.currentStreak} Days
              </Badge>
              <Badge variant="secondary" className="border border-white/10 bg-white/5 text-white/70">
                🏆 {streakStats.longestStreak} Max
              </Badge>
            </div>
          </div>

          <div className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl border-white/10 bg-black/40 pl-9 text-white placeholder:text-white/40 backdrop-blur-md focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
              <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-black/40 text-white backdrop-blur-md">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10 bg-zinc-950/95 text-white backdrop-blur-xl">
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-black/40 text-white backdrop-blur-md">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10 bg-zinc-950/95 text-white backdrop-blur-xl">
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-10 rounded-xl border-white/10 bg-white/5 text-white hover:bg-blue-500/10 hover:text-white"
            >
              <SortAsc className={cn('h-4 w-4 transition-transform', sortOrder === 'desc' && 'rotate-180')} />
            </Button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-4">
          {groupedActivities.map(([date, dateActivities]) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-20 z-10 mb-3 -mx-4 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">{date}</h3>
                  <Badge variant="secondary" className="bg-white/10 text-white/60 border-0">
                    {dateActivities.length} activities
                  </Badge>
                </div>
              </div>

              {/* Activities for this date */}
              <div className="space-y-2.5">
                {dateActivities.map((activity) => {
                  const isExpanded = expandedActivity === activity.id;

                  return (
                    <Card
                      key={activity.id}
                      className={cn(
                        'rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.005] hover:shadow-xl hover:shadow-white/5',
                        isExpanded && "ring-2 ring-blue-500/30"
                      )}
                    >
                      <CardContent className="px-4 py-3 sm:px-5 sm:py-3.5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className="truncate text-base font-medium text-white sm:text-[15px]">{activity.name}</p>
                              {activity.notes && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                                  className="h-auto p-0 text-xs text-blue-400 hover:bg-transparent hover:text-blue-300"
                                >
                                  {isExpanded ? 'Hide notes' : 'Show notes'}
                                </Button>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60 sm:text-sm">
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Start {formatTime(activity.timestamp)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
                              </span>
                            </div>

                            {activity.notes && isExpanded && (
                              <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                <p className="text-sm text-white/75">{activity.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 rounded-lg text-white/60 hover:bg-white/10 hover:text-white sm:h-9 sm:w-9"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(activity.id)}
                              className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 sm:h-9 sm:w-9"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No activities found</h3>
              <p className="text-white/60">
                {searchQuery 
                  ? 'Try adjusting your search' 
                  : 'Start logging activities to see them here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Activity</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
