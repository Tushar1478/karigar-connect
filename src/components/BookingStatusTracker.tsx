import { CheckCircle, Circle, Truck, Wrench, Send } from 'lucide-react';

const STAGES = [
  { key: 'pending', label: 'Request Sent', icon: Send },
  { key: 'accepted', label: 'Karigar Accepted', icon: CheckCircle },
  { key: 'on_the_way', label: 'On The Way', icon: Truck },
  { key: 'in_progress', label: 'Work In Progress', icon: Wrench },
  { key: 'completed', label: 'Job Completed', icon: CheckCircle },
];

const stageIndex = (status: string) => {
  const idx = STAGES.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
};

const BookingStatusTracker = ({ status }: { status: string }) => {
  const current = stageIndex(status);

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {STAGES.map((stage, i) => {
        const done = i <= current;
        const Icon = stage.icon;
        return (
          <div key={stage.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${done ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground/30 bg-background text-muted-foreground/50'}`}>
                {done ? <Icon className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              <span className={`text-[10px] text-center leading-tight max-w-[70px] ${done ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded transition-colors ${i < current ? 'bg-success' : 'bg-muted-foreground/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookingStatusTracker;
