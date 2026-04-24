import { MdEvent, MdCheckCircle, MdBadge, MdWarning, MdAttachMoney } from "react-icons/md";
import { Card, CardContent } from "../card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";


// Define the Stat type to match your API response
export interface Stat {
  id?: string;
  label: string;
  value: string;
  type?: "event" | "payment" | "visitor" | string;
  status?: string;
}

// Map of icons and styles based on stat type
const statStyles: Record<string, {
  icon: ReactNode;
  bg: string;
  textColor: string;
  valueColor: string;
}> = {
  event: {
    icon: <MdEvent className="w-6 h-6 text-primary" />,
    bg: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-950 dark:text-blue-50",
    valueColor: "text-blue-950 dark:text-blue-50",
  },
  payment: {
    icon: <MdCheckCircle className="w-6 h-6 text-green-600" />,
    bg: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-950 dark:text-green-50",
    valueColor: "text-green-600 dark:text-green-400",
  },
  visitor: {
    icon: <MdBadge className="w-6 h-6 text-gray-600" />,
    bg: "bg-gray-50 dark:bg-gray-900/50",
    textColor: "text-gray-950 dark:text-gray-50",
    valueColor: "text-gray-950 dark:text-gray-50",
  },
  // Fallback styles and additional types
  default: {
    icon: <MdWarning className="w-6 h-6 text-orange-500" />,
    bg: "bg-orange-50 dark:bg-orange-950/30",
    textColor: "text-orange-950 dark:text-orange-50",
    valueColor: "text-orange-950 dark:text-orange-50",
  },
  overdue: {
    icon: <MdAttachMoney className="w-6 h-6 text-red-600" />,
    bg: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-950 dark:text-red-50",
    valueColor: "text-red-600 dark:text-red-300",
  },
};


interface StatsCardsProps {
  stats?: Stat[];
}

export function StatsCards({ stats: statsProp }: StatsCardsProps) {
  const statsToUse = statsProp ?? [];
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statsToUse.map((stat) => {
        // Get styling based on stat type, or use default styles
        const style = statStyles[stat.type || 'default'] || statStyles.default;
        
        return (
          <Card 
            key={stat.id || stat.label} 
            className={cn(style.bg, "border-none shadow-sm overflow-hidden")}
          >
            <CardContent className="px-4 py-2 flex justify-between items-start">
              <div>
                <div className={cn("text-sm font-medium mb-1", style.textColor)}>
                  {stat.label}
                </div>
                <div className={cn("text-2xl font-bold", style.valueColor)}>
                  {stat.value}
                </div>
              </div>
              <div className="rounded-full bg-white/60 dark:bg-white/5 p-3 shadow-xs">
                {style.icon}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

export function StatsCardsSkeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 py-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-6 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
