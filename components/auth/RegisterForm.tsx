'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, UserPlus, ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RegisterData } from '@/types/activity';

interface RegisterFormProps {
  onRegisterSuccess?: (data: RegisterData) => void;
  onBackClick?: () => void;
}

type RegisterStep = 'mobile' | 'otp' | 'success';

export function RegisterForm({ onRegisterSuccess, onBackClick }: RegisterFormProps) {
  const [step, setStep] = useState<RegisterStep>('mobile');
  const [mobileNo, setMobileNo] = useState('');
  const [otp, setOtp] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [copied, setCopied] = useState<'code' | 'id' | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const { register, isLoading, error, clearError, sendLoginOtp, verifyLoginOtp } = useAuth();

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 15) {
      setMobileNo(value);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSendOtp = async () => {
    if (!mobileNo.trim() || mobileNo.length < 8) return;
    
    setOtpLoading(true);
    setOtpError(null);
    
    const result = await sendLoginOtp(mobileNo);
    
    if (result.success) {
      setOtpSent(true);
      setStep('otp');
      if (result.devOtp) {
        console.log('[Dev] OTP for testing:', result.devOtp);
      }
    } else {
      setOtpError(result.error || 'Failed to send OTP');
    }
    
    setOtpLoading(false);
  };

  const handleVerifyOtpAndRegister = async () => {
    if (!otp.trim() || otp.length < 6) return;
    
    setOtpLoading(true);
    setOtpError(null);
    setStep('mobile'); // Temporarily go back to avoid UI issues
    clearError();
    
    // First verify OTP
    const verifyResult = await verifyLoginOtp(mobileNo, otp);
    
    if (!verifyResult.success || !verifyResult.verified) {
      setOtpError(verifyResult.error || 'Invalid OTP. Please try again.');
      setStep('otp');
      setOtpLoading(false);
      return;
    }

    // If OTP verified, proceed with registration
    const data = await register(mobileNo);
    
    if (data) {
      setRegisterData(data);
      setIsRegistered(true);
      setStep('success');
      
      if (onRegisterSuccess) {
        onRegisterSuccess(data);
      }
    }
    setOtpLoading(false);
  };

  const handleRegister = async () => {
    clearError();
    
    // Skip OTP if we already have verified mobile in session
    const data = await register(mobileNo);
    
    if (data) {
      setRegisterData(data);
      setIsRegistered(true);
      setStep('success');
      
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

  const handleBack = () => {
    if (step === 'otp') {
      setStep('mobile');
      setOtp('');
      setOtpError(null);
    } else if (step === 'mobile' && onBackClick) {
      onBackClick();
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setOtpError(null);
    handleSendOtp();
  };

  if (isRegistered && registerData && step === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-white/50 mb-1">Registered Mobile</p>
                <p className="text-sm font-mono text-white/80">+91 {mobileNo}</p>
              </div>
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
        <CardHeader className="text-center">
          {(step !== 'mobile' || onBackClick) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="absolute left-4 top-4 text-white/50 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            {step === 'mobile' ? (
              <Phone className="w-6 h-6 text-white" />
            ) : (
              <MessageSquare className="w-6 h-6 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {step === 'mobile' ? 'Create New Session' : 'Verify OTP'}
          </CardTitle>
          <CardDescription className="text-white/70">
            {step === 'mobile' 
              ? 'Verify your mobile number to create a new session' 
              : `Enter the 6-digit OTP sent to +91 ${mobileNo}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'mobile' && (
            <>
              <div className="space-y-2">
                <label htmlFor="registerMobileNo" className="text-sm font-medium text-white/80">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <span className="text-white/60 text-sm font-medium">+91</span>
                    <span className="mx-1 text-white/30">|</span>
                  </div>
                  <Input
                    id="registerMobileNo"
                    type="tel"
                    value={mobileNo}
                    onChange={handleMobileChange}
                    placeholder="Enter your mobile number"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 pl-14"
                    maxLength={15}
                    disabled={otpLoading}
                  />
                </div>
                <p className="text-xs text-white/50">
                  Mobile number used for OTP verification and future logins
                </p>
              </div>

              {otpError && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{otpError}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSendOtp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={otpLoading || mobileNo.length < 8}
              >
                {otpLoading ? 'Sending OTP...' : 'Send OTP & Create Session'}
              </Button>

              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                onClick={handleBack}
                disabled={otpLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="registerOtp" className="text-sm font-medium text-white/80">
                  OTP
                </label>
                <Input
                  id="registerOtp"
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
                  {otpSent ? 'OTP has been sent to your mobile' : 'Click resend if you did not receive OTP'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleResendOtp}
                  className="text-green-400 hover:text-green-300 hover:bg-transparent p-0 text-sm"
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

              <Button
                onClick={handleVerifyOtpAndRegister}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={otpLoading || otp.length < 6}
              >
                {otpLoading ? 'Verifying & Creating Session...' : 'Verify & Create Session'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}