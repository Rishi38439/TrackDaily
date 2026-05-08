'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onLoginSuccess, onRegisterClick }: LoginFormProps) {
  const [sessionCode, setSessionCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) {
      return;
    }

    clearError();
    const success = await login({ sessionCode });
    
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 5) {
      setSessionCode(value);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-white/70">
            Enter your session code to access your TrackDaily
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sessionCode" className="text-sm font-medium text-white/80">
                Session Code
              </label>
              <div className="relative">
                <Input
                  id="sessionCode"
                  type={showCode ? 'text' : 'password'}
                  value={sessionCode}
                  onChange={handleInputChange}
                  placeholder="XXXXX"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 pr-10"
                  maxLength={5}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/50 hover:text-white/70 p-0"
                >
                  {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-white/50">
                Enter your 5-character session code (letters and numbers)
              </p>
            </div>

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || sessionCode.length !== 5}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-white/50">OR</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10 hover:border-white/20"
              onClick={onRegisterClick}
              disabled={isLoading}
            >
              Create New Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
