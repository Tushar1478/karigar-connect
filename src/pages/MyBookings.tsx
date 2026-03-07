import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StarRatingInput from '@/components/StarRatingInput';
import BookingStatusTracker from '@/components/BookingStatusTracker';
import BookingChat from '@/components/BookingChat';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Clock, Star, ChevronRight, X, MessageCircle,
  ChevronUp, Loader2, Check, AlertTriangle
} from 'lucide-react';

/* ─── STATUS CONFIG ─────────────────────────────────── */
const STATUS_META = {
  pending:    { label: 'Pending',    color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  step: 0 },
  accepted:   { label: 'Accepted',   color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)',  step: 1 },
  on_the_way: { label: 'On the Way', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',border: 'rgba(167,139,250,0.3)', step: 2 },
  completed:  { label: 'Completed',  color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)',  step: 3 },
  rejected:   { label: 'Rejected',   color: '#f87171', bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.3)', step: -1 },
  cancelled:  { label: 'Cancelled',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', step: -1 },
};

const STEPS = ['Pending', 'Accepted', 'On the Way', 'Completed'];

/* ─── CONFETTI ──────────────────────────────────────── */
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const COLORS = ['#fb923c','#fde68a','#34d399','#38bdf8','#a78bfa','#f472b6','#fff'];
    particles.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      size: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.08;
        p.rot += p.rotV;
        if (p.y > canvas.height * 0.6) p.opacity -= 0.015;
        p.opacity = Math.max(0, p.opacity);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      particles.current = particles.current.filter(p => p.opacity > 0);
      if (particles.current.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', borderRadius: 20, zIndex: 10,
      }}
    />
  );
}

/* ─── PROGRESS BAR ──────────────────────────────────── */
function ProgressBar({ status }) {
  const meta = STATUS_META[status];
  if (!meta || meta.step < 0) return null;
  const pct = (meta.step / (STEPS.length - 1)) * 100;

  return (
    <div style={{ marginTop: 14, marginBottom: 4 }}>
      {/* Step labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {STEPS.map((s, i) => {
          const done    = i < meta.step;
          const current = i === meta.step;
          return (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: done || current
                  ? done ? 'rgba(52,211,153,0.2)' : `${meta.color}22`
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${done ? '#34d399' : current ? meta.color : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s ease',
                boxShadow: current ? `0 0 10px ${meta.color}55` : 'none',
              }}>
                {done
                  ? <Check size={11} color="#34d399" />
                  : current
                    ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, animation: 'pulse 1.5s infinite' }} />
                    : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                }
              </div>
              <span style={{
                fontSize: '0.58rem', fontWeight: current ? 700 : 400,
                color: done ? '#34d399' : current ? meta.color : 'rgba(255,255,255,0.25)',
                transition: 'color 0.4s', textAlign: 'center', lineHeight: 1.2,
                display: 'none',  // hide on small, show on md
              }}>{s}</span>
            </div>
          );
        })}
      </div>

      {/* Bar track */}
      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          background: status === 'completed'
            ? 'linear-gradient(90deg,#34d399,#6ee7b7)'
            : `linear-gradient(90deg,${meta.color}cc,${meta.color})`,
          width: `${pct}%`,
          transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: `0 0 10px ${meta.color}66`,
        }} />
        {/* shimmer overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%)',
          backgroundSize: '200% 100%',
          animation: pct > 0 && pct < 100 ? 'progressShimmer 2s linear infinite' : 'none',
          borderRadius: 999,
        }} />
      </div>

      {/* Percentage label */}
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', fontFamily: "'Space Mono',monospace" }}>
          Step {meta.step + 1} of {STEPS.length}
        </span>
        <span style={{ fontSize: '0.68rem', color: meta.color, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

/* ─── RATING DIALOG ─────────────────────────────────── */
function RatingDialog({ open, onClose, onSubmit, rating, setRating, review, setReview }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
      animation: 'fadeIn .2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'rgba(14,14,20,0.98)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(251,146,60,0.25)',
        borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, margin: 16,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'dialogPop .3s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Review</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Rate this Service</h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <StarRatingInput value={rating} onChange={setRating} />
          <textarea
            placeholder="Write a review (optional)..."
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 14px',
              color: '#fff', fontSize: '0.875rem', resize: 'none',
              fontFamily: "'Sora',sans-serif", outline: 'none',
              transition: 'border-color .2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(251,146,60,0.5)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 11, borderRadius: 12,
            border: '1.5px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Sora',sans-serif",
          }}>Cancel</button>
          <button onClick={onSubmit} disabled={rating === 0} style={{
            flex: 2, padding: 11, borderRadius: 12, border: 'none',
            background: rating === 0 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
            backgroundSize: '200% auto',
            color: rating === 0 ? 'rgba(255,255,255,0.25)' : '#0a0a0f',
            fontSize: '0.875rem', fontWeight: 700,
            cursor: rating === 0 ? 'not-allowed' : 'pointer',
            fontFamily: "'Sora',sans-serif",
            animation: rating > 0 ? 'shimmer 3s linear infinite' : 'none',
          }}>Submit Rating</button>
        </div>
      </div>
    </div>
  );
}

/* ─── BOOKING CARD ──────────────────────────────────── */
function BookingCard({ b, index, onRate, onCancel, expandedChat, setExpandedChat }) {
  const meta = STATUS_META[b.status] || STATUS_META.pending;
  const [hov, setHov] = useState(false);
  const isCompleted = b.status === 'completed';
  const showProgress = !['rejected','cancelled'].includes(b.status);
  const showChat = ['accepted', 'on_the_way', 'completed'].includes(b.status);
  const chatOpen = expandedChat === b.id;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: isCompleted
          ? 'linear-gradient(135deg,rgba(52,211,153,0.05),rgba(255,255,255,0.02))'
          : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isCompleted ? 'rgba(52,211,153,0.2)' : hov ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20, padding: 20,
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov
          ? isCompleted ? '0 12px 40px rgba(52,211,153,0.12)' : '0 12px 40px rgba(0,0,0,0.3)'
          : 'none',
        animation: `cardFadeUp .55s cubic-bezier(.22,1,.36,1) ${index * 0.09}s both`,
      }}
    >
      {/* Confetti for completed */}
      <Confetti active={isCompleted} />

      {/* Completed glow top border */}
      {isCompleted && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg,transparent,#34d399,transparent)',
          borderRadius: '20px 20px 0 0',
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 4 }}>{b.karigar_name}</h3>
          <span style={{ fontSize: '0.8rem', color: '#fb923c', fontWeight: 600 }}>{b.skill}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{
            background: meta.bg, border: `1px solid ${meta.border}`,
            color: meta.color, fontSize: '0.68rem', fontWeight: 700,
            padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
          }}>
            {isCompleted ? '🎉 ' : ''}{meta.label}
          </span>
        </div>
      </div>

      {/* Date/time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Clock size={12} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
          {b.date} · {b.time}
        </span>
      </div>

      {/* Progress bar */}
      {showProgress && <ProgressBar status={b.status} />}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '14px 0' }} />

      {/* Rating display */}
      {b.rating && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px',
          background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)',
          borderRadius: 10, marginBottom: 10,
        }}>
          <StarRating rating={b.rating} size={13} />
          {b.review && <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>{b.review}</span>}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>

        {/* Rate button */}
        {isCompleted && !b.rating && (
          <button onClick={onRate} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.35)',
            color: '#fb923c', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', transition: 'all .2s', fontFamily: "'Sora',sans-serif",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.1)'; }}
          >
            <Star size={13} fill="#fb923c" />Rate Service<ChevronRight size={13} />
          </button>
        )}

        {/* Cancel button */}
        {(b.status === 'pending' || b.status === 'accepted') && (
          <button onClick={onCancel} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
            color: '#f87171', fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all .2s', fontFamily: "'Sora',sans-serif",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}
          >
            <AlertTriangle size={13} />Cancel Booking
          </button>
        )}

        {/* Chat button */}
        {showChat && (
          <button onClick={() => setExpandedChat(chatOpen ? null : b.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: chatOpen ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${chatOpen ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.1)'}`,
            color: chatOpen ? '#38bdf8' : 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all .2s', fontFamily: "'Sora',sans-serif",
          }}>
            {chatOpen ? <><ChevronUp size={13} />Hide Chat</> : <><MessageCircle size={13} />Open Chat</>}
          </button>
        )}
      </div>

      {/* Chat panel */}
      {showChat && chatOpen && (
        <div style={{
          marginTop: 14,
          animation: 'chatSlide .3s cubic-bezier(.22,1,.36,1)',
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(56,189,248,0.15)',
        }}>
          <BookingChat bookingId={b.id} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const MyBookings = () => {
  const { user } = useAuth();
  const { bookings, rateBooking, updateBookingStatus } = useBookings();
  const [ratingDialog, setRatingDialog] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [expandedChat, setExpandedChat] = useState(null);

  const myBookings = bookings.filter(b => b.customer_id === user?.authUser?.id);

  const handleRate = async () => {
    if (!ratingDialog || rating === 0 || !user?.profile) return;
    await rateBooking(ratingDialog.id, rating, review, ratingDialog.karigarId, user.profile.name);
    toast.success('Rating submitted!');
    setRatingDialog(null); setRating(0); setReview('');
  };

  const handleCancel = async (id) => {
    await updateBookingStatus(id, 'cancelled');
    toast.success('Booking cancelled');
  };

  const counts = {
    total:     myBookings.length,
    active:    myBookings.filter(b => ['pending','accepted','on_the_way'].includes(b.status)).length,
    completed: myBookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Sora',sans-serif", color: '#fff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp       { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cardFadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn       { from { opacity:0; } to { opacity:1; } }
        @keyframes dialogPop    { from { opacity:0; transform:scale(.93) translateY(14px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes shimmer      { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes progressShimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes chatSlide    { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse        { 0%,100% { opacity:1; box-shadow:0 0 0 0 currentColor; } 50% { opacity:.6; } }
        @keyframes spin         { to { transform:rotate(360deg); } }

        .fu-1 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .05s both; }
        .fu-2 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .15s both; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(251,146,60,.3); border-radius: 999px; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── PAGE TITLE ── */}
        <div className="fu-1" style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fb923c', display: 'block', marginBottom: 8 }}>
            Overview
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            My <span style={{ color: '#fb923c' }}>Bookings</span>
          </h1>
        </div>

        {/* ── STATS ROW ── */}
        {myBookings.length > 0 && (
          <div className="fu-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total',     value: counts.total,     color: '#fb923c' },
              { label: 'Active',    value: counts.active,    color: '#38bdf8' },
              { label: 'Completed', value: counts.completed, color: '#34d399' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '16px 18px',
                backdropFilter: 'blur(12px)',
              }}>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 5, fontWeight: 300 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── BOOKING LIST ── */}
        {myBookings.length === 0 ? (
          <div style={{
            padding: '64px 24px', textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            animation: 'fadeUp .5s ease both',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>📋</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', fontWeight: 300 }}>No bookings yet.</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem', marginTop: 6 }}>Book a karigar to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myBookings.map((b, i) => (
              <BookingCard
                key={b.id}
                b={b}
                index={i}
                onRate={() => setRatingDialog({ id: b.id, karigarId: b.karigar_id })}
                onCancel={() => handleCancel(b.id)}
                expandedChat={expandedChat}
                setExpandedChat={setExpandedChat}
              />
            ))}
          </div>
        )}
      </main>

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

export default MyBookings;