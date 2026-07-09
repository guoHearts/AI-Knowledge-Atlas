export default function CompareArticleLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-4 w-24 bg-cosmos-border rounded mb-4 animate-pulse" />
          <div className="h-6 w-32 bg-cosmos-border rounded animate-pulse" />
        </div>

        <div className="bg-cosmos-surface rounded-lg p-8 border border-cosmos-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-20 bg-cosmos-border rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-cosmos-border rounded-full animate-pulse" />
          </div>

          <div className="h-9 w-3/4 bg-cosmos-border rounded mb-6 animate-pulse" />

          <div className="space-y-2 mb-8">
            <div className="h-5 bg-cosmos-border rounded animate-pulse" />
            <div className="h-5 bg-cosmos-border rounded w-5/6 animate-pulse" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-cosmos-border rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
