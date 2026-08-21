import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, X, Bell, Wrench } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { bookings } = useBookings();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName = user?.profile?.name || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const notifications = useMemo(() => {
    if (!user) return [];

    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      accepted: 'Accepted',
      on_the_way: 'On the way',
      completed: 'Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };

    const isCustomer = user.role === 'customer';
    const isKarigar = user.role === 'karigar';

    const myBookings = bookings.filter(b => {
      if (isCustomer) return b.customer_id === user.authUser.id;
      if (isKarigar) return b.karigar_id === user.karigar?.id;
      return false;
    });

    return myBookings
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 8)
      .map(b => {
        const statusLabel = statusLabels[b.status] || b.status;
        const otherName = isCustomer ? b.karigar_name : b.customer_name;
        const prefix = isCustomer ? 'Your booking with' : 'Booking from';
        const message = `${prefix} ${otherName} is ${statusLabel}`;
        const when = new Date(b.updated_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        return { id: b.id, message, when, status: b.status };
      });
  }, [bookings, user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const homeRoute = isAuthenticated
    ? user?.role === 'customer' ? '/customer' : '/karigar-dashboard'
    : '/';

  const customerLinks = [
    { label: t('home'), path: '/customer' },
    { label: t('my_bookings'), path: '/my-bookings' },
    { label: t('profile'), path: '/customer-profile' },
  ];

  const karigarLinks = [
    { label: t('dashboard'), path: '/karigar-dashboard' },
    { label: t('my_profile'), path: '/karigar-profile-edit' },
  ];

  const navLinks = user?.role === 'customer' ? customerLinks : user?.role === 'karigar' ? karigarLinks : [];

  const isActive = (path: string) => location.pathname === path;

  const statusTone = (status: string) =>
    status === 'completed' || status === 'accepted'
      ? 'bg-success/10 text-success'
      : status === 'pending' || status === 'on_the_way'
        ? 'bg-warning/15 text-warning'
        : 'bg-destructive/10 text-destructive';

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur transition-shadow ${
        scrolled ? 'border-border shadow-sm' : 'border-transparent'
      }`}
    >
      <div className="uc-container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate(homeRoute)}
          className="flex items-center gap-2.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wrench className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Karigar<span className="text-primary">Hub</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(link.path)
                  ? 'bg-primary-soft text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen(o => !o)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg animate-fade-in">
                    <div className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">
                      Notifications
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0">
                            <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${statusTone(n.status).split(' ')[0].replace('/10', '').replace('/15', '')}`} />
                            <div className="min-w-0">
                              <p className="text-sm text-foreground">{n.message}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{n.when}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {initials}
                </span>
                <span className="max-w-28 truncate text-sm font-semibold text-foreground">{displayName}</span>
              </div>
              <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" onClick={() => navigate('/login/customer')} className="font-semibold">
                Log in
              </Button>
              <Button onClick={() => navigate('/signup/customer')} className="rounded-xl font-semibold">
                Get started
              </Button>
            </div>
          )}

          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileOpen(o => !o)}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden animate-fade-in">
          <div className="uc-container flex flex-col gap-1 py-3">
            {isAuthenticated && (
              <div className="mb-2 flex items-center gap-3 rounded-2xl bg-secondary p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
                  <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
                </div>
              </div>
            )}

            {navLinks.map(link => (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className={`rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  isActive(link.path) ? 'bg-primary-soft text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="py-2 sm:hidden">
              <LanguageSelector />
            </div>

            {isAuthenticated ? (
              <Button variant="outline" onClick={handleLogout} className="mt-1 justify-start gap-2 rounded-xl">
                <User className="h-4 w-4" /> Log out
              </Button>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Button variant="outline" className="rounded-xl" onClick={() => navigate('/login/customer')}>
                  Log in
                </Button>
                <Button className="rounded-xl" onClick={() => navigate('/signup/customer')}>
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
