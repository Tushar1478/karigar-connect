import { useState } from 'react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StarRatingInput from '@/components/StarRatingInput';
import BookingStatusTracker from '@/components/BookingStatusTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, Pencil, X, Check,
  Clock, Star, ChevronRight, Loader2
} from 'lucide-react';

/* ─── STATUS CONFIG ─────────────────────────────────── */
const STATUS_META = {
  pending:    { label: 'Pending',    color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
  accepted:   { label: 'Accepted',   color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)'  },
  on_the_way: { label: 'On the Way', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)'  },
  completed:  { label: 'Completed',  color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)'  },
  rejected:   { label: 'Rejected',   color: '#f87171', bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.3)' },
};

/* ─── GLASS INPUT ───────────────────────────────────── */
function GlassInput({ label, value, onChange, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${focused ? 'rgba(251,146,60,0.55)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12,
          padding: '10px 14px',
          color: '#fff',
          fontSize: '0.9rem',
          fontFamily: "'Sora', sans-serif",
          outline: 'none',
          transition: 'border-color .25s, box-shadow .25s',
          boxShadow: focused ? '0 0 0 3px rgba(251,146,60,0.1)' : 'none',
          width: '100%',
        }}
      />
    </div>
  );
}

/* ─── PROFILE FIELD ROW ─────────────────────────────── */
function ProfileField({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.9rem', color: value ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: value ? 500 : 300 }}>
          {value || 'Not set'}
        </p>
      </div>
    </div>
  );
}

/* ─── BOOKING CARD ──────────────────────────────────── */
function BookingCard({ b, onRate, index }) {
  const meta = STATUS_META[b.status] || STATUS_META.pending;
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hov ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20,
        padding: 20,
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
        animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${index * 0.08}s both`,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{b.karigar_name}</h3>
          <span style={{ fontSize: '0.8rem', color: '#fb923c', fontWeight: 600 }}>{b.skill}</span>
        </div>
        <span style={{
          background: meta.bg, border: `1px solid ${meta.border}`,
          color: meta.color, fontSize: '0.7rem', fontWeight: 700,
          padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap',
          letterSpacing: '0.04em',
        }}>
          {meta.label}
        </span>
      </div>

      {/* Date/time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Clock size={13} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
          {b.date} · {b.time}
        </span>
      </div>

      {/* Status tracker */}
      {b.status !== 'rejected' && (
        <div style={{ marginBottom: 14 }}>
          <BookingStatusTracker status={b.status} />
        </div>
      )}

      {/* Rating display */}
      {b.rating && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px',
          background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)',
          borderRadius: 10, marginBottom: 4,
        }}>
          <StarRating rating={b.rating} size={13} />
          {b.review && <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>{b.review}</span>}
        </div>
      )}

      {/* Rate button */}
      {b.status === 'completed' && !b.rating && (
        <button
          onClick={onRate}
          style={{
            marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 10,
            background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)',
            color: '#fb923c', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', transition: 'all .2s',
            fontFamily: "'Sora', sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.1)'; }}
        >
          <Star size={13} fill="#fb923c" />
          Rate this Service
          <ChevronRight size={13} />
        </button>
      )}
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
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      animation: 'fadeIn .2s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(14,14,20,0.98)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(251,146,60,0.25)',
          borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, margin: 16,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'dialogPop .3s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Review</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Rate this Service</h3>
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
              fontFamily: "'Sora', sans-serif", outline: 'none',
              transition: 'border-color .2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(251,146,60,0.5)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: 12,
            border: '1.5px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Sora',sans-serif", transition: 'all .2s',
          }}>Cancel</button>
          <button onClick={onSubmit} disabled={rating === 0} style={{
            flex: 2, padding: '11px', borderRadius: 12, border: 'none',
            background: rating === 0
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
            backgroundSize: '200% auto',
            color: rating === 0 ? 'rgba(255,255,255,0.25)' : '#0a0a0f',
            fontSize: '0.875rem', fontWeight: 700, cursor: rating === 0 ? 'not-allowed' : 'pointer',
            fontFamily: "'Sora',sans-serif", transition: 'all .2s',
            animation: rating > 0 ? 'shimmer 3s linear infinite' : 'none',
          }}>Submit Rating</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const CustomerProfile = () => {
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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 size={32} color="#fb923c" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Sora',sans-serif" }}>Loading profile...</p>
      </div>
    </div>
  );

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Sora', sans-serif", color: '#fff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cardFadeUp{ from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
        @keyframes dialogPop { from { opacity:0; transform:scale(.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes shimmer   { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes avatarGlow{ 0%,100% { box-shadow:0 0 0 4px rgba(251,146,60,0.15),0 0 24px rgba(251,146,60,0.1); } 50% { box-shadow:0 0 0 6px rgba(251,146,60,0.25),0 0 40px rgba(251,146,60,0.2); } }
        @keyframes spin      { to { transform:rotate(360deg); } }

        .fu-1 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .05s both; }
        .fu-2 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .15s both; }
        .fu-3 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .25s both; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(251,146,60,.3); border-radius: 999px; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── PAGE LABEL ── */}
        <div className="fu-1" style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fb923c', display: 'block', marginBottom: 8 }}>
            Account
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            My <span style={{ color: '#fb923c' }}>Profile</span>
          </h1>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="fu-2" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 28, marginBottom: 32,
        }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(251,146,60,0.5))',
                border: '2px solid rgba(251,146,60,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: '1.1rem',
                color: '#fb923c', flexShrink: 0,
                animation: 'avatarGlow 3s ease-in-out infinite',
              }}>{initials}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 3 }}>{profile.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Active Customer</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setEditing(!editing); setForm({ name: profile.name, phone: profile.phone, location: profile.location }); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                border: `1.5px solid ${editing ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.12)'}`,
                background: editing ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.04)',
                color: editing ? '#f87171' : 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all .2s', fontFamily: "'Sora',sans-serif",
              }}
            >
              {editing ? <><X size={13}/>Cancel</> : <><Pencil size={13}/>Edit</>}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 20 }} />

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <GlassInput label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <GlassInput label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <GlassInput label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  marginTop: 4, padding: '12px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s linear infinite',
                  color: '#0a0a0f', fontWeight: 700, fontSize: '0.9rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'Sora',sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Saving...</> : <><Check size={16}/>Save Changes</>}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ProfileField icon={<User size={15} color="#fb923c" />}    label="Name"     value={profile.name} />
              <ProfileField icon={<Mail size={15} color="#fb923c" />}    label="Email"    value={profile.email} />
              <ProfileField icon={<Phone size={15} color="#fb923c" />}   label="Phone"    value={profile.phone} />
              <ProfileField icon={<MapPin size={15} color="#fb923c" />}  label="Location" value={profile.location} />
            </div>
          )}
        </div>

        {/* ── BOOKINGS ── */}
        <div className="fu-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>My Bookings</h2>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {myBookings.length} TOTAL
            </span>
          </div>

          {myBookings.length === 0 ? (
            <div style={{
              padding: '56px 24px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>📋</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', fontWeight: 300 }}>No bookings yet.</p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: 6 }}>Book a karigar to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myBookings.map((b, i) => (
                <BookingCard
                  key={b.id}
                  b={b}
                  index={i}
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
