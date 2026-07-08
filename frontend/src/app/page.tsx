import { HomePageView } from '@/features/home/components/HomePageView';
import { getHomeContent, getHomeStats } from '@/features/home/api/homeApi';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [stats, content] = await Promise.all([
    getHomeStats(),
    getHomeContent(),
  ]);

  return <HomePageView stats={stats} content={content} />;
}
