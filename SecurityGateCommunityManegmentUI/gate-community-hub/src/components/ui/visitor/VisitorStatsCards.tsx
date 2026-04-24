import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Clock, QrCode } from "lucide-react";

interface Props {
  stats: {
    today: number;
    pending: number;
    active: number;
  };
}

export function VisitorStatsCards({ stats }: Props) {
  const items = [
    {
      label: "Today's Visitors",
      value: stats.today,
      icon: <UserPlus className="text-primary" />,
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="text-success" />,
    },
    {
      label: "Active Passes",
      value: stats.active,
      icon: <QrCode className="text-accent" />,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <Card key={item.label} className="p-2 flex flex-col items-center">
          <CardContent className="flex flex-col items-center gap-1 p-0">
            <div className="rounded-full bg-muted p-2 mb-1">{item.icon}</div>
            <div className="text-lg font-bold">{item.value}</div>
            <div className="text-xs text-muted-foreground text-center">{item.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
