import { prisma } from "@/lib/prisma";
import type { ProductInput, ProductQueryInput } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

// Lists products with optional filters (category slug, search, price range,
// status) and pagination. Defaults to "available" only, since this powers
// the public storefront by default.
export async function listProducts(query: ProductQueryInput) {
  const { category, search, minPrice, maxPrice, status, page, limit } = query;

  const where: Prisma.ProductWhereInput = {
    status: status ?? "available",
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(category && { categories: { some: { category: { slug: category } } } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        sizes: true,
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      sizes: true,
      categories: { include: { category: true } },
    },
  });
}

export async function createProduct(data: ProductInput, createdBy: string) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      discount: data.discount ?? null,
      status: data.status,
      createdBy,
      categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
      images: {
        create: data.images.map((img, index) => ({
          imageUrl: img.imageUrl,
          altText: img.altText || null,
          position: img.position ?? index,
        })),
      },
      sizes: {
        create: data.sizes.map((size) => ({
          size: size.size,
          stockQuantity: size.stockQuantity,
          sku: size.sku || null,
        })),
      },
    },
  });
}

// Replaces a product's categories/images/sizes and updates its core
// fields, in one transaction. These are set-style fields the form fully
// replaces on every save, rather than being individually patched.
export async function updateProduct(id: string, data: ProductInput) {
  return prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { productId: id } }),
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productSize.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discount: data.discount ?? null,
        status: data.status,
        categories: { create: data.categoryIds.map((categoryId) => ({ categoryId })) },
        images: {
          create: data.images.map((img, index) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || null,
            position: img.position ?? index,
          })),
        },
        sizes: {
          create: data.sizes.map((size) => ({
            size: size.size,
            stockQuantity: size.stockQuantity,
            sku: size.sku || null,
          })),
        },
      },
    }),
  ]);
}

// Cascade delete on the schema removes related images, sizes, and
// category links automatically.
export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}