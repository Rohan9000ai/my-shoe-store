"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import SizeSelector from "@/components/product/SizeSelector";
import CartAddedModal, { type AddedItem } from "@/components/cart/CartAddedModal";

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

// Size selector + quantity stepper inline on the page, with the Add to
// Cart button in a sticky bar fixed to the bottom of the screen. After
// adding, a cart window offers Checkout or Continue Shopping.
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
  const [modalOpen, setModalOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<AddedItem | null>(null);

  const selectedStock = sizes.find((s) => s.size === selectedSize)?.stockQuantity ?? 0;
  const finalPrice = price - discount;

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const stock = sizes.find((s) => s.size === size)?.stockQuantity ?? 1;
    setQuantity((q) => Math.max(1, Math.min(q, stock)));
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;

    addItem(
      { productId, name, price, discount, size: selectedSize, imageUrl, maxStock: selectedStock },
      quantity
    );

    setAddedItem({ name, size: selectedSize, quantity, unitPrice: finalPrice, imageUrl });
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <SizeSelector sizes={sizes} selectedSize={selectedSize} onSelect={handleSelectSize} />

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
      </div>

      {/* Sticky Add to Cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brown/10 bg-beige/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="truncate text-sm font-semibold text-espresso">{name}</p>
            <p className="text-xs text-brown/60">
              PKR {finalPrice.toLocaleString()}
              {selectedSize ? ` · Size ${selectedSize}` : " · Select a size"}
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize || selectedStock === 0}
            >
              {!selectedSize ? "Select a Size" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>

      <CartAddedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={addedItem}
      />
    </>
  );
}