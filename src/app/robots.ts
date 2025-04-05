import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/search/', '/*?q=*'],
    },
    sitemap: 'https://www.localroofernearme.co.uk/sitemap.xml',
  };
} 