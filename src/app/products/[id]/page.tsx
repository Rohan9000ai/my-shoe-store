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
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getProductByIdCached as getProductById } from "@/services/product.service";
import { buildMetadata, buildProductJsonLd } from "@/lib/seo";
import RelatedProducts from "@/components/product/RelatedProducts";
export const revalidate = 60;

// Pre-build the newest available products at deploy time, so opening one
// serves a ready-made page. Products added later are built on their first
// visit and cached the same way.
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "available" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true },
    });

    return products.map((product) => ({ id: product.id }));
  } catch {
    // If the database can't be reached during the build, skip pre-building
    // instead of failing the deploy; pages are then built on first visit.
    return [];
  }
}

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

      <Suspense fallback={<RelatedProductsFallback />}>
        <RelatedProducts
          productId={product.id}
          categories={product.categories.map((c) => c.category)}
        />
      </Suspense>

      <div className="bg-espresso pb-20">
        <Footer />
      </div>
      <StickyCartButton raised showHint />
      <WhatsAppBubble raised />
    </>
  );
}
// Placeholder shown while "More from..." loads, so the product itself
// appears first instead of waiting for it.
function RelatedProductsFallback() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12">
      <div className="border-t border-brown/10 pt-8">
        <div className="h-6 w-48 animate-pulse rounded bg-brown/10" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-brown/10" />
              <div className="mt-2 h-3 w-3/4 rounded bg-brown/10" />
              <div className="mt-1 h-4 w-1/3 rounded bg-brown/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}