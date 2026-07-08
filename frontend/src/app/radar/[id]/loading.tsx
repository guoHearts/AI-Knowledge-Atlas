export default function RadarItemLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header loading */}
        <div className="mb-6">
          <div className="h-4 w-24 bg-cosmos-border rounded mb-4 animate-pulse"></div>
          <div className="h-6 w-32 bg-cosmos-border rounded mb-2 animate-pulse"></div>
          <div className="h-8 w-48 bg-cosmos-border rounded animate-pulse"></div>
        </div>

        {/* Content loading */}
        <div className="bg-cosmos-surface rounded-lg p-8 border border-cosmos-border">
          {/* Tags loading */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-20 bg-cosmos-border rounded-full animate-pulse"></div>
            <div className="h-6 w-16 bg-cosmos-border rounded-full animate-pulse"></div>
            <div className="h-6 w-12 bg-cosmos-border rounded-full animate-pulse"></div>
          </div>
          
          {/* Title loading */}
          <div className="h-9 w-3/4 bg-cosmos-border rounded mb-6 animate-pulse"></div>
          
          {/* Summary loading */}
          <div className="mb-8">
            <div className="space-y-2">
              <div className="h-5 bg-cosmos-border rounded animate-pulse"></div>
              <div className="h-5 bg-cosmos-border rounded w-5/6 animate-pulse"></div>
              <div className="h-5 bg-cosmos-border rounded w-4/6 animate-pulse"></div>
            </div>
          </div>

          {/* Details loading */}
          <div className="space-y-8">
            <div>
              <div className="h-6 w-32 bg-cosmos-border rounded mb-3 animate-pulse"></div>
              <div className="h-4 bg-cosmos-border rounded w-full animate-pulse"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="h-4 w-16 bg-cosmos-border rounded mb-3 animate-pulse"></div>
                <div className="h-3 bg-cosmos-border rounded w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-cosmos-border rounded mb-3 animate-pulse"></div>
                <div className="h-3 bg-cosmos-border rounded w-full animate-pulse"></div>
              </div>
            </div>

            <div>
              <div className="h-6 w-24 bg-cosmos-border rounded mb-3 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-cosmos-border rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}