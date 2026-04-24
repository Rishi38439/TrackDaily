'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Search,
  Edit,
  Share,
  Trash2,
  SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity } from '@/types/activity';

interface ActivityHistoryProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
}

export function ActivityHistory({ activities, onDeleteActivity }: ActivityHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (activity.notes && activity.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
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
  }, [activities, searchQuery, sortBy, sortOrder]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Activity History</h2>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
            </select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <SortAsc className={cn("w-4 h-4 transition-transform", sortOrder === 'desc' && 'rotate-180')} />
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {groupedActivities.map(([date, dateActivities]) => (
          <div key={date} className="relative">
            {/* Date Header */}
            <div className="sticky top-20 z-10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-4 mb-4 -mx-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">{date}</h3>
                <Badge variant="secondary" className="bg-white/10 text-white/60 border-0">
                  {dateActivities.length} activities
                </Badge>
              </div>
            </div>

            {/* Activities for this date */}
            <div className="space-y-3">
              {dateActivities.map((activity) => {
                const isExpanded = expandedActivity === activity.id;

                return (
                  <Card
                    key={activity.id}
                    className={cn(
                      "bg-white/5 border-white/10 backdrop-blur-sm rounded-2xl hover:scale-[1.01] hover:shadow-xl hover:shadow-white/5 transition-all duration-300",
                      isExpanded && "ring-2 ring-blue-500/30"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-white font-medium">{activity.name}</p>
                            </div>

                            <div className="flex items-center gap-1 text-white/60 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>{formatTime(activity.timestamp)}</span>
                            </div>

                            <div className="flex items-center gap-1 text-white/60 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(activity.duration / 60)}h {activity.duration % 60}m</span>
                            </div>
                          </div>

                          {/* Expandable Notes */}
                          {activity.notes && (
                            <div className="mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                                className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                              >
                                {isExpanded ? 'Hide' : 'Show'} notes
                              </Button>
                              {isExpanded && (
                                <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                  <p className="text-white/80 text-sm">{activity.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Share className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteActivity(activity.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
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
  );
}
