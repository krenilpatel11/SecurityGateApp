import { AlertCircle, Clock } from "lucide-react";

export function VisitorAlertsCard() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <div className="font-semibold mb-2">Security Alerts</div>
      <div className="flex items-center gap-2 text-danger mb-1">
        <AlertCircle className="w-4 h-4" />
        <span>Unauthorized Access</span>
        <span className="text-xs text-muted-foreground ml-auto">Side entrance - 2:30 PM</span>
      </div>
      <div className="flex items-center gap-2 text-warning">
        <Clock className="w-4 h-4" />
        <span>Extended Visit</span>
        <span className="text-xs text-muted-foreground ml-auto">Guest over 4 hours</span>
      </div>
    </div>
  );
}
