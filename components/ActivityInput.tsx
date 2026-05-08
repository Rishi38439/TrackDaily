'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Plus, Minus, Search, Trash2 } from 'lucide-react';
import { formatDuration, getCategoryIcon } from '@/lib/activityUtils';

interface ActivityInputProps {
  activities: Activity[];
  onAddActivity: (name: string, duration: number) => void;
  onDeleteActivity?: (id: string) => void;
  onUpdateActivity?: (id: string, duration: number) => void;
}

export function ActivityInput({ activities, onAddActivity, onDeleteActivity, onUpdateActivity }: ActivityInputProps) {
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDurations, setEditingDurations] = useState<Record<string, number>>({});

  const handleAddActivity = () => {
    if (!activityName.trim()) return;

    // Validation: duration must be between 0 and 1440 minutes (24 hours)
    if (duration < 0 || duration > 1440) {
      alert('Duration must be between 0 and 24 hours');
      return;
    }

    onAddActivity(activityName.trim(), duration);
    
    // Reset form
    setActivityName('');
    setDuration(30);
  };

  const incrementDuration = () => {
    setDuration((prev) => Math.min(1440, prev + 15)); // Add 15 minutes, max 24 hours
  };

  const decrementDuration = () => {
    setDuration((prev) => Math.max(0, prev - 15)); // Subtract 15 minutes, min 0
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleActivityDurationChange = (activityId: string, newDuration: number) => {
    setEditingDurations(prev => ({ ...prev, [activityId]: newDuration }));
  };

  const handleActivityUpdate = (activityId: string) => {
    const newDuration = editingDurations[activityId];
    if (newDuration !== undefined && onUpdateActivity) {
      // Validation: duration must be between 0 and 1440 minutes (24 hours)
      if (newDuration < 0 || newDuration > 1440) {
        alert('Duration must be between 0 and 24 hours');
        return;
      }
      onUpdateActivity(activityId, newDuration);
      // Clear the editing duration after successful update
      setEditingDurations(prev => {
        const newState = { ...prev };
        delete newState[activityId];
        return newState;
      });
    }
  };

  const handleIncrementDuration = (activityId: string, currentDuration: number) => {
    const newDuration = Math.min(1440, currentDuration + 15); // Add 15 minutes, max 24 hours
    handleActivityDurationChange(activityId, newDuration);
  };

  const handleDecrementDuration = (activityId: string, currentDuration: number) => {
    const newDuration = Math.max(0, currentDuration - 15); // Subtract 15 minutes, min 0
    handleActivityDurationChange(activityId, newDuration);
  };

  // Filter activities based on search term
  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Activity
        </CardTitle>
        <CardDescription>Log your activity instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
          />
        </div>
        {/* Activity Input */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <Input
            type="text"
            placeholder="Activity name..."
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            className="flex-grow bg-transparent border-none text-white placeholder:text-white/50 focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddActivity();
              }
            }}
          />
          
          {/* Duration Controls */}
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={decrementDuration}
              className="h-8 w-8 text-white/70 hover:bg-white/20 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-base font-medium text-white min-w-[60px] text-center">
              {formatDuration(duration)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={incrementDuration}
              className="h-8 w-8 text-white/70 hover:bg-white/20 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleAddActivity}
            disabled={!activityName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center transition-all duration-200"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Templates */}
        <div className="flex gap-2 flex-wrap">
          {[
            { name: 'Run', duration: 30 },
            { name: 'Gym', duration: 60 },
            { name: 'Yoga', duration: 45 },
            { name: 'Walk', duration: 20 }
          ].map((template) => (
            <Button
              key={template.name}
              variant="outline"
              size="sm"
              onClick={() => {
                setActivityName(template.name);
                setDuration(template.duration);
              }}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-lg text-xs px-3 py-1 h-auto"
            >
              {template.name}
            </Button>
          ))}
        </div>

        {/* Activities List */}
        {activities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/80">Recent Activities</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => {
                  const currentEditingDuration = editingDurations[activity.id] ?? activity.duration;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getCategoryIcon(activity.category)}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{activity.name}</p>
                          <p className="text-xs text-white/60">
                            {activity.category}
                          </p>
                        </div>
                      </div>
                      
                      {/* Duration Input with Controls */}
                      <div className="flex items-center gap-2">
                        {/* Decrement Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDecrementDuration(activity.id, currentEditingDuration)}
                          className="h-7 w-7 text-white/70 hover:bg-white/20 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        {/* Duration Input */}
                        <Input
                          type="number"
                          value={currentEditingDuration}
                          onChange={(e) => handleActivityDurationChange(activity.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-7 bg-white/10 border-white/20 text-white text-center text-sm focus-visible:ring-0"
                          min="0"
                          max="1440"
                        />
                        
                        {/* Increment Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleIncrementDuration(activity.id, currentEditingDuration)}
                          className="h-7 w-7 text-white/70 hover:bg-white/20 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        {/* Send Button */}
                        {onUpdateActivity && (
                          <Button
                            onClick={() => handleActivityUpdate(activity.id)}
                            disabled={editingDurations[activity.id] === undefined}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center ml-2 disabled:opacity-50"
                            size="icon"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {/* Delete Button */}
                        {onDeleteActivity && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteActivity(activity.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-white/60 text-center py-4 text-sm">No activities found</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
