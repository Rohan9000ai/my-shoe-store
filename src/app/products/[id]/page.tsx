import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import ProductImageMagnifier from "@/components/product/ProductImageMagnifier";
import AddToCartForm from "@/components/product/AddToCartForm";
import { getProductById } from "@/services/product.service";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product || product.status !== "available") {
    notFound();
  }

  const price = Number(product.price);
  const discount = product.discount ? Number(product.discount) : 0;
  const finalPrice = discount > 0 ? price - discount : price;
  const primaryCategory = product.categories[0]?.category.name;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-4 text-xs text-brown/50">
          <Link href="/" className="hover:text-gold">
            Home
          </Link>
          {" / "}
          {primaryCategory && (
            <>
              <span>{primaryCategory}</span>
              {" / "}
            </>
          )}
          <span className="text-espresso">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductImageMagnifier images={product.images} productName={product.name} />

          <div>
            <h1 className="font-heading text-2xl font-bold text-espresso sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-espresso">
                PKR {finalPrice.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-base text-brown/40 line-through">
                  PKR {price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-brown/70">
              {product.description}
            </p>

            <div className="mt-6 border-t border-brown/10 pt-6">
              <AddToCartForm
                productId={product.id}
                name={product.name}
                price={price}
                discount={discount}
                imageUrl={product.images[0]?.imageUrl}
                sizes={product.sizes.map((s) => ({
                  size: s.size,
                  stockQuantity: s.stockQuantity,
                }))}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppBubble />
    </>
  );
}