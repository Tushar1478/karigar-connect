import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button onClick={() => navigate(isAuthenticated ? (user?.role === 'customer' ? '/customer' : '/karigar-dashboard') : '/')} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">K</span>
          </div>
          <span className="text-xl font-bold text-foreground">KarigarHub</span>
        </button>

        {isAuthenticated && (
          <>
            <nav className="hidden items-center gap-6 md:flex">
              {user?.role === 'customer' && (
                <>
                  <button onClick={() => navigate('/customer')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</button>
                  <button onClick={() => navigate('/my-bookings')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">My Bookings</button>
                </>
              )}
              {user?.role === 'karigar' && (
                <button onClick={() => navigate('/karigar-dashboard')} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Dashboard</button>
              )}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{user?.role === 'customer' ? user.customer?.name : user?.karigar?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </div>
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>
      {mobileOpen && isAuthenticated && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {user?.role === 'customer' && (
              <>
                <button onClick={() => { navigate('/customer'); setMobileOpen(false); }} className="text-left text-sm font-medium">Home</button>
                <button onClick={() => { navigate('/my-bookings'); setMobileOpen(false); }} className="text-left text-sm font-medium">My Bookings</button>
              </>
            )}
            {user?.role === 'karigar' && (
              <button onClick={() => { navigate('/karigar-dashboard'); setMobileOpen(false); }} className="text-left text-sm font-medium">Dashboard</button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-fit">
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
