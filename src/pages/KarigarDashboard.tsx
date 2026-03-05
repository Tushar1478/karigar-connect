import { useState } from 'react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import BookingChat from '@/components/BookingChat';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, IndianRupee, Star, Briefcase, Truck, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const KarigarDashboard = () => {
  const { user } = useAuth();
  const { bookings, updateBookingStatus } = useBookings();
  const karigar = user?.karigar;
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>((karigar as any)?.availability || 'available');

  const myBookings = bookings.filter(b => b.karigar_id === karigar?.id);
  const pending = myBookings.filter(b => b.status === 'pending');
  const active = myBookings.filter(b => ['accepted', 'on_the_way', 'in_progress'].includes(b.status));
  const completed = myBookings.filter(b => b.status === 'completed');

  const handleAccept = async (id: string) => { await updateBookingStatus(id, 'accepted'); toast.success('Booking accepted!'); };
  const handleReject = async (id: string) => { await updateBookingStatus(id, 'rejected'); toast.info('Booking rejected.'); };
  const handleStatusChange = async (id: string, status: string) => { await updateBookingStatus(id, status); toast.success(`Status updated to ${status.replace('_', ' ')}`); };

  const handleAvailability = async (val: string) => {
    setAvailability(val);
    if (karigar) {
      await supabase.from('karigars').update({ availability: val } as any).eq('id', karigar.id);
      toast.success(`Status set to ${val}`);
    }
  };

  if (!karigar) return <div className="flex min-h-screen items-center justify-center"><p>Loading dashboard...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground animate-fade-in">Welcome, {karigar.name}!</h1>
          <AvailabilityBadge status={availability} />
        </div>
        <div className="mb-6 flex items-center gap-3">
          <p className="text-muted-foreground">{karigar.skill} · {karigar.location}</p>
          <Select value={availability} onValueChange={handleAvailability}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          <h2 className="mb-4 text-lg font-bold text-foreground">Active Jobs</h2>
          {active.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active jobs.</p>
          ) : (
            <div className="space-y-3">
              {active.map(b => (
                <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{b.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{b.date} · {b.time}</p>
                      <p className="mt-1 text-xs font-medium capitalize text-info">{b.status.replace('_', ' ')}</p>
                    </div>
                    <div className="flex gap-2">
                      {b.status === 'accepted' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(b.id, 'on_the_way')} className="gap-1"><Truck className="h-4 w-4" />On Way</Button>
                      )}
                      {b.status === 'on_the_way' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(b.id, 'in_progress')} className="gap-1"><Wrench className="h-4 w-4" />Start Work</Button>
                      )}
                      {b.status === 'in_progress' && (
                        <Button size="sm" onClick={() => handleStatusChange(b.id, 'completed')}>Mark Complete</Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    {expandedChat === b.id ? (
                      <>
                        <Button size="sm" variant="ghost" className="mb-2" onClick={() => setExpandedChat(null)}>Hide Chat</Button>
                        <BookingChat bookingId={b.id} />
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setExpandedChat(b.id)}>Open Chat</Button>
                    )}
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
