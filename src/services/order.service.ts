import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface OrderItemInput {
  productId: string;
  size: string;
  quantity: number;
}

interface ShippingInput {
  name: string;
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
    super(`Only ${available} left in stock for "${productName}" (size ${size})`);
    this.name = "InsufficientStockError";
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

async function getDeliverySettings() {
  const rows = await prisma.settings.findMany({
    where: { key: { in: ["delivery_charge", "free_delivery_threshold", "tax_rate"] } },
  });

  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;

  return {
    deliveryCharge: Number(map.delivery_charge ?? 1500),
    freeDeliveryThreshold: Number(map.free_delivery_threshold ?? 50000),
    taxRate: Number(map.tax_rate ?? 0),
  };
}

// Creates an order and decrements stock for every item, atomically.
// If any item is out of stock, the whole transaction rolls back — no
// partial orders, no stock silently disappearing.
export async function createOrder(input: CreateOrderInput) {
  const { items, shipping, paymentMethod, userId } = input;

  if (items.length === 0) {
    throw new Error("Cannot place an order with no items");
  }

  const { deliveryCharge: deliveryChargeSetting, freeDeliveryThreshold, taxRate } =
    await getDeliverySettings();

  const orderNumber = await generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const sizeRow = await tx.productSize.findFirst({
        where: { productId: item.productId, size: item.size },
      });

      if (!sizeRow || sizeRow.stockQuantity < item.quantity) {
        throw new InsufficientStockError(product.name, item.size, sizeRow?.stockQuantity ?? 0);
      }

      await tx.productSize.update({
        where: { id: sizeRow.id },
        data: { stockQuantity: { decrement: item.quantity } },
      });

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
        phone: shipping.phone,
        country: shipping.country,
        city: shipping.city,
        address: shipping.address,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
  });

  return order;
}