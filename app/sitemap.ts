import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['','services','pricing','request','join','how-it-works','about','contact','faq','terms','privacy'];
  return routes.map((r) => ({ url: `https://handymanja.com/${r}`, lastModified: new Date() }));
}
