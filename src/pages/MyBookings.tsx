import { useState } from 'react';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import StarRatingInput from '@/components/StarRatingInput';
import BookingStatusTracker from '@/components/BookingStatusTracker';
import BookingChat from '@/components/BookingChat';
import { useBookings } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  accepted: 'bg-info/15 text-info border-info/30',
  completed: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const MyBookings = () => {
  const { user } = useAuth();
  const { bookings, rateBooking, updateBookingStatus } = useBookings();
  const [ratingDialog, setRatingDialog] = useState<{ id: string; karigarId: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [expandedChat, setExpandedChat] = useState<string | null>(null);

  const myBookings = bookings.filter(b => b.customer_id === user?.authUser?.id);

  const handleRate = async () => {
    if (!ratingDialog || rating === 0 || !user?.profile) return;
    await rateBooking(ratingDialog.id, rating, review, ratingDialog.karigarId, user.profile.name);
    toast.success('Rating submitted!');
    setRatingDialog(null);
    setRating(0);
    setReview('');
  };

  const chatStatuses = ['accepted', 'completed'];

  const handleCancel = async (id: string) => {
    await updateBookingStatus(id, 'cancelled');
    toast.success('Booking cancelled');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground animate-fade-in">My Bookings</h1>
        {myBookings.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {myBookings.map((b, i) => (
              <div key={b.id} className="rounded-xl border border-border bg-card p-4 shadow-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{b.karigar_name}</h3>
                    <p className="text-sm text-primary">{b.skill}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{b.date} · {b.time}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusColor[b.status] || ''}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                {b.status !== 'rejected' && (
                  <div className="mt-3">
                    <BookingStatusTracker status={b.status} />
                  </div>
                )}

                {b.rating && (
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={b.rating} size={14} />
                    <span className="text-xs text-muted-foreground">{b.review}</span>
                  </div>
                )}
                {b.status === 'completed' && !b.rating && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setRatingDialog({ id: b.id, karigarId: b.karigar_id })}>Rate Service</Button>
                )}

                {chatStatuses.includes(b.status) && (
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
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!ratingDialog} onOpenChange={() => setRatingDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rate this service</DialogTitle></DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <StarRatingInput value={rating} onChange={setRating} />
              <Textarea placeholder="Write a review (optional)" value={review} onChange={e => setReview(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRatingDialog(null)}>Cancel</Button>
              <Button onClick={handleRate} disabled={rating === 0}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MyBookings;
