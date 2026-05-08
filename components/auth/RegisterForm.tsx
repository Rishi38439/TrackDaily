'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RegisterData } from '@/types/activity';

interface RegisterFormProps {
  onRegisterSuccess?: (data: RegisterData) => void;
  onBackClick?: () => void;
}

export function RegisterForm({ onRegisterSuccess, onBackClick }: RegisterFormProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [copied, setCopied] = useState<'code' | 'id' | null>(null);
  const { register, isLoading, error, clearError } = useAuth();

  const handleRegister = async () => {
    clearError();
    const data = await register();
    
    if (data) {
      setRegisterData(data);
      setIsRegistered(true);
      
      if (onRegisterSuccess) {
        onRegisterSuccess(data);
      }
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'id') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isRegistered && registerData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Session Created!</CardTitle>
            <CardDescription className="text-white/70">
              Save your session credentials for future logins
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 mb-1">Session Code</p>
                    <p className="text-lg font-mono font-bold text-white">{registerData.sessionCode}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(registerData.sessionCode, 'code')}
                    className="text-white/50 hover:text-white hover:bg-white/10"
                  >
                    {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 mb-1">Session ID</p>
                    <p className="text-sm font-mono text-white/80 truncate">{registerData.sessionId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(registerData.sessionId, 'id')}
                    className="text-white/50 hover:text-white hover:bg-white/10"
                  >
                    {copied === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {registerData.logCode && (
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">Database Log Code</p>
                  <p className="text-sm font-mono text-white/80">{registerData.logCode}</p>
                </div>
              )}
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
              <AlertDescription>
                <strong>Important:</strong> Save your session code in a secure place. You'll need it to log back in.
              </AlertDescription>
            </Alert>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.reload()}
            >
              Start Using TrackDaily
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create New Session</CardTitle>
          <CardDescription className="text-white/70">
            Generate a unique session code to start tracking your activities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-medium text-white/80 mb-2">What you'll get:</h3>
              <ul className="text-xs text-white/60 space-y-1 text-left">
                <li>• Unique 5-character session code</li>
                <li>• Secure session ID for data storage</li>
                <li>• Automatic cloud backup of your data</li>
                <li>• Access to all TrackDaily features</li>
              </ul>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Session...' : 'Generate New Session'}
          </Button>

          <Button
            variant="outline"
            className="w-full border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            onClick={onBackClick}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
