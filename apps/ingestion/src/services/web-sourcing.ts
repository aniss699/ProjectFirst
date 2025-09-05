
import { PrismaClient } from '@prisma/client';
import { RssSitemapService } from './rss-sitemap';
import { CrawlerService } from './crawler';
import { CompanyParserService } from './company-parser';

export class WebSourcingService {
  private prisma = new PrismaClient();
  private rssSitemap = new RssSitemapService();
  private crawler = new CrawlerService();
  private parser = new CompanyParserService();

  async discoverProviders(domains: string[], categories: string[]) {
    const results = {
      discovered: 0,
      sources: {},
      errors: []
    };

    for (const domain of domains) {
      try {
        // 1. Découverte RSS/Sitemap
        const rssResults = await this.rssSitemap.discoverFeeds(domain);
        results.sources[domain] = { rss: rssResults.length };

        // 2. Crawling guidé
        const crawlResults = await this.crawler.crawlDomain(domain, {
          categories,
          maxPages: 50,
          respectRobots: true,
          rateLimit: 1000
        });

        results.sources[domain].crawled = crawlResults.length;

        // 3. Parsing et extraction
        const allContent = [...rssResults, ...crawlResults];
        const providers = await this.parser.extractProviders(allContent);

        // 4. Sauvegarde en base
        for (const provider of providers) {
          await this.saveProvider(provider, domain);
          results.discovered++;
        }

      } catch (error) {
        results.errors.push(`${domain}: ${error.message}`);
      }
    }

    return results;
  }

  private async saveProvider(provider: any, sourceDomain: string) {
    const existing = await this.prisma.sourcedProvider.findFirst({
      where: {
        OR: [
          { website_url: provider.website },
          { contact_email: provider.email }
        ]
      }
    });

    if (existing) {
      // Mise à jour si confiance supérieure
      if (provider.confidence > (existing.confidence_score || 0)) {
        await this.prisma.sourcedProvider.update({
          where: { id: existing.id },
          data: {
            confidence_score: provider.confidence,
            last_verified: new Date(),
            description: provider.description || existing.description,
            specialties: provider.specialties || existing.specialties
          }
        });
      }
    } else {
      // Nouveau prestataire
      await this.prisma.sourcedProvider.create({
        data: {
          company_name: provider.name,
          website_url: provider.website,
          contact_email: provider.email,
          phone: provider.phone,
          description: provider.description,
          specialties: provider.specialties || [],
          location: provider.location,
          source_url: sourceDomain,
          source_type: provider.sourceType || 'crawler',
          confidence_score: provider.confidence,
          status: 'pending'
        }
      });
    }
  }

  async getStats() {
    const stats = await this.prisma.sourcedProvider.groupBy({
      by: ['status', 'source_type'],
      _count: true
    });

    const total = await this.prisma.sourcedProvider.count();
    
    return {
      total,
      by_status: stats.filter(s => s.status).reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {}),
      by_source: stats.filter(s => s.source_type).reduce((acc, s) => {
        acc[s.source_type] = s._count;
        return acc;
      }, {})
    };
  }
}
