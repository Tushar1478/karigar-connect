import { useState } from 'react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import BookingChat from '@/components/BookingChat';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, IndianRupee, Star, Briefcase, ChevronUp, MessageCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/* ─── AVAILABILITY SELECT ───────────────────────────── */
const AVAIL_OPTIONS = [
  { value: 'available', label: 'Available', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  { value: 'busy',      label: 'Busy',      color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)' },
  { value: 'offline',   label: 'Offline',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)' },
];

function AvailSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = AVAIL_OPTIONS.find(o => o.value === value) || AVAIL_OPTIONS[0];
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 14px', borderRadius: 10,
        border: `1.5px solid ${cur.border}`,
        background: cur.bg, color: cur.color,
        fontSize: '0.82rem', fontWeight: 700,
        cursor: 'pointer', fontFamily: "'Sora',sans-serif",
        transition: 'all .2s',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cur.color, display: 'inline-block', animation: value === 'available' ? 'dotPulse 1.5s infinite' : 'none' }} />
        {cur.label}
        <ChevronDown size={13} style={{ opacity: .6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50,
          background: 'rgba(14,14,20,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
          overflow: 'hidden', minWidth: 140,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          animation: 'dropIn .18s cubic-bezier(.22,1,.36,1)',
        }}>
          {AVAIL_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '10px 14px', border: 'none',
              background: value === opt.value ? opt.bg : 'transparent',
              color: opt.color, fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Sora',sans-serif",
              transition: 'background .15s',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color, display: 'inline-block' }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── STAT CARD ─────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 18, padding: '20px 16px', textAlign: 'center',
      backdropFilter: 'blur(12px)',
      animation: `cardFadeUp .55s cubic-bezier(.22,1,.36,1) ${delay}s both`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        <Icon size={18} color={color} />
      </div>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '1.4rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 5, fontWeight: 300 }}>{label}</p>
    </div>
  );
}

/* ─── PENDING BOOKING CARD ──────────────────────────── */
function PendingCard({ b, onAccept, onReject, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
      border: `1px solid ${hov ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 20, padding: 20,
      transition: 'all .3s cubic-bezier(.22,1,.36,1)',
      transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hov ? '0 12px 36px rgba(0,0,0,0.3)' : 'none',
      animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${index * 0.09}s both`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Yellow top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>{b.customer_name}</h3>
          {b.description && <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', fontWeight: 300, marginBottom: 4 }}>{b.description}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={12} color="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{b.date} · {b.time}</span>
          </div>
        </div>
        <span style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
          New Request
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button onClick={onAccept} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 10, border: 'none',
          background: 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
          backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite',
          color: '#0a0a0f', fontWeight: 700, fontSize: '0.85rem',
          cursor: 'pointer', fontFamily: "'Sora',sans-serif",
          transition: 'transform .2s, box-shadow .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <CheckCircle size={15} /> Accept
        </button>
        <button onClick={onReject} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 10,
          border: '1.5px solid rgba(248,113,113,0.3)',
          background: 'rgba(248,113,113,0.08)',
          color: '#f87171', fontWeight: 600, fontSize: '0.85rem',
          cursor: 'pointer', fontFamily: "'Sora',sans-serif", transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
        >
          <XCircle size={15} /> Reject
        </button>
      </div>
    </div>
  );
}

/* ─── ACTIVE JOB CARD ───────────────────────────────── */
function ActiveCard({ b, expandedChat, setExpandedChat, onComplete, index }) {
  const [hov, setHov] = useState(false);
  const chatOpen = expandedChat === b.id;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: 'linear-gradient(135deg,rgba(56,189,248,0.05),rgba(255,255,255,0.02))',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${hov ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.12)'}`,
      borderRadius: 20, padding: 20,
      transition: 'all .3s cubic-bezier(.22,1,.36,1)',
      transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hov ? '0 12px 36px rgba(56,189,248,0.08)' : 'none',
      animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${index * 0.09}s both`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,rgba(56,189,248,0.6),transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>{b.customer_name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={12} color="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{b.date} · {b.time}</span>
          </div>
        </div>
        <span style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', fontSize: '0.68rem', fontWeight: 700, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
          In Progress
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button onClick={onComplete} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 10,
          border: '1.5px solid rgba(52,211,153,0.35)',
          background: 'rgba(52,211,153,0.15)', color: '#34d399',
          fontWeight: 700, fontSize: '0.82rem',
          cursor: 'pointer', fontFamily: "'Sora',sans-serif", transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; }}
        >
          <CheckCircle size={14} /> Mark Completed
        </button>

        <button onClick={() => setExpandedChat(chatOpen ? null : b.id)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10,
          background: chatOpen ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${chatOpen ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)'}`,
          color: chatOpen ? '#38bdf8' : 'rgba(255,255,255,0.5)',
          fontSize: '0.82rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Sora',sans-serif", transition: 'all .2s',
        }}>
          {chatOpen ? <><ChevronUp size={13} />Hide Chat</> : <><MessageCircle size={13} />Open Chat</>}
        </button>
      </div>

      {chatOpen && (
        <div style={{
          marginTop: 14, borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(56,189,248,0.18)',
          background: 'rgba(56,189,248,0.025)',
          animation: 'chatSlide .3s cubic-bezier(.22,1,.36,1)',
        }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(56,189,248,0.07)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#38bdf8', animation: 'dotPulse 1.5s infinite', boxShadow: '0 0 6px #38bdf8' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', fontFamily: "'Space Mono',monospace" }}>LIVE CHAT</span>
          </div>
          <BookingChat bookingId={b.id} />
        </div>
      )}
    </div>
  );
}

/* ─── COMPLETED JOB CARD ────────────────────────────── */
function CompletedCard({ b, index }) {
  return (
    <div style={{
      background: 'rgba(52,211,153,0.03)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(52,211,153,0.12)',
      borderRadius: 18, padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${index * 0.07}s both`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)' }} />
      <div>
        <h3 style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: 3 }}>{b.customer_name}</h3>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>{b.date}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {b.rating && <StarRating rating={b.rating} size={14} />}
        <span style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>
          Done
        </span>
      </div>
    </div>
  );
}

/* ─── SECTION WRAPPER ───────────────────────────────── */
function Section({ label, count, color, children, emptyMsg }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{label}</h2>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color, background: `${color}18`, border: `1px solid ${color}30`, padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
          {count}
        </span>
      </div>
      {count === 0
        ? <div style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', fontWeight: 300 }}>{emptyMsg}</p>
          </div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      }
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const KarigarDashboard = () => {
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const karigar = user?.karigar;
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>((karigar as any)?.availability || 'available');

  const myBookings  = bookings.filter(b => b.karigar_id === karigar?.id);
  const pending     = myBookings.filter(b => b.status === 'pending');
  const active      = myBookings.filter(b => b.status === 'accepted');
  const completed   = myBookings.filter(b => b.status === 'completed');

  const handleAccept  = async (id: string) => { await updateBookingStatus(id, 'accepted');  toast.success('Booking accepted!'); };
  const handleReject  = async (id: string) => { await updateBookingStatus(id, 'rejected');  toast.info('Booking rejected.'); };
  const handleComplete = async (id: string) => { await updateBookingStatus(id, 'completed'); toast.success('Job marked as completed!'); };

  const handleAvailability = async (val: string) => {
    setAvailability(val);
    if (karigar) {
      await supabase.from('karigars').update({ availability: val } as any).eq('id', karigar.id);
      toast.success(`Status set to ${val}`);
    }
  };

  if (!karigar) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Sora',sans-serif" }}>Loading dashboard...</p>
    </div>
  );

  const initials = karigar.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Sora',sans-serif", color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cardFadeUp{ from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer   { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes dropIn    { from { opacity:0; transform:translateY(-8px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes dotPulse  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.8); } }
        @keyframes chatSlide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes avatarGlow{ 0%,100% { box-shadow:0 0 0 4px rgba(251,146,60,.15),0 0 24px rgba(251,146,60,.1); } 50% { box-shadow:0 0 0 6px rgba(251,146,60,.25),0 0 40px rgba(251,146,60,.2); } }
        .fu-1 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .05s both; }
        .fu-2 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .15s both; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(251,146,60,.3); border-radius:999px; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── WELCOME HERO ── */}
        <div className="fu-1" style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '24px 28px', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {karigar.photo ? (
              <img src={karigar.photo} alt={karigar.name} style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(251,146,60,0.4)', animation: 'avatarGlow 3s ease-in-out infinite', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(249,115,22,.3),rgba(251,146,60,.5))', border: '2px solid rgba(251,146,60,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: '1rem', color: '#fb923c', animation: 'avatarGlow 3s ease-in-out infinite', flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Karigar Dashboard</span>
              <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 4 }}>
                Welcome, <span style={{ color: '#fb923c' }}>{karigar.name}</span>!
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
                {karigar.skill} · {karigar.location}
              </p>
            </div>
          </div>
          <AvailSelect value={availability} onChange={handleAvailability} />
        </div>

        {/* ── STATS ── */}
        <div className="fu-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12, marginBottom: 36 }}>
          <StatCard icon={Briefcase}    label="Completed"  value={karigar.completed_jobs}            color="#34d399" delay={0.05} />
          <StatCard icon={Clock}        label="Pending"    value={pending.length}                    color="#fbbf24" delay={0.1}  />
          <StatCard icon={IndianRupee}  label="Earnings"   value={`₹${karigar.total_earnings}`}      color="#fb923c" delay={0.15} />
          <StatCard icon={Star}         label="Rating"     value={Number(karigar.rating).toFixed(1)} color="#a78bfa" delay={0.2}  />
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 36 }} />

        {/* ── INCOMING REQUESTS ── */}
        <Section label="Incoming Requests" count={pending.length} color="#fbbf24" emptyMsg="No pending requests right now.">
          {pending.map((b, i) => (
            <PendingCard key={b.id} b={b} index={i}
              onAccept={() => handleAccept(b.id)}
              onReject={() => handleReject(b.id)}
            />
          ))}
        </Section>

        {/* ── ACTIVE JOBS ── */}
        <Section label="Active Jobs" count={active.length} color="#38bdf8" emptyMsg="No active jobs at the moment.">
          {active.map((b, i) => (
            <ActiveCard key={b.id} b={b} index={i}
              expandedChat={expandedChat}
              setExpandedChat={setExpandedChat}
              onComplete={() => handleComplete(b.id)}
            />
          ))}
        </Section>

        {/* ── COMPLETED JOBS ── */}
        <Section label="Completed Jobs" count={completed.length} color="#34d399" emptyMsg="No completed jobs yet.">
          {completed.map((b, i) => <CompletedCard key={b.id} b={b} index={i} />)}
        </Section>

      </main>
    </div>
  );
};

export default KarigarDashboard;