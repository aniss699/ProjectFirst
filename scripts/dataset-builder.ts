/**
 * Extrait AiEvent -> CSV pour entrainement de modèles étroits.
 * Filtrage:
 *  - allowTraining = true
 *  - provenance in ('human_validated','ab_test_winner') OR accepted = true
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { aiEvents } from '../shared/schema.js';
import { and, or, eq, inArray } from 'drizzle-orm';
import { writeFileSync, mkdirSync } from 'fs';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main(){
  const rows = await db
    .select()
    .from(aiEvents)
    .where(and(
      eq(aiEvents.allow_training, true),
      or(
        inArray(aiEvents.provenance, ['human_validated','ab_test_winner']),
        eq(aiEvents.accepted, true)
      )
    ))
    .orderBy(aiEvents.created_at);

  // Créer le dossier datasets s'il n'existe pas
  mkdirSync('datasets', { recursive: true });

  const csvData = [
    'phase,prompt_hash,output_json,created_at',
    ...rows.map(r => [
      r.phase,
      r.prompt_hash,
      JSON.stringify(r.output).replace(/"/g, '""'),
      r.created_at.toISOString()
    ].join(','))
  ].join('\n');

  writeFileSync('datasets/pricing_dataset.csv', csvData);
  console.log(`Wrote ${rows.length} rows to datasets/pricing_dataset.csv`);
}

main().catch(e=>{ console.error(e); process.exit(1); });