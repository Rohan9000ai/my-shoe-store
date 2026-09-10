import { notFound } from "next/navigation";
import OrderStatusUpdate from "@/components/admin/OrderStatusUpdate";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-300 text-yellow-900 border-yellow-400",
  confirmed: "bg-blue-300 text-blue-900 border-blue-400",
  shipped: "bg-purple-300 text-purple-900 border-purple-400",
  delivered: "bg-green-300 text-green-900 border-green-400",
  cancelled: "bg-red-300 text-red-900 border-red-400",
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-espresso">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-espresso/70">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize border ${
            STATUS_STYLES[order.status] ?? "bg-gray-300 text-gray-900 border-gray-400"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Customer Information */}
          <div className="rounded-lg border border-brown/20 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-espresso">
              Customer Information
            </h2>
            <p className="mt-2 text-sm font-semibold text-espresso">{order.name}</p>
            <p className="text-sm text-espresso">{order.phone}</p>
            {order.user?.email && (
              <p className="text-sm text-espresso">{order.user.email}</p>
            )}
          </div>

          {/* Delivery Address */}
          <div className="rounded-lg border border-brown/20 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-espresso">
              Delivery Address
            </h2>
            <p className="mt-2 text-sm text-espresso">{order.address}</p>
            <p className="text-sm text-espresso">
              {order.city}, {order.country}
            </p>
          </div>

          {/* Reserved Items */}
          <div className="rounded-lg border border-brown/20 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-espresso">
              Reserved Items
            </h2>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm border-b border-brown/10 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-espresso">{item.productName}</p>
                    <p className="text-xs text-espresso/70">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-espresso">
                    PKR {Number(item.lineTotal).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 space-y-1 border-t border-brown/20 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-espresso">Subtotal</span>
                <span className="font-medium text-espresso">
                  PKR {Number(order.subtotal).toLocaleString()}
                </span>
              </div>
              {Number(order.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-espresso">Tax</span>
                  <span className="font-medium text-espresso">
                    PKR {Number(order.tax).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-espresso">Delivery</span>
                <span className="font-medium text-espresso">
                  {Number(order.deliveryCharge) === 0
                    ? "Free"
                    : `PKR ${Number(order.deliveryCharge).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-espresso border-t border-brown/20">
                <span>Total</span>
                <span>PKR {Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Payment Method */}
          <div className="rounded-lg border border-brown/20 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-espresso">
              Payment Method
            </h2>
            <p className="mt-2 text-sm font-medium text-espresso">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online / Bank Transfer"}
            </p>
          </div>

          {/* Order Status Update */}
          <div className="rounded-lg border border-brown/20 bg-white p-5 shadow-sm">
            <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}