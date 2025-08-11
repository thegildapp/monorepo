import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate sitemap index that points to sub-sitemaps
export async function generateSitemapIndex(_baseUrl: string): Promise<string> {
  // Always use the main domain for sitemap URLs
  const mainUrl = 'https://thegild.app';
  
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Static pages sitemap
  sitemapIndex += '  <sitemap>\n';
  sitemapIndex += `    <loc>${mainUrl}/sitemap-static.xml</loc>\n`;
  sitemapIndex += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  sitemapIndex += '  </sitemap>\n';
  
  // Recent listings sitemap (last 7 days)
  sitemapIndex += '  <sitemap>\n';
  sitemapIndex += `    <loc>${mainUrl}/sitemap-recent.xml</loc>\n`;
  sitemapIndex += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  sitemapIndex += '  </sitemap>\n';
  
  // Popular listings sitemap (top viewed)
  sitemapIndex += '  <sitemap>\n';
  sitemapIndex += `    <loc>${mainUrl}/sitemap-popular.xml</loc>\n`;
  sitemapIndex += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
  sitemapIndex += '  </sitemap>\n';
  
  sitemapIndex += '</sitemapindex>';
  return sitemapIndex;
}

// Generate sitemap for static pages
export async function generateStaticSitemap(baseUrl: string): Promise<string> {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add homepage
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}/</loc>\n`;
  sitemap += '    <changefreq>daily</changefreq>\n';
  sitemap += '    <priority>1.0</priority>\n';
  sitemap += '  </url>\n';

  // Add search page
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}/search</loc>\n`;
  sitemap += '    <changefreq>hourly</changefreq>\n';
  sitemap += '    <priority>0.9</priority>\n';
  sitemap += '  </url>\n';

  // Add about page
  sitemap += '  <url>\n';
  sitemap += `    <loc>${baseUrl}/about</loc>\n`;
  sitemap += '    <changefreq>monthly</changefreq>\n';
  sitemap += '    <priority>0.5</priority>\n';
  sitemap += '  </url>\n';

  sitemap += '</urlset>';
  return sitemap;
}

// Generate sitemap for recent listings (last 7 days, max 1000 listings)
export async function generateRecentListingsSitemap(baseUrl: string): Promise<string> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const listings = await prisma.listing.findMany({
    where: {
      status: 'APPROVED',
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    select: {
      id: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 1000 // Limit to 1000 most recent
  });

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const listing of listings) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/listing/${listing.id}</loc>\n`;
    sitemap += `    <lastmod>${listing.updatedAt.toISOString()}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  }

  sitemap += '</urlset>';
  return sitemap;
}

// Generate sitemap for popular listings (top 500 by views)
export async function generatePopularListingsSitemap(baseUrl: string): Promise<string> {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'APPROVED',
      viewCount: {
        gt: 0
      }
    },
    select: {
      id: true,
      updatedAt: true,
      viewCount: true
    },
    orderBy: {
      viewCount: 'desc'
    },
    take: 500 // Top 500 most viewed
  });

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const listing of listings) {
    // Higher priority for more popular listings
    const priority = Math.min(0.9, 0.5 + (listing.viewCount / 1000) * 0.4);
    
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/listing/${listing.id}</loc>\n`;
    sitemap += `    <lastmod>${listing.updatedAt.toISOString()}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += `    <priority>${priority.toFixed(1)}</priority>\n`;
    sitemap += '  </url>\n';
  }

  sitemap += '</urlset>';
  return sitemap;
}

// Keep the old function for backwards compatibility but use the index
export async function generateSitemap(baseUrl: string): Promise<string> {
  return generateSitemapIndex(baseUrl);
}

export async function generateRobotsTxt(baseUrl: string): Promise<string> {
  // Check if this is the API subdomain
  if (baseUrl.includes('api.')) {
    // Allow GraphQL endpoint for Googlebot but block everything else
    let robots = '# Robots.txt for Gild API\n';
    robots += '# Allow GraphQL for rendering but block other endpoints\n';
    robots += 'User-agent: Googlebot\n';
    robots += 'Allow: /graphql\n';
    robots += 'Disallow: /\n';
    robots += '\n';
    robots += 'User-agent: *\n';
    robots += 'Disallow: /\n';
    return robots;
  }
  
  // Regular robots.txt for main domain
  let robots = '# Robots.txt for Gild\n';
  robots += 'User-agent: *\n';
  robots += 'Allow: /\n';
  robots += 'Disallow: /me\n';
  robots += 'Disallow: /me/\n';
  robots += 'Disallow: /signin\n';
  robots += 'Disallow: /signup\n';
  robots += 'Disallow: /verify-email\n';
  robots += 'Disallow: /reset-password\n';
  robots += 'Disallow: /forgot-password\n';
  robots += 'Disallow: /listing/*/manage\n';
  robots += 'Disallow: /listing/*/edit\n';
  robots += '\n';
  robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;
  
  return robots;
}