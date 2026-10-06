import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StarRatingInput from '@/components/StarRatingInput';
import BookingStatusTracker from '@/components/BookingStatusTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  User, Mail, Phone, MapPin, Pencil, X, Check,
  Clock, Star, ChevronRight, Loader2,
} from 'lucide-react';

/* ─── STATUS CONFIG ─────────────────────────────────── */
const STATUS_META = {
  pending:    { label: 'Pending',    className: 'bg-warning/15 text-warning' },
  accepted:   { label: 'Accepted',   className: 'bg-info/15 text-info' },
  on_the_way: { label: 'On the Way', className: 'bg-info/15 text-info' },
  completed:  { label: 'Completed',  className: 'bg-success/15 text-success' },
  rejected:   { label: 'Rejected',   className: 'bg-destructive/10 text-destructive' },
};

/* ─── PROFILE FIELD ROW ─────────────────────────────── */
function ProfileField({ icon, label, value }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-secondary/60 px-4 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <div>
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`text-sm ${value ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{value || 'Not set'}</p>
      </div>
    </div>
  );
}

/* ─── BOOKING CARD ──────────────────────────────────── */
function BookingCard({ b, onRate }) {
  const { t } = useLanguage();
  const meta = STATUS_META[b.status] || STATUS_META.pending;
  return (
    <div className="uc-card uc-card-hover p-5">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="mb-1 text-base font-bold">{b.karigar_name}</h3>
          <span className="text-sm font-semibold text-primary">{b.skill}</span>
        </div>
        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      <div className="mb-3.5 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{b.date} · {b.time}</span>
      </div>

      {b.status !== 'rejected' && (
        <div className="mb-3.5">
          <BookingStatusTracker status={b.status} />
        </div>
      )}

      {b.rating && (
        <div className="mb-1 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2.5">
          <StarRating rating={b.rating} size={13} />
          {b.review && <span className="text-sm text-muted-foreground">{b.review}</span>}
        </div>
      )}

      {b.status === 'completed' && !b.rating && (
        <Button variant="outline" size="sm" className="mt-1 gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10" onClick={onRate}>
          <Star className="h-3.5 w-3.5 fill-primary" />
          Rate this Service
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

/* ─── RATING DIALOG ─────────────────────────────────── */
function RatingDialog({ open, onClose, onSubmit, rating, setRating, review, setReview }) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <span className="uc-eyebrow mb-1 block">Review</span>
          <DialogTitle className="text-xl">Rate this Service</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-5">
          <StarRatingInput value={rating} onChange={setRating} />
          <Textarea
            placeholder="Write a review (optional)..."
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={3}
            className="resize-none rounded-xl"
          />
        </div>
        <DialogFooter className="mt-2 flex-row gap-2 sm:justify-stretch">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>{t('cancel')}</Button>
          <Button className="flex-[2] rounded-xl font-semibold" disabled={rating === 0} onClick={onSubmit}>Submit Rating</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const CustomerProfile = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { bookings, rateBooking } = useBookings();
  const profile = user?.profile;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '', location: profile?.location || '' });
  const [saving, setSaving] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(null);
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

  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {/* ── PAGE LABEL ── */}
        <div className="mb-7 animate-fade-in">
          <span className="uc-eyebrow mb-2 block">Account</span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            My <span className="text-primary">{t('profile')}</span>
          </h1>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="uc-card mb-8 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/30">
                <AvatarFallback className="bg-primary-soft font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="mb-1 text-lg font-bold">{profile.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-xs font-semibold text-success">Active Customer</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 rounded-xl ${editing ? 'border-destructive/40 text-destructive hover:bg-destructive/10' : ''}`}
              onClick={() => { setEditing(!editing); setForm({ name: profile.name, phone: profile.phone, location: profile.location }); }}
            >
              {editing ? <><X className="h-3.5 w-3.5" />{t('cancel')}</> : <><Pencil className="h-3.5 w-3.5" />Edit</>}
            </Button>
          </div>

          <div className="mb-5 h-px bg-border" />

          {editing ? (
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</Label>
                <Input className="rounded-xl" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</Label>
                <Input className="rounded-xl" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('location')}</Label>
                <Input className="rounded-xl" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <Button className="mt-1 gap-2 rounded-xl font-semibold" disabled={saving} onClick={handleSave}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Check className="h-4 w-4" />Save Changes</>}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <ProfileField icon={<User className="h-4 w-4" />} label="Name" value={profile.name} />
              <ProfileField icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
              <ProfileField icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
              <ProfileField icon={<MapPin className="h-4 w-4" />} label="Location" value={profile.location} />
            </div>
          )}
        </div>

        {/* ── BOOKINGS ── */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">{t('my_bookings')}</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{myBookings.length} total</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="uc-card p-14 text-center">
              <div className="mb-3.5 text-4xl">📋</div>
              <p className="text-sm text-foreground">No bookings yet.</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Book a karigar to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {myBookings.map(b => (
                <BookingCard
                  key={b.id}
                  b={b}
                  onRate={() => setRatingDialog({ id: b.id, karigarId: b.karigar_id })}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── RATING DIALOG ── */}
      <RatingDialog
        open={!!ratingDialog}
        onClose={() => setRatingDialog(null)}
        onSubmit={handleRate}
        rating={rating}
        setRating={setRating}
        review={review}
        setReview={setReview}
      />
    </div>
  );
};

export default CustomerProfile;
