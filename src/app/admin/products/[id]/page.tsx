import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        sizes: true,
        categories: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    name: product.name,
    description: product.description,
    price: Number(product.price),
    discount: product.discount ? Number(product.discount) : null,
    status: product.status,
    categoryIds: product.categories.map((c) => c.categoryId),
    images: product.images.map((img, index) => ({
      imageUrl: img.imageUrl,
      altText: img.altText ?? "",
      position: img.position ?? index,
    })),
    sizes: product.sizes.map((s) => ({
      size: s.size,
      stockQuantity: s.stockQuantity,
      sku: s.sku ?? "",
    })),
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">
        Edit Product
      </h1>

      <div className="mt-6 rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          initialData={initialData}
        />
      </div>
    </div>
  );
}