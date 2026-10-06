import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SKILLS = ['Electrician', 'Plumber', 'Carpenter', 'AC Repair', 'Mason', 'Painter', 'Cleaning', 'Appliance Repair'];

/* ─── PAGE SHELL ─────────────────────────────────────── */
function PageShell({ children }) {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-secondary/40 flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

/* ─── HEADER ─────────────────────────────────────────── */
function PageHeader({ tag, headline, accent }) {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-8">
      <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center font-extrabold text-xl shadow-md">
        K
      </div>
      <p className="uc-eyebrow mb-2">{tag}</p>
      <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
        {headline}
        <br />
        <span className="text-primary">{accent}</span>
      </h1>
    </div>
  );
}

/* ─── FORM CARD ─────────────────────────────────────── */
function FormCard({ children }) {
  const { t } = useLanguage();
  return <div className="uc-card p-8">{children}</div>;
}

/* ─── LOGIN LINK ─────────────────────────────────────── */
function LoginLink({ text, onClick }) {
  const { t } = useLanguage();
  return (
    <p className="text-center text-sm text-muted-foreground">
      {text}{' '}
      <button
        type="button"
        onClick={onClick}
        className="text-primary font-semibold hover:text-primary/80 transition-colors"
      >
        {t('login')}
      </button>
    </p>
  );
}

/* ══════════════════════════════════════════════════════
   CUSTOMER SIGNUP
══════════════════════════════════════════════════════ */
const SignupCustomer = () => {
  const { t } = useLanguage();
  const { signupCustomer } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);

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
      <FormCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-name">{t('my_profile')}</Label>
            <Input id="c-name" value={form.name} onChange={set('name')} placeholder="Full name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-email">{t('login')}</Label>
            <Input id="c-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-password">{t('profile')}</Label>
            <Input id="c-password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-phone">Phone</Label>
            <Input id="c-phone" value={form.phone} onChange={set('phone')} placeholder="+91 00000 00000" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="c-location">{t('location')}</Label>
            <Input id="c-location" value={form.location} onChange={set('location')} placeholder="City, Area" required />
          </div>

          <div className="flex flex-col gap-4 mt-1">
            <Button type="submit" disabled={loading} className="w-full font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                'Create Account'
              )}
            </Button>
            <LoginLink text="Already have an account?" onClick={() => navigate('/login/customer')} />
          </div>
        </form>
      </FormCard>
    </PageShell>
  );
};

/* ══════════════════════════════════════════════════════
   KARIGAR SIGNUP
══════════════════════════════════════════════════════ */
const SignupKarigar = () => {
  const { t } = useLanguage();
  const { signupKarigar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', skill: '', experience: '', location: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);

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

  return (
    <PageShell>
      <PageHeader tag="Karigar · Sign Up" headline="Start earning" accent="today." />
      <FormCard>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="k-name">Name</Label>
            <Input id="k-name" value={form.name} onChange={set('name')} placeholder="Full name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="k-email">Email</Label>
            <Input id="k-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="k-password">Password</Label>
            <Input id="k-password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="k-phone">Phone</Label>
            <Input id="k-phone" value={form.phone} onChange={set('phone')} placeholder="+91 00000 00000" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="k-skill">Skill Category</Label>
            <Select value={form.skill} onValueChange={(v) => setForm(f => ({ ...f, skill: v }))} required>
              <SelectTrigger id="k-skill">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                {SKILLS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="k-experience">Experience (yrs)</Label>
              <Input id="k-experience" type="number" value={form.experience} onChange={set('experience')} placeholder="0" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="k-price">Price (₹/visit)</Label>
              <Input id="k-price" type="number" value={form.price} onChange={set('price')} placeholder="500" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="k-location">{t('location')}</Label>
            <Input id="k-location" value={form.location} onChange={set('location')} placeholder="City, Area" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="k-description">Short Description</Label>
            <Textarea id="k-description" value={form.description} onChange={set('description')} placeholder="Briefly describe your expertise…" required rows={3} className="resize-none" />
          </div>

          <div className="flex flex-col gap-4 mt-1">
            <Button type="submit" disabled={loading} className="w-full font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering…
                </>
              ) : (
                'Register'
              )}
            </Button>
            <LoginLink text="Already registered?" onClick={() => navigate('/login/karigar')} />
          </div>
        </form>
      </FormCard>
    </PageShell>
  );
};

export { SignupCustomer, SignupKarigar };
