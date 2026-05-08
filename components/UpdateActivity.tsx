'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit3, Save, X } from 'lucide-react';

interface UpdateActivityProps {
  activities: Activity[];
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
}

export function UpdateActivity({ activities, onUpdateActivity }: UpdateActivityProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: '',
    notes: ''
  });

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setFormData({
      name: activity.name,
      category: activity.category,
      duration: activity.duration.toString(),
      notes: activity.notes || ''
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedActivity) {
      setFormData({
        name: selectedActivity.name,
        category: selectedActivity.category,
        duration: selectedActivity.duration.toString(),
        notes: selectedActivity.notes || ''
      });
    }
    setIsEditing(false);
  };

  const handleSaveUpdate = () => {
    if (!selectedActivity) return;

    const duration = parseInt(formData.duration);
    
    // Validation: duration must be between 0 and 1440 minutes (24 hours)
    if (duration < 0 || duration > 1440) {
      alert('Duration must be between 0 and 24 hours (1440 minutes)');
      return;
    }

    const updates: Partial<Activity> = {
      name: formData.name,
      category: formData.category,
      duration: duration,
      notes: formData.notes || undefined
    };

    onUpdateActivity(selectedActivity.id, updates);
    setIsEditing(false);
  };

  const categories = ['cardio', 'strength', 'flexibility', 'sports', 'outdoor', 'mind', 'other'];

  return (
    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Update Activity
        </CardTitle>
        <CardDescription>Search and update existing activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="space-y-3">
          <Label htmlFor="search">Search Activities</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              id="search"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleSelectActivity(activity)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  searchTerm && !filteredActivities.includes(activity)
                    ? 'opacity-30 bg-white/5 border-white/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{activity.name}</p>
                    <p className="text-sm text-white/60">{activity.category} • {activity.duration}min</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/60 text-center py-4">No activities found</p>
          )}
        </div>

        {/* Selected Activity Details */}
        {selectedActivity && (
          <div className="space-y-4 p-4 bg-black rounded-lg border border-white/10">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">Activity Details</h3>
              {!isEditing ? (
                <Button
                  onClick={handleStartEdit}
                  size="sm"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveUpdate}
                    size="sm"
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    size="sm"
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Activity Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black border border-white/10 text-white disabled:opacity-50"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-black border border-white/10 text-white disabled:opacity-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  max="1440"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black border border-white/10 text-white disabled:opacity-50"
                />
                {isEditing && (
                  <p className="text-xs text-white/50 mt-1">Maximum: 24 hours (1440 minutes)</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!isEditing}
                  className="bg-black border border-white/10 text-white disabled:opacity-50"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedActivity && !searchTerm && (
          <div className="text-center py-8">
            <Edit3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Search for an activity to update it</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
