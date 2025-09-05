
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

interface DiscoveryResult {
  urls: string[];
  source_type: 'RSS' | 'SITEMAP';
  domain: string;
  discovered_at: Date;
}

export class RssSitemapDiscovery {
  private userAgent: string;
  private rateLimit: number;
  private domainWhitelist: string[];

  constructor() {
    this.userAgent = process.env.USER_AGENT || 'TestMarketplaceBot/0.1 (+contact@exemple.fr)';
    this.rateLimit = parseInt(process.env.RATE_LIMIT_PER_DOMAIN_RPS || '1') * 1000;
    this.domainWhitelist = (process.env.DOMAIN_WHITELIST || '').split(',').map(d => d.trim());
  }

  async discoverFromDomain(domain: string): Promise<DiscoveryResult[]> {
    if (!this.isDomainWhitelisted(domain)) {
      throw new Error(`Domain ${domain} not in whitelist`);
    }

    const results: DiscoveryResult[] = [];
    
    try {
      // Tentative sitemap.xml
      const sitemapUrls = await this.discoverSitemap(domain);
      if (sitemapUrls.length > 0) {
        results.push({
          urls: sitemapUrls,
          source_type: 'SITEMAP',
          domain,
          discovered_at: new Date()
        });
      }

      // Attente pour rate limiting
      await this.sleep(this.rateLimit);

      // Tentative RSS/Feed
      const rssUrls = await this.discoverRssFeed(domain);
      if (rssUrls.length > 0) {
        results.push({
          urls: rssUrls,
          source_type: 'RSS',
          domain,
          discovered_at: new Date()
        });
      }

    } catch (error) {
      console.error(`Discovery failed for ${domain}:`, error);
    }

    return results;
  }

  private async discoverSitemap(domain: string): Promise<string[]> {
    const sitemapUrls = [
      `https://${domain}/sitemap.xml`,
      `https://${domain}/sitemap_index.xml`,
      `https://${domain}/sitemaps.xml`,
      `http://${domain}/sitemap.xml`
    ];

    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await axios.get(sitemapUrl, {
          headers: { 'User-Agent': this.userAgent },
          timeout: 10000,
          maxRedirects: 3
        });

        if (response.status === 200 && response.data.includes('<urlset')) {
          return this.parseSitemap(response.data);
        }
      } catch (error) {
        // Continue vers l'URL suivante
        continue;
      }
    }

    return [];
  }

  private async discoverRssFeed(domain: string): Promise<string[]> {
    try {
      // Récupération page d'accueil pour détecter les liens RSS
      const homeUrl = `https://${domain}`;
      const response = await axios.get(homeUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const rssUrls: string[] = [];

      // Recherche des liens RSS dans le HTML
      $('link[type="application/rss+xml"], link[type="application/atom+xml"]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = new URL(href, homeUrl).href;
          rssUrls.push(absoluteUrl);
        }
      });

      // URLs RSS communes à tester
      const commonRssUrls = [
        `${homeUrl}/rss`,
        `${homeUrl}/feed`,
        `${homeUrl}/rss.xml`,
        `${homeUrl}/feed.xml`,
        `${homeUrl}/blog/rss`,
        `${homeUrl}/news/rss`
      ];

      for (const rssUrl of commonRssUrls) {
        if (!rssUrls.includes(rssUrl)) {
          try {
            const rssResponse = await axios.head(rssUrl, {
              headers: { 'User-Agent': this.userAgent },
              timeout: 5000
            });
            
            if (rssResponse.status === 200) {
              rssUrls.push(rssUrl);
            }
          } catch (error) {
            // Continue
          }
        }
      }

      return rssUrls;
    } catch (error) {
      console.error(`RSS discovery failed for ${domain}:`, error);
      return [];
    }
  }

  private parseSitemap(xmlContent: string): string[] {
    const urls: string[] = [];
    
    try {
      const $ = cheerio.load(xmlContent, { xmlMode: true });
      
      $('url > loc').each((_, element) => {
        const url = $(element).text().trim();
        if (url && this.isValidUrl(url)) {
          urls.push(url);
        }
      });

      // Si c'est un sitemap index, récupérer les sous-sitemaps
      $('sitemap > loc').each((_, element) => {
        const sitemapUrl = $(element).text().trim();
        if (sitemapUrl && this.isValidUrl(sitemapUrl)) {
          urls.push(sitemapUrl);
        }
      });

    } catch (error) {
      console.error('Sitemap parsing error:', error);
    }

    return urls.slice(0, 100); // Limite pour éviter surcharge
  }

  private isDomainWhitelisted(domain: string): boolean {
    if (this.domainWhitelist.length === 0) return true;
    
    return this.domainWhitelist.some(whitelistedDomain => {
      if (whitelistedDomain.startsWith('*.')) {
        const pattern = whitelistedDomain.substring(2);
        return domain.endsWith(pattern);
      }
      return domain === whitelistedDomain;
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
