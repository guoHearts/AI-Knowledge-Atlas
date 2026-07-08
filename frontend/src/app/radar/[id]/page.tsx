import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRadarItemFromBackend, RadarItemDetailView } from '@/features/radar';

export default async function RadarItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const radarItem = await getRadarItemFromBackend(id).catch(() => null);

  if (!radarItem) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/radar"
            className="inline-flex items-center text-stellar-green hover:text-stellar-green/80 font-medium mb-4 transition-colors"
          >
            ← 返回雷达
          </Link>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmos-border bg-cosmos-surface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cosmos-dim">
            <span className="h-2 w-2 rounded-full bg-stellar-green" />
            AI Engineering Radar
          </div>
        </div>

        <RadarItemDetailView item={radarItem} />
      </div>
    </div>
  );
}
