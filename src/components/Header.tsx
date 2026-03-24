import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { bookings } = useBookings();
  const { t } = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoSpin,   setLogoSpin]   = useState(true);
  const [scrolled,   setScrolled]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);

  const displayName = user?.profile?.name || 'User';
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

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
    const isKarigar  = user.role === 'karigar';

    const myBookings = bookings.filter(b => {
      if (isCustomer) return b.customer_id === user.authUser.id;
      if (isKarigar)  return b.karigar_id  === user.karigar?.id;
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
    const t = setTimeout(() => setLogoSpin(false), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const homeRoute = isAuthenticated
    ? user?.role === 'customer' ? '/customer' : '/karigar-dashboard'
    : '/';

  const customerLinks = [
    { label: 'Home',        path: '/customer' },
    { label: 'My Bookings', path: '/my-bookings' },
    { label: 'Profile',     path: '/customer-profile' },
  ];

  const karigarLinks = [
    { label: 'Dashboard', path: '/karigar-dashboard' },
    { label: 'My Profile', path: '/karigar-profile-edit' },
  ];

  const navLinks = user?.role === 'customer' ? customerLinks : user?.role === 'karigar' ? karigarLinks : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        @keyframes logoSpin {
          0%   { transform: rotate(0deg) scale(0.4); opacity: 0; }
          65%  { transform: rotate(385deg) scale(1.1); opacity: 1; }
          100% { transform: rotate(360deg) scale(1); opacity: 1; }
        }
        @keyframes logoPulse {
          0%,100% { filter: drop-shadow(0 0 5px rgba(251,146,60,0.35)); }
          50%     { filter: drop-shadow(0 0 12px rgba(251,146,60,0.7)); }
        }
        @keyframes mobileSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-spin { animation: logoSpin 1s cubic-bezier(.22,1,.36,1) forwards; }
        .logo-idle { animation: logoPulse 3s ease-in-out infinite; }

        .nav-link {
          font-size: 0.875rem; font-weight: 500;
          color: rgba(255,255,255,0.45);
          background: none; border: none; cursor: pointer;
          padding: 5px 2px; position: relative;
          font-family: 'Sora', sans-serif;
          transition: color .2s;
          text-decoration: none;
        }
        .nav-link::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 1.5px; border-radius: 999px;
          background: #fb923c;
          transform: scaleX(0);
          transition: transform .25s cubic-bezier(.22,1,.36,1);
        }
        .nav-link:hover        { color: rgba(255,255,255,0.85); }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link.active       { color: #fb923c; font-weight: 600; }
        .nav-link.active::after{ transform: scaleX(1); }

        .logout-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45);
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all .2s;
          font-family: 'Sora', sans-serif;
        }
        .logout-btn:hover {
          border-color: rgba(248,113,113,0.4);
          background: rgba(248,113,113,0.08);
          color: #f87171;
        }

        .mobile-nav-link {
          display: block; width: 100%; text-align: left;
          padding: 11px 16px; border-radius: 12px;
          font-size: 0.9rem; font-weight: 500;
          background: none; border: none; cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: all .2s;
          color: rgba(255,255,255,0.5);
        }
        .mobile-nav-link:hover  { background: rgba(255,255,255,0.05); color: #fff; }
        .mobile-nav-link.active { background: rgba(251,146,60,0.1); color: #fb923c; font-weight: 600; }

        .notif-btn {
          position: relative;
          width: 34px; height: 34px;
          border-radius: 999px;
          border: 1.5px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          transition: all .2s;
        }
        .notif-btn:hover {
          border-color: rgba(251,146,60,0.5);
          background: rgba(251,146,60,0.12);
          color: #fb923c;
        }
        .notif-dot {
          position: absolute;
          top: 5px; right: 6px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #fb923c;
          box-shadow: 0 0 6px rgba(251,146,60,0.8);
        }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,10,15,0.88)' : 'rgba(10,10,15,0.72)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'background .3s, border-color .3s',
        fontFamily: "'Sora', sans-serif",
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── LOGO ── */}
          <button
            onClick={() => navigate(homeRoute)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div className={logoSpin ? 'logo-spin' : 'logo-idle'} style={{ width: 34, height: 34, flexShrink: 0 }}>
              <img src="/icon.png" alt="KarigarHub" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.015em', color: '#fff', lineHeight: 1 }}>
              Karigar<span style={{ color: '#fb923c' }}>Hub</span>
            </span>
          </button>

          {/* ── DESKTOP NAV ── */}
          {isAuthenticated && (
            <>
              <nav style={{ display: 'none', alignItems: 'center', gap: 28 }} className="md-nav">
                {navLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* ── DESKTOP RIGHT ── */}
              <div style={{ display: 'none', alignItems: 'center', gap: 12, position: 'relative' }} className="md-right">
                {/* Notifications */}
                <button
                  type="button"
                  className="notif-btn"
                  onClick={() => setNotifOpen(o => !o)}
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                  {notifications.length > 0 && <span className="notif-dot" />}
                </button>

                {notifOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 280,
                      maxHeight: 320,
                      overflowY: 'auto',
                      background: 'rgba(10,10,15,0.97)',
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 18px 60px rgba(0,0,0,0.6)',
                      padding: '10px 10px 8px',
                      zIndex: 120,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff' }}>Notifications</span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono',monospace', letterSpacing: '0.08em'" }}>
                        {notifications.length || 0} ITEMS
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', padding: '8px 4px' }}>
                        No recent activity yet.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            style={{
                              padding: '8px 9px',
                              borderRadius: 10,
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <p style={{ fontSize: '0.8rem', color: '#fff', marginBottom: 3 }}>
                              {n.message}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono',monospace" }}>
                              {n.when}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '6px 12px 6px 6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 999,
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(251,146,60,0.5))',
                    border: '1.5px solid rgba(251,146,60,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.58rem', fontWeight: 700,
                    color: '#fb923c', fontFamily: "'Space Mono',monospace",
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                </div>

                {/* Logout */}
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={14} /> Logout
                </button>
              </div>

              {/* ── MOBILE HAMBURGER ── */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  background: mobileOpen ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${mobileOpen ? 'rgba(251,146,60,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10, width: 38, height: 38,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: mobileOpen ? '#fb923c' : 'rgba(255,255,255,0.6)',
                  transition: 'all .2s',
                }}
                className="mobile-hamburger"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          )}
        </div>

        {/* ── MOBILE DRAWER ── */}
        {mobileOpen && isAuthenticated && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(10,10,15,0.97)',
            backdropFilter: 'blur(20px)',
            padding: '12px 16px 16px',
            animation: 'mobileSlide .25s cubic-bezier(.22,1,.36,1)',
          }} className="mobile-drawer">

            {/* User info row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 14, marginBottom: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,rgba(249,115,22,0.3),rgba(251,146,60,0.5))',
                border: '1.5px solid rgba(251,146,60,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700,
                color: '#fb923c', fontFamily: "'Space Mono',monospace",
              }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{displayName}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 3, textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 10px' }} />

            {/* Logout */}
            <button className="logout-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Inline responsive styles — show desktop nav on md+ */}
      <style>{`
        @media (min-width: 768px) {
          .md-nav         { display: flex !important; }
          .md-right       { display: flex !important; }
          .mobile-hamburger { display: none !important; }
          .mobile-drawer  { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Header;