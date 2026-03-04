import { Karigar } from '@/data/mockData';
import { MapPin, Clock, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/StarRating';

const KarigarCard = ({ karigar }: { karigar: Karigar }) => {
  const navigate = useNavigate();

  return (
    <div className="group rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="flex gap-4">
        <img
          src={karigar.photo}
          alt={karigar.name}
          className="h-20 w-20 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{karigar.name}</h3>
          <p className="text-sm font-medium text-primary">{karigar.skill}</p>
          <div className="mt-1 flex items-center gap-1">
            <StarRating rating={karigar.rating} size={14} />
            <span className="text-xs text-muted-foreground">({karigar.reviewCount})</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{karigar.experience} yrs</span>
        <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />₹{karigar.price}/visit</span>
        {karigar.distance && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{karigar.distance}</span>}
      </div>
      <Button
        className="mt-3 w-full"
        size="sm"
        onClick={() => navigate(`/karigar/${karigar.id}`)}
      >
        View Profile
      </Button>
    </div>
  );
};

export default KarigarCard;
