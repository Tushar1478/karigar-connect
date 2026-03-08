import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type Booking = Tables<'bookings'>;

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  addBooking: (booking: { customer_id: string; customer_name: string; karigar_id: string; karigar_name: string; skill: string; date: string; time: string; description?: string }) => Promise<void>;
  updateBookingStatus: (id: string, status: string) => Promise<void>;
  rateBooking: (id: string, rating: number, review: string, karigarId: string, customerName: string) => Promise<void>;
  refetch: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) { setBookings([]); return; }
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Realtime subscription for live status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchBookings]);

  const addBooking = async (booking: { customer_id: string; customer_name: string; karigar_id: string; karigar_name: string; skill: string; date: string; time: string; description?: string }) => {
    await supabase.from('bookings').insert({ ...booking, status: 'pending' });
    fetchBookings();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    // Prevent any status change on cancelled or completed bookings
    const existing = bookings.find(b => b.id === id);
    if (existing && (existing.status === 'cancelled' || existing.status === 'completed')) {
      console.warn(`Cannot update booking ${id}: already ${existing.status}`);
      return;
    }
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update booking status:', error);
      return;
    }
    fetchBookings();
  };

  const rateBooking = async (id: string, rating: number, review: string, karigarId: string, customerName: string) => {
    // Update booking
    await supabase.from('bookings').update({ rating, review }).eq('id', id);
    // Insert review (triggers auto-update of karigar stats)
    if (user?.authUser) {
      await supabase.from('reviews').insert({
        customer_id: user.authUser.id,
        customer_name: customerName,
        karigar_id: karigarId,
        rating,
        text: review,
      });
    }
    fetchBookings();
  };

  return (
    <BookingContext.Provider value={{ bookings, loading, addBooking, updateBookingStatus, rateBooking, refetch: fetchBookings }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
};
