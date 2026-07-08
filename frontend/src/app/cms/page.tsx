import { CmsDashboardView } from '@/features/cms/components/CmsDashboardView';
import { getCmsDashboardData } from '@/features/cms/api/cmsApi';

export const dynamic = 'force-dynamic';

export default async function CMSPage() {
  const data = await getCmsDashboardData();

  return <CmsDashboardView data={data} />;
}
