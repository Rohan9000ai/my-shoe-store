import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getProductsByCategory } from "@/services/product.service";

interface RelatedProductsProps {
  productId: string;
  categories: { id: string; name: string; slug: string }[];
}

// Shown under a product's details: other available products from each
// category the product belongs to, with a View All link per category.
export default async function RelatedProducts({
  productId,
  categories,
}: RelatedProductsProps) {
  const sections = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: await getProductsByCategory(category.id, productId, 12),
    }))
  );

  const visible = sections.filter((section) => section.products.length > 0);

  if (visible.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl space-y-12 px-4 pb-12">
      {visible.map(({ category, products }) => (
        <div key={category.id}>
          <div className="mb-4 flex items-end justify-between gap-4 border-t border-brown/10 pt-8">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-espresso sm:text-2xl">
              More from {category.name}
            </h2>
            <Link
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="text-sm font-semibold uppercase tracking-wide text-espresso underline underline-offset-4 hover:text-gold"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  discount: product.discount ? Number(product.discount) : null,
                  images: product.images.map((image) => ({ imageUrl: image.imageUrl })),
                  sizes: product.sizes.map((size) => ({
                    size: size.size,
                    stockQuantity: size.stockQuantity,
                  })),
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}