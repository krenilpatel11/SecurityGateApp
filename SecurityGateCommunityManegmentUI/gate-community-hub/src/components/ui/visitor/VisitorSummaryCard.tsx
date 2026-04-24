interface Props {
  summary: {
    total: number;
    active: number;
    residents: number;
    guests: number;
    deliveries: number;
  };
}

export function VisitorSummaryCard({ summary }: Props) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <div className="font-semibold mb-2">Today's Summary</div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span>Total Visitors</span><span>{summary.total}</span></div>
        <div className="flex justify-between"><span>Currently Active</span><span>{summary.active}</span></div>
        <div className="flex justify-between"><span>Residents</span><span>{summary.residents}</span></div>
        <div className="flex justify-between"><span>Guests</span><span>{summary.guests}</span></div>
        <div className="flex justify-between"><span>Deliveries</span><span>{summary.deliveries}</span></div>
      </div>
    </div>
  );
}
