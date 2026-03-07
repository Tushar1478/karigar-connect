import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Plus, Trash2, Check, Loader2 } from 'lucide-react';

/* ─── GLASS INPUT ───────────────────────────────────── */
function GlassInput({ label, value, onChange, type = 'text', colSpan = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: colSpan ? 'span 2' : 'span 1' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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

/* ─── GLASS TEXTAREA ────────────────────────────────── */
function GlassTextarea({ label, value, onChange, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
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
          resize: 'none',
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
const KarigarProfileEdit = () => {
  const { user } = useAuth();
  const karigar = user?.karigar;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', skill: '', experience: 0, price: 0, location: '', description: '', photo: '',
  });
  const [portfolioImages, setPortfolioImages] = useState<{ id: string; image_url: string; caption: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hoveredPortfolio, setHoveredPortfolio] = useState<string | null>(null);

  useEffect(() => {
    if (karigar) {
      setForm({
        name: karigar.name, skill: karigar.skill, experience: karigar.experience,
        price: karigar.price, location: karigar.location, description: karigar.description, photo: karigar.photo,
      });
      fetchPortfolio();
    }
  }, [karigar]);

  const fetchPortfolio = async () => {
    if (!karigar) return;
    const { data } = await supabase.from('portfolio_images').select('*').eq('karigar_id', karigar.id).order('created_at', { ascending: false });
    setPortfolioImages(data || []);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.authUser) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.authUser.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    setForm(f => ({ ...f, photo: publicUrl }));
    setUploading(false);
    toast.success('Photo uploaded!');
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !karigar || !user?.authUser) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${user.authUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file);
      if (error) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path);
      await supabase.from('portfolio_images').insert({ karigar_id: karigar.id, user_id: user.authUser.id, image_url: publicUrl });
    }
    await fetchPortfolio();
    setUploading(false);
    toast.success('Portfolio updated!');
  };

  const handleDeletePortfolio = async (id: string) => {
    await supabase.from('portfolio_images').delete().eq('id', id);
    setPortfolioImages(prev => prev.filter(p => p.id !== id));
    toast.success('Image removed');
  };

  const handleSave = async () => {
    if (!karigar) return;
    setSaving(true);
    const { error } = await supabase.from('karigars').update({
      name: form.name, skill: form.skill, experience: form.experience,
      price: form.price, location: form.location, description: form.description, photo: form.photo,
    }).eq('id', karigar.id);
    if (user?.authUser) {
      await supabase.from('profiles').update({ name: form.name, location: form.location }).eq('user_id', user.authUser.id);
    }
    setSaving(false);
    if (error) toast.error('Failed to save'); else toast.success('Profile updated!');
  };

  if (!karigar) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 size={32} color="#fb923c" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Sora',sans-serif" }}>Loading...</p>
      </div>
    </div>
  );

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'K';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Sora', sans-serif", color: '#fff' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cardFadeUp{ from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer   { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes avatarGlow{ 0%,100% { box-shadow:0 0 0 4px rgba(251,146,60,0.15),0 0 24px rgba(251,146,60,0.1); } 50% { box-shadow:0 0 0 6px rgba(251,146,60,0.25),0 0 40px rgba(251,146,60,0.2); } }
        @keyframes spin      { to { transform:rotate(360deg); } }
        @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

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
            Edit <span style={{ color: '#fb923c' }}>Profile</span>
          </h1>
        </div>

        {/* ── PHOTO CARD ── */}
        <div className="fu-2" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 28, marginBottom: 24,
        }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>Profile Photo</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="Profile"
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(251,146,60,0.4)',
                    animation: 'avatarGlow 3s ease-in-out infinite',
                  }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(251,146,60,0.5))',
                  border: '2px solid rgba(251,146,60,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: '1.3rem',
                  color: '#fb923c',
                  animation: 'avatarGlow 3s ease-in-out infinite',
                }}>{initials}</div>
              )}
              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#f97316,#fb923c)',
                  border: '2px solid #0a0a0f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Camera size={13} color="#0a0a0f" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            </div>

            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{form.name || 'Your Name'}</p>
              <p style={{ fontSize: '0.8rem', color: '#fb923c', fontWeight: 600, marginBottom: 8 }}>{form.skill || 'Your Skill'}</p>
              {uploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={12} color="#fb923c" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Uploading...</span>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    border: '1.5px solid rgba(251,146,60,0.3)',
                    background: 'rgba(251,146,60,0.08)',
                    color: '#fb923c', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Sora',sans-serif",
                    transition: 'all .2s',
                  }}
                >
                  Change Photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div className="fu-2" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 28, marginBottom: 24,
        }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 20 }}>Details</span>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 20 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <GlassInput label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <GlassInput label="Skill Category" value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} />
            <GlassInput label="Years of Experience" type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: Number(e.target.value) }))} />
            <GlassInput label="Service Price (₹)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            <GlassInput label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} colSpan />
            <GlassTextarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: 24,
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: saving
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316)',
              backgroundSize: '200% auto',
              animation: saving ? 'none' : 'shimmer 3s linear infinite',
              color: saving ? 'rgba(255,255,255,0.25)' : '#0a0a0f',
              fontWeight: 700, fontSize: '0.9rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Sora',sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: saving ? 0.7 : 1,
              transition: 'opacity .2s',
            }}
          >
            {saving
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />Saving...</>
              : <><Check size={16} />Save Profile</>
            }
          </button>
        </div>

        {/* ── PORTFOLIO CARD ── */}
        <div className="fu-3" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.18em', color: '#fb923c', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Gallery</span>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Work Portfolio</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {portfolioImages.length > 0 && (
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                  {portfolioImages.length} PHOTOS
                </span>
              )}
              <button
                onClick={() => portfolioInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  border: '1.5px solid rgba(251,146,60,0.3)',
                  background: 'rgba(251,146,60,0.08)',
                  color: uploading ? 'rgba(251,146,60,0.4)' : '#fb923c',
                  fontSize: '0.78rem', fontWeight: 700,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Sora',sans-serif", transition: 'all .2s',
                }}
                onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = 'rgba(251,146,60,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,146,60,0.08)'; }}
              >
                {uploading
                  ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />Uploading...</>
                  : <><Plus size={13} />Add Images</>
                }
              </button>
              <input ref={portfolioInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePortfolioUpload} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)', marginBottom: 20 }} />

          {portfolioImages.length === 0 ? (
            <div
              onClick={() => portfolioInputRef.current?.click()}
              style={{
                padding: '48px 24px', textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1.5px dashed rgba(255,255,255,0.1)',
                borderRadius: 16, cursor: 'pointer',
                transition: 'border-color .2s, background .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(251,146,60,0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(251,146,60,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🖼️</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 300, marginBottom: 4 }}>No portfolio images yet.</p>
              <p style={{ color: 'rgba(251,146,60,0.5)', fontSize: '0.78rem', fontWeight: 600 }}>Click to upload your previous work</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {portfolioImages.map((img, i) => (
                <div
                  key={img.id}
                  onMouseEnter={() => setHoveredPortfolio(img.id)}
                  onMouseLeave={() => setHoveredPortfolio(null)}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    borderRadius: 14,
                    border: `1px solid ${hoveredPortfolio === img.id ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    transition: 'border-color .2s',
                    animation: `cardFadeUp .5s cubic-bezier(.22,1,.36,1) ${i * 0.07}s both`,
                  }}
                >
                  <img
                    src={img.image_url}
                    alt="Portfolio"
                    style={{
                      width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block',
                      transition: 'transform .3s',
                      transform: hoveredPortfolio === img.id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />
                  {/* Delete overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: hoveredPortfolio === img.id ? 1 : 0,
                    transition: 'opacity .2s',
                  }}>
                    <button
                      onClick={() => handleDeletePortfolio(img.id)}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(248,113,113,0.2)',
                        border: '1.5px solid rgba(248,113,113,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
                    >
                      <Trash2 size={15} color="#f87171" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default KarigarProfileEdit;