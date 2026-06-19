/**
 * InlineLinter — Harper-style inline highlight system.
 *
 * Pipeline:
 *   text change → debounce 1.2 s → POST /lint → render underlines (shadow DOM)
 *   pointerdown on element → hit-test → show suggestion popup → apply replacement
 *
 * The /lint endpoint must return:
 *   { lints: Array<{ start: number, end: number, message: string, suggestions: string[] }> }
 */

import type { Config } from '../protocol';
import type { LintResult } from './api';
import { lintText } from './api';
import { getSpanClientRects } from './offsetMapper';
import { HighlightRenderer } from './highlightRenderer';
import { showLintPopup, hideLintPopup, lintPopupContains, isLintPopupOpen } from './suggestionPopup';
import { replaceTextSpan } from './textReplacer';

const DEBOUNCE_MS = 1200;

// ─── Element text extraction ──────────────────────────────────────────────────

function getElementText(el: Element): string {
  const isCE =
    (el as HTMLElement).isContentEditable &&
    el.tagName !== 'TEXTAREA' &&
    el.tagName !== 'INPUT';

  if (isCE) {
    // innerText respects newlines and visible text only
    return (el as HTMLElement).innerText ?? '';
  }
  return (el as HTMLInputElement | HTMLTextAreaElement).value ?? '';
}

// ─── Per-element state ────────────────────────────────────────────────────────

interface ElementState {
  el: Element;
  renderer: HighlightRenderer;
  lints: LintResult[];
  lintTimer: ReturnType<typeof setTimeout> | null;
  lastText: string;
  abortCtrl: AbortController | null;
  scrollCleanup: (() => void) | null;
}

// ─── InlineLinter ─────────────────────────────────────────────────────────────

export class InlineLinter {
  private config: Config;
  private states = new Map<Element, ElementState>();

  constructor(config: Config) {
    this.config = config;
  }

  updateConfig(config: Config): void {
    this.config = config;
  }

  /** Attach inline linting to an editable element. Idempotent. */
  attachElement(el: Element): void {
    if (this.states.has(el)) return;
    // Skip if element is not sizeable (e.g. hidden inputs)
    if ((el as HTMLElement).offsetWidth === 0 && (el as HTMLElement).offsetHeight === 0) return;

    const renderer = new HighlightRenderer();
    const state: ElementState = {
      el,
      renderer,
      lints: [],
      lintTimer: null,
      lastText: '',
      abortCtrl: null,
      scrollCleanup: null,
    };

    this.states.set(el, state);
    this.attachListeners(state);
    this.scheduleLint(state);
  }

  detachElement(el: Element): void {
    const state = this.states.get(el);
    if (!state) return;
    this.cleanupState(state);
    this.states.delete(el);
  }

  detachAll(): void {
    for (const state of this.states.values()) {
      this.cleanupState(state);
    }
    this.states.clear();
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  private cleanupState(state: ElementState): void {
    if (state.lintTimer !== null) clearTimeout(state.lintTimer);
    state.abortCtrl?.abort();
    state.renderer.destroy();
    state.scrollCleanup?.();
    hideLintPopup();
    state.el.removeEventListener('input', this.inputHandler);
    state.el.removeEventListener('keyup', this.inputHandler);
    state.el.removeEventListener('pointerdown', this.pointerDownHandler);
    (state.el as HTMLElement).removeEventListener('scroll', this.scrollHandler);
  }

  // Arrow functions so `this` is bound and the same reference can be removed
  private inputHandler = (e: Event) => {
    const state = this.states.get(e.currentTarget as Element);
    if (state) this.scheduleLint(state);
  };

  private scrollHandler = (e: Event) => {
    const state = this.states.get(e.currentTarget as Element);
    if (state) this.renderHighlights(state);
  };

  private pointerDownHandler = (e: Event) => {
    const state = this.states.get(e.currentTarget as Element);
    if (state) this.onPointerDown(state, e as PointerEvent);
  };

  private attachListeners(state: ElementState): void {
    state.el.addEventListener('input', this.inputHandler);
    state.el.addEventListener('keyup', this.inputHandler);
    state.el.addEventListener('pointerdown', this.pointerDownHandler);
    (state.el as HTMLElement).addEventListener('scroll', this.scrollHandler, { passive: true });

    // Re-render highlights on window scroll (keeps fixed overlay in sync)
    const onWindowScroll = () => this.renderHighlights(state);
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    state.scrollCleanup = () => window.removeEventListener('scroll', onWindowScroll);
  }

  // ─── Linting pipeline ────────────────────────────────────────────────────────

  private scheduleLint(state: ElementState): void {
    if (state.lintTimer !== null) clearTimeout(state.lintTimer);
    state.lintTimer = setTimeout(() => this.doLint(state), DEBOUNCE_MS);
    // While waiting, keep current highlights visible but dimmed
  }

  private async doLint(state: ElementState): Promise<void> {
    const text = getElementText(state.el);
    if (!text.trim() || text === state.lastText) return;

    state.abortCtrl?.abort();
    state.abortCtrl = new AbortController();
    const { signal } = state.abortCtrl;

    try {
      const lints = await lintText(this.config.agentBaseUrl, text, signal);
      if (signal.aborted) return;
      state.lints = lints;
      state.lastText = text;
      this.renderHighlights(state);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // /lint endpoint not implemented yet — silently degrade
      if (err instanceof Error && err.message.includes('404')) return;
      console.warn('[vibe-typing inline-lint]', (err as Error).message);
      state.renderer.clear();
    }
  }

  private renderHighlights(state: ElementState): void {
    if (!state.lints.length) {
      state.renderer.clear();
      return;
    }

    const text = getElementText(state.el);

    const rectsByLint = state.lints
      .map((lint, lintIndex) => {
        if (lint.end > text.length || lint.start >= lint.end) return null;
        const rects = getSpanClientRects(state.el, lint.start, lint.end);
        return rects.length ? { rects, lintIndex } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    state.renderer.update(rectsByLint);
  }

  // ─── Click / popup flow ───────────────────────────────────────────────────────

  private onPointerDown(state: ElementState, e: PointerEvent): void {
    // Don't steal clicks inside the popup itself
    if (lintPopupContains(e.target)) return;

    const hitIndex = state.renderer.hitTest(e.clientX, e.clientY);

    if (hitIndex === null) {
      if (isLintPopupOpen()) hideLintPopup();
      return;
    }

    const lint = state.lints[hitIndex];
    if (!lint) return;

    const rects = getSpanClientRects(state.el, lint.start, lint.end);
    if (!rects.length) return;

    // Use the first rect as the popup anchor
    const anchorRect = rects[0];

    showLintPopup(
      anchorRect,
      lint,
      // onApply: replace text + re-lint
      suggestion => {
        replaceTextSpan(state.el, lint.start, lint.end, suggestion);
        // Invalidate stale lints after the replacement
        state.lints = [];
        state.lastText = '';
        state.renderer.clear();
        this.scheduleLint(state);
      },
      // onDismiss: remove just this lint from the current pass
      () => {
        state.lints = state.lints.filter((_, i) => i !== hitIndex);
        this.renderHighlights(state);
      },
    );
  }
}
