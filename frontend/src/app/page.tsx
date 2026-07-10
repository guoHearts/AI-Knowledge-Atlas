import { getLocale } from 'next-intl/server';
import { HomePageView } from '@/features/home/components/HomePageView';
import { getHomeContent, getHomeStats } from '@/features/home/api/homeApi';
import { listRadarItemsFromBackend } from '@/features/radar/api/radarApi';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const locale = await getLocale();
  const [stats, content] = await Promise.all([
    getHomeStats(),
    getHomeContent(),
  ]);
  const radar = await listRadarItemsFromBackend({ locale });

  return (
    <HomePageView
      stats={stats}
      content={content}
      radarItems={radar.items.slice(0, 3)}
      locale={locale}
    />
  );
}
