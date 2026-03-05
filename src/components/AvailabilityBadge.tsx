const statusConfig: Record<string, { dot: string; text: string; label: string }> = {
  available: { dot: 'bg-success', text: 'text-success', label: 'Available' },
  busy: { dot: 'bg-warning', text: 'text-warning', label: 'Busy' },
  offline: { dot: 'bg-muted-foreground', text: 'text-muted-foreground', label: 'Offline' },
};

const AvailabilityBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.offline;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.text}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default AvailabilityBadge;
