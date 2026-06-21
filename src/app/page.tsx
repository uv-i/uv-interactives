import { getContentRepository } from '@/content';
import { HomeView } from '@/features/home/HomeView';

export default async function HomePage() {
  const repo = getContentRepository();
  const [config, services] = await Promise.all([repo.getConfig(), repo.getServices()]);
  return <HomeView config={config} services={services} />;
}
