import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppBubble from "@/components/layout/WhatsAppBubble";
import { prisma } from "@/lib/prisma";

function estimateDeliveryRange(createdAt: Date) {
  const start = new Date(createdAt);
  start.setDate(start.getDate() + 5);
  const end = new Date(createdAt);
  end.setDate(end.getDate() + 8);

  const format = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return `${format(start)} - ${format(end)}`;
}

// Fetches the order directly from the database via orderId in the URL —
// no dependency on client cart state, so this page works even after the
// cart has been cleared, or if the person refreshes/bookmarks the link.
export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;

  if (!orderId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg border border-brown/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            ✓
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-espresso">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-brown/60">
            Thank you for choosing Luxe Sole. Master artisans have been notified, and your
            reservation box is being assembled.
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-brown/10 pt-6 text-left text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brown/40">
                Order Number
              </p>
              <p className="font-semibold text-espresso">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-brown/40">
                Estimated Delivery
              </p>
              <p className="font-semibold text-green-600">
                {estimateDeliveryRange(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-brown/10 pt-6 text-left">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brown/40">
              Your Shipment Recap
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

            <div className="mt-4 flex justify-between border-t border-brown/10 pt-4 text-sm text-brown/60">
              <span>
                Paid via{" "}
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online / Bank Transfer"}
              </span>
              <span className="font-semibold text-espresso">
                PKR {Number(order.total).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-md border border-brown/20 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-brown hover:border-gold hover:text-gold"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="rounded-md bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-espresso hover:bg-gold/90"
            >
              Track Order
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppBubble />
    </>
  );
}