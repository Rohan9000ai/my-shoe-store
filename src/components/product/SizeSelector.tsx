"use client";

interface SizeOption {
  size: string;
  stockQuantity: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
}

// Standalone size-picker: renders each available size as a button,
// disabling any with zero stock. Selection state is owned by the parent
// (AddToCartForm) so it can be combined with quantity when adding to cart.
export default function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso">
        Select Size
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s.size}
            type="button"
            disabled={s.stockQuantity === 0}
            onClick={() => onSelect(s.size)}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              selectedSize === s.size
                ? "border-gold bg-gold text-espresso"
                : "border-brown/20 text-brown hover:border-gold"
            } ${s.stockQuantity === 0 ? "cursor-not-allowed opacity-30" : ""}`}
          >
            {s.size}
          </button>
        ))}
        {sizes.length === 0 && (
          <p className="text-sm text-brown/40">No sizes available.</p>
        )}
      </div>
    </div>
  );
}