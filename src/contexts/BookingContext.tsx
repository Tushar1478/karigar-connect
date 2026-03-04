import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking } from '@/data/mockData';

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  rateBooking: (id: string, rating: number, review: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const initialBookings: Booking[] = [
  {
    id: 'b1', customerId: 'c1', customerName: 'Priya Mehta', karigarId: 'k1', karigarName: 'Ramesh Kumar',
    skill: 'Electrician', date: '2026-03-05', time: '10:00 AM', status: 'pending', description: 'Need to fix short circuit in kitchen',
  },
  {
    id: 'b2', customerId: 'c2', customerName: 'Rahul Gupta', karigarId: 'k1', karigarName: 'Ramesh Kumar',
    skill: 'Electrician', date: '2026-03-06', time: '2:00 PM', status: 'accepted', description: 'Install new fan and light',
  },
  {
    id: 'b3', customerId: 'c3', customerName: 'Anita Joshi', karigarId: 'k1', karigarName: 'Ramesh Kumar',
    skill: 'Electrician', date: '2026-02-20', time: '11:00 AM', status: 'completed', description: 'Wiring repair', rating: 5, review: 'Great work!',
  },
];

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const addBooking = (booking: Omit<Booking, 'id'>) => {
    setBookings(prev => [...prev, { ...booking, id: `b_${Date.now()}` }]);
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const rateBooking = (id: string, rating: number, review: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, rating, review } : b));
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, updateBookingStatus, rateBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be used within BookingProvider');
  return ctx;
};
