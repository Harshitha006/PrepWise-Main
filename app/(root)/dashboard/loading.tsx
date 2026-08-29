export default function Loading() {
  return (
    <div className="page-container py-10">
      <div className="glass-card rounded-3xl p-12 animate-pulse mb-8 h-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
