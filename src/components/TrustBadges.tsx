import { ShieldCheck, Award, Briefcase } from 'lucide-react';

interface TrustBadgesProps {
  rating: number;
  reviewCount: number;
  completedJobs: number;
  size?: 'sm' | 'md';
}

const TrustBadges = ({ rating, reviewCount, completedJobs, size = 'sm' }: TrustBadgesProps) => {
  const badges: { icon: typeof ShieldCheck; label: string; color: string }[] = [];

  if (reviewCount >= 1) {
    badges.push({ icon: ShieldCheck, label: 'Verified', color: 'bg-info/15 text-info border-info/30' });
  }
  if (rating >= 4.5 && reviewCount >= 2) {
    badges.push({ icon: Award, label: 'Top Rated', color: 'bg-warning/15 text-warning border-warning/30' });
  }
  if (completedJobs >= 100) {
    badges.push({ icon: Briefcase, label: '100+ Jobs', color: 'bg-success/15 text-success border-success/30' });
  }

  if (badges.length === 0) return null;

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map(b => (
        <span key={b.label} className={`inline-flex items-center gap-0.5 rounded-full border font-semibold ${b.color} ${textSize} ${padding}`}>
          <b.icon className={iconSize} />
          {b.label}
        </span>
      ))}
    </div>
  );
};

export default TrustBadges;
