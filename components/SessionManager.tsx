'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Eye, EyeOff } from 'lucide-react';

interface SessionManagerProps {
  sessionCode: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionManager({ sessionCode, isOpen, onOpenChange }: SessionManagerProps) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('[v0] Session code copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg bg-slate-800 border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Session Information</DialogTitle>
          <DialogDescription className="text-white/60">
            Share this code with others to allow them to access this session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-white/70 mb-2">Session Code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span className={`text-2xl font-bold tracking-wider ${showCode ? 'text-blue-400' : 'text-white/50'}`}>
                  {showCode ? sessionCode : '•'.repeat(5)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCode(!showCode)}
                  className="h-8 w-8 hover:bg-white/10"
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                type="button"
                onClick={handleCopyCode}
                className="h-10 w-10 p-0 rounded-[10px] bg-blue-500/80 hover:bg-blue-500 text-white"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-400 mt-2">Copied to clipboard!</p>}
          </div>

          <div className="text-sm text-white/60 space-y-1">
            <p>Share this 5-digit code with anyone who needs access to this session. They will need to enter this code to view and modify activities.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
