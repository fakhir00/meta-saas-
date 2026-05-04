/**
 * Shared Groq client with automatic API key rotation/fallback.
 * Tries each key in order; on 401/429 errors, falls back to the next.
 */
import Groq from 'groq-sdk';

const FALLBACK_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.NEXT_PUBLIC_GROQ_API_KEY,
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
  "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",
].filter(k => k && k.trim());

/**
 * Execute a Groq chat completion with automatic key fallback.
 * @param {object} params - Parameters to pass to groq.chat.completions.create()
 * @returns {Promise<object>} The completion result
 */
export async function groqComplete(params) {
  let lastError = null;

  for (const key of FALLBACK_KEYS) {
    const cleanKey = key.trim().replace(/^['"]|['"]$/g, '');
    if (!cleanKey) continue;

    try {
      const groq = new Groq({ apiKey: cleanKey });
      const result = await groq.chat.completions.create(params);
      return result;
    } catch (err) {
      lastError = err;
      const msg = err?.message || '';
      // Retry with next key on auth or rate-limit errors
      if (msg.includes('401') || msg.includes('429') || msg.includes('403')) {
        console.warn(`Groq key ending ...${cleanKey.slice(-6)} failed (${msg.includes('429') ? 'rate-limited' : 'auth error'}), trying next key...`);
        continue;
      }
      // For other errors (model issues, bad request, etc.), throw immediately
      throw err;
    }
  }

  throw lastError || new Error('All Groq API keys exhausted. Please try again later.');
}
