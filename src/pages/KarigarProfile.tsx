import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Briefcase, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import TrustBadges from '@/components/TrustBadges';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import { supabase } from '@/integrations/supabase/client';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const KarigarProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addBooking } = useBookings();
  const [karigar, setKarigar] = useState<Tables<'karigars'> | null>(null);
  const [reviews, setReviews] = useState<Tables<'reviews'>[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<{ id: string; image_url: string }[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const distance = karigar ? (Number((karigar as any).distance) || (Math.random() * 4 + 0.3).toFixed(1)) : '0';

  useEffect(() => {
    const fetchData = async () => {
      const { data: k } = await supabase.from('karigars').select('*').eq('id', id!).single();
      setKarigar(k);
      const { data: r } = await supabase.from('reviews').select('*').eq('karigar_id', id!).order('created_at', { ascending: false });
      setReviews(r || []);
      const { data: p } = await supabase.from('portfolio_images').select('*').eq('karigar_id', id!).order('created_at', { ascending: false });
      setPortfolioImages(p || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  if (!karigar) return <div className="flex min-h-screen items-center justify-center"><p>Karigar not found</p></div>;

  const handleBook = async () => {
    if (!date || !time || !user?.authUser || !user.profile) return;
    await addBooking({
      customer_id: user.authUser.id,
      customer_name: user.profile.name,
      karigar_id: karigar.id,
      karigar_name: karigar.name,
      skill: karigar.skill,
      date,
      time,
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
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-start">
            <img src={karigar.photo} alt={karigar.name} className="h-28 w-28 rounded-2xl object-cover" />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-foreground">{karigar.name}</h1>
                <AvailabilityBadge status={(karigar as any).availability || 'available'} />
              </div>
              <p className="text-lg font-semibold text-primary">{karigar.skill}</p>
              <div className="mt-1">
                <TrustBadges rating={Number(karigar.rating)} reviewCount={karigar.review_count} completedJobs={karigar.completed_jobs} size="md" />
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <StarRating rating={Number(karigar.rating)} />
                <span className="text-sm text-muted-foreground">{Number(karigar.rating).toFixed(1)} ({karigar.review_count} reviews)</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{karigar.experience} yrs exp</span>
                <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{karigar.completed_jobs} jobs</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />₹{karigar.price}/visit</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{karigar.location}</span>
                <span className="flex items-center gap-1 text-info font-medium"><Navigation className="h-4 w-4" />{distance} km away</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-2 font-semibold text-foreground">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{karigar.description}</p>
          </div>

          {user?.role === 'customer' && (
            <Button className="mt-4 w-full" size="lg" onClick={() => setBookingOpen(true)}>Book Service</Button>
          )}

          {/* Portfolio Gallery */}
          {portfolioImages.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">Previous Work</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolioImages.map(img => (
                  <div key={img.id} className="overflow-hidden rounded-xl border border-border">
                    <img src={img.image_url} alt="Portfolio work" className="aspect-square w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.customer_name}</span>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Book {karigar.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} max={new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]} />
              </div>
              <div><Label>Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
              <div><Label>Job Description (optional)</Label><Textarea placeholder="Describe the work needed..." value={description} onChange={e => setDescription(e.target.value)} /></div>
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
