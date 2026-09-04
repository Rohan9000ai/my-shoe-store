"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface CategoryOption {
  id: string;
  name: string;
}

interface ImageItem {
  imageUrl: string;
  altText: string;
  position: number;
}

interface SizeItem {
  size: string;
  stockQuantity: number;
  sku: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  categories: CategoryOption[];
  initialData?: {
    name: string;
    description: string;
    price: number;
    discount: number | null;
    status: "available" | "unavailable";
    categoryIds: string[];
    images: ImageItem[];
    sizes: SizeItem[];
  };
}

// Cloudinary's widget script attaches itself to window at runtime.
declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event?: string; info?: { secure_url: string } }) => void
      ) => { open: () => void };
    };
  }
}

export default function ProductForm({
  mode,
  productId,
  categories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [discount, setDiscount] = useState(initialData?.discount?.toString() ?? "");
  const [status, setStatus] = useState<"available" | "unavailable">(
    initialData?.status ?? "available"
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categoryIds ?? []
  );
  const [images, setImages] = useState<ImageItem[]>(initialData?.images ?? []);
  const [sizes, setSizes] = useState<SizeItem[]>(
    initialData?.sizes ?? [{ size: "", stockQuantity: 0, sku: "" }]
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const widgetRef = useRef<{ open: () => void } | null>(null);

  // Load Cloudinary's Upload Widget script once.
  useEffect(() => {
    if (document.getElementById("cloudinary-widget-script")) return;
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openUploadWidget = async () => {
    setError(null);
    setIsUploading(true);

    try {
      const res = await fetch("/api/admin/cloudinary-signature", { method: "POST" });
      if (!res.ok) throw new Error("Could not start upload");

      const { signature, timestamp, folder, apiKey, cloudName } = await res.json();

      if (!window.cloudinary) {
        setError("Upload widget is still loading — please try again in a moment.");
        setIsUploading(false);
        return;
      }

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          apiKey,
          uploadSignature: signature,
          uploadSignatureTimestamp: timestamp,
          folder,
          multiple: true,
          maxFiles: 6,
          maxFileSize: 5 * 1024 * 1024, // 5MB per project validation rules
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        },
        (uploadError, result) => {
          if (uploadError) {
            setError("Image upload failed. Please try again.");
            return;
          }
          if (result?.event === "success" && result.info) {
            setImages((prev) => [
              ...prev,
              { imageUrl: result.info!.secure_url, altText: "", position: prev.length },
            ]);
          }
          if (result?.event === "close") {
            setIsUploading(false);
          }
        }
      );

      widgetRef.current.open();
    } catch {
      setError("Could not start upload. Please try again.");
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i }))
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addSizeRow = () => {
    setSizes((prev) => [...prev, { size: "", stockQuantity: 0, sku: "" }]);
  };

  const removeSizeRow = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSizeRow = (index: number, field: keyof SizeItem, value: string) => {
    setSizes((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: field === "stockQuantity" ? Number(value) : value }
          : row
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    const validSizes = sizes.filter((s) => s.size.trim() !== "");
    if (validSizes.length === 0) {
      setError("Please add at least one size with stock.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name,
      description,
      price: Number(price),
      discount: discount ? Number(discount) : undefined,
      status,
      categoryIds: selectedCategories,
      images,
      sizes: validSizes,
    };

    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${productId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main product details */}
        <div className="space-y-4 lg:col-span-2">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-espresso">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
              className="w-full rounded-md border border-brown/20 bg-white px-4 py-3 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Regular Price (PKR)"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Discount (PKR)"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-espresso">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "available" | "unavailable")}
              className="w-full rounded-md border border-brown/20 bg-white px-4 py-3 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-gold/60"
            >
              <option value="available">Active</option>
              <option value="unavailable">Draft / Unavailable</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-espresso">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selectedCategories.includes(cat.id)
                      ? "border-gold bg-gold text-espresso"
                      : "border-brown/20 text-brown hover:border-gold"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="text-xs text-brown/40">
                  No categories yet — add some via the database first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Images + size/stock matrix */}
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-espresso">
              Atelier Assets Preview
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div
                  key={img.imageUrl}
                  className="group relative aspect-square overflow-hidden rounded-md border border-brown/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.altText || "Product image"}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={openUploadWidget}
                disabled={isUploading}
                className="flex aspect-square items-center justify-center rounded-md border border-dashed border-brown/30 text-2xl text-brown/50 hover:border-gold hover:text-gold disabled:opacity-50"
              >
                {isUploading ? "…" : "+"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-espresso">
              Size & Stock Matrix
            </label>
            <div className="space-y-2">
              {sizes.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Size (e.g. 42 EU)"
                    value={row.size}
                    onChange={(e) => updateSizeRow(index, "size", e.target.value)}
                    className="w-24 rounded-md border border-brown/20 px-2 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={row.stockQuantity}
                    onChange={(e) => updateSizeRow(index, "stockQuantity", e.target.value)}
                    className="w-20 rounded-md border border-brown/20 px-2 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="SKU (optional)"
                    value={row.sku}
                    onChange={(e) => updateSizeRow(index, "sku", e.target.value)}
                    className="flex-1 rounded-md border border-brown/20 px-2 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSizeRow(index)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove size row"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSizeRow}
                className="text-xs font-semibold text-gold hover:underline"
              >
                + Add another size
              </button>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {mode === "create" ? "Save Atelier Product" : "Update Atelier Product"}
      </Button>
    </form>
  );
}