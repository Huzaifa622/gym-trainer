'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { setPassword } from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
];

export default function SetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setTokens } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const e = sessionStorage.getItem('setupEmail');
    const t = sessionStorage.getItem('setupToken');
    if (!e || !t) router.replace('/verify-otp');
    else setEmail(e);
  }, [router]);

  const allRulesPassed = rules.every(r => r.test(newPassword));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    const setupToken = sessionStorage.getItem('setupToken') || '';
    setLoading(true);
    try {
      const { data } = await setPassword(email, newPassword, confirmPassword, setupToken);
      setTokens(data.data.token);
      sessionStorage.removeItem('setupToken');
      sessionStorage.removeItem('setupEmail');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="text-4xl font-bold text-blue-600 mb-2">GymPro</div>
        <CardTitle className="text-xl text-gray-800">Set Your Password</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Create a strong password for your account</p>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-gray-50 text-gray-500" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          {newPassword && (
            <div className="space-y-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
              {rules.map(r => (
                <div key={r.label} className="flex items-center gap-2 text-xs">
                  {r.test(newPassword)
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    : <XCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
                  <span className={r.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>{r.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !allRulesPassed || newPassword !== confirmPassword}
          >
            {loading ? 'Setting password...' : 'Set Password & Login'}
          </Button>
          <p className="text-center text-sm">
            <Link href="/verify-otp" className="text-gray-500 hover:underline">Back to OTP</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
