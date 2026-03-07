
-- Function to auto-update karigar availability when booking status changes
CREATE OR REPLACE FUNCTION public.auto_update_karigar_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_active boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE karigar_id = NEW.karigar_id
      AND status = 'accepted'
      AND date = to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')
  ) INTO has_active;

  IF has_active THEN
    UPDATE public.karigars SET availability = 'busy' WHERE id = NEW.karigar_id;
  ELSE
    UPDATE public.karigars SET availability = 'available' 
    WHERE id = NEW.karigar_id AND availability = 'busy';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_karigar_availability
AFTER INSERT OR UPDATE OF status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.auto_update_karigar_availability();
