"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Slide {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  isActive: boolean;
}

interface HeroSettings {
  backgroundImage: string | null;
}

export default function AdminHeroPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [settings, setSettings] = useState<HeroSettings>({ backgroundImage: null });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<Slide> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [slidesRes, settingsRes] = await Promise.all([
        fetch("/api/hero/slides"),
        fetch("/api/hero/settings"),
      ]);

      if (slidesRes.ok) {
        const data = await slidesRes.json();
        setSlides(data.slides || []);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings || { backgroundImage: null });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load hero data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSlide = () => {
    setEditingSlide({
      title: "",
      description: "",
      ctaLabel: "Shop Now",
      ctaHref: "/products",
      order: slides.length,
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setIsEditing(true);
  };

  const handleSaveSlide = async () => {
    if (!editingSlide) return;
    setIsUploading(true);
    setError(null);

    try {
      const url = editingSlide.id
        ? `/api/hero/slides/${editingSlide.id}`
        : "/api/hero/slides";
      const method = editingSlide.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to save slide");
        setIsUploading(false);
        return;
      }

      await fetchData();
      setIsEditing(false);
      setEditingSlide(null);
      router.refresh();
    } catch (error) {
      setError("Failed to save slide");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const response = await fetch("/api/hero/slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchData();
        router.refresh();
      }
    } catch (error) {
      alert("Failed to delete slide");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-espresso">
          Hero Section Management
        </h1>
        <button
          onClick={handleAddSlide}
          className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-espresso hover:bg-gold/90 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* ✅ Default Slides Note - Fixed position */}
      <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 border border-blue-200">
        <p className="font-semibold">💡 Default Slides</p>
        <p className="text-xs text-blue-600 mt-1">
          These are the default hero slides. You can edit, delete, or add new slides below.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Background Settings */}
      <div className="mb-6 rounded-lg border border-brown/20 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-espresso mb-4">
          Background Image
        </h2>
        <div className="flex items-center gap-4">
          {settings.backgroundImage && (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-brown/20">
              <Image
                src={settings.backgroundImage}
                alt="Hero background"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter background image URL"
              value={settings.backgroundImage || ""}
              onChange={(e) => {
                setSettings({ backgroundImage: e.target.value });
              }}
              className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <button
              onClick={async () => {
                try {
                  const response = await fetch("/api/hero/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ backgroundImage: settings.backgroundImage }),
                  });
                  if (response.ok) {
                    await fetchData();
                    router.refresh();
                  }
                } catch (error) {
                  alert("Failed to update background");
                }
              }}
              className="mt-2 px-4 py-2 bg-gold text-espresso rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors"
            >
              Update Background
            </button>
          </div>
        </div>
      </div>

      {/* Slides List */}
      <div className="rounded-lg border border-brown/20 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brown/10 text-xs uppercase tracking-wide text-espresso/70">
            <tr>
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Button</th>
              <th className="px-5 py-3 font-semibold text-center">Status</th>
              <th className="px-5 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-espresso/40">
                  No slides added yet.
                </td>
              </tr>
            ) : (
              slides.map((slide) => (
                <tr key={slide.id} className="border-b border-brown/5 hover:bg-beige/20 transition-colors">
                  <td className="px-5 py-3 text-espresso/70">{slide.order + 1}</td>
                  <td className="px-5 py-3 font-medium text-espresso">{slide.title}</td>
                  <td className="px-5 py-3 text-espresso/70 max-w-xs truncate">
                    {slide.description}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2 py-1 bg-gold/20 text-espresso text-xs rounded">
                      {slide.ctaLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${slide.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditSlide(slide)}
                        className="p-2 text-brown hover:text-gold transition-colors rounded-lg hover:bg-beige/50"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditing && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl bg-white rounded-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-espresso">
                {editingSlide.id ? "Edit Slide" : "Add New Slide"}
              </h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingSlide(null);
                }}
                className="p-2 hover:bg-beige/50 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingSlide.title || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="e.g. Step Into Luxury"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-espresso mb-1">
                  Description
                </label>
                <textarea
                  value={editingSlide.description || ""}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 min-h-[80px]"
                  placeholder="e.g. Handcrafted shoes for the modern connoisseur..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-espresso mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={editingSlide.ctaLabel || "Shop Now"}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaLabel: e.target.value })}
                    className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-espresso mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={editingSlide.ctaHref || "/products"}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaHref: e.target.value })}
                    className="w-full rounded-lg border-2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-espresso">
                  <input
                    type="checkbox"
                    checked={editingSlide.isActive !== false}
                    onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                    className="rounded border-brown/20 text-gold focus:ring-gold"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingSlide(null);
                }}
                className="px-4 py-2 text-sm font-medium text-espresso/70 hover:text-espresso transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSlide}
                disabled={isUploading}
                className="px-6 py-2 bg-gold text-espresso rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {isUploading ? "Saving..." : "Save Slide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}