"use client";

import { useState, type MouseEvent } from "react";

interface ProductImage {
  imageUrl: string;
  altText?: string | null;
}

interface ProductImageMagnifierProps {
  images: ProductImage[];
  productName: string;
}

// Main image with hover-to-zoom magnifier (desktop only, since hover
// doesn't apply on touch devices) plus a thumbnail strip to switch
// between images — matches the product-detail-page design.
export default function ProductImageMagnifier({
  images,
  productName,
}: ProductImageMagnifierProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const activeImage = images[selectedIndex];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  if (!activeImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-brown/5 text-sm text-brown/40">
        No image available
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg border border-brown/10 bg-white"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage.imageUrl}
          alt={activeImage.altText || productName}
          className="h-full w-full object-cover"
        />

        {/* Zoomed layer — shown on hover, follows cursor position */}
        {isZooming && (
          <div
            className="pointer-events-none absolute inset-0 hidden bg-no-repeat sm:block"
            style={{
              backgroundImage: `url(${activeImage.imageUrl})`,
              backgroundSize: "200%",
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.imageUrl}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                index === selectedIndex ? "border-gold" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.altText || `${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}