/**
 * replaceTextSpan — ported directly from Harper's computeLintBoxes/index.ts
 *
 * Harper detects the host editor framework and dispatches to an editor-specific
 * replacement strategy. Critical for CKEditor 5 (Microsoft Teams): CKEditor
 * ignores execCommand and requires beforeinput + targetRanges so its internal
 * model stays in sync with the DOM.
 */

// ─── Leaf-node traversal (Harper's domUtils.ts) ───────────────────────────────

/** Recursively collect all leaf nodes (nodes with no children). */
function leafNodes(node: Node): Node[] {
  const children = Array.from(node.childNodes);
  if (children.length === 0) return [node];
  return children.flatMap(leafNodes);
}

/**
 * Convert a character-offset span to a DOM Range.
 * Mirrors Harper's getRangeForTextSpan — handles <br> as one newline character,
 * matching innerText semantics.
 */
function getRangeForTextSpan(
  target: Element,
  start: number,
  end: number,
): Range | null {
  const leaves = leafNodes(target);
  const range = document.createRange();
  let traversed = 0;
  let startFound = false;

  for (const leaf of leaves) {
    if ((leaf as Element).nodeName === 'BR') {
      traversed += 1;
      continue;
    }
    const text = leaf.textContent ?? '';

    if (!startFound && traversed + text.length > start) {
      range.setStart(leaf, start - traversed);
      startFound = true;
    }

    if (startFound && traversed + text.length >= end) {
      range.setEnd(leaf, end - traversed);
      return range;
    }

    traversed += text.length;
  }
  return null;
}

// ─── Editor detection (Harper's editorUtils.ts) ───────────────────────────────

function findAncestor(
  el: Element,
  predicate: (node: Element) => boolean,
): Element | null {
  let cur: Element | null = el;
  while (cur) {
    if (predicate(cur)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

const getLexicalRoot = (el: Element) =>
  findAncestor(el, n => n.getAttribute('data-lexical-editor') === 'true');

const getDraftRoot = (el: Element) =>
  findAncestor(el, n => n.classList?.contains('public-DraftEditor-content'));

const getCMRoot = (el: Element) =>
  findAncestor(el, n => n.classList?.contains('cm-editor'));

const getSlateRoot = (el: Element) =>
  findAncestor(el, n => n.getAttribute('data-slate-editor') === 'true');

const getCkEditorRoot = (el: Element) =>
  findAncestor(el, n => n.classList?.contains('ck-editor__editable'));

// ─── Core DOM replacement (Harper's replaceTextInRange) ──────────────────────

function replaceTextInRange(
  sel: Selection,
  range: Range,
  replacementText: string,
): void {
  const { startContainer, endContainer } = range;

  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    // Single text node — direct string splice (faster, avoids re-parsing)
    const tn = startContainer as Text;
    const old = tn.textContent ?? '';
    tn.textContent =
      old.substring(0, range.startOffset) +
      replacementText +
      old.substring(range.endOffset);

    // Reposition caret after replacement
    const newRange = document.createRange();
    const cursor = range.startOffset + replacementText.length;
    newRange.setStart(tn, cursor);
    newRange.setEnd(tn, cursor);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    // Multi-node range — standard delete + insert
    range.deleteContents();
    const tn = document.createTextNode(replacementText);
    range.insertNode(tn);
    const newRange = document.createRange();
    newRange.setStartAfter(tn);
    newRange.setEndAfter(tn);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}

// ─── selectSpanInEditor helper (Harper's selectSpanInEditor) ─────────────────

function selectSpanInEditor(
  el: HTMLElement,
  start: number,
  end: number,
): { sel: Selection; range: Range } | null {
  const sel = el.ownerDocument.defaultView?.getSelection();
  if (!sel) return null;

  el.focus();

  const range = getRangeForTextSpan(el, start, end);
  if (!range) return null;

  sel.removeAllRanges();
  sel.addRange(range);
  return { sel, range };
}

// ─── Editor-specific strategies (Harper's replaceValue branches) ─────────────

/** textarea / input */
function replaceFormElementValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  start: number,
  end: number,
  text: string,
): void {
  el.focus();
  el.setSelectionRange(start, end);
  if (!document.execCommand('insertText', false, text)) {
    const v = el.value;
    el.value = v.substring(0, start) + text + v.substring(end);
    el.setSelectionRange(start + text.length, start + text.length);
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Lexical */
function replaceLexicalValue(
  el: HTMLElement,
  start: number,
  end: number,
  text: string,
): void {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  replaceTextInRange(setup.sel, setup.range, text);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false }));
}

/** Draft.js — must defer so Draft's synthetic event system intercepts beforeinput first */
function replaceDraftValue(
  el: HTMLElement,
  start: number,
  end: number,
  text: string,
): void {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  const { sel, range } = setup;
  setTimeout(() => {
    const ev = new InputEvent('beforeinput', {
      bubbles: true, cancelable: true,
      inputType: 'insertText', data: text,
    });
    el.dispatchEvent(ev);
    if (!ev.defaultPrevented) replaceTextInRange(sel, range, text);
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
  }, 0);
}

/** CodeMirror */
function replaceCodeMirrorValue(
  el: HTMLElement,
  start: number,
  end: number,
  text: string,
): void {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  const { sel, range } = setup;

  const init: InputEventInit = {
    bubbles: true, cancelable: true,
    inputType: 'insertReplacementText', data: text,
  };
  if ('StaticRange' in self) init.targetRanges = [new StaticRange(range)];

  const ev = new InputEvent('beforeinput', init);
  el.dispatchEvent(ev);

  if (!ev.defaultPrevented) {
    replaceTextInRange(sel, range, text);
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true, cancelable: false,
      inputType: 'insertReplacementText', data: text,
    }));
  }
}

/**
 * Slate / CKEditor 5 (Teams, Notion, etc.)
 * These editors read event.getTargetRanges() — the same mechanism the browser
 * uses for native spell-check replacements. Without targetRanges the event is
 * treated as an empty-range insertion and nothing happens.
 */
function replaceRichTextEditorValue(
  el: HTMLElement,
  start: number,
  end: number,
  text: string,
): void {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  const { sel, range } = setup;

  const init: InputEventInit = {
    bubbles: true, cancelable: true,
    inputType: 'insertReplacementText', data: text,
  };
  if ('StaticRange' in self) init.targetRanges = [new StaticRange(range)];

  const ev = new InputEvent('beforeinput', init);
  el.dispatchEvent(ev);

  if (!ev.defaultPrevented) {
    // Editor didn't handle it — fall back to direct DOM manipulation
    replaceTextInRange(sel, range, text);
    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false }));
  }
}

/** Plain contenteditable (no framework) */
function replaceGenericContentEditable(
  el: HTMLElement,
  start: number,
  end: number,
  text: string,
): void {
  const setup = selectSpanInEditor(el, start, end);
  if (setup) {
    replaceTextInRange(setup.sel, setup.range, text);
    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: false }));
    return;
  }
  // Last resort: overwrite entire content
  el.textContent =
    (el.innerText ?? '').substring(0, start) + text + (el.innerText ?? '').substring(end);
  el.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function replaceTextSpan(
  el: Element,
  start: number,
  end: number,
  replacement: string,
): void {
  const isFormEl =
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

  if (isFormEl) {
    replaceFormElementValue(
      el as HTMLInputElement | HTMLTextAreaElement,
      start, end, replacement,
    );
  } else if (getLexicalRoot(el as HTMLElement)) {
    replaceLexicalValue(el as HTMLElement, start, end, replacement);
  } else if (getDraftRoot(el as HTMLElement)) {
    replaceDraftValue(el as HTMLElement, start, end, replacement);
  } else if (getCMRoot(el as HTMLElement)) {
    replaceCodeMirrorValue(el as HTMLElement, start, end, replacement);
  } else if (getSlateRoot(el as HTMLElement) || getCkEditorRoot(el as HTMLElement)) {
    replaceRichTextEditorValue(el as HTMLElement, start, end, replacement);
  } else {
    replaceGenericContentEditable(el as HTMLElement, start, end, replacement);
  }

  // Always fire change so any framework listening for external mutations reconciles
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
