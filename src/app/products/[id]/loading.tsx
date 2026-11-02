import Navbar from "@/components/layout/Navbar";

// Shown instantly when a product is clicked, while the page itself loads.
// Keeps the navbar in place and sketches the layout so nothing jumps.
export default function ProductDetailLoading() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 h-3 w-56 animate-pulse rounded bg-brown/10" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-brown/10" />

          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-brown/10" />
            <div className="h-7 w-1/3 animate-pulse rounded bg-brown/10" />
            <div className="h-3 w-full animate-pulse rounded bg-brown/10" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-brown/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-brown/10" />
            <div className="flex gap-2 pt-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-10 w-12 animate-pulse rounded-md bg-brown/10" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}