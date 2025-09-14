
import express from 'express';
import { WebSourcingService } from './services/web-sourcing';
import { CrawlerService } from './services/crawler';
import { RssSitemapService } from './services/rss-sitemap';
import { EnrichmentService } from './services/enrichment';

const app = express();
const port = parseInt(process.env.INGESTION_PORT || '3001', 10);

// Services
const webSourcing = new WebSourcingService();
const crawler = new CrawlerService();
const rssSitemap = new RssSitemapService();
const enrichment = new EnrichmentService();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ingestion' });
});

// Endpoints de sourcing
app.post('/api/sourcing/discover', async (req, res) => {
  try {
    const { domains, categories } = req.body;
    const results = await webSourcing.discoverProviders(domains, categories);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sourcing/enrich', async (req, res) => {
  try {
    const { providerId } = req.body;
    const enriched = await enrichment.enrichProvider(providerId);
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sourcing/stats', async (req, res) => {
  try {
    const stats = await webSourcing.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Only start server if running as standalone service
if (process.env.STANDALONE_INGESTION === 'true') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🔍 Ingestion service running on http://0.0.0.0:${port}`);
  });
}

// Export the app for potential use in other services
export default app;
