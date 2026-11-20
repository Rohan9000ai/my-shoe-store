import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getSettings } from "@/services/settings.service";

interface OrderItemInput {
  productId: string;
  size: string;
  quantity: number;
}

interface ShippingInput {
  name: string;
  email?: string;
  phone: string;
  country: string;
  city: string;
  address: string;
}

interface CreateOrderInput {
  items: OrderItemInput[];
  shipping: ShippingInput;
  paymentMethod: "cod" | "online_contact";
  userId?: string | null;
}

// Thrown when a requested size doesn't have enough stock — the API route
// catches this specifically to return a helpful 409 instead of a generic
// 500 error.
export class InsufficientStockError extends Error {
  constructor(
    public productName: string,
    public size: string,
    public available: number
  ) {
    super(
      available > 0
        ? `Only ${available} left in stock for "${productName}" (size ${size})`
        : `"${productName}" (size ${size}) is out of stock`
    );
    this.name = "InsufficientStockError";
  }
}

// Thrown when a product was deleted or the admin switched it to
// Unavailable after the customer put it in their cart.
export class ProductUnavailableError extends Error {
  constructor(public productName: string) {
    super(`"${productName}" is no longer available`);
    this.name = "ProductUnavailableError";
  }
}

async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `LS-${Math.floor(10000 + Math.random() * 90000)}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber: candidate } });
    if (!existing) return candidate;
  }
  // Astronomically unlikely fallback if 5 random collisions happen in a row
  return `LS-${Date.now()}`;
}

// Creates an order and decrements stock for every item, atomically.
// If any item is unavailable or out of stock, the whole transaction rolls
// back — no partial orders, no stock silently disappearing.
export async function createOrder(input: CreateOrderInput) {
  const { items, shipping, paymentMethod, userId } = input;

  if (items.length === 0) {
    throw new Error("Cannot place an order with no items");
  }

  // Uses the same shared settings service the checkout page's
  // OrderSummary reads from, so the price shown and the price charged
  // can never drift apart.
  const {
    deliveryCharge: deliveryChargeSetting,
    freeDeliveryThreshold,
    taxRate,
  } = await getSettings();

  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(
    async (tx) => {
      // One query for every product in the order, instead of one per item.
      const productIds = Array.from(new Set(items.map((item) => item.productId)));
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, discount: true, status: true },
      });
      const productById = new Map(products.map((product) => [product.id, product]));

      let subtotal = 0;
      const orderItemsData: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

      for (const item of items) {
        const product = productById.get(item.productId);

        // Deleted, or switched to Unavailable by the admin: it can't be sold,
        // even if it is still sitting in someone's saved cart.
        if (!product || product.status !== "available") {
          throw new ProductUnavailableError(product?.name ?? "This product");
        }

        // The stock check and the stock decrease are ONE database statement.
        // If two customers buy the last pair at the same moment, the database
        // lets only one of them through — stock can never go below zero.
        const updated = await tx.productSize.updateMany({
          where: {
            productId: item.productId,
            size: item.size,
            stockQuantity: { gte: item.quantity },
          },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          const sizeRow = await tx.productSize.findFirst({
            where: { productId: item.productId, size: item.size },
            select: { stockQuantity: true },
          });
          throw new InsufficientStockError(product.name, item.size, sizeRow?.stockQuantity ?? 0);
        }

        const unitPrice = Number(product.price);
        const discount = product.discount ? Number(product.discount) : 0;
        const lineTotal = (unitPrice - discount) * item.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          productId: item.productId,
          productName: product.name,
          size: item.size,
          unitPrice,
          discount,
          quantity: item.quantity,
          lineTotal,
        });
      }

      const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeSetting;
      const tax = Math.round((subtotal * taxRate) / 100);
      const total = subtotal + tax + deliveryCharge;

      return tx.order.create({
        data: {
          orderNumber,
          userId: userId ?? null,
          status: "pending",
          subtotal,
          tax,
          deliveryCharge,
          total,
          paymentMethod,
          name: shipping.name,
          email: shipping.email || null,
          phone: shipping.phone,
          country: shipping.country,
          city: shipping.city,
          address: shipping.address,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
    },
    // The default 5 seconds is too short when the database is far away or
    // busy; a timed-out transaction would fail the customer's order.
    { maxWait: 10_000, timeout: 20_000 }
  );

  return order;
}