'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, Eye, EyeOff, ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { isValidMobileNumber, normalizeMobileNumber } from '@/lib/phone';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onRegisterClick?: () => void;
}

type LoginStep = 'mobile' | 'otp' | 'session';

const COUNTRY_CODE_OPTIONS = [
  { code: '91', label: 'India +91' },
  { code: '1', label: 'United States +1' },
  { code: '44', label: 'United Kingdom +44' },
  { code: '61', label: 'Australia +61' },
  { code: '65', label: 'Singapore +65' },
  { code: '971', label: 'United Arab Emirates +971' },
];

export function LoginForm({ onLoginSuccess, onRegisterClick }: LoginFormProps) {
  const [step, setStep] = useState<LoginStep>('mobile');
  const [countryCode, setCountryCode] = useState('91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  
  const { login, isLoading, error, clearError, sendLoginOtp, verifyLoginOtp, isOtpVerified } = useAuth();

  useEffect(() => {
    const verified = isOtpVerified();
    if (verified) {
      const normalized = normalizeMobileNumber(verified);
      const matchedCountry = COUNTRY_CODE_OPTIONS
        .slice()
        .sort((left, right) => right.code.length - left.code.length)
        .find((option) => normalized.startsWith(`+${option.code}`));

      if (matchedCountry) {
        setCountryCode(matchedCountry.code);
        setMobileNumber(normalized.slice(matchedCountry.code.length + 1));
      } else {
        setMobileNumber(normalized.replace(/^\+/, ''));
      }
      setStep('session');
    }
  }, [isOtpVerified]);

  const fullMobileNumber = normalizeMobileNumber(`+${countryCode}${mobileNumber}`);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 15) {
      setMobileNumber(value);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSessionCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 5) {
      setSessionCode(value);
    }
  };

  const handleSendOtp = async () => {
    if (!isValidMobileNumber(fullMobileNumber)) {
      setOtpError('Enter a valid mobile number before requesting OTP.');
      return;
    }
    
    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);
    clearError();
    
    const result = await sendLoginOtp(fullMobileNumber);
    
    if (result.success) {
      setOtpMessage(result.message || `OTP sent to ${fullMobileNumber}`);
      setStep('otp');
      if (result.devOtp) {
        console.log('[Dev] OTP for testing:', result.devOtp);
      }
    } else {
      setOtpError(result.error || 'Failed to send OTP');
    }
    
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 6) return;
    
    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);
    clearError();
    
    const result = await verifyLoginOtp(fullMobileNumber, otp);
    
    if (result.success && result.verified) {
      setVerificationToken(result.verificationToken || '');
      setOtpMessage(result.message || 'OTP verified. Enter your session code.');
      setStep('session');
    } else {
      setOtpError(result.error || 'Invalid OTP. Please try again.');
    }
    
    setOtpLoading(false);
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim() || sessionCode.length !== 5) return;
    clearError();
    setLoginSuccess(null);
    
    const success = await login({ sessionCode, mobileNumber: fullMobileNumber, verificationToken });
    if (success && onLoginSuccess) {
      setLoginSuccess('Access granted.');
      window.setTimeout(() => onLoginSuccess(), 350);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('mobile');
      setOtp('');
      setOtpError(null);
      setOtpMessage(null);
    } else if (step === 'session') {
      setStep('otp');
      setOtp('');
      setOtpError(null);
      setLoginSuccess(null);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setOtpError(null);
    setOtpMessage(null);
    handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader className="text-center">
          {step !== 'mobile' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="absolute left-4 top-4 text-white/50 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {step === 'mobile' ? (
              <Phone className="w-6 h-6 text-white" />
            ) : step === 'otp' ? (
              <MessageSquare className="w-6 h-6 text-white" />
            ) : (
              <LogIn className="w-6 h-6 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {step === 'mobile' ? 'Enter Mobile Number' : 
             step === 'otp' ? 'Enter OTP' : 
             'Enter Session Code'}
          </CardTitle>
          <CardDescription className="text-white/70">
            {step === 'mobile' ? 'Enter your mobile number to receive an OTP' : 
             step === 'otp' ? `Enter the 6-digit OTP sent to ${fullMobileNumber || 'your mobile number'}` : 
             'Enter your session code to access TrackDaily'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'mobile' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="loginMobileNo" className="text-sm font-medium text-white/80">
                  Mobile Number
                </label>
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={otpLoading}>
                    <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/5 text-white backdrop-blur-md">
                      <SelectValue placeholder="Country code" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/10 bg-zinc-950/95 text-white backdrop-blur-xl">
                      {COUNTRY_CODE_OPTIONS.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="loginMobileNo"
                    type="tel"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    placeholder="Enter mobile number"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                    maxLength={15}
                    disabled={otpLoading}
                  />
                </div>
              </div>

              {otpError && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{otpError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSendOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={otpLoading || !isValidMobileNumber(fullMobileNumber)}
              >
                {otpLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>

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
              >
                Create New Session
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="loginOtp" className="text-sm font-medium text-white/80">
                  OTP
                </label>
                <Input
                  id="loginOtp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter 6-digit OTP"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  disabled={otpLoading}
                  autoFocus
                />
                <p className="text-xs text-white/50 text-center">
                  {otpMessage || 'Click resend if you did not receive OTP'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleResendOtp}
                  className="text-blue-400 hover:text-blue-300 hover:bg-transparent p-0 text-sm"
                  disabled={otpLoading}
                >
                  Resend OTP
                </Button>
                {process.env.NODE_ENV !== 'production' && (
                  <span className="text-xs text-yellow-500/70">Dev: Check console for OTP</span>
                )}
              </div>

              {otpError && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{otpError}</AlertDescription>
                </Alert>
              )}

              {loginSuccess && (
                <Alert className="bg-green-500/10 border-green-500/20 text-green-400">
                  <AlertDescription>{loginSuccess}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleVerifyOtp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={otpLoading || otp.length < 6}
              >
                {otpLoading ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
            </div>
          )}

          {step === 'session' && (
            <form onSubmit={handleSubmitSession} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="loginSessionCode" className="text-sm font-medium text-white/80">
                  Session Code
                </label>
                <div className="relative">
                  <Input
                    id="loginSessionCode"
                    type={showCode ? 'text' : 'password'}
                    value={sessionCode}
                    onChange={handleSessionCodeChange}
                    placeholder="XXXXX"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 pr-10 text-center text-xl tracking-[0.3em] font-mono"
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

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-white/50">Verified Mobile</p>
                <p className="text-sm font-medium text-white">{fullMobileNumber}</p>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loginSuccess && (
                <Alert className="bg-green-500/10 border-green-500/20 text-green-400">
                  <AlertDescription>{loginSuccess}</AlertDescription>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}