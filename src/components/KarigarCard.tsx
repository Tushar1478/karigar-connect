import { MapPin, Clock, IndianRupee, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/StarRating';
import TrustBadges from '@/components/TrustBadges';
import AvailabilityBadge from '@/components/AvailabilityBadge';
import type { Tables } from '@/integrations/supabase/types';

const KarigarCard = ({ karigar }: { karigar: Tables<'karigars'> }) => {
  const navigate = useNavigate();
  const distance = Number(karigar.distance) || (Math.random() * 4 + 0.3).toFixed(1);

  return (
    <div className="group rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="flex gap-4">
        <img src={karigar.photo} alt={karigar.name} className="h-20 w-20 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{karigar.name}</h3>
            <AvailabilityBadge status={(karigar as any).availability || 'available'} />
          </div>
          <p className="text-sm font-medium text-primary">{karigar.skill}</p>
          <div className="mt-1 flex items-center gap-1">
            <StarRating rating={Number(karigar.rating)} size={14} />
            <span className="text-xs text-muted-foreground">({karigar.review_count})</span>
          </div>
          <TrustBadges rating={Number(karigar.rating)} reviewCount={karigar.review_count} completedJobs={karigar.completed_jobs} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{karigar.experience} yrs</span>
        <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />₹{karigar.price}/visit</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{karigar.location}</span>
        <span className="flex items-center gap-1 text-info font-medium"><Navigation className="h-3.5 w-3.5" />{distance} km away</span>
      </div>
      <Button className="mt-3 w-full" size="sm" onClick={() => navigate(`/karigar/${karigar.id}`)}>
        View Profile
      </Button>
    </div>
  );
};

export default KarigarCard;
