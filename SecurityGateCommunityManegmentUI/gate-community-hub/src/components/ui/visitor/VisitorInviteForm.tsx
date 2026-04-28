import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { inviteVisitor } from "@/api/visitor";
import { Button } from "../Button";

export function VisitorInviteForm() {
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    purpose: "Personal Visit",
  });
  const [, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await inviteVisitor({
      name: form.name,
      purpose: form.purpose,
      visitDate: form.date,
      visitTime: form.time,
    });
    setLoading(false);
    // Optionally show a toast or reset form
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="text-primary" />
        <span className="font-semibold">Invite Visitor</span>
      </div>
      <Input
        name="name"
        placeholder="Enter guest name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <div className="flex gap-2">
        <Input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="flex-1"
          required
        />
        <Input
          name="time"
          type="time"
          value={form.time}
          onChange={handleChange}
          className="flex-1"
          required
        />
      </div>
      <Select name="purpose" value={form.purpose} onValueChange={v => setForm(f => ({ ...f, purpose: v }))}>
      <SelectContent>
        <SelectItem value="Personal Visit">Personal Visit</SelectItem>
        <SelectItem value="Business Meeting">Business Meeting</SelectItem>
        <SelectItem value="Delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full">
         Generate QR Code
      </Button>
    </form>
  );
}
