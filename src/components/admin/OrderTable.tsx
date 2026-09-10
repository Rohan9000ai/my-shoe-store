import Link from "next/link";

interface OrderRow {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  createdAt: Date;
  status: string;
  total: unknown; // Prisma Decimal — rendered via Number() below
  paymentMethod: string;
  items: { id: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

// Presentational orders table — matches the admin-orders design. Row
// links to /admin/orders/[id] for the detail/status-update view, which
// is a separate upcoming task.
export default function OrderTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-brown/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-brown/10 text-xs uppercase tracking-wide text-brown/50">
          <tr>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-brown/40">
                No orders found.
              </td>
            </tr>
          )}

          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-brown/5 last:border-0 hover:bg-beige/40"
            >
              <td className="px-4 py-3 font-medium text-espresso">
                <Link href={`/admin/orders/${order.id}`} className="hover:text-gold">
                  #{order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{order.name}</td>
              <td className="px-4 py-3">{order.phone}</td>
              <td className="px-4 py-3">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">{order.items.length}</td>
              <td className="px-4 py-3">PKR {Number(order.total).toLocaleString()}</td>
              <td className="px-4 py-3 uppercase">
                {order.paymentMethod === "cod" ? "COD" : "Online"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[order.status] ?? "bg-brown/10 text-brown"
                  }`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}