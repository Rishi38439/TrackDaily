'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock,
  Check,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ActivityFormProps {
  onSubmit: (
    name: string,
    duration: number
  ) => void;
  isOpen: boolean;
  onClose: () => void;
}

const quickTemplates = [
  { name: 'Morning Run', duration: 0.5 },
  { name: 'Gym Workout', duration: 1 },
  { name: 'Yoga Session', duration: 0.75 },
  { name: 'Evening Walk', duration: 0.33 }
];

export function ActivityForm({ onSubmit, isOpen, onClose }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    duration: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name) return;

    // Validation: duration must be between 0 and 24 hours
    if (formData.duration < 0 || formData.duration > 24) {
      alert('Duration must be between 0 and 24 hours');
      return;
    }

    setIsSubmitting(true);
    
    onSubmit(
      formData.name,
      Math.round(formData.duration * 60) // Convert hours to minutes
    );

    // Show success toast
    toast({
      title: "Activity Logged! 🎯",
      description: `${formData.name} completed successfully`,
      duration: 3000,
    });

    setFormData({
      name: '',
      duration: 1
    });
    setIsSubmitting(false);
    onClose();
  };

  const selectTemplate = (template: typeof quickTemplates[0]) => {
    setFormData({
      name: template.name,
      duration: template.duration
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Log Activity</h2>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity Name */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-3 block">Activity Name</label>
              <Input
                placeholder="Enter activity name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-14 text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-3 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration (hours)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white rounded-xl h-14 text-lg focus:ring-2 focus:ring-blue-500/50"
                min="0"
                max="24"
                step="0.25"
                required
              />
              <input
                type="range"
                min="0"
                max="24"
                step="0.25"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || 0 })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider mt-3"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>0h</span>
                <span>24h</span>
              </div>
              <p className="text-xs text-white/50 mt-2">Maximum: 24 hours</p>
            </div>

            
            {/* Quick Templates */}
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-3">Quick Templates</h4>
              <div className="grid grid-cols-2 gap-3">
                {quickTemplates.map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    variant="outline"
                    onClick={() => selectTemplate(template)}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-white/60">
                        {template.duration} hours
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-xl"
              >
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Log Activity
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
