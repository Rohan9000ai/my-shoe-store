"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
  status: string; // "available" | "unavailable"
}

// Per-row actions on the admin products list: edit, switch between
// Available/Unavailable in one click, and delete.
export default function ProductRowActions({
  productId,
  productName,
  status,
}: ProductRowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<"status" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAvailable = status === "available";

  const toggleStatus = async () => {
    setError(null);
    setBusy("status");

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isAvailable ? "unavailable" : "available" }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not change the status.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not change the status.");
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    setError(null);
    setBusy("delete");

    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not delete the product.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not delete the product.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/products/${productId}`}
        className="rounded-md border border-brown/20 px-2.5 py-1 text-xs font-medium text-brown hover:border-gold hover:text-gold"
      >
        Edit
      </Link>

      <button
        type="button"
        onClick={toggleStatus}
        disabled={busy !== null}
        className={`rounded-md px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${
          isAvailable
            ? "border border-brown/20 text-brown hover:border-gold hover:text-gold"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {busy === "status" ? "Saving..." : isAvailable ? "Make Unavailable" : "Make Available"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={busy !== null}
        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {busy === "delete" ? "Deleting..." : "Delete"}
      </button>

      {error && <p className="w-full text-xs text-red-500">{error}</p>}
    </div>
  );
}