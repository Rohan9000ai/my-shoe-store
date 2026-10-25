"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "packing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  // Older statuses from before the new stages — kept so old orders still display.
  confirmed: "Confirmed (old)",
  shipped: "Shipped (old)",
};

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
}

// Status dropdown + Update button. Split from the order detail page (a
// server component) since this needs client interactivity to call the
// status-update API and refresh the server-rendered data afterward.
export default function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // An order still on an old status keeps that status visible in the dropdown.
  const options: string[] = (STATUS_OPTIONS as readonly string[]).includes(currentStatus)
    ? [...STATUS_OPTIONS]
    : [currentStatus, ...STATUS_OPTIONS];

  const handleUpdate = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not update status.");
        setIsSaving(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not update status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brown/50">
        Update Shipment Status
      </p>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 rounded-md border border-brown/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/60"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option] ?? option}
            </option>
          ))}
        </select>
        <div className="w-32">
          <Button
            type="button"
            onClick={handleUpdate}
            isLoading={isSaving}
            disabled={status === currentStatus}
          >
            Update
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}