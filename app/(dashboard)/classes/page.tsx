'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getClasses, createClass, updateClass, getClassEnrollments } from '@/lib/api';
import { Plus, Users, X } from 'lucide-react';

type GymClass = {
  _id: string;
  className: string;
  scheduledTime: string;
  capacity: number;
  enrolledCount: number;
  status: string;
};

const emptyForm = { className: '', scheduledTime: '', capacity: 20 };

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState<{ id: string; data: any[] } | null>(null);

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => getClasses().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      editId ? updateClass(editId, data) : createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setShowForm(false);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to save class'),
  });

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (c: GymClass) => {
    setForm({ className: c.className, scheduledTime: c.scheduledTime.slice(0, 16), capacity: c.capacity });
    setEditId(c._id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    saveMutation.mutate(form);
  };

  const viewEnrollments = async (id: string) => {
    const { data } = await getClassEnrollments(id);
   const enrollmentsData = data.data || [];
    setEnrollments({ id, data: enrollmentsData });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 text-sm mt-1">{classes.length} class{classes.length !== 1 ? 'es' : ''} assigned</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Class</Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">{editId ? 'Edit Class' : 'Create New Class'}</CardTitle>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Class Name</Label>
                <Input placeholder="Morning Yoga" value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Scheduled Time</Label>
                <Input type="datetime-local" value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} required />
              </div>
              {error && <p className="col-span-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</p>}
              <div className="col-span-3 flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : editId ? 'Update Class' : 'Create Class'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {enrollments && (
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Enrollments</CardTitle>
            <button onClick={() => setEnrollments(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </CardHeader>
          <CardContent>
            {enrollments.data.length === 0 ? (
              <p className="text-sm text-gray-400">No enrollments yet</p>
            ) : (
              <div className="space-y-2">
                {enrollments.data.map((e: any) => (
                  <div key={e._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
                    <span className="text-gray-700">{e.traineeId?.userId?.email || 'Trainee'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">{new Date(e.enrolledAt).toLocaleDateString()}</span>
                      <Badge label={e.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {classes.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center py-12">No classes yet. Create your first class!</p>
        )}
        {classes.map((c: GymClass) => (
          <Card key={c._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{c.className}</h3>
                <Badge label={c.status} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{new Date(c.scheduledTime).toLocaleString()}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <Users className="h-3.5 w-3.5" />
                <span>{c.enrolledCount} / {c.capacity} enrolled</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min((c.enrolledCount / c.capacity) * 100, 100)}%` }}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => viewEnrollments(c._id)}>
                  <Users className="h-3.5 w-3.5 mr-1" />Enrollments
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
