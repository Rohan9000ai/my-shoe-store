"use client";

import { useEffect, useState, type FormEvent } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setError("Could not load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setName("");
      await loadCategories();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not delete category.");
        setDeletingId(null);
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Could not delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">Categories</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-brown/10 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            Add New Category
          </h2>
          <Input
            label="Category Name"
            placeholder="e.g. Men's Oxfords"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" isLoading={isSubmitting}>
            Add Category
          </Button>
        </form>

        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            All Categories
          </h2>

          {isLoading ? (
            <p className="mt-4 text-sm text-brown/40">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="mt-4 text-sm text-brown/40">
              No categories yet — add your first one.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-brown/5">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-espresso">{cat.name}</p>
                    <p className="text-xs text-brown/40">/{cat.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === cat.id ? "Deleting..." : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}