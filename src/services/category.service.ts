import { prisma } from "@/lib/prisma";
import type { CategoryInput } from "@/lib/validations";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(data: CategoryInput) {
  const slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);

  return prisma.category.create({
    data: { name: data.name.trim(), slug },
  });
}

// Cascade delete on the schema removes the product_categories links
// automatically; the products themselves are untouched.
export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}