import { notFound } from "next/navigation";
import OrderStatusUpdate from "@/components/admin/OrderStatusUpdate";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  packing: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  // Older statuses, kept so old orders still look right.
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  confirmed: "Confirmed",
  shipped: "Shipped",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-espresso">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-brown/50">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            STATUS_STYLES[order.status] ?? "bg-brown/10 text-brown"
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
         <div className="rounded-lg border border-brown/20 bg-white p-5 shadow-sm">
  <h2 className="text-xs font-bold uppercase tracking-wide text-espresso">
    Customer Information
  </h2>
  <p className="mt-2 text-sm font-semibold text-espresso">{order.name}</p>
  <p className="text-sm text-espresso">{order.phone}</p>
  
  {/* 👇 This is the block that shows the email or fallback */}
  <p className="text-sm text-espresso mt-1">
    <span className="text-brown/60">Email: </span>
    {order.email ? order.email : <span className="text-brown/40 italic">Not provided</span>}
  </p>
</div>

          <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brown/40">
              Delivery Address
            </h2>
            <p className="mt-2 text-sm text-brown/70">{order.address}</p>
            <p className="text-sm text-brown/70">
              {order.city}, {order.country}
            </p>
          </div>

          <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brown/40">
              Ordered Items
            </h2>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-espresso">{item.productName}</p>
                    <p className="text-xs text-brown/40">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-espresso">
                    PKR {Number(item.lineTotal).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 border-t border-brown/10 pt-4 text-sm text-brown/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>PKR {Number(order.subtotal).toLocaleString()}</span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>PKR {Number(order.tax).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {Number(order.deliveryCharge) === 0
                    ? "Free"
                    : `PKR ${Number(order.deliveryCharge).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-semibold text-espresso">
                <span>Total</span>
                <span>PKR {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brown/40">
              Payment Method
            </h2>
            <p className="mt-2 text-sm text-espresso">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online / Bank Transfer"}
            </p>
          </div>

          <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
            <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}