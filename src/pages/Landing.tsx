import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
            <span className="text-xl font-bold text-foreground">KarigarHub</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-2xl text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find Trusted <span className="text-primary">Karigars</span> Near You
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            Book skilled electricians, plumbers, carpenters and more — instantly. Quality service at your doorstep.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="w-full gap-2 text-base sm:w-auto"
              onClick={() => navigate('/login/customer')}
            >
              <Users className="h-5 w-5" />
              Login as Customer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 text-base sm:w-auto"
              onClick={() => navigate('/login/karigar')}
            >
              <Wrench className="h-5 w-5" />
              Login as Karigar
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup/customer')} className="font-semibold text-primary hover:underline">Sign up as Customer</button>
            {' · '}
            <button onClick={() => navigate('/signup/karigar')} className="font-semibold text-primary hover:underline">Sign up as Karigar</button>
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          {[
            { label: 'Karigars', value: '500+' },
            { label: 'Bookings', value: '10K+' },
            { label: 'Rating', value: '4.8★' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
