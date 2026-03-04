import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, IndianRupee, Star, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const KarigarDashboard = () => {
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const karigar = user?.karigar;

  const myBookings = bookings.filter(b => b.karigar_id === karigar?.id);
  const pending = myBookings.filter(b => b.status === 'pending');
  const accepted = myBookings.filter(b => b.status === 'accepted');
  const completed = myBookings.filter(b => b.status === 'completed');

  const handleAccept = async (id: string) => { await updateBookingStatus(id, 'accepted'); toast.success('Booking accepted!'); };
  const handleReject = async (id: string) => { await updateBookingStatus(id, 'rejected'); toast.info('Booking rejected.'); };
  const handleComplete = async (id: string) => { await updateBookingStatus(id, 'completed'); toast.success('Job marked as completed!'); };

  if (!karigar) return <div className="flex min-h-screen items-center justify-center"><p>Loading dashboard...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground animate-fade-in">Welcome, {karigar.name}!</h1>
        <p className="mb-6 text-muted-foreground">{karigar.skill} · {karigar.location}</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {[
            { icon: Briefcase, label: 'Completed', value: karigar.completed_jobs, color: 'text-success' },
            { icon: Clock, label: 'Pending', value: pending.length, color: 'text-warning' },
            { icon: IndianRupee, label: 'Earnings', value: `₹${karigar.total_earnings}`, color: 'text-primary' },
            { icon: Star, label: 'Rating', value: Number(karigar.rating).toFixed(1), color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
              <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Incoming Requests</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {pending.map(b => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{b.description}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{b.date} · {b.time}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(b.id)} className="gap-1"><CheckCircle className="h-4 w-4" />Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(b.id)} className="gap-1"><XCircle className="h-4 w-4" />Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Upcoming Jobs</h2>
          {accepted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming jobs.</p>
          ) : (
            <div className="space-y-3">
              {accepted.map(b => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{b.date} · {b.time}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleComplete(b.id)}>Mark Complete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Completed Jobs</h2>
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {completed.map(b => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{b.date}</p>
                    </div>
                    {b.rating && <StarRating rating={b.rating} size={14} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default KarigarDashboard;
