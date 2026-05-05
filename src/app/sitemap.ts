import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://quranify.fr';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Si l'application gère des pages dynamiques à l'avenir (ex: sourates, récitateurs), 
    // vous pouvez les ajouter ici dynamiquement.
  ];
}
