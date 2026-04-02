'use client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getProfile, getClasses, getTrainees } from '@/lib/api';
import { Users, CalendarDays, Star, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile().then(r => r.data.data) });
  const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: () => getClasses().then(r => r.data.data) });
  const { data: trainees = [], isLoading } = useQuery({ queryKey: ['trainees'], queryFn: () => getTrainees().then(r => r.data.data) });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const stats = [
    { label: 'Total Classes', value: classes.length, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Trainees', value: trainees.length, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Experience', value: (profile?.experience ?? '—') + ' yrs', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Hourly Fee', value: profile?.fees != null ? '$' + profile.fees : '—', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.name ?? 'Trainer'} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Here is your training overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Classes</CardTitle></CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-gray-400 text-sm">No classes assigned yet</p>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 5).map((c: any) => (
                  <div key={c._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{c.className}</p>
                      <p className="text-xs text-gray-500">{new Date(c.scheduledTime).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{c.enrolledCount}/{c.capacity}</span>
                      <Badge label={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Trainees</CardTitle></CardHeader>
          <CardContent>
            {trainees.length === 0 ? (
              <p className="text-gray-400 text-sm">No trainees assigned yet</p>
            ) : (
              <div className="space-y-3">
                {trainees.slice(0, 5).map((t: any) => (
                  <div key={t._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{t.userId?.email || 'Trainee'}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(t.joiningDate).toLocaleDateString()}</p>
                    </div>
                    <Badge label={t.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
