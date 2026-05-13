'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  LogOut, 
  Copy, 
  Check, 
  User, 
  Shield, 
  Database,
  Calendar,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SettingsPanelProps {
  onLogout?: () => void;
  onLoginClick?: () => void;
}

export function SettingsPanel({ onLogout, onLoginClick }: SettingsPanelProps) {
  const [copied, setCopied] = useState<'code' | 'id' | null>(null);
  const [showId, setShowId] = useState(false);
  const { session, logout, isLoading, isAuthenticated } = useAuth();

  const copyToClipboard = async (text: string, type: 'code' | 'id') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLogout = () => {
    logout();
    // Force page reload to trigger main authentication flow
    window.location.reload();
    if (onLogout) {
      onLogout();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show login/register UI when not authenticated even if a session object exists
  if (!isAuthenticated) {
    return (
      <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <CardDescription>Manage your session and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default State - Not Logged In */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Not Logged In</h3>
              <p className="text-white/60 text-sm">
                You need to be logged in to access session settings and manage your data.
              </p>
            </div>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
              <LogIn className="h-4 w-4" />
              <AlertDescription>
                Log in to access your session data, manage settings, and sync your activities across devices.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onLoginClick}
                disabled={isLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Login to Your Session'}
              </Button>
              
              <p className="text-xs text-white/50 text-center">
                Don't have a session? You can create a new one from the login screen.
              </p>
            </div>
          </div>

          {/* Information Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white/80">What you can do when logged in:</h4>
            <ul className="text-xs text-white/60 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                View and copy your session code and ID
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                Manage your session preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                Access database information and backup
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                Securely logout and clear local data
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Settings
        </CardTitle>
        <CardDescription>Manage your session and account preferences</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Session Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Session Information</h3>
            <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10">
              Active
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Session Code */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-white/50 mb-1">Session Code</p>
                  <p className="text-lg font-mono font-bold text-white">{session?.code ?? ''}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => session?.code && copyToClipboard(session.code, 'code')}
                  className="text-white/50 hover:text-white hover:bg-white/10"
                  disabled={!session?.code}
                >
                  {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Session ID removed as requested */
            /*
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              ...existing code...
            </div>
            */}

            {/* Session Start Date */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/50" />
                <div>
                  <p className="text-xs text-white/50 mb-1">Session Created</p>
                  <p className="text-sm text-white/80">{formatDate(session.startDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Information */}
        {session.logCode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Database Information</h3>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-xs text-white/50 mb-1">Log Code</p>
              <p className="text-sm font-mono text-white/80">{session.logCode}</p>
            </div>
          </div>
        )}

        {/* Security Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Security</h3>
          
          <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your session data is stored locally and backed up to our secure database. 
              Keep your session code private to protect your data.
            </AlertDescription>
          </Alert>

          <Button
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoading ? 'Logging out...' : 'Logout'}
          </Button>

          <p className="text-xs text-white/50 text-center">
            Logging out will clear all local data. You can log back in anytime with your session code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
