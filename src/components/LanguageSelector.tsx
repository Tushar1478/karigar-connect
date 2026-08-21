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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
          open ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-background text-foreground'
        }`}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current?.native || 'EN'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[150] w-[200px] max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-lg">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 ${
                lang === l.code ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-secondary'
              }`}
            >
              <span>{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
