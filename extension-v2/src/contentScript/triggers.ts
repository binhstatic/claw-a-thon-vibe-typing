export type TriggerMode = 'translate' | 'synonyms' | 'analyze';

export interface TriggerMatch {
  fullMatch: string;
  phrase: string;
  mode: TriggerMode;
  matchStart: number;
  context: string;
  isCE: boolean;
}

interface Trigger {
  re: RegExp;
  mode: TriggerMode;
}

const TRIGGERS: Trigger[] = [
  { re: /@([^@\n]{2,80})\.$/, mode: 'translate' },
  { re: /!!([^!\n]{2,80})\.$/, mode: 'synonyms' },
  { re: /#([^#\n]{2,60})\.$/, mode: 'analyze' },
];

export function matchTrigger(
  text: string,
  isCE: boolean,
  enableTranslate: boolean,
  enableSynonyms: boolean,
  enableAnalyze: boolean,
): TriggerMatch | null {
  const enabled: Record<TriggerMode, boolean> = {
    translate: enableTranslate,
    synonyms: enableSynonyms,
    analyze: enableAnalyze,
  };

  for (const { re, mode } of TRIGGERS) {
    if (!enabled[mode]) continue;
    const m = text.match(re);
    if (!m || m.index === undefined) continue;

    const fullMatch = m[0];
    const phrase = m[1].trim();
    const matchStart = m.index;

    // Extract preceding sentence for context-aware translations
    const before = text.substring(0, matchStart);
    const sentCandidates = [
      before.lastIndexOf('. ') + 2,
      before.lastIndexOf('? ') + 2,
      before.lastIndexOf('! ') + 2,
    ].filter(i => i >= 2);
    const sentStart = sentCandidates.length ? Math.max(...sentCandidates) : 0;
    const context = before.substring(sentStart).trim();

    return { fullMatch, phrase, mode, matchStart, context, isCE };
  }
  return null;
}
