import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { aiEvents } from '../../../../../shared/schema.js';
import { LoggedEvent } from '../shadow-logger';
import { randomUUID } from 'crypto';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function prismaSink(e: LoggedEvent){
  await db.insert(aiEvents).values({
    id: randomUUID(),
    phase: e.phase,
    provider: e.meta.provider,
    model_family: e.model_family,
    model_name: e.model_name,
    allow_training: e.meta.allow_training,
    input_redacted: e.input_redacted as any,
    output: e.output as any,
    confidence: e.quality?.confidence?.toString() ?? null,
    tokens: e.quality?.tokens ?? null,
    latency_ms: e.quality?.latency_ms ?? null,
    provenance: e.meta.provenance,
    prompt_hash: e.prompt_hash,
    accepted: e.user_feedback?.accepted ?? null,
    rating: e.user_feedback?.rating ?? null,
    edits: e.user_feedback?.edits ?? null
  });
}