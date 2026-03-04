import { Zap, Droplets, Hammer, Wind, Paintbrush, Wrench, Sparkles, BrickWall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serviceCategories } from '@/data/mockData';

const iconMap: Record<string, React.ElementType> = {
  Zap, Droplets, Hammer, Wind, Paintbrush, Wrench, SparklesIcon: Sparkles, Brick: BrickWall,
};

const ServiceCategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {serviceCategories.map((cat, i) => {
        const Icon = iconMap[cat.icon] || Wrench;
        return (
          <button
            key={cat.id}
            onClick={() => navigate(`/customer?search=${cat.name}`)}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ServiceCategoryGrid;
