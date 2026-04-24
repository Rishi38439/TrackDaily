'use client';

import { useState, useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Plus,
  BarChart3,
  History,
  Download,
  Settings,
  Calendar,
  Target,
  Flame,
  Clock,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: string) => void;
  onQuickAdd: () => void;
}

export function CommandPalette({ isOpen, onClose, onViewChange, onQuickAdd }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const commands = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: Target,
      shortcut: 'g d',
      action: () => {
        onViewChange('dashboard');
        onClose();
      }
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      icon: Plus,
      shortcut: 'l a',
      action: () => {
        onQuickAdd();
        onClose();
      }
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: BarChart3,
      shortcut: 'g a',
      action: () => {
        onViewChange('analytics');
        onClose();
      }
    },
    {
      id: 'history',
      label: 'Activity History',
      icon: History,
      shortcut: 'g h',
      action: () => {
        onViewChange('history');
        onClose();
      }
    },
    {
      id: 'import-export',
      label: 'Import/Export',
      icon: Download,
      shortcut: 'g i',
      action: () => {
        onViewChange('import-export');
        onClose();
      }
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      shortcut: 'g s',
      action: () => {
        onViewChange('settings');
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] z-50">
      <Card className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <Command className="rounded-lg">
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="w-5 h-5 text-white/50 mr-3" />
            <Command.Input
              ref={inputRef}
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus:outline-none focus:ring-0 py-4"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-white/60">
              No commands found.
            </Command.Empty>
            
            {commands.map((command) => {
              const Icon = command.icon;
              return (
                <Command.Item
                  key={command.id}
                  onSelect={command.action}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-white cursor-pointer",
                    "hover:bg-white/10 transition-colors duration-200",
                    "[&[aria-selected='true']]:bg-white/10"
                  )}
                >
                  <Icon className="w-5 h-5 text-white/60" />
                  <span className="flex-1">{command.label}</span>
                  <kbd className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded">
                    {command.shortcut}
                  </kbd>
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </Card>
    </div>
  );
}
