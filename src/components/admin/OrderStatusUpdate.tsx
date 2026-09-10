"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

// Status colors with good visibility
const statusColors = {
  pending: 'bg-yellow-300 text-yellow-900 border-yellow-400',
  confirmed: 'bg-blue-300 text-blue-900 border-blue-400',
  shipped: 'bg-purple-300 text-purple-900 border-purple-400',
  delivered: 'bg-green-300 text-green-900 border-green-400',
  cancelled: 'bg-red-300 text-red-900 border-red-400',
};

// Status labels
const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusUpdate({ orderId, currentStatus }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="bg-white rounded-lg p-4 border border-brown/20 shadow-sm">
      {/* Title - smaller */}
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-espresso">
        Update Shipment Status
      </p>
      
      {/* Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        {/* Select dropdown - wider */}
        <div className="w-full sm:w-56">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`
              w-full rounded-lg border-2 px-3 py-1.5 text-xs font-semibold capitalize
              focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent
              transition-all duration-200 cursor-pointer
              ${statusColors[status as keyof typeof statusColors] || 'bg-gray-300 text-gray-900 border-gray-400'}
            `}
          >
            {STATUS_OPTIONS.map((option) => (
              <option 
                key={option} 
                value={option} 
                className="capitalize text-espresso bg-white py-1 text-xs"
              >
                {statusLabels[option]}
              </option>
            ))}
          </select>
        </div>
        
        {/* Update button - smaller text */}
        <button
          type="button"
          onClick={handleUpdate}
          disabled={isSaving || status === currentStatus}
          className={`
            w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold 
            transition-all duration-200 whitespace-nowrap
            min-h-[32px]
            ${status === currentStatus || isSaving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gold text-espresso hover:bg-gold/90 hover:shadow-md'
            }
          `}
        >
          {isSaving ? 'Updating...' : 'Update Status'}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-xs text-red-700 bg-red-100 rounded-lg px-3 py-1.5 border border-red-300">
          ⚠️ {error}
        </p>
      )}
      
      {/* Current status - smaller */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-brown/10">
        <span className="text-xs font-semibold text-espresso whitespace-nowrap">Current:</span>
        <span className={`
          text-xs font-semibold px-3 py-0.5 rounded-full
          ${statusColors[currentStatus as keyof typeof statusColors] || 'bg-gray-300 text-gray-900'}
        `}>
          {statusLabels[currentStatus as keyof typeof statusLabels] || currentStatus}
        </span>
      </div>
    </div>
  );
}