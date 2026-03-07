import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SKILLS = ['Electrician', 'Plumber', 'Carpenter', 'AC Repair', 'Mason', 'Painter', 'Cleaning', 'Appliance Repair'];

/* ─── SHARED STYLES ─────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes blob1   { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.08); } }
  @keyframes blob2   { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,25px) scale(1.06); } }
  .signup-wrap { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
  .skill-opt:hover { background: rgba(234,88,12,0.07) !important; color: #ea580c !important; }
  ::placeholder { color: rgba(120,80,40,0.35) !important; font-family: 'Sora', sans-serif; font-size: 0.88rem; }
`;

/* ─── PAGE SHELL ─────────────────────────────────────── */
function PageShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf6ee 0%, #faecd8 40%, #fdf0e0 70%, #fff5e6 100%)',
      fontFamily: "'Sora', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{globalStyles}</style>
      {/* Warm blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)', animation: 'blob1 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-12%', left: '-6%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', animation: 'blob2 10s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '35%', left: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,186,116,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="signup-wrap" style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── HEADER ─────────────────────────────────────────── */
function PageHeader({ tag, headline, accent }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'linear-gradient(135deg, #f97316, #fb923c)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
      }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '1rem', fontWeight: 700, color: '#fff' }}>K</span>
      </div>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(180,90,20,0.6)', marginBottom: 10 }}>
        {tag}
      </p>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#1c0f00' }}>
        {headline}<br /><span style={{ color: '#ea580c' }}>{accent}</span>
      </h1>
    </div>
  );
}

/* ─── GLASS CARD ─────────────────────────────────────── */
function GlassCard({ children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.45)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1.5px solid rgba(255,255,255,0.75)',
      borderRadius: 24,
      padding: '28px 28px 24px',
      boxShadow: '0 8px 48px rgba(180,100,20,0.1), 0 2px 8px rgba(180,100,20,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
    }}>
      {children}
    </div>
  );
}

/* ─── FIELD ──────────────────────────────────────────── */
function Field({ label, isFocused, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: isFocused ? '#ea580c' : 'rgba(100,60,20,0.45)',
        transition: 'color .25s',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── LINE INPUT HOOK ────────────────────────────────── */
function useLineInput() {
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%',
    background: focused === name ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
    border: `1.5px solid ${focused === name ? 'rgba(234,88,12,0.45)' : 'rgba(180,140,100,0.2)'}`,
    borderRadius: 10,
    padding: '10px 13px',
    color: '#1a1008',
    fontSize: '0.91rem',
    fontFamily: "'Sora', sans-serif",
    outline: 'none',
    transition: 'all .25s',
    boxShadow: focused === name ? '0 0 0 3px rgba(234,88,12,0.08)' : 'none',
    backdropFilter: 'blur(8px)',
  });

  return { focused, setFocused, inputStyle };
}

/* ─── SUBMIT BUTTON ──────────────────────────────────── */
function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', padding: '13px', borderRadius: 12, border: 'none',
        background: loading
          ? 'rgba(200,150,100,0.2)'
          : 'linear-gradient(90deg,#c2410c,#ea580c,#f97316,#ea580c,#c2410c)',
        backgroundSize: '300% auto',
        animation: loading ? 'none' : 'shimmer 4s linear infinite',
        color: loading ? 'rgba(120,80,40,0.4)' : '#fff',
        fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.03em',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Sora', sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: loading ? 'none' : '0 4px 20px rgba(234,88,12,0.3)',
        transition: 'box-shadow .2s',
      }}
    >
      {loading ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {loadingLabel}
        </>
      ) : label}
    </button>
  );
}

/* ─── LOGIN LINK ─────────────────────────────────────── */
function LoginLink({ text, onClick }) {
  return (
    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(100,60,20,0.45)' }}>
      {text}{' '}
      <button
        type="button"
        onClick={onClick}
        style={{ background: 'none', border: 'none', padding: 0, color: '#ea580c', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Sora',sans-serif", transition: 'color .2s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#c2410c'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#ea580c'; }}
      >
        Login
      </button>
    </p>
  );
}

/* ══════════════════════════════════════════════════════
   CUSTOMER SIGNUP
══════════════════════════════════════════════════════ */
const SignupCustomer = () => {
  const { signupCustomer } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);
  const { focused, setFocused, inputStyle } = useLineInput();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signupCustomer(form);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success('Account created!'); navigate('/customer'); }
  };

  return (
    <PageShell>
      <PageHeader tag="Customer · Sign Up" headline="Create your" accent="account." />
      <GlassCard>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name" isFocused={focused === 'name'}>
            <input value={form.name} onChange={set('name')} placeholder="Full name" required style={inputStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Email" isFocused={focused === 'email'}>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={inputStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Password" isFocused={focused === 'password'}>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required minLength={6} style={inputStyle('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Phone" isFocused={focused === 'phone'}>
            <input value={form.phone} onChange={set('phone')} placeholder="+91 00000 00000" required style={inputStyle('phone')} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Location" isFocused={focused === 'location'}>
            <input value={form.location} onChange={set('location')} placeholder="City, Area" required style={inputStyle('location')} onFocus={() => setFocused('location')} onBlur={() => setFocused(null)} />
          </Field>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating…" />

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(180,120,60,0.15)' }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(150,90,30,0.35)', fontFamily: "'Space Mono',monospace", letterSpacing: '0.1em' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(180,120,60,0.15)' }} />
            </div>

            <LoginLink text="Already have an account?" onClick={() => navigate('/login/customer')} />
          </div>
        </form>
      </GlassCard>
    </PageShell>
  );
};

/* ══════════════════════════════════════════════════════
   KARIGAR SIGNUP
══════════════════════════════════════════════════════ */
const SignupKarigar = () => {
  const { signupKarigar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', skill: '', experience: '', location: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const { focused, setFocused, inputStyle } = useLineInput();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signupKarigar({
      name: form.name, email: form.email, password: form.password, phone: form.phone,
      skill: form.skill, experience: Number(form.experience),
      location: form.location, price: Number(form.price), description: form.description,
    });
    setLoading(false);
    if (result.error) toast.error(result.error);
    else { toast.success('Registration successful!'); navigate('/karigar-dashboard'); }
  };

  const sharedInput = inputStyle('__none__'); // base style for reuse

  return (
    <PageShell>
      <PageHeader tag="Karigar · Sign Up" headline="Start earning" accent="today." />
      <GlassCard>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Name" isFocused={focused === 'name'}>
            <input value={form.name} onChange={set('name')} placeholder="Full name" required style={inputStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Email" isFocused={focused === 'email'}>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={inputStyle('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Password" isFocused={focused === 'password'}>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required minLength={6} style={inputStyle('password')} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
          </Field>
          <Field label="Phone" isFocused={focused === 'phone'}>
            <input value={form.phone} onChange={set('phone')} placeholder="+91 00000 00000" required style={inputStyle('phone')} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
          </Field>

          {/* Skill dropdown */}
          <Field label="Skill Category" isFocused={skillOpen}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setSkillOpen(o => !o)}
                style={{
                  ...sharedInput,
                  background: skillOpen ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                  border: `1.5px solid ${skillOpen ? 'rgba(234,88,12,0.45)' : 'rgba(180,140,100,0.2)'}`,
                  boxShadow: skillOpen ? '0 0 0 3px rgba(234,88,12,0.08)' : 'none',
                  textAlign: 'left', cursor: 'pointer',
                  color: form.skill ? '#1a1008' : 'rgba(120,80,40,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.91rem' }}>{form.skill || 'Select skill'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(180,100,40,0.5)" strokeWidth="2.5" style={{ transform: skillOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {skillOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
                  background: 'rgba(255,248,240,0.97)',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(255,255,255,0.8)',
                  borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(180,100,20,0.15), 0 2px 8px rgba(180,100,20,0.08)',
                }}>
                  {SKILLS.map(s => (
                    <button
                      key={s} type="button"
                      className="skill-opt"
                      onClick={() => { setForm(f => ({ ...f, skill: s })); setSkillOpen(false); }}
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: form.skill === s ? 'rgba(234,88,12,0.08)' : 'transparent',
                        border: 'none', textAlign: 'left',
                        color: form.skill === s ? '#ea580c' : 'rgba(80,40,10,0.7)',
                        fontSize: '0.88rem', cursor: 'pointer',
                        fontFamily: "'Sora',sans-serif", fontWeight: form.skill === s ? 700 : 400,
                        transition: 'all .15s',
                        borderBottom: '1px solid rgba(180,120,60,0.08)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* Two-col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Experience (yrs)" isFocused={focused === 'experience'}>
              <input type="number" value={form.experience} onChange={set('experience')} placeholder="0" required style={inputStyle('experience')} onFocus={() => setFocused('experience')} onBlur={() => setFocused(null)} />
            </Field>
            <Field label="Price (₹/visit)" isFocused={focused === 'price'}>
              <input type="number" value={form.price} onChange={set('price')} placeholder="500" required style={inputStyle('price')} onFocus={() => setFocused('price')} onBlur={() => setFocused(null)} />
            </Field>
          </div>

          <Field label="Location" isFocused={focused === 'location'}>
            <input value={form.location} onChange={set('location')} placeholder="City, Area" required style={inputStyle('location')} onFocus={() => setFocused('location')} onBlur={() => setFocused(null)} />
          </Field>

          <Field label="Short Description" isFocused={focused === 'description'}>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="Briefly describe your expertise…"
              required rows={3}
              onFocus={() => setFocused('description')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle('description'),
                resize: 'none',
              }}
            />
          </Field>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            <SubmitButton loading={loading} label="Register" loadingLabel="Registering…" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(180,120,60,0.15)' }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(150,90,30,0.35)', fontFamily: "'Space Mono',monospace", letterSpacing: '0.1em' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(180,120,60,0.15)' }} />
            </div>

            <LoginLink text="Already registered?" onClick={() => navigate('/login/karigar')} />
          </div>
        </form>
      </GlassCard>
    </PageShell>
  );
};

export { SignupCustomer, SignupKarigar };