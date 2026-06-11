'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Send, Plus, Minus, Trash2 } from 'lucide-react';

interface ActivityItemProps {
  id: string;
  name: string;
  initialDuration: number;
  onDelete: (id: string) => void;
}

export function ActivityItem({
  id,
  name,
  initialDuration,
  onDelete,
}: ActivityItemProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const incrementDuration = () => {
    setDuration((prev) => Math.min(1440, prev + 60)); // Max 24 hours in minutes
    console.log('[v0] Activity duration incremented:', duration + 60);
  };

  const decrementDuration = () => {
    setDuration((prev) => Math.max(0, prev - 60));
    console.log('[v0] Activity duration decremented:', duration - 60);
  };

  const handleSave = () => {
    console.log('[v0] Activity saved:', { id, name, duration });
  };

  const handleDelete = () => {
    console.log('[v0] Activity deleted:', id);
    onDelete(id);
    setShowDeleteDialog(false);
  };

  const formatDuration = () => {
    if (duration === 0) return '0h';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 border border-white/10 p-4">
        {/* Activity Name */}
        <div className="flex-1">
          <p className="text-white font-medium text-lg">{name}</p>
          <p className="text-white/50 text-sm">Duration: {formatDuration()}</p>
        </div>

        {/* Controls on the right */}
        <div className="flex items-center gap-3">
          {/* Decrement Button */}
          <Button
            onClick={decrementDuration}
            className="h-10 w-10 p-0 rounded-[10px] bg-white/20 hover:bg-white/30 text-white"
          >
            <Minus className="h-5 w-5" />
          </Button>

          {/* Duration Display */}
          <span className="w-16 text-center text-white font-medium text-sm bg-white/10 rounded-lg py-2">
            {formatDuration()}
          </span>

          {/* Increment Button */}
          <Button
            onClick={incrementDuration}
            className="h-10 w-10 p-0 rounded-[10px] bg-white/20 hover:bg-white/30 text-white"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* Send/Save Button */}
          <Button
            onClick={handleSave}
            className="h-10 w-10 p-0 rounded-[10px] bg-blue-500/80 hover:bg-blue-500 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>

          {/* Delete Button */}
          <Button
            onClick={() => setShowDeleteDialog(true)}
            className="h-10 w-10 p-0 rounded-[10px] bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Activity</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete "{name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
