import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import StickyCartButton from "@/components/layout/StickyCartButton";
import ProductImageMagnifier from "@/components/product/ProductImageMagnifier";
import AddToCartForm from "@/components/product/AddToCartForm";
import FavoriteButton from "@/components/product/FavoriteButton";
import { getProductById } from "@/services/product.service";
import { buildMetadata, buildProductJsonLd } from "@/lib/seo";
import RelatedProducts from "@/components/product/RelatedProducts";
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProductById(params.id);

  if (!product) {
    return buildMetadata({ title: "Product Not Found", noIndex: true });
  }

  return buildMetadata({
    title: product.name,
    description: product.description.slice(0, 155),
    path: `/products/${product.id}`,
    image: product.images[0]?.imageUrl,
  });
}

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
  const totalStock = product.sizes.reduce((sum, s) => sum + s.stockQuantity, 0);

  const productJsonLd = buildProductJsonLd({
    id: product.id,
    name: product.name,
    description: product.description,
    price: finalPrice,
    imageUrl: product.images[0]?.imageUrl,
    inStock: totalStock > 0,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />

      {/* 👇 Added pb-24 sm:pb-0 here so the sticky bar doesn't cover content on mobile */}
      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:pb-0">
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
          <ProductImageMagnifier
            images={product.images}
            productName={product.name}
            outOfStock={totalStock <= 0}
          />

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

            <div className="mt-5">
              <FavoriteButton
                variant="full"
                product={{
                  productId: product.id,
                  name: product.name,
                  price,
                  discount,
                  imageUrl: product.images[0]?.imageUrl,
                }}
              />
            </div>

            <div className="mt-6 border-t border-brown/10 pt-6">
              <AddToCartForm
                productId={product.id}
                name={product.name}
                price={price}
                discount={discount}
                imageUrl={product.images[0]?.imageUrl}
                outOfStock={totalStock <= 0}
                sizes={product.sizes.map((s) => ({
                  size: s.size,
                  stockQuantity: s.stockQuantity,
                }))}
              />
            </div>
          </div>
        </div>
      </main>

      <RelatedProducts
        productId={product.id}
        categories={product.categories.map((c) => c.category)}
      />

      <div className="bg-espresso pb-20">
        <Footer />
      </div>
      <StickyCartButton raised showHint />
      <WhatsAppBubble raised />
    </>
  );
}