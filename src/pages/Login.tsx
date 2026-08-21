import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const Login = () => {
  const { role } = useParams<{ role: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedRole = role === 'karigar' ? 'karigar' : 'customer';
  const isCustomer = normalizedRole === 'customer';

  // Only allow same-origin relative paths as a post-login redirect target.
  const rawNext = searchParams.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Logged in!');
      if (nextPath) {
        window.location.href = nextPath;
        return;
      }
      navigate(isCustomer ? '/customer' : '/karigar-dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-secondary/40 flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center font-extrabold text-xl shadow-md">
            K
          </div>
          <span className="uc-eyebrow block mb-2">{isCustomer ? 'Customer' : 'Karigar'} Portal</span>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
        </div>

        {/* Form card */}
        <div className="uc-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-1 font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate(isCustomer ? '/signup/customer' : '/signup/karigar')}
              className="text-primary font-semibold underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
