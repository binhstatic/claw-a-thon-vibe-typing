export interface Suggestion {
  phrase: string;
  breakdown?: string;
  meaning?: string;
}

// ─── Trigger-based suggest ────────────────────────────────────────────────────

export async function callAgent(
  baseUrl: string,
  mode: string,
  phrase: string,
  context: string,
  mask: string,
  model: string,
  signal: AbortSignal,
): Promise<Suggestion[]> {
  const res = await fetch(`${baseUrl}/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, phrase, context, mask, model }),
    signal,
  });
  if (!res.ok) throw new Error(`Agent HTTP ${res.status}`);
  const { suggestions } = await res.json() as { suggestions: Suggestion[] };
  return suggestions ?? [];
}
