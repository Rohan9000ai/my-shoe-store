import { prisma } from "@/lib/prisma";

// Stats placeholder. Total Products is real (Product model exists as of
// Day 5). Sales/Orders/Low Stock will switch from placeholders to real
// queries once the Order model is added in a later step.
export default async function AdminDashboardPage() {
  const totalProducts = await prisma.product.count();

  const stats = [
    { label: "Total Sales", value: "PKR 0", hint: "Awaiting Order model" },
    { label: "Total Orders", value: "0", hint: "Awaiting Order model" },
    { label: "Total Products", value: totalProducts.toLocaleString(), hint: "Live from database" },
    { label: "Low Stock Alert", value: "0", hint: "Awaiting stock query" },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-espresso">
        Dashboard Overview
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-brown/10 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brown/50">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-espresso">{stat.value}</p>
            <p className="mt-1 text-xs text-brown/40">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            Recent Atelier Orders
          </h2>
          <p className="mt-4 text-sm text-brown/40">
            Order history will appear here once the Order model is built.
          </p>
        </div>

        <div className="rounded-lg border border-brown/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">
            Atelier Performance
          </h2>
          <p className="mt-4 text-sm text-brown/40">
            Sales trajectory chart placeholder — wired up in a later step.
          </p>
        </div>
      </div>
    </div>
  );
}