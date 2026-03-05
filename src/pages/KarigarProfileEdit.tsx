import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Camera, Plus, Trash2 } from 'lucide-react';

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
    // Also update profile name/location
    if (user?.authUser) {
      await supabase.from('profiles').update({ name: form.name, location: form.location }).eq('user_id', user.authUser.id);
    }
    setSaving(false);
    if (error) toast.error('Failed to save'); else toast.success('Profile updated!');
  };

  if (!karigar) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Edit Profile</h1>
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img src={form.photo} alt="Profile" className="h-28 w-28 rounded-2xl object-cover border border-border" />
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Skill Category</Label><Input value={form.skill} onChange={e => setForm(f => ({ ...f, skill: e.target.value }))} /></div>
            <div><Label>Years of Experience</Label><Input type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: Number(e.target.value) }))} /></div>
            <div><Label>Service Price (₹)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
            <div className="sm:col-span-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Profile'}</Button>

          {/* Portfolio */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Work Portfolio</h2>
              <Button size="sm" variant="outline" onClick={() => portfolioInputRef.current?.click()} className="gap-1">
                <Plus className="h-4 w-4" /> Add Images
              </Button>
              <input ref={portfolioInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioUpload} />
            </div>
            {portfolioImages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No portfolio images yet. Upload your previous work to showcase your skills!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolioImages.map(img => (
                  <div key={img.id} className="group relative overflow-hidden rounded-xl border border-border">
                    <img src={img.image_url} alt="Portfolio" className="aspect-square w-full object-cover" />
                    <button onClick={() => handleDeletePortfolio(img.id)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KarigarProfileEdit;
