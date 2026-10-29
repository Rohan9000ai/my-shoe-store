import CategoryRow from "@/components/product/CategoryRow";
import { getCategoriesWithProducts } from "@/services/category.service";

// Homepage section: one sliding row per category that has products.
// Server component — queries the database directly and passes plain
// numbers (not Prisma Decimals) down to the client row component.
export default async function CategoryRows() {
  const categories = await getCategoriesWithProducts(10);

  if (categories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-brown/40">
        No products yet. Check back soon.
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          name={category.name}
          slug={category.slug}
          products={category.products.map(({ product }) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            discount: product.discount ? Number(product.discount) : null,
            images: product.images.map((image) => ({ imageUrl: image.imageUrl })),
            sizes: product.sizes.map((size) => ({
              size: size.size,
              stockQuantity: size.stockQuantity,
            })),
          }))}
        />
      ))}
    </section>
  );
}