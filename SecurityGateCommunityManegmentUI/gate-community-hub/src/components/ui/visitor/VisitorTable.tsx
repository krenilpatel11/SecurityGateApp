import type { Visitor } from "@/types/visitor";
import { VisitorTableRow } from "./VisitorTableRow";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";

interface Props {
  visitors: Visitor[];
  onRowClick: (visitor: Visitor) => void;
}

const categories = ["All", "Resident", "Delivery", "Guest", "Service"];

export function VisitorTable({ visitors, onRowClick }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = visitors.filter(
    v =>
      (category === "All" || v.category === category) &&
      (v.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <div className="flex flex-col md:flex-row gap-2 md:items-center mb-4">
        <h2 className="font-semibold text-lg flex-1">Visitor Logs</h2>
        <Input
          placeholder="Search visitors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
       <Select value={category} onValueChange={setCategory}>
  <SelectContent>
    {categories.map(cat => (
      <SelectItem key={cat} value={cat}>
        {cat}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-2 px-2 text-left">Visitor</th>
              <th className="py-2 px-2 text-left">Category</th>
              <th className="py-2 px-2 text-left">Check-in</th>
              <th className="py-2 px-2 text-left">Status</th>
              <th className="py-2 px-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(visitor => (
              <VisitorTableRow
                key={visitor._id}
                visitor={visitor}
                onClick={() => onRowClick(visitor)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
