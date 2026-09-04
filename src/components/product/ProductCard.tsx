import Link from "next/link";

interface ProductCardProduct {
  id: string;
  name: string;
  price: number | string;
  discount?: number | string | null;
  images: { imageUrl: string }[];
  sizes: { size: string }[];
}

// Matches the product-card design: image, discount badge, name, price
// (with strikethrough original when discounted), size hint, hover effect.
export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const price = Number(product.price);
  const discount = product.discount ? Number(product.discount) : 0;
  const finalPrice = discount > 0 ? price - discount : price;
  const thumbnail = product.images[0]?.imageUrl;
  const sizeLabels = product.sizes.map((s) => s.size);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-brown/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-brown/5">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-brown/30">
            No image
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Sale
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-espresso">{product.name}</h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-espresso">
            PKR {finalPrice.toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-xs text-brown/40 line-through">
              PKR {price.toLocaleString()}
            </span>
          )}
        </div>

        {sizeLabels.length > 0 && (
          <p className="mt-1 truncate text-xs text-brown/40">
            Sizes: {sizeLabels.join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}