import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, Navigation, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import TrustBadges from '@/components/TrustBadges';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

const formatSlot = (slot: string) => {
  const [h] = slot.split(':');
  const hour = parseInt(h);
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
};

const getISTDate = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60 * 1000;
  const local = new Date(now.getTime() - tzOffset);
  return local.toISOString().split('T')[0];
};

const getISTHour = () => {
  const now = new Date();
  return now.getHours();
};

/* ─── STAT PILL ─────────────────────────────────────── */
function StatPill({ icon, value }) {
  const { t } = useLanguage();
  return (
    <div className="uc-chip">
      {icon}
      <span>{value}</span>
    </div>
  );
}

/* ─── BOOKING DIALOG ─────────────────────────────────── */
function BookingDialog({ open, onClose, karigar, date, setDate, time, setTime, description, setDescription, availableSlots, todayIST, maxDate, onConfirm }) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <span className="uc-eyebrow mb-1 block">Schedule</span>
          <DialogTitle className="text-xl">Book {karigar?.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</Label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setTime(''); }}
              min={todayIST}
              max={maxDate}
              className="uc-input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time Slot</Label>
            {!date ? (
              <p className="text-sm text-muted-foreground">Select a date first</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-destructive">No available slots for this date</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`rounded-xl border px-1 py-2 text-xs font-semibold transition-all duration-200 ${time === slot ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary text-foreground hover:border-primary/30'}`}
                  >
                    {formatSlot(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Job Description <span className="font-normal normal-case text-muted-foreground/70">(optional)</span>
            </Label>
            <Textarea
              placeholder="Describe the work needed..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="mt-2 flex-row gap-2 sm:justify-stretch">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>{t('cancel')}</Button>
          <Button className="flex-[2] rounded-xl font-semibold" disabled={!date || !time} onClick={onConfirm}>
            {t('confirm_booking')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const KarigarProfile = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const [karigar, setKarigar] = useState<Tables<'karigars'> | null>(null);
  const [reviews, setReviews] = useState<Tables<'reviews'>[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<{ id: string; image_url: string }[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const todayIST = useMemo(() => getISTDate(), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (!date || !id) { setBookedSlots([]); return; }
    const fetchBooked = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('time')
        .eq('karigar_id', id)
        .eq('date', date)
        .in('status', ['pending', 'accepted']);
      setBookedSlots((data || []).map(b => b.time));
    };
    fetchBooked();
  }, [date, id]);

  const availableSlots = useMemo(() => {
    const currentHour = getISTHour();
    return TIME_SLOTS.filter(slot => {
      if (bookedSlots.includes(slot)) return false;
      if (date === todayIST) {
        const slotHour = parseInt(slot.split(':')[0]);
        return slotHour > currentHour;
      }
      return true;
    });
  }, [date, todayIST, bookedSlots]);

  const distance = karigar ? (Number((karigar as any).distance) || (Math.random() * 4 + 0.3).toFixed(1)) : '0';

  useEffect(() => {
    const fetchData = async () => {
      const { data: k } = await supabase.from('karigars').select('*').eq('id', id!).single();
      setKarigar(k);
      const { data: r } = await supabase.from('reviews').select('*').eq('karigar_id', id!).order('created_at', { ascending: false });
      setReviews(r || []);
      const { data: p } = await supabase.from('portfolio_images').select('*').eq('karigar_id', id!).order('created_at', { ascending: false });
      setPortfolioImages(p || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  );

  if (!karigar) return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40">
      <p className="text-muted-foreground">Karigar not found</p>
    </div>
  );

  const initials = karigar.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'K';

  const handleBook = async () => {
    if (!date || !time || !user?.authUser || !user.profile) return;

    const selected = new Date(date);
    const min = new Date(todayIST);
    const max = new Date(maxDate);

    if (selected < min) {
      toast.error('Please choose a date from today onwards.');
      return;
    }

    if (selected > max) {
      toast.error('Bookings can only be made up to 90 days in advance.');
      return;
    }

    await addBooking({
      customer_id: user.authUser.id,
      customer_name: user.profile.name,
      karigar_id: karigar.id,
      karigar_name: karigar.name,
      skill: karigar.skill,
      date,
      time,
      description: description || `${karigar.skill} service requested`,
    });
    setBookingOpen(false);
    toast.success('Booking Confirmed!', { description: `${karigar.name} will be notified.` });
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {/* ── PAGE LABEL ── */}
        <div className="mb-7 animate-fade-in">
          <span className="uc-eyebrow mb-2 block">Karigar</span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Service <span className="text-primary">{t('profile')}</span>
          </h1>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="uc-card mb-6 p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/30">
                <AvatarImage src={karigar.photo ?? undefined} alt={karigar.name} />
                <AvatarFallback className="bg-primary-soft font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-lg font-bold">{karigar.name}</p>
                  <AvailabilityBadge status={(karigar as any).availability || 'available'} />
                </div>
                <p className="mb-1.5 text-sm font-semibold text-primary">{karigar.skill}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-xs font-semibold text-success">Available for Hire</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 h-px bg-border" />

          <div className="mb-4">
            <TrustBadges rating={Number(karigar.rating)} reviewCount={karigar.review_count} completedJobs={karigar.completed_jobs} size="md" />
          </div>

          <div className="mb-5 flex items-center gap-2">
            <StarRating rating={Number(karigar.rating)} />
            <span className="text-sm text-muted-foreground">
              {Number(karigar.rating).toFixed(1)} ({karigar.review_count} reviews)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatPill icon={<Clock className="h-3.5 w-3.5 text-primary" />} value={`${karigar.experience} yrs exp`} />
            <StatPill icon={<Briefcase className="h-3.5 w-3.5 text-primary" />} value={`${karigar.completed_jobs} jobs`} />
            <StatPill icon={<IndianRupee className="h-3.5 w-3.5 text-primary" />} value={`₹${karigar.price}/visit`} />
            <StatPill icon={<MapPin className="h-3.5 w-3.5 text-primary" />} value={karigar.location} />
            <StatPill icon={<Navigation className="h-3.5 w-3.5 text-info" />} value={`${distance} km away`} />
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="uc-card mb-6 p-6">
          <span className="uc-eyebrow mb-2.5 block">Bio</span>
          <p className="text-sm leading-relaxed text-muted-foreground">{karigar.description}</p>
        </div>

        {/* ── BOOK BUTTON ── */}
        {user?.role === 'customer' && (
          <div className="mb-8">
            <Button className="w-full rounded-xl py-6 text-base font-bold" onClick={() => setBookingOpen(true)}>
              Book Service
            </Button>
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {portfolioImages.length > 0 && (
          <div className="mb-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight">Previous Work</h2>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{portfolioImages.length} photos</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {portfolioImages.map(img => (
                <div key={img.id} className="overflow-hidden rounded-2xl border border-border bg-secondary">
                  <img src={img.image_url} alt="Portfolio work" className="aspect-square w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Customer Reviews</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{reviews.length} total</span>
          </div>

          {reviews.length === 0 ? (
            <div className="uc-card p-14 text-center">
              <div className="mb-3.5 text-4xl">⭐</div>
              <p className="text-sm text-foreground">No reviews yet.</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Be the first to book and leave a review!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── BOOKING DIALOG ── */}
      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        karigar={karigar}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        description={description}
        setDescription={setDescription}
        availableSlots={availableSlots}
        todayIST={todayIST}
        maxDate={maxDate}
        onConfirm={handleBook}
      />
    </div>
  );
};

/* ─── REVIEW CARD ────────────────────────────────────── */
function ReviewCard({ r }) {
  const { t } = useLanguage();
  return (
    <div className="uc-card uc-card-hover p-5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-primary/30">
            <AvatarFallback className="bg-primary-soft text-xs font-bold text-primary">
              {r.customer_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold">{r.customer_name}</span>
        </div>
        <StarRating rating={r.rating} size={13} />
      </div>
      <p className="mb-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
      <p className="text-xs text-muted-foreground/70">
        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default KarigarProfile;
