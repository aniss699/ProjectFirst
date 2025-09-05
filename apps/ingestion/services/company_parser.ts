
import * as cheerio from 'cheerio';

interface CompanyInfo {
  name?: string;
  siren?: string;
  siret?: string;
  naf_code?: string;
  emails: string[];
  phones: string[];
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  social?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  raw_tags: string[];
}

export class CompanyParser {
  private emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private phoneRegex = /(?:\+33|0)[1-9](?:[0-9]{8})/g;
  private sirenRegex = /\b\d{9}\b/g;
  private siretRegex = /\b\d{14}\b/g;

  parseFromHtml(html: string, url: string): CompanyInfo {
    const $ = cheerio.load(html);
    const text = $.text();
    
    return {
      name: this.extractCompanyName($, url),
      siren: this.extractSiren(text),
      siret: this.extractSiret(text),
      naf_code: this.extractNafCode(text),
      emails: this.extractEmails(text),
      phones: this.extractPhones(text),
      address: this.extractAddress($, text),
      social: this.extractSocialLinks($),
      raw_tags: this.extractTags($, text)
    };
  }

  private extractCompanyName($: cheerio.CheerioAPI, url: string): string | undefined {
    // Tentatives par ordre de priorité
    const selectors = [
      'h1',
      '.company-name',
      '.business-name',
      '[itemtype*="Organization"] [itemprop="name"]',
      'title'
    ];

    for (const selector of selectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim()) {
        return element.text().trim();
      }
    }

    // Fallback: extraire du domaine
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '').split('.')[0];
    } catch {
      return undefined;
    }
  }

  private extractSiren(text: string): string | undefined {
    const matches = text.match(this.sirenRegex);
    return matches ? matches[0] : undefined;
  }

  private extractSiret(text: string): string | undefined {
    const matches = text.match(this.siretRegex);
    return matches ? matches[0] : undefined;
  }

  private extractNafCode(text: string): string | undefined {
    const nafPattern = /(?:NAF|APE)[:\s]*([0-9]{4}[A-Z]?)/i;
    const match = text.match(nafPattern);
    return match ? match[1] : undefined;
  }

  private extractEmails(text: string): string[] {
    const emails = text.match(this.emailRegex) || [];
    // Filtrer les emails génériques/spam
    return emails.filter(email => 
      !email.includes('noreply') && 
      !email.includes('example') &&
      !email.includes('test')
    ).slice(0, 3); // Max 3 emails
  }

  private extractPhones(text: string): string[] {
    const phones = text.match(this.phoneRegex) || [];
    return [...new Set(phones)].slice(0, 2); // Déduplication, max 2
  }

  private extractAddress($: cheerio.CheerioAPI, text: string): any {
    const address: any = {};

    // Tentative avec microdata
    const streetAddress = $('[itemprop="streetAddress"]').text().trim();
    const locality = $('[itemprop="addressLocality"]').text().trim();
    const postalCode = $('[itemprop="postalCode"]').text().trim();

    if (streetAddress) address.street = streetAddress;
    if (locality) address.city = locality;
    if (postalCode) address.postal_code = postalCode;

    // Si pas de microdata, chercher patterns dans le texte
    if (!address.city) {
      const cityPattern = /(\d{5})\s+([A-Z][a-zA-ZÀ-ÿ\s-]+)/g;
      const cityMatch = cityPattern.exec(text);
      if (cityMatch) {
        address.postal_code = cityMatch[1];
        address.city = cityMatch[2].trim();
      }
    }

    address.country = 'France'; // Par défaut pour domaines FR

    return Object.keys(address).length > 1 ? address : undefined;
  }

  private extractSocialLinks($: cheerio.CheerioAPI): any {
    const social: any = {};

    $('a[href*="linkedin.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/company/')) {
        social.linkedin = href;
      }
    });

    $('a[href*="twitter.com"], a[href*="x.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) social.twitter = href;
    });

    $('a[href*="facebook.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) social.facebook = href;
    });

    return Object.keys(social).length > 0 ? social : undefined;
  }

  private extractTags($: cheerio.CheerioAPI, text: string): string[] {
    const tags = new Set<string>();
    
    // Meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    if (metaKeywords) {
      metaKeywords.split(',').forEach(keyword => 
        tags.add(keyword.trim().toLowerCase())
      );
    }

    // Mots-clés fréquents (services, compétences)
    const commonBusinessWords = [
      'développement', 'design', 'marketing', 'conseil', 'formation',
      'web', 'mobile', 'e-commerce', 'seo', 'digital', 'communication',
      'graphisme', 'création', 'innovation', 'expertise', 'solution'
    ];

    const textLower = text.toLowerCase();
    commonBusinessWords.forEach(word => {
      if (textLower.includes(word)) {
        tags.add(word);
      }
    });

    return Array.from(tags).slice(0, 10); // Max 10 tags
  }
}
