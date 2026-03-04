import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      // Auth state change will set user, then navigate
      toast.success('Logged in!');
      navigate(role === 'customer' ? '/customer' : '/karigar-dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <span className="text-xl font-bold text-primary-foreground">K</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Login as {role === 'customer' ? 'Customer' : 'Karigar'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate(`/signup/${role}`)} className="font-semibold text-primary hover:underline">Sign up</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
