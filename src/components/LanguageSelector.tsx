import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 10,
          border: '1.5px solid rgba(255,255,255,0.12)',
          background: open ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.05)',
          color: open ? '#fb923c' : 'rgba(255,255,255,0.6)',
          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
          fontFamily: "'Sora', sans-serif", transition: 'all .2s',
        }}
      >
        <Globe size={14} />
        <span>{current?.native || 'EN'}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 200, maxHeight: 320, overflowY: 'auto',
          background: 'rgba(10,10,15,0.97)',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.6)',
          padding: 6, zIndex: 150,
        }}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 12px', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                background: lang === l.code ? 'rgba(251,146,60,0.12)' : 'transparent',
                color: lang === l.code ? '#fb923c' : 'rgba(255,255,255,0.7)',
                fontSize: '0.82rem', fontWeight: lang === l.code ? 600 : 400,
                fontFamily: "'Sora', sans-serif", transition: 'all .15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{l.native}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
