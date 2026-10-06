import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Plus, Trash2, Check, Loader2, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const KarigarProfileEdit = () => {
  const { t } = useLanguage();
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
    <div className="grid min-h-screen place-items-center bg-secondary/40">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );

  const initials = form.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'K';

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ── PAGE LABEL ── */}
        <div className="mb-7 animate-fade-in">
          <span className="uc-eyebrow mb-2 block">Account</span>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Edit <span className="text-primary">{t('profile')}</span>
          </h1>
        </div>

        {/* ── PHOTO CARD ── */}
        <div className="uc-card mb-6 p-7 animate-fade-in">
          <span className="uc-eyebrow mb-5 block">Profile Photo</span>

          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage src={form.photo} alt="Profile" />
                <AvatarFallback className="bg-primary-soft text-lg font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground transition hover:bg-primary/90"
              >
                <Camera size={13} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div>
              <p className="mb-1 font-bold text-foreground">{form.name || 'Your Name'}</p>
              <p className="mb-2 text-sm font-semibold text-primary">{form.skill || 'Your Skill'}</p>
              {uploading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  Change Photo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── FORM CARD ── */}
        <div className="uc-card mb-6 p-7 animate-fade-in">
          <span className="uc-eyebrow mb-5 block">Details</span>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label>Skill Category</Label>
              <Input value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label>Years of Experience</Label>
              <Input type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: Number(e.target.value) }))} className="rounded-xl" />
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label>Service Price (₹)</Label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="rounded-xl" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t('location')}</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t('description')}</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl resize-none" />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full rounded-xl font-semibold"
            size="lg"
          >
            {saving
              ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</>
              : <><Check size={16} className="mr-2" />{t('my_profile')}</>
            }
          </Button>
        </div>

        {/* ── PORTFOLIO CARD ── */}
        <div className="uc-card p-7 animate-fade-in">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="uc-eyebrow mb-1 block">Gallery</span>
              <h2 className="text-base font-bold tracking-tight">Work Portfolio</h2>
            </div>
            <div className="flex items-center gap-2.5">
              {portfolioImages.length > 0 && (
                <span className="text-xs font-medium text-muted-foreground">
                  {portfolioImages.length} photos
                </span>
              )}
              <Button
                onClick={() => portfolioInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                size="sm"
                className="rounded-lg border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              >
                {uploading
                  ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Uploading...</>
                  : <><Plus size={13} className="mr-1.5" />Add Images</>
                }
              </Button>
              <input ref={portfolioInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioUpload} />
            </div>
          </div>

          {portfolioImages.length === 0 ? (
            <div
              onClick={() => portfolioInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border border-dashed border-border bg-secondary/60 px-6 py-12 text-center transition hover:border-primary/30 hover:bg-primary-soft/40"
            >
              <ImageIcon className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="mb-1 text-sm text-muted-foreground">No portfolio images yet.</p>
              <p className="text-xs font-semibold text-primary/70">Click to upload your previous work</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {portfolioImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-xl border border-border transition hover:border-primary/30"
                >
                  <img
                    src={img.image_url}
                    alt="Portfolio"
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      onClick={() => handleDeletePortfolio(img.id)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-destructive/50 bg-destructive/20 transition hover:bg-destructive/40"
                    >
                      <Trash2 size={15} className="text-destructive" />
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
