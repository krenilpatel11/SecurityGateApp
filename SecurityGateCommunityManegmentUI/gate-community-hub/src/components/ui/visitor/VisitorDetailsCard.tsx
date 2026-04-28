import type { Visitor } from "@/types/visitor";
import { Badge } from "@/components/ui/badge";
import { Button } from "../Button";

interface Props {
  visitor: Visitor | null;
}

export function VisitorDetailsCard({ visitor }: Props) {
  if (!visitor) return (
    <div className="bg-card rounded-xl p-4 shadow-sm min-h-[300px] flex items-center justify-center text-muted-foreground">
      Select a visitor to view details
    </div>
  );

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <div className="flex flex-col items-center gap-2">
        <img src={visitor.photoUrl} alt={visitor.name} className="w-16 h-16 rounded-full" />
        <div className="font-semibold">{visitor.name}</div>
        <div className="text-xs text-muted-foreground">{visitor.unit}</div>
      </div>
      <div className="mt-4 space-y-1 text-sm">
        <div>
          <span className="font-medium">Category: </span>
          <Badge>{visitor.category}</Badge>
        </div>
        <div>
          <span className="font-medium">Check-in Time: </span>
          {new Date(visitor.checkInTime ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div>
          <span className="font-medium">Entry Point: </span>
          {visitor.entryPoint}
        </div>
        <div>
          <span className="font-medium">Visit Purpose: </span>
          {visitor.purpose}
        </div>
        <div>
          <span className="font-medium">Status: </span>
          <Badge>{visitor.status}</Badge>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="default">Send Message</Button>
        <Button variant="outline">View History</Button>
      </div>
    </div>
  );
}
