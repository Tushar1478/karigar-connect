import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import BookingChat from '@/components/BookingChat';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, IndianRupee, Star, Briefcase, ChevronUp, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/* ─── AVAILABILITY SELECT ───────────────────────────── */
const AVAIL_OPTIONS = [
  { value: 'available', label: 'Available', dot: 'bg-success' },
  { value: 'busy', label: 'Busy', dot: 'bg-warning' },
  { value: 'offline', label: 'Offline', dot: 'bg-muted-foreground' },
];

function AvailSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cur = AVAIL_OPTIONS.find((o) => o.value === value) || AVAIL_OPTIONS[0];
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[150px] rounded-xl border-success/30 bg-success/10 font-semibold text-success">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${cur.dot}`} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {AVAIL_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
              {opt.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ─── STAT CARD ─────────────────────────────────────── */
function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  const { t } = useLanguage();
  return (
    <div className="uc-card text-center p-5 animate-fade-in">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon size={18} />
      </div>
      <p className="text-xl font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── PENDING BOOKING CARD ──────────────────────────── */
function PendingCard({ b, onAccept, onReject }: { b: any; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="uc-card uc-card-hover p-5 animate-fade-in">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="mb-1 font-bold text-foreground">{b.customer_name}</h3>
          {b.description && <p className="mb-1 text-sm text-muted-foreground">{b.description}</p>}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span className="text-xs">{b.date} · {b.time}</span>
          </div>
        </div>
        <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
          New Request
        </span>
      </div>

      <div className="mt-3.5 flex gap-2">
        <Button onClick={onAccept} className="flex-1 rounded-xl font-semibold">
          <CheckCircle size={15} className="mr-1.5" /> Accept
        </Button>
        <Button onClick={onReject} variant="outline" className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <XCircle size={15} className="mr-1.5" /> Reject
        </Button>
      </div>
    </div>
  );
}

/* ─── ACTIVE JOB CARD ───────────────────────────────── */
function ActiveCard({ b, expandedChat, setExpandedChat, onComplete }: { b: any; expandedChat: string | null; setExpandedChat: (id: string | null) => void; onComplete: () => void }) {
  const chatOpen = expandedChat === b.id;
  return (
    <div className="uc-card uc-card-hover p-5 animate-fade-in border-primary/20 bg-primary-soft/30">
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <h3 className="mb-1 font-bold text-foreground">{b.customer_name}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={12} />
            <span className="text-xs">{b.date} · {b.time}</span>
          </div>
        </div>
        <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          In Progress
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onComplete} className="rounded-xl bg-success text-success-foreground font-semibold hover:bg-success/90">
          <CheckCircle size={14} className="mr-1.5" /> {t('mark_completed')}
        </Button>

        <Button
          onClick={() => setExpandedChat(chatOpen ? null : b.id)}
          variant="outline"
          className={`rounded-xl ${chatOpen ? 'border-primary/40 text-primary' : ''}`}
        >
          {chatOpen ? <><ChevronUp size={13} className="mr-1.5" />Hide Chat</> : <><MessageCircle size={13} className="mr-1.5" />Open Chat</>}
        </Button>
      </div>

      {chatOpen && (
        <div className="mt-3.5 animate-fade-in overflow-hidden rounded-2xl border border-primary/20">
          <div className="flex items-center gap-2 border-b border-primary/10 bg-primary/5 px-4 py-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="uc-eyebrow">Live Chat</span>
          </div>
          <BookingChat bookingId={b.id} />
        </div>
      )}
    </div>
  );
}

/* ─── COMPLETED JOB CARD ────────────────────────────── */
function CompletedCard({ b }: { b: any }) {
  const { t } = useLanguage();
  return (
    <div className="uc-card flex items-center justify-between gap-3 border-success/20 bg-success/5 px-5 py-4 animate-fade-in">
      <div>
        <h3 className="mb-0.5 text-sm font-semibold text-foreground">{b.customer_name}</h3>
        <span className="text-xs text-muted-foreground">{b.date}</span>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2.5">
        {b.rating && <StarRating rating={b.rating} size={14} />}
        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
          Done
        </span>
      </div>
    </div>
  );
}

/* ─── SECTION WRAPPER ───────────────────────────────── */
function Section({ label, count, badgeClass, children, emptyMsg }: { label: string; count: number; badgeClass: string; children: React.ReactNode; emptyMsg: string }) {
  const { t } = useLanguage();
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center gap-2.5">
        <h2 className="text-base font-bold tracking-tight">{label}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
          {count}
        </span>
      </div>
      {count === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/60 px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">{emptyMsg}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">{children}</div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const KarigarDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const karigar = user?.karigar;
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>((karigar as any)?.availability || 'available');

  const myBookings = bookings.filter((b) => b.karigar_id === karigar?.id);
  const pending = myBookings.filter((b) => b.status === 'pending');
  const active = myBookings.filter((b) => b.status === 'accepted');
  const completed = myBookings.filter((b) => b.status === 'completed');

  const handleAccept = async (id: string) => { await updateBookingStatus(id, 'accepted'); toast.success('Booking accepted!'); };
  const handleReject = async (id: string) => { await updateBookingStatus(id, 'rejected'); toast.info('Booking rejected.'); };
  const handleComplete = async (id: string) => { await updateBookingStatus(id, 'completed'); toast.success('Job marked as completed!'); };

  const handleAvailability = async (val: string) => {
    setAvailability(val);
    if (karigar) {
      await supabase.from('karigars').update({ availability: val } as any).eq('id', karigar.id);
      toast.success(`Status set to ${val}`);
    }
  };

  if (!karigar) return (
    <div className="grid min-h-screen place-items-center bg-secondary/40">
      <p className="text-muted-foreground">Loading dashboard...</p>
    </div>
  );

  const initials = karigar.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />

      <main className="uc-container py-8">
        {/* ── WELCOME HERO ── */}
        <div className="uc-card mb-7 flex flex-wrap items-center justify-between gap-4 p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/30">
              <AvatarImage src={karigar.photo} alt={karigar.name} />
              <AvatarFallback className="bg-primary-soft font-bold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <span className="uc-eyebrow mb-1 block">Karigar Dashboard</span>
              <h1 className="mb-1 text-xl font-extrabold tracking-tight leading-tight sm:text-2xl">
                Welcome, <span className="text-primary">{karigar.name}</span>!
              </h1>
              <p className="text-sm text-muted-foreground">
                {karigar.skill} · {karigar.location}
              </p>
            </div>
          </div>
          <AvailSelect value={availability} onChange={handleAvailability} />
        </div>

        {/* ── STATS ── */}
        <div className="mb-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Briefcase} label="Completed" value={karigar.completed_jobs} />
          <StatCard icon={Clock} label="Pending" value={pending.length} />
          <StatCard icon={IndianRupee} label="Earnings" value={`₹${karigar.total_earnings}`} />
          <StatCard icon={Star} label="Rating" value={Number(karigar.rating).toFixed(1)} />
        </div>

        {/* ── INCOMING REQUESTS ── */}
        <Section label="Incoming Requests" count={pending.length} badgeClass="bg-warning/15 text-warning" emptyMsg="No pending requests right now.">
          {pending.map((b) => (
            <PendingCard key={b.id} b={b}
              onAccept={() => handleAccept(b.id)}
              onReject={() => handleReject(b.id)}
            />
          ))}
        </Section>

        {/* ── ACTIVE JOBS ── */}
        <Section label="Active Jobs" count={active.length} badgeClass="bg-primary/10 text-primary" emptyMsg="No active jobs at the moment.">
          {active.map((b) => (
            <ActiveCard key={b.id} b={b}
              expandedChat={expandedChat}
              setExpandedChat={setExpandedChat}
              onComplete={() => handleComplete(b.id)}
            />
          ))}
        </Section>

        {/* ── COMPLETED JOBS ── */}
        <Section label="Completed Jobs" count={completed.length} badgeClass="bg-success/10 text-success" emptyMsg="No completed jobs yet.">
          {completed.map((b) => <CompletedCard key={b.id} b={b} />)}
        </Section>
      </main>
    </div>
  );
};

export default KarigarDashboard;
