import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SignupCustomer = () => {
  const { signupCustomer } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signupCustomer(form);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created!');
      navigate('/customer');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Customer Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your account to book services</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <button type="button" onClick={() => navigate('/login/customer')} className="font-semibold text-primary hover:underline">Login</button>
          </p>
        </form>
      </div>
    </div>
  );
};

const SignupKarigar = () => {
  const { signupKarigar } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', skill: '', experience: '', location: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signupKarigar({
      name: form.name, email: form.email, password: form.password, phone: form.phone,
      skill: form.skill, experience: Number(form.experience), location: form.location,
      price: Number(form.price), description: form.description,
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Registration successful!');
      navigate('/karigar-dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Karigar Sign Up</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register to offer your services</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required /></div>
          <div>
            <Label>Skill Category</Label>
            <Select value={form.skill} onValueChange={v => setForm(f => ({ ...f, skill: v }))}>
              <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
              <SelectContent>
                {['Electrician','Plumber','Carpenter','AC Repair','Mason','Painter','Cleaning','Appliance Repair'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Years of Experience</Label><Input type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} required /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required /></div>
          <div><Label>Service Price (₹ per visit)</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
          <div><Label>Short Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
          <p className="text-center text-sm text-muted-foreground">
            Already registered? <button type="button" onClick={() => navigate('/login/karigar')} className="font-semibold text-primary hover:underline">Login</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export { SignupCustomer, SignupKarigar };
