'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyOtp, resendOtp } from '@/lib/api';

export default function VerifyOtpPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const { data } = await verifyOtp(email, otp);
      console.log(data)
      sessionStorage.setItem('setupToken', data.data.setupToken);
      sessionStorage.setItem('setupEmail', email);
      router.push('/set-password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setResending(true); setError(''); setSuccess('');
    try {
      await resendOtp(email);
      setSuccess('OTP resent to your email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="text-4xl font-bold text-blue-600 mb-2">GymPro</div>
        <CardTitle className="text-xl text-gray-800">Verify OTP</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Enter the 6-digit OTP sent to your email by admin</p>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="trainer@gym.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-md">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
            <Link href="/login" className="text-gray-500 hover:underline">Back to Login</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
