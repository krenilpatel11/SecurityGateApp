import { getAllVisitors } from "@/api/visitor";
import { Skeleton } from "@/components/ui/skeleton";
import { VisitorAlertsCard } from "@/components/ui/visitor/VisitorAlertsCard";
import { VisitorDetailsCard } from "@/components/ui/visitor/VisitorDetailsCard";
import { VisitorSummaryCard } from "@/components/ui/visitor/VisitorSummaryCard";
import { VisitorTable } from "@/components/ui/visitor/VisitorTable";
import type { Visitor } from "@/types/visitor";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


export default function VisitorLogs() {
  const [selected, setSelected] = useState<Visitor | null>(null);


// Fetch all visitors (for Security/Admin)
  const { data: visitors, isLoading, error } = useQuery<Visitor[]>({
    queryKey: ["allVisitors"],
    queryFn: () => getAllVisitors(),
  });

  // Example summary (replace with real API or compute from visitors)
  const summary = {
    total: visitors?.length || 0,
    active: visitors?.filter(v => v.status === "Active").length || 0,
    residents: visitors?.filter(v => v.category === "Resident").length || 0,
    guests: visitors?.filter(v => v.category === "Guest").length || 0,
    deliveries: visitors?.filter(v => v.category === "Delivery").length || 0,
  };

  return (
    <div className="container mx-auto py-6 flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl" />
        ) : error ? (
          <div className="text-danger">Error loading visitors.</div>
        ) : (
          <VisitorTable visitors={visitors!} onRowClick={setSelected} />
        )}
      </div>
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <VisitorDetailsCard visitor={selected} />
        <VisitorSummaryCard summary={summary} />
        <VisitorAlertsCard />
      </div>
    </div>
  );
}