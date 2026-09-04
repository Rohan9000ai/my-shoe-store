"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import SizeSelector from "@/components/product/SizeSelector";

interface SizeOption {
  size: string;
  stockQuantity: number;
}

interface AddToCartFormProps {
  productId: string;
  name: string;
  price: number;
  discount: number;
  imageUrl?: string;
  sizes: SizeOption[];
}

// Size selector + quantity stepper + Add to Cart button. Split out from
// the product detail page (a server component) since this needs client
// interactivity to read/write CartContext.
export default function AddToCartForm({
  productId,
  name,
  price,
  discount,
  imageUrl,
  sizes,
}: AddToCartFormProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedStock = sizes.find((s) => s.size === selectedSize)?.stockQuantity ?? 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({ productId, name, price, discount, size: selectedSize, imageUrl }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      <SizeSelector sizes={sizes} selectedSize={selectedSize} onSelect={setSelectedSize} />

      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-espresso">Quantity</p>
        <div className="flex items-center rounded-md border border-brown/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 text-brown hover:text-gold"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(selectedStock || 99, q + 1))}
            className="px-3 py-1 text-brown hover:text-gold"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleAddToCart}
        disabled={!selectedSize || selectedStock === 0}
      >
        {added ? "Added to Cart ✓" : "Add to Cart"}
      </Button>
    </div>
  );
}