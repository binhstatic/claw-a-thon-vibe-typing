import './styles.css';
import { ProtocolClient } from '../ProtocolClient';
import type { Config } from '../protocol';
import { matchTrigger } from './triggers';
import type { TriggerMatch } from './triggers';
import { getContentEditableRoot, getCETextBeforeCaret } from './caretPosition';
import { callAgent } from './api';
import type { Suggestion } from './api';
import { getSpanClientRects } from './offsetMapper';
import { HighlightRenderer } from './highlightRenderer';
import {
  showSuggestionPopup,
  hideSuggestionPopup,
  showLoadingPopup,
  hideLoadingPopup,
  isSuggestionPopupOpen,
  suggestionPopupContains,
} from './suggestionPopup';
import { replaceTextSpan } from './textReplacer';

// ─── Module state ─────────────────────────────────────────────────────────────

let config: Config | null = null;
let currentTarget: Element | null = null;
let currentMatch: TriggerMatch | null = null;
let currentAbortCtrl: AbortController | null = null;
let readySuggestions: Suggestion[] | null = null;

// Harper-style shadow DOM overlay — one shared renderer for the active trigger
const triggerRenderer = new HighlightRenderer();

// ─── Initialization ───────────────────────────────────────────────────────────

async function init(): Promise<void> {
  const domain = window.location.hostname;

  const [cfg, enabled] = await Promise.all([
    ProtocolClient.getConfig(),
    ProtocolClient.getDomainStatus(domain),
  ]);

  config = cfg;
  if (!enabled) return;

  // Sync config changes (e.g. mask) made in the popup without requiring a page reload
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && 'config' in changes && config) {
      config = { ...config, ...changes.config.newValue };
    }
  });

  attachListeners();

  // Keep-alive: prevent MV3 service worker from being suspended
  setInterval(() => {
    ProtocolClient.getConfig().catch(() => {});
  }, 400);
}

// ─── Clear trigger state ──────────────────────────────────────────────────────

function clearTriggerState(): void {
  triggerRenderer.clear();
  hideSuggestionPopup();
  hideLoadingPopup();
  readySuggestions = null;
  currentMatch = null;
  currentTarget = null;
  if (currentAbortCtrl) {
    currentAbortCtrl.abort();
    currentAbortCtrl = null;
  }
}

// ─── Target resolution ────────────────────────────────────────────────────────

function resolveTarget(el: EventTarget | null): Element | null {
  if (!el || !(el instanceof Element)) return null;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return el;
  if (tag === 'INPUT') {
    const t = ((el as HTMLInputElement).type || 'text').toLowerCase();
    return t === 'text' || t === 'search' || t === '' ? el : null;
  }
  if ((el as HTMLElement).isContentEditable) return getContentEditableRoot(el);
  return null;
}

function isCEElement(el: Element): boolean {
  return (
    (el as HTMLElement).isContentEditable &&
    el.tagName !== 'TEXTAREA' &&
    el.tagName !== 'INPUT'
  );
}

function getTextBeforeCaret(el: Element): string | null {
  if (isCEElement(el)) return getCETextBeforeCaret(el);
  const input = el as HTMLInputElement | HTMLTextAreaElement;
  if (!input.value) return null;
  const caret = typeof input.selectionEnd === 'number' ? input.selectionEnd : input.value.length;
  return input.value.slice(0, caret);
}

// ─── Highlight re-render on scroll ───────────────────────────────────────────

function refreshHighlight(ready: boolean): void {
  if (!currentMatch || !currentTarget) return;
  const rects = getSpanClientRects(
    currentTarget,
    currentMatch.matchStart,
    currentMatch.matchStart + currentMatch.fullMatch.length,
  );
  triggerRenderer.update(rects.map((r, i) => ({ rects: [r], lintIndex: i })), ready);
}

// ─── Trigger detection ────────────────────────────────────────────────────────

async function detect(el: Element): Promise<void> {
  if (!config) return;

  const text = getTextBeforeCaret(el);
  if (!text) { clearTriggerState(); return; }

  const match = matchTrigger(
    text,
    isCEElement(el),
    config.enableTranslate,
    config.enableSynonyms,
    config.enableAnalyze,
  );

  if (!match) { clearTriggerState(); return; }

  // Same match already in flight — don't re-fire
  if (
    currentMatch &&
    currentTarget === el &&
    currentMatch.matchStart === match.matchStart &&
    currentMatch.fullMatch === match.fullMatch
  ) return;

  // New match: cancel previous and start fresh
  if (currentAbortCtrl) currentAbortCtrl.abort();
  currentAbortCtrl = new AbortController();
  const { signal } = currentAbortCtrl;

  currentTarget = el;
  currentMatch = match;
  readySuggestions = null;
  hideSuggestionPopup();

  // Show loading underline + loading popup immediately
  const rects = getSpanClientRects(el, match.matchStart, match.matchStart + match.fullMatch.length);
  triggerRenderer.update(rects.map((r, i) => ({ rects: [r], lintIndex: i })), false);
  const anchorRect = rects[0] ?? el.getBoundingClientRect();
  showLoadingPopup(anchorRect, match);

  try {
    const suggestions = await callAgent(
      config.agentBaseUrl,
      match.mode,
      match.phrase,
      match.context,
      config.mask ?? 'academic',
      signal,
    );
    if (signal.aborted) return;

    if (!suggestions.length) { clearTriggerState(); return; }

    // Promote underline to "ready" state
    readySuggestions = suggestions;
    refreshHighlight(true);

    // Replace loading popup with suggestion popup
    hideLoadingPopup();
    showSuggestionPopup(
      anchorRect,
      match,
      suggestions,
      (chosen) => {
        replaceTextSpan(el, match.matchStart, match.matchStart + match.fullMatch.length, chosen);
        clearTriggerState();
      },
      () => clearTriggerState(),
    );

  } catch (err: unknown) {
    if (err instanceof Error && err.name !== 'AbortError') {
      console.warn('[vibe-typing] Agent error:', err.message);
      clearTriggerState();
    }
  }
}

// ─── Pointer down → dismiss if click outside popup ───────────────────────────

function onPointerDown(e: PointerEvent): void {
  if (suggestionPopupContains(e.target)) return;
  if (isSuggestionPopupOpen()) hideSuggestionPopup();
}

// ─── Event listeners ──────────────────────────────────────────────────────────

function handleEditableInput(e: Event): void {
  const el = resolveTarget(e.target);
  if (el) detect(el);
}

function attachListeners(): void {
  document.addEventListener('input', handleEditableInput, true);
  document.addEventListener('keyup', handleEditableInput, true);
  document.addEventListener('compositionend', handleEditableInput, true);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      clearTriggerState();
    }
  }, true);

  document.addEventListener('pointerdown', (e: PointerEvent) => {
    onPointerDown(e);
  }, true);

  // Re-render fixed-position boxes when the page scrolls
  window.addEventListener('scroll', () => {
    if (currentMatch && currentTarget) {
      refreshHighlight(readySuggestions !== null);
    }
  }, { passive: true, capture: true });
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

init().catch(console.error);
