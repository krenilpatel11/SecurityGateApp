import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllDeliveries,
  getPendingDeliveries,
  getDeliveryHistory,
  logDelivery,
  markDeliveryReceived,
  type Delivery,
} from "@/api/delivery";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

function StatusBadge({ status }: { status: Delivery["status"] }) {
  const colors: Record<Delivery["status"], string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
    "Left at Gate": "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

function ResidentDeliveryView() {
  const queryClient = useQueryClient();
  const { data: pending = [], isLoading: loadingPending } = useQuery({
    queryKey: ["deliveries", "pending"],
    queryFn: getPendingDeliveries,
  });
  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["deliveries", "history"],
    queryFn: getDeliveryHistory,
  });

  const receivedMutation = useMutation({
    mutationFn: markDeliveryReceived,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deliveries</h1>
      <section>
        <h2 className="text-lg font-semibold mb-3">Pending Deliveries</h2>
        {loadingPending ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="text-muted-foreground">No pending deliveries.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((d) => (
              <Card key={d._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{d.deliveryPerson}</p>
                    {d.deliveryCompany && <p className="text-sm text-muted-foreground">{d.deliveryCompany}</p>}
                    <p className="text-sm">{d.purpose}</p>
                    <StatusBadge status={d.status} />
                  </div>
                  <button
                    onClick={() => receivedMutation.mutate(d._id)}
                    disabled={receivedMutation.isPending}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Mark Received
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">Delivery History</h2>
        {loadingHistory ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground">No delivery history.</p>
        ) : (
          <div className="space-y-3">
            {history.map((d) => (
              <Card key={d._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.deliveryPerson}</p>
                      {d.deliveryCompany && <p className="text-sm text-muted-foreground">{d.deliveryCompany}</p>}
                      <p className="text-sm">{d.purpose}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(d.requestedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GuardDeliveryView() {
  const queryClient = useQueryClient();
  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries", "all"],
    queryFn: getAllDeliveries,
  });

  const [form, setForm] = useState({
    recipientUnit: "",
    deliveryPerson: "",
    deliveryCompany: "",
    purpose: "",
    items: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const logMutation = useMutation({
    mutationFn: logDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      setForm({ recipientUnit: "", deliveryPerson: "", deliveryCompany: "", purpose: "", items: "" });
      setFormSuccess("Delivery logged successfully!");
      setFormError("");
      setTimeout(() => setFormSuccess(""), 3000);
    },
    onError: () => {
      setFormError("Failed to log delivery. Check the unit number.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.recipientUnit || !form.deliveryPerson || !form.purpose) {
      setFormError("Unit, delivery person, and purpose are required.");
      return;
    }
    logMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Delivery Management</h1>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Log New Delivery</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Unit *</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.recipientUnit}
                onChange={(e) => setForm({ ...form, recipientUnit: e.target.value })}
                placeholder="e.g. A-101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Person *</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.deliveryPerson}
                onChange={(e) => setForm({ ...form, deliveryPerson: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.deliveryCompany}
                onChange={(e) => setForm({ ...form, deliveryCompany: e.target.value })}
                placeholder="e.g. Amazon, FedEx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose *</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="e.g. Package delivery"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Items Description</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
                placeholder="e.g. 2 boxes"
              />
            </div>
            {formError && <p className="md:col-span-2 text-red-500 text-sm">{formError}</p>}
            {formSuccess && <p className="md:col-span-2 text-green-600 text-sm">{formSuccess}</p>}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={logMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {logMutation.isPending ? "Logging..." : "Log Delivery"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-3">All Deliveries</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : deliveries.length === 0 ? (
          <p className="text-muted-foreground">No deliveries found.</p>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => {
              const resident = typeof d.resident === "object" ? d.resident : null;
              return (
                <Card key={d._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{d.deliveryPerson}</p>
                        {d.deliveryCompany && <p className="text-sm text-muted-foreground">{d.deliveryCompany}</p>}
                        <p className="text-sm">{d.purpose}</p>
                        {resident && (
                          <p className="text-xs text-muted-foreground">
                            Unit: {resident.unit} — {resident.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <StatusBadge status={d.status} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(d.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DeliveryPage() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "security" || role === "admin") return <GuardDeliveryView />;
  return <ResidentDeliveryView />;
}
