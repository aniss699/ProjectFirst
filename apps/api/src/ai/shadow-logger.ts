import crypto from 'crypto';
import { UnifiedAIOutput } from './types';

export interface UserFeedback { accepted?: boolean; rating?: number; edits?: string }

export interface LoggedEvent extends UnifiedAIOutput {
  prompt_hash: string;       // SHA-256 du prompt brut
  user_feedback?: UserFeedback;
}

export function redactPII(input:any){
  const s = JSON.stringify(input)
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,'<email>')
    .replace(/\+?\d[\d\s().-]{7,}/g,'<phone>')
    .replace(/\b([A-Z]{2}\d{2}[A-Z0-9]{1,30})\b/g,'<iban>');
  try { return JSON.parse(s); } catch { return {}; }
}

async function sha256(str:string){
  return crypto.createHash('sha256').update(str).digest('hex');
}

export class ShadowLogger {
  constructor(private sink: (e: LoggedEvent)=>Promise<void>) {}

  async log(base: UnifiedAIOutput & { prompt:any; user_feedback?:UserFeedback }) {
    const promptStr = JSON.stringify(base['prompt'] ?? {});
    const prompt_hash = await sha256(promptStr);
    const input_redacted = redactPII(base['prompt'] ?? {});
    const evt: LoggedEvent = {
      ...base,
      input_redacted,
      prompt_hash,
      user_feedback: base.user_feedback
    };
    await this.sink(evt);
  }
}