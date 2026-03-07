import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Zap, Droplets, Hammer, Home, Wind, Brush, ChevronDown, X, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import KarigarCard from '@/components/KarigarCard';
import { supabase } from '@/integrations/supabase/client';

/* ─── CATEGORY DATA ─────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Electrician',
    icon: <Zap size={28} />,
    color: '#f97316',
    desc: 'Wiring, fitting & repairs',
    
  },
  {
    label: 'Plumber',
    icon: <Droplets size={28} />,
    color: '#38bdf8',
    desc: 'Pipes, leaks & installation',
    
  },
  {
    label: 'Carpenter',
    icon: <Hammer size={28} />,
    color: '#a78bfa',
    desc: 'Furniture, doors & woodwork',
    
  },
  {
    label: 'AC Repair',
    icon: <Wind size={28} />,
    color: '#34d399',
    desc: 'Service, gas & installation',
    
  },
  {
    label: 'Mason',
    icon: <Home size={28} />,
    color: '#fbbf24',
    desc: 'Tiles, walls & construction',
    
  },
  {
    label: 'Painter',
    icon: <Brush size={28} />,
    color: '#f472b6',
    desc: 'Interior, exterior & textures',
  },
];

/* ─── SCROLL REVEAL HOOK ────────────────────────────── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── CATEGORY CARD (big) ───────────────────────────── */
function CategoryCard({ label, icon, color, desc, count, active, onClick, delay, visible }) {
  const [hov, setHov] = useState(false);
  const lit = active || hov;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', gap: 0,
        padding: '24px 22px 20px',
        borderRadius: 22,
        border: `1.5px solid ${active ? color : hov ? color + '44' : 'rgba(255,255,255,0.07)'}`,
        background: active
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : hov
            ? `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`
            : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        cursor: 'pointer',
        transition: 'all 0.38s cubic-bezier(0.22,1,0.36,1)',
        transitionDelay: visible ? `${delay}s` : '0s',
        transform: visible
          ? hov ? 'translateY(-6px) scale(1.01)' : active ? 'translateY(-3px)' : 'translateY(0)'
          : 'translateY(36px)',
        opacity: visible ? 1 : 0,
        boxShadow: active
          ? `0 12px 40px ${color}28, 0 0 0 1px ${color}28, inset 0 1px 0 ${color}20`
          : hov
            ? `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${color}18`
            : 'none',
        textAlign: 'left',
        fontFamily: "'Sora', sans-serif",
        width: '100%',
        minHeight: 160,
      }}
    >
      {/* Glow orb behind icon */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}${lit ? '18' : '08'} 0%, transparent 70%)`,
        transition: 'background .4s',
        pointerEvents: 'none',
      }} />

      {/* Active top shimmer line */}
      {active && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: '22px 22px 0 0',
        }} />
      )}

      {/* Icon box */}
      <div style={{
        width: 52, height: 52, borderRadius: 15, marginBottom: 16,
        background: lit ? `${color}20` : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${lit ? color + '40' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: lit ? color : 'rgba(255,255,255,0.4)',
        transition: 'all .35s',
        boxShadow: lit ? `0 0 20px ${color}30` : 'none',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Label */}
      <span style={{
        fontSize: '1rem', fontWeight: 700, lineHeight: 1.2,
        color: active ? color : hov ? '#fff' : 'rgba(255,255,255,0.85)',
        transition: 'color .3s', marginBottom: 5,
      }}>
        {label}
      </span>

      {/* Desc */}
      <span style={{
        fontSize: '0.75rem', fontWeight: 300,
        color: lit ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
        transition: 'color .3s', lineHeight: 1.4, marginBottom: 14,
      }}>
        {desc}
      </span>

      {/* Footer row */}
      <div style={{
        marginTop: 'auto', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Availability pill */}
        <span style={{
          fontSize: '0.65rem', fontWeight: 700,
          color: lit ? color : 'rgba(255,255,255,0.25)',
          background: lit ? `${color}15` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${lit ? color + '30' : 'rgba(255,255,255,0.06)'}`,
          padding: '3px 9px', borderRadius: 999,
          transition: 'all .3s',
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: "'Space Mono', monospace",
        }}>
          {active && (
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', animation: 'dotPulse 1.5s infinite' }} />
          )}
          {count}
        </span>

        {/* Arrow */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: lit ? `${color}18` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${lit ? color + '30' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: lit ? color : 'rgba(255,255,255,0.25)',
          transition: 'all .3s',
          transform: hov ? 'translateX(2px)' : 'translateX(0)',
          flexShrink: 0,
        }}>
          <ArrowRight size={13} />
        </div>
      </div>

      {/* Active indicator dot */}
      {active && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 8, height: 8, borderRadius: '50%',
          background: color, boxShadow: `0 0 10px ${color}`,
          animation: 'dotPulse 1.5s infinite',
        }} />
      )}
    </button>
  );
}

/* ─── KARIGAR SKELETON ──────────────────────────────── */
function Skeleton() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: 24, height: 220,
      animation: 'skeletonPulse 1.6s ease-in-out infinite',
    }} />
  );
}

/* ─── FILTER SELECT ─────────────────────────────────── */
function FilterSelect({ value, onChange, placeholder, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 10,
          border: `1.5px solid ${open ? 'rgba(251,146,60,0.5)' : 'rgba(255,255,255,0.1)'}`,
          background: open ? 'rgba(251,146,60,0.08)' : 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          color: value && value !== 'all' && value !== 'none' ? '#fb923c' : 'rgba(255,255,255,0.6)',
          fontSize: '0.875rem', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: "'Sora', sans-serif", whiteSpace: 'nowrap',
        }}
      >
        {selected?.label || placeholder}
        <ChevronDown size={14} style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 50,
          background: 'rgba(14,14,20,0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(251,146,60,0.2)',
          borderRadius: 12, overflow: 'hidden', minWidth: 165,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'dropIn 0.18s cubic-bezier(0.22,1,0.36,1)',
        }}>
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
              display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left',
              background: value === opt.value ? 'rgba(251,146,60,0.12)' : 'transparent',
              color: value === opt.value ? '#fb923c' : 'rgba(255,255,255,0.7)',
              fontSize: '0.875rem', fontWeight: value === opt.value ? 700 : 400,
              border: 'none', cursor: 'pointer', transition: 'background 0.15s',
              fontFamily: "'Sora', sans-serif",
            }}
              onMouseEnter={e => { if (value !== opt.value) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (value !== opt.value) (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const CustomerDashboard = () => {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const [search, setSearch]           = useState(searchFromUrl);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { setSearch(searchFromUrl); }, [searchFromUrl]);

  const [skillFilter, setSkillFilter]   = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [priceSort, setPriceSort]       = useState('none');
  const [karigars, setKarigars]         = useState([]);
  const [loading, setLoading]           = useState(true);

  const [catRef,  catVisible]  = useScrollReveal(0.05);
  const [cardRef, cardVisible] = useScrollReveal(0.05);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from('karigars').select('*');
      setKarigars(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = karigars.filter(k => (k as any).availability !== 'offline');
    if (search)            list = list.filter(k => (k as any).name.toLowerCase().includes(search.toLowerCase()) || (k as any).skill.toLowerCase().includes(search.toLowerCase()));
    if (skillFilter !== 'all')   list = list.filter(k => (k as any).skill === skillFilter);
    if (ratingFilter !== 'all')  list = list.filter(k => Number((k as any).rating) >= Number(ratingFilter));
    if (priceSort === 'low')  list = [...list].sort((a: any, b: any) => a.price - b.price);
    if (priceSort === 'high') list = [...list].sort((a: any, b: any) => b.price - a.price);
    return list;
  }, [search, skillFilter, ratingFilter, priceSort, karigars]);

  const activeFiltersCount = [skillFilter !== 'all', ratingFilter !== 'all', priceSort !== 'none'].filter(Boolean).length;
  const clearFilters = () => { setSkillFilter('all'); setRatingFilter('all'); setPriceSort('none'); };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Sora', sans-serif", color: '#fff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        @keyframes fadeUp       { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dropIn       { from { opacity:0; transform:translateY(-8px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes skeletonPulse{ 0%,100% { opacity:.4; } 50% { opacity:.7; } }
        @keyframes cardFadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotPulse     { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.8); } }

        .fu-1 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .05s both; }
        .fu-2 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .15s both; }
        .fu-3 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .25s both; }

        .karigar-card-wrap { animation: cardFadeUp .55s cubic-bezier(.22,1,.36,1) both; }

        .search-input {
          width: 100%; height: 52px;
          background: rgba(255,255,255,0.05) !important;
          border: 1.5px solid rgba(255,255,255,0.1) !important;
          border-radius: 14px !important;
          color: #fff !important; font-size: 0.95rem;
          padding-left: 48px !important;
          font-family: 'Sora', sans-serif;
          transition: border-color .25s, box-shadow .25s !important;
        }
        .search-input:focus {
          border-color: rgba(251,146,60,0.55) !important;
          box-shadow: 0 0 0 3px rgba(251,146,60,0.1) !important;
          outline: none !important;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.3); }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(251,146,60,.3); border-radius: 999px; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* PAGE TITLE */}
        <div className="fu-1" style={{ marginBottom: 28 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fb923c', display: 'block', marginBottom: 8 }}>
            Customer Dashboard
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Find a <span style={{ color: '#fb923c' }}>Karigar</span> Near You
          </h1>
        </div>

        {/* SEARCH */}
        <div className="fu-2" style={{ position: 'relative', marginBottom: 32 }}>
          <Search size={18} style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: searchFocused ? '#fb923c' : 'rgba(255,255,255,0.35)',
            transition: 'color .25s', zIndex: 1, pointerEvents: 'none',
          }} />
          <input
            className="search-input"
            placeholder="Search for electrician, plumber, carpenter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
            }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* SERVICE CATEGORIES */}
        {!search && (
          <section style={{ marginBottom: 44 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 3 }}>
                  Service Categories
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>
                  Tap a category to filter karigars
                </p>
              </div>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                {CATEGORIES.length} TRADES
              </span>
            </div>

            <div
              ref={catRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 14,
              }}
            >
              {CATEGORIES.map((cat, i) => (
                <CategoryCard
                  key={cat.label}
                  {...cat}
                  active={skillFilter === cat.label}
                  onClick={() => setSkillFilter(skillFilter === cat.label ? 'all' : cat.label)}
                  delay={i * 0.07}
                  visible={catVisible}
                />
              ))}
            </div>
          </section>
        )}

        {/* FILTERS */}
        <section style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
            padding: '14px 18px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
              <SlidersHorizontal size={15} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Filters</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.4)',
                  color: '#fb923c', fontSize: '0.65rem', fontWeight: 700,
                  padding: '1px 7px', borderRadius: 999,
                }}>{activeFiltersCount}</span>
              )}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
            <FilterSelect value={skillFilter} onChange={setSkillFilter} placeholder="All Skills"
              options={[{ value: 'all', label: 'All Skills' }, ...['Electrician','Plumber','Carpenter','AC Repair','Mason','Painter'].map(s => ({ value: s, label: s }))]} />
            <FilterSelect value={ratingFilter} onChange={setRatingFilter} placeholder="All Ratings"
              options={[{ value: 'all', label: 'All Ratings' }, { value: '4.5', label: '4.5+ ★' }, { value: '4', label: '4.0+ ★' }]} />
            <FilterSelect value={priceSort} onChange={setPriceSort} placeholder="Sort by Price"
              options={[{ value: 'none', label: 'Default Order' }, { value: 'low', label: 'Price: Low → High' }, { value: 'high', label: 'Price: High → Low' }]} />
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Sora',sans-serif", transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fb923c'; e.currentTarget.style.borderColor = 'rgba(251,146,60,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        </section>

        {/* KARIGAR RESULTS */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {search ? <span>Results for <span style={{ color: '#fb923c' }}>"{search}"</span></span> : 'Nearby Karigars'}
            </h2>
            {!loading && (
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                {filtered.length} FOUND
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '64px 24px', textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔍</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 300 }}>No karigars found.</p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', marginTop: 6 }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div ref={cardRef} style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
              {filtered.map((k: any, i) => (
                <div key={k.id} className="karigar-card-wrap"
                  style={{ animationDelay: cardVisible ? `${i * 0.07}s` : '0s', opacity: cardVisible ? undefined : 0 }}>
                  <KarigarCard karigar={k} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;