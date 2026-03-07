import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, Navigation, Star, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import TrustBadges from '@/components/TrustBadges';
import AvailabilityBadge from '@/components/AvailabilityBadge';
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
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
  return ist.toISOString().split('T')[0];
};

const getISTHour = () => {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000));
  return ist.getUTCHours();
};

/* ─── STAT PILL ─────────────────────────────────────── */
function StatPill({ icon, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 999,
    }}>
      {icon}
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ─── BOOKING DIALOG ─────────────────────────────────── */
function BookingDialog({ open, onClose, karigar, date, setDate, time, setTime, description, setDescription, availableSlots, todayIST, maxDate, onConfirm }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
      animation: 'fadeIn .2s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(14,14,20,0.98)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(251,146,60,0.25)',
          borderRadius: 24, padding: 32,
          width: '100%', maxWidth: 460, margin: 16,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          animation: 'dialogPop .3s cubic-bezier(.22,1,.36,1)',
          fontFamily: "'Sora', sans-serif",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Schedule</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Book {karigar?.name}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setTime(''); }}
              min={todayIST}
              max={maxDate}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '10px 14px',
                color: '#fff', fontSize: '0.9rem',
                fontFamily: "'Sora', sans-serif", outline: 'none',
                width: '100%', colorScheme: 'dark',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(251,146,60,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(251,146,60,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Time Slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Time Slot</label>
            {!date ? (
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>Select a date first</p>
            ) : availableSlots.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#f87171' }}>No available slots for this date</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: `1.5px solid ${time === slot ? 'rgba(251,146,60,0.6)' : 'rgba(255,255,255,0.1)'}`,
                      background: time === slot ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.03)',
                      color: time === slot ? '#fb923c' : 'rgba(255,255,255,0.55)',
                      fontSize: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Sora',sans-serif",
                      transition: 'all .2s',
                    }}
                  >
                    {formatSlot(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Job Description <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              placeholder="Describe the work needed..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{
                background: 'rgba(255,255,255,0.05)',
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
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: 12,
            border: '1.5px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Sora',sans-serif",
          }}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!date || !time}
            style={{
              flex: 2, padding: '11px', borderRadius: 12, border: 'none',
              background: (!date || !time)
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
              backgroundSize: '200% auto',
              color: (!date || !time) ? 'rgba(255,255,255,0.25)' : '#0a0a0f',
              fontSize: '0.875rem', fontWeight: 700,
              cursor: (!date || !time) ? 'not-allowed' : 'pointer',
              fontFamily: "'Sora',sans-serif",
              animation: (date && time) ? 'shimmer 3s linear infinite' : 'none',
            }}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const KarigarProfile = () => {
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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 size={32} color="#fb923c" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Sora',sans-serif" }}>Loading profile...</p>
      </div>
    </div>
  );

  if (!karigar) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Sora',sans-serif" }}>Karigar not found</p>
    </div>
  );

  const initials = karigar.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'K';

  const handleBook = async () => {
    if (!date || !time || !user?.authUser || !user.profile) return;
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
        @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

        .fu-1 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .05s both; }
        .fu-2 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .15s both; }
        .fu-3 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .25s both; }
        .fu-4 { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .35s both; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(251,146,60,.3); border-radius: 999px; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── PAGE LABEL ── */}
        <div className="fu-1" style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fb923c', display: 'block', marginBottom: 8 }}>
            Karigar
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Service <span style={{ color: '#fb923c' }}>Profile</span>
          </h1>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="fu-2" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 28, marginBottom: 24,
        }}>
          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Avatar — use photo if available, else initials */}
              {karigar.photo ? (
                <img
                  src={karigar.photo}
                  alt={karigar.name}
                  style={{
                    width: 58, height: 58, borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(251,146,60,0.4)',
                    flexShrink: 0,
                    animation: 'avatarGlow 3s ease-in-out infinite',
                  }}
                />
              ) : (
                <div style={{
                  width: 58, height: 58, borderRadius: '50%',
                  background: 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(251,146,60,0.5))',
                  border: '2px solid rgba(251,146,60,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: '1.1rem',
                  color: '#fb923c', flexShrink: 0,
                  animation: 'avatarGlow 3s ease-in-out infinite',
                }}>{initials}</div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{karigar.name}</p>
                  <AvailabilityBadge status={(karigar as any).availability || 'available'} />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 600, marginBottom: 6 }}>{karigar.skill}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Available for Hire</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 20 }} />

          {/* Trust badges */}
          <div style={{ marginBottom: 16 }}>
            <TrustBadges rating={Number(karigar.rating)} reviewCount={karigar.review_count} completedJobs={karigar.completed_jobs} size="md" />
          </div>

          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <StarRating rating={Number(karigar.rating)} />
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              {Number(karigar.rating).toFixed(1)} ({karigar.review_count} reviews)
            </span>
          </div>

          {/* Stat pills row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatPill icon={<Clock size={13} color="#fb923c" />} value={`${karigar.experience} yrs exp`} />
            <StatPill icon={<Briefcase size={13} color="#fb923c" />} value={`${karigar.completed_jobs} jobs`} />
            <StatPill icon={<IndianRupee size={13} color="#fb923c" />} value={`₹${karigar.price}/visit`} />
            <StatPill icon={<MapPin size={13} color="#fb923c" />} value={karigar.location} />
            <StatPill icon={<Navigation size={13} color="#38bdf8" />} value={`${distance} km away`} />
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="fu-2" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 24, marginBottom: 24,
        }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Bio</span>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontWeight: 300 }}>{karigar.description}</p>
        </div>

        {/* ── BOOK BUTTON ── */}
        {user?.role === 'customer' && (
          <div className="fu-3" style={{ marginBottom: 32 }}>
            <button
              onClick={() => setBookingOpen(true)}
              style={{
                width: '100%', padding: '14px',
                borderRadius: 14, border: 'none',
                background: 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
                backgroundSize: '200% auto',
                animation: 'shimmer 3s linear infinite',
                color: '#0a0a0f', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', fontFamily: "'Sora',sans-serif",
                letterSpacing: '0.01em',
              }}
            >
              Book Service
            </button>
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {portfolioImages.length > 0 && (
          <div className="fu-3" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Previous Work</h2>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                {portfolioImages.length} PHOTOS
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {portfolioImages.map((img, i) => (
                <div
                  key={img.id}
                  style={{
                    overflow: 'hidden', borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.03)',
                    animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${i * 0.07}s both`,
                  }}
                >
                  <img src={img.image_url} alt="Portfolio work" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div className="fu-4">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Customer Reviews</h2>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {reviews.length} TOTAL
            </span>
          </div>

          {reviews.length === 0 ? (
            <div style={{
              padding: '56px 24px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>⭐</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', fontWeight: 300 }}>No reviews yet.</p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', marginTop: 6 }}>Be the first to book and leave a review!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r, i) => (
                <ReviewCard key={r.id} r={r} index={i} />
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
function ReviewCard({ r, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hov ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20, padding: 20,
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
        animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${index * 0.08}s both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(249,115,22,0.25),rgba(251,146,60,0.4))',
            border: '1.5px solid rgba(251,146,60,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', fontWeight: 700, color: '#fb923c',
          }}>
            {r.customer_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.customer_name}</span>
        </div>
        <StarRating rating={r.rating} size={13} />
      </div>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontWeight: 300, marginBottom: 8 }}>{r.text}</p>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Space Mono',monospace" }}>
        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default KarigarProfile;