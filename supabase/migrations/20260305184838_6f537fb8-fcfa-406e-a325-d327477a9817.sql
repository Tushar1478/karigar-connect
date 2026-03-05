
-- Add availability and distance columns to karigars
ALTER TABLE public.karigars ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'available';
ALTER TABLE public.karigars ADD COLUMN IF NOT EXISTS distance numeric NOT NULL DEFAULT 0;

-- Create messages table for chat
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: participants of the booking can view messages
CREATE POLICY "Booking participants can view messages" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = messages.booking_id
    AND (b.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.karigars k WHERE k.id = b.karigar_id AND k.user_id = auth.uid()
    ))
  )
);

-- Policy: participants can send messages
CREATE POLICY "Booking participants can send messages" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = messages.booking_id
    AND (b.customer_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.karigars k WHERE k.id = b.karigar_id AND k.user_id = auth.uid()
    ))
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
