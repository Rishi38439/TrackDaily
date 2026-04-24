'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ActivityFormProps {
  onSubmit: (
    name: string,
    category: string,
    duration: number,
    calories: number,
    notes?: string
  ) => void;
}

export function ActivityForm({ onSubmit }: ActivityFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      console.log('[v0] Form validation failed: activity name is empty');
      return;
    }

    setIsSubmitting(true);
    
    const activityData = {
      name: name.trim(),
      category: 'cardio',
      duration: 0, // Start with 0 duration, user can adjust via ActivityItem
      calories: 0,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[v0] Creating new activity:', activityData);
    
    onSubmit(
      activityData.name,
      activityData.category,
      activityData.duration,
      activityData.calories
    );

    // Reset form
    setName('');
    setIsSubmitting(false);
    
    console.log('[v0] Activity created and form reset');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-4 rounded-lg bg-white/5 border border-white/10 p-4">
        {/* Activity Name Input */}
        <Input
          placeholder="Enter Activity Name (e.g., GYM)..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border-0 bg-transparent text-white placeholder:text-white/40 focus:outline-none focus:ring-0 text-lg"
          required
        />

        {/* Send Button - Square with 10deg rounded corners */}
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="h-10 w-10 p-0 rounded-[10px] bg-blue-500/80 hover:bg-blue-500 disabled:opacity-50 text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
