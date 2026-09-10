export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-brown/10 rounded-lg" />
            <div className="h-4 bg-brown/10 rounded mt-2 w-3/4" />
            <div className="h-3 bg-brown/10 rounded w-1/2 mt-1" />
            <div className="h-5 bg-brown/10 rounded w-1/4 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}