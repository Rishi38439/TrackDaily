// Client-side OTP service using API calls

export interface SendOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  devOtp?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  verified?: boolean;
  error?: string;
  verificationToken?: string;
  message?: string;
}

export async function sendOtp(mobileNumber: string): Promise<SendOtpResult> {
  try {
    const response = await fetch('/api/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', mobileNumber }),
    });
    return (await response.json()) as SendOtpResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyOtp(mobileNumber: string, otp: string): Promise<VerifyOtpResult> {
  try {
    const response = await fetch('/api/otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', mobileNumber, otp }),
    });
    return (await response.json()) as VerifyOtpResult;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify OTP. Please try again.' };
  }
}
