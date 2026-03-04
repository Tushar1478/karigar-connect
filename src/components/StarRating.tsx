import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${i <= Math.round(rating) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
};

export default StarRating;
