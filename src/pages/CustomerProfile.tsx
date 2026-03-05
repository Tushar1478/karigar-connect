import { useState } from 'react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StarRatingInput from '@/components/StarRatingInput';
import BookingStatusTracker from '@/components/BookingStatusTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Pencil } from 'lucide-react';

const statusColor: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  accepted: 'bg-info/15 text-info border-info/30',
  on_the_way: 'bg-info/15 text-info border-info/30',
  completed: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

const CustomerProfile = () => {
  const { user } = useAuth();
  const { bookings, rateBooking } = useBookings();
  const profile = user?.profile;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '', location: profile?.location || '' });
  const [saving, setSaving] = useState(false);
  const [ratingDialog, setRatingDialog] = useState<{ id: string; karigarId: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const myBookings = bookings.filter(b => b.customer_id === user?.authUser?.id);

  const handleSave = async () => {
    if (!user?.authUser) return;
    setSaving(true);
    await supabase.from('profiles').update({ name: form.name, phone: form.phone, location: form.location }).eq('user_id', user.authUser.id);
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated!');
  };

  const handleRate = async () => {
    if (!ratingDialog || rating === 0 || !user?.profile) return;
    await rateBooking(ratingDialog.id, rating, review, ratingDialog.karigarId, user.profile.name);
    toast.success('Rating submitted!');
    setRatingDialog(null);
    setRating(0);
    setReview('');
  };

  if (!profile) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl">
          {/* Profile Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <Button size="sm" variant="outline" onClick={() => { setEditing(!editing); setForm({ name: profile.name, phone: profile.phone, location: profile.location }); }} className="gap-1">
                <Pencil className="h-3.5 w-3.5" />{editing ? 'Cancel' : 'Edit'}
              </Button>
            </div>

            {editing ? (
              <div className="mt-4 space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
                <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm"><User className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.name}</span></div>
                <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.email}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.phone || 'Not set'}</span></div>
                <div className="flex items-center gap-3 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{profile.location || 'Not set'}</span></div>
              </div>
            )}
          </div>

          {/* Bookings */}
          <h2 className="mb-4 mt-8 text-lg font-bold text-foreground">My Bookings</h2>
          {myBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {myBookings.map(b => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.karigar_name}</h3>
                      <p className="text-sm text-primary">{b.skill}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{b.date} · {b.time}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusColor[b.status] || ''}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  {b.status !== 'rejected' && <div className="mt-3"><BookingStatusTracker status={b.status} /></div>}
                  {b.rating && <div className="mt-2 flex items-center gap-2"><StarRating rating={b.rating} size={14} /><span className="text-xs text-muted-foreground">{b.review}</span></div>}
                  {b.status === 'completed' && !b.rating && (
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setRatingDialog({ id: b.id, karigarId: b.karigar_id })}>Rate Service</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!ratingDialog} onOpenChange={() => setRatingDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rate this service</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <StarRatingInput value={rating} onChange={setRating} />
              <Textarea placeholder="Write a review (optional)" value={review} onChange={e => setReview(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRatingDialog(null)}>Cancel</Button>
              <Button onClick={handleRate} disabled={rating === 0}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CustomerProfile;
