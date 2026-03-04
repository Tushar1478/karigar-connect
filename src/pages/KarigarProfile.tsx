import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { mockKarigars, mockReviews } from '@/data/mockData';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const KarigarProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const karigar = mockKarigars.find(k => k.id === id);
  const reviews = mockReviews.filter(r => r.karigarId === id);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!karigar) return <div className="flex min-h-screen items-center justify-center"><p>Karigar not found</p></div>;

  const handleBook = () => {
    if (!date || !time) return;
    addBooking({
      customerId: user?.customer?.id || 'c1',
      customerName: user?.customer?.name || 'Customer',
      karigarId: karigar.id,
      karigarName: karigar.name,
      skill: karigar.skill,
      date,
      time,
      status: 'pending',
      description: `${karigar.skill} service requested`,
    });
    setBookingOpen(false);
    toast.success('Booking Confirmed!', { description: `${karigar.name} will be notified.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-2xl animate-fade-in">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-start">
            <img src={karigar.photo} alt={karigar.name} className="h-28 w-28 rounded-2xl object-cover" />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground">{karigar.name}</h1>
              <p className="text-lg font-semibold text-primary">{karigar.skill}</p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <StarRating rating={karigar.rating} />
                <span className="text-sm text-muted-foreground">{karigar.rating} ({karigar.reviewCount} reviews)</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{karigar.experience} yrs exp</span>
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{karigar.completedJobs} jobs</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />₹{karigar.price}/visit</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{karigar.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-2 font-semibold text-foreground">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{karigar.description}</p>
          </div>

          {/* Book button */}
          {user?.role === 'customer' && (
            <Button className="mt-4 w-full" size="lg" onClick={() => setBookingOpen(true)}>Book Service</Button>
          )}

          {/* Reviews */}
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.customerName}</span>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Dialog */}
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Book {karigar.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div><Label>Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button>
              <Button onClick={handleBook} disabled={!date || !time}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default KarigarProfile;
