'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getTrainees } from '@/lib/api';
import { Mail, Calendar, DollarSign } from 'lucide-react';

type Trainee = {
  _id: string;
  userId: { email: string };
  fees: number;
  joiningDate: string;
  lastActive?: string;
  status: string;
  planId?: { planName: string; planType: string };
};

export default function TraineesPage() {
  const [filter, setFilter] = useState('all');

  const { data: trainees = [], isLoading } = useQuery({
    queryKey: ['trainees'],
    queryFn: () => getTrainees().then(r => r.data.data),
  });

  const filtered = filter === 'all' ? trainees : trainees.filter((t: Trainee) => t.status === filter);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
          <p className="text-gray-500 text-sm mt-1">{trainees.length} trainee{trainees.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'suspended'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">No trainees found</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t: Trainee) => (
          <Card key={t._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{t.userId?.email?.[0]?.toUpperCase() || 'T'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.userId?.email || 'Unknown'}</p>
                  {t.planId && <p className="text-xs text-gray-500 capitalize">{t.planId.planName} · {t.planId.planType}</p>}
                </div>
                <Badge label={t.status} />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{t.userId?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>Joined {new Date(t.joiningDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                  <span>${t.fees}/month</span>
                </div>
                {t.lastActive && (
                  <p className="text-xs text-gray-400">Last active: {new Date(t.lastActive).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
