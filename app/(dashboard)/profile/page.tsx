'use client';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getProfile, updateProfile, uploadProfilePicture } from '@/lib/api';
import { Camera, Plus, Trash2 } from 'lucide-react';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile().then(({ data }) => {
      setProfile(data);
      setForm({
        name: data.name,
        fees: data.fees,
        specialty: data.specialty,
        experience: data.experience,
        level: data.level,
        availability: data.availability || [],
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const { data } = await updateProfile(form);
      setProfile(data);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadProfilePicture(file);
      setProfile((p: any) => ({ ...p, profilePic: data.profilePic }));
      setSuccess('Profile picture updated');
    } catch {
      setError('Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  const addSlot = () =>
    setForm((f: any) => ({ ...f, availability: [...f.availability, { day: 'Monday', from: '08:00', to: '17:00' }] }));

  const removeSlot = (i: number) =>
    setForm((f: any) => ({ ...f, availability: f.availability.filter((_: any, idx: number) => idx !== i) }));

  const updateSlot = (i: number, key: string, val: string) =>
    setForm((f: any) => {
      const av = [...f.availability];
      av[i] = { ...av[i], [key]: val };
      return { ...f, availability: av };
    });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.profilePic} />
              <AvatarFallback className="text-xl">{profile?.name?.[0]}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
            <p className="text-gray-500 text-sm">{profile?.specialty}</p>
            <div className="flex gap-2 mt-2">
              <Badge label={profile?.level} />
              {uploading && <span className="text-xs text-blue-600">Uploading...</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Specialty</Label>
              <Input value={form.specialty || ''} onChange={e => setForm((f: any) => ({ ...f, specialty: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Hourly Fee ($)</Label>
              <Input type="number" min={0} value={form.fees || ''} onChange={e => setForm((f: any) => ({ ...f, fees: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Experience (years)</Label>
              <Input type="number" min={0} value={form.experience || ''} onChange={e => setForm((f: any) => ({ ...f, experience: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <select
                value={form.level || ''}
                onChange={e => setForm((f: any) => ({ ...f, level: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Availability Schedule</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSlot}>
              <Plus className="h-4 w-4 mr-1" />Add Slot
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.availability?.length === 0 && (
              <p className="text-sm text-gray-400">No availability slots added</p>
            )}
            {form.availability?.map((slot: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg flex-wrap">
                <select
                  value={slot.day}
                  onChange={e => updateSlot(i, 'day', e.target.value)}
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <Input type="time" value={slot.from} onChange={e => updateSlot(i, 'from', e.target.value)} className="w-32" />
                <span className="text-gray-400 text-sm">to</span>
                <Input type="time" value={slot.to} onChange={e => updateSlot(i, 'to', e.target.value)} className="w-32" />
                <button type="button" onClick={() => removeSlot(i)} className="text-red-500 hover:text-red-700 ml-auto">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-md">{success}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </div>
  );
}
