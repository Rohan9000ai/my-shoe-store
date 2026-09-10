import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

// ✅ Prevent static generation - database connection needed at runtime
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">
        Add New Product
      </h1>

      <div className="mt-6 rounded-lg border border-brown/20 bg-white p-6 shadow-sm">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}