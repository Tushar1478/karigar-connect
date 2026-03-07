import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

/* ─── GLASS INPUT ───────────────────────────────────── */
function GlassInput({ label, id, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${focused ? 'rgba(251,146,60,0.55)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12,
          padding: '11px 14px',
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

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const Login = () => {
  const { role } = useParams<{ role: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedRole = role === 'karigar' ? 'karigar' : 'customer';
  const isCustomer = normalizedRole === 'customer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Logged in!');
      navigate(isCustomer ? '/customer' : '/karigar-dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Sora', sans-serif", color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes logoGlow{ 0%,100% { box-shadow:0 0 0 4px rgba(251,146,60,0.15),0 0 24px rgba(251,146,60,0.1); } 50% { box-shadow:0 0 0 8px rgba(251,146,60,0.22),0 0 40px rgba(251,146,60,0.18); } }
        @keyframes spin    { to { transform:rotate(360deg); } }

        .login-card { animation: fadeUp .65s cubic-bezier(.22,1,.36,1) .05s both; }

        ::placeholder { color: rgba(255,255,255,0.2) !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(251,146,60,.3); border-radius: 999px; }
      `}</style>

      <div className="login-card" style={{ width: '100%', maxWidth: 420 }}>

        {/* ── LOGO + HEADING ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(249,115,22,0.35),rgba(251,146,60,0.55))',
            border: '2px solid rgba(251,146,60,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'logoGlow 3s ease-in-out infinite',
            fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: '1.3rem', color: '#fb923c',
          }}>
            K
          </div>

          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fb923c', display: 'block', marginBottom: 10 }}>
            {isCustomer ? 'Customer' : 'Karigar'} Portal
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 8 }}>
            Welcome <span style={{ color: '#fb923c' }}>Back</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Enter your credentials to continue</p>
        </div>

        {/* ── FORM CARD ── */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 28,
        }}>
          {/* Divider label */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 24 }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <GlassInput
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <GlassInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                background: loading
                  ? 'rgba(255,255,255,0.06)'
                  : 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
                backgroundSize: '200% auto',
                animation: loading ? 'none' : 'shimmer 3s linear infinite',
                color: loading ? 'rgba(255,255,255,0.25)' : '#0a0a0f',
                fontWeight: 800, fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Sora',sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: 'opacity .2s',
                letterSpacing: '0.01em',
              }}
            >
              {loading
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Logging in...</>
                : <><Check size={16} />Login</>
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontFamily: "'Space Mono',monospace", letterSpacing: '0.08em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate(isCustomer ? '/signup/customer' : '/signup/karigar')}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: '#fb923c', fontWeight: 700, fontSize: '0.82rem',
                cursor: 'pointer', fontFamily: "'Sora',sans-serif",
                textDecoration: 'underline', textDecorationColor: 'rgba(251,146,60,0.4)',
                textUnderlineOffset: 3,
                transition: 'color .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fdba74'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#fb923c'; }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;