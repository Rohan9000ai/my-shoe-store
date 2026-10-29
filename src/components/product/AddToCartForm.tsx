"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
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
  outOfStock?: boolean;
}

export default function AddToCartForm({
  productId,
  name,
  price,
  discount,
  imageUrl,
  sizes,
  outOfStock = false,
}: AddToCartFormProps) {
  const { addItem } = useCart();
  const router = useRouter();
  
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
    if (outOfStock || !selectedSize) return;

    addItem(
      { productId, name, price, discount, size: selectedSize, imageUrl, maxStock: selectedStock },
      quantity
    );

    setAddedItem({ name, size: selectedSize, quantity, unitPrice: finalPrice, imageUrl });
    setModalOpen(true);
  };

  const handleBuyNow = () => {
    if (outOfStock || !selectedSize) return;

    // Add to cart, then go straight to checkout
    addItem(
      { productId, name, price, discount, size: selectedSize, imageUrl, maxStock: selectedStock },
      quantity
    );
    router.push("/checkout");
  };

  const buttonLabel = outOfStock
    ? "Out of Stock"
    : !selectedSize
      ? "Select a Size"
      : "Add to Cart";

  return (
    <>
      <div className="space-y-4">
        {outOfStock && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            This product is currently out of stock.
          </p>
        )}

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

      {/* Sticky Bottom Bar */}
      {/* Sticky Bottom Bar - Transparent Background */}
      {/* Sticky Bottom Bar - Transparent Background */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent p-4 pb-6 pointer-events-none">
        
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 pointer-events-auto">
          
          {/* Buy It Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            className={`w-full py-3.5 text-sm font-semibold uppercase tracking-wide rounded-md transition-all duration-200 shadow-lg border-2 ${
              selectedSize && !outOfStock
                ? "bg-white border-espresso text-espresso hover:bg-beige"
                : "bg-beige/80 border-brown/20 text-brown/50 cursor-not-allowed backdrop-blur-sm"
            }`}
            disabled={!selectedSize || outOfStock}
          >
            Buy It Now
          </button>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-3.5 text-sm font-semibold uppercase tracking-wide rounded-md transition-all duration-200 shadow-lg ${
              selectedSize && !outOfStock
                ? "bg-gold text-espresso hover:bg-gold/90"
                : "bg-gold/40 text-espresso/50 cursor-not-allowed"
            }`}
            disabled={!selectedSize || outOfStock}
          >
            {buttonLabel}
          </button>
          
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