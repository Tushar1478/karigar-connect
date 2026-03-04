import { Star } from 'lucide-react';
import { useState } from 'react';

const StarRatingInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-8 w-8 ${i <= (hover || value) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRatingInput;
