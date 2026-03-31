'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSchedule } from '@/lib/api';
import { Clock } from 'lucide-react';

type Slot = { day: string; from: string; to: string };

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_COLORS: Record<string, string> = {
  Monday: 'bg-blue-50 border-blue-200 text-blue-700',
  Tuesday: 'bg-purple-50 border-purple-200 text-purple-700',
  Wednesday: 'bg-green-50 border-green-200 text-green-700',
  Thursday: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  Friday: 'bg-orange-50 border-orange-200 text-orange-700',
  Saturday: 'bg-pink-50 border-pink-200 text-pink-700',
  Sunday: 'bg-red-50 border-red-200 text-red-700',
};

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedule().then(({ data }) => setSchedule(data)).finally(() => setLoading(false));
  }, []);

  const grouped = DAY_ORDER.reduce<Record<string, Slot[]>>((acc, day) => {
    const slots = schedule.filter(s => s.day === day);
    if (slots.length) acc[day] = slots;
    return acc;
  }, {});

  const totalHours = schedule.reduce((acc, s) => {
    const [fh, fm] = s.from.split(':').map(Number);
    const [th, tm] = s.to.split(':').map(Number);
    return acc + (th + tm / 60) - (fh + fm / 60);
  }, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">Your weekly availability</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{totalHours.toFixed(1)} hrs/week</span>
        </div>
      </div>

      {schedule.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No schedule set yet.</p>
            <p className="text-sm mt-1">Go to Profile to add your availability slots.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([day, slots]) => (
            <Card key={day} className={`border ${DAY_COLORS[day]?.split(' ')[1] || 'border-gray-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-semibold ${DAY_COLORS[day]?.split(' ')[2] || 'text-gray-700'}`}>
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {slots.map((s, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${DAY_COLORS[day] || 'bg-gray-50 border-gray-200'}`}>
                    <Clock className="h-3.5 w-3.5 opacity-60" />
                    <span className="text-sm font-medium">{s.from} – {s.to}</span>
                    <span className="ml-auto text-xs opacity-60">
                      {(() => {
                        const [fh, fm] = s.from.split(':').map(Number);
                        const [th, tm] = s.to.split(':').map(Number);
                        const hrs = (th + tm / 60) - (fh + fm / 60);
                        return hrs.toFixed(1) + 'h';
                      })()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {schedule.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Weekly Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {DAY_ORDER.map(day => {
                const slots = schedule.filter(s => s.day === day);
                const hrs = slots.reduce((acc, s) => {
                  const [fh, fm] = s.from.split(':').map(Number);
                  const [th, tm] = s.to.split(':').map(Number);
                  return acc + (th + tm / 60) - (fh + fm / 60);
                }, 0);
                return (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">{day.slice(0, 3)}</p>
                    <div className={`rounded-lg py-2 text-xs font-semibold ${hrs > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                      {hrs > 0 ? hrs.toFixed(1) + 'h' : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
