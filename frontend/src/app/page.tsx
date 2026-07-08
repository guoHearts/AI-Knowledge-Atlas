import { HomePageView } from '@/features/home/components/HomePageView';
import { getHomeStats } from '@/features/home/api/homeApi';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stats = await getHomeStats();

  return <HomePageView stats={stats} />;
}
