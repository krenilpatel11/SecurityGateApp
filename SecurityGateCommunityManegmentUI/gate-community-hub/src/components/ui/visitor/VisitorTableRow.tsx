import { Badge } from "@/components/ui/badge";
import type { Visitor } from "@/types/visitor";
import { Eye } from "lucide-react";

interface Props {
  visitor: Visitor;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  Resident: "bg-primary/10 text-primary",
  Delivery: "bg-secondary/10 text-secondary",
  Guest: "bg-accent/10 text-accent",
  Service: "bg-success/10 text-success",
};

const statusColors: Record<string, string> = {
  Active: "bg-success/10 text-success",
  "Checked Out": "bg-muted text-muted-foreground",
  Pending: "bg-warning/10 text-warning",
  Approved: "bg-success/10 text-success",
};

export function VisitorTableRow({ visitor, onClick }: Props) {
  return (
    <tr className="hover:bg-muted cursor-pointer transition" onClick={onClick}>
      <td className="py-2 px-2 flex items-center gap-2">
        <img src={visitor.photoUrl} alt={visitor.name} className="w-8 h-8 rounded-full" />
        <div>
          <div className="font-medium">{visitor.name}</div>
          <div className="text-xs text-muted-foreground">{visitor.unit}</div>
        </div>
      </td>
      <td className="py-2 px-2">
        <Badge className={categoryColors[visitor.category]}>{visitor.category}</Badge>
      </td>
      <td className="py-2 px-2">
        <div>{new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="text-xs text-muted-foreground">{visitor.entryPoint}</div>
      </td>
      <td className="py-2 px-2">
        <Badge className={statusColors[visitor.status]}>{visitor.status}</Badge>
      </td>
      <td className="py-2 px-2">
        <button className="p-2 rounded hover:bg-muted" aria-label="View Details">
          <Eye className="w-5 h-5 text-muted-foreground" />
        </button>
      </td>
    </tr>
  );
}
