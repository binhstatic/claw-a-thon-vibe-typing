export interface Point {
  x: number;
  y: number;
}

// CSS properties to copy to the mirror div for accurate caret measurement
const COPY_STYLES = [
  'boxSizing', 'width', 'height',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
  'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant', 'fontStretch',
  'lineHeight', 'letterSpacing', 'wordSpacing',
  'textAlign', 'textTransform', 'textIndent',
  'overflowX', 'overflowY',
] as const;

// Mirror-div technique for pixel-accurate caret position in textarea/input
export function getCaretAnchorTextarea(el: HTMLTextAreaElement | HTMLInputElement): Point {
  const elRect = el.getBoundingClientRect();
  const cs = window.getComputedStyle(el);
  const caretPos = typeof el.selectionEnd === 'number' ? el.selectionEnd : el.value.length;

  const m = document.createElement('div');
  m.setAttribute('aria-hidden', 'true');
  const ms = m.style;
  ms.position = 'absolute';
  ms.visibility = 'hidden';
  ms.pointerEvents = 'none';
  ms.whiteSpace = el.nodeName === 'INPUT' ? 'nowrap' : 'pre-wrap';
  ms.wordBreak = 'break-word';

  for (const prop of COPY_STYLES) {
    const kebab = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
    (ms as unknown as Record<string, string>)[prop] = cs.getPropertyValue(kebab);
  }

  ms.left = `${elRect.left + window.scrollX}px`;
  ms.top = `${elRect.top + window.scrollY}px`;
  ms.height = `${elRect.height}px`;
  ms.overflow = 'scroll';

  m.textContent = el.value.substring(0, caretPos);

  const caret = document.createElement('span');
  caret.textContent = '​'; // zero-width space marks caret position
  m.appendChild(caret);

  document.body.appendChild(m);
  m.scrollTop = (el as HTMLTextAreaElement).scrollTop;
  m.scrollLeft = (el as HTMLTextAreaElement).scrollLeft;

  const caretRect = caret.getBoundingClientRect();
  document.body.removeChild(m);

  return {
    x: caretRect.left + window.scrollX,
    y: caretRect.bottom + window.scrollY,
  };
}

// DOM Selection API for contenteditable caret position
export function getCaretAnchorCE(): Point {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) throw new Error('no selection');
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(false);
  const rect = range.getBoundingClientRect();
  if (!rect || (!rect.left && !rect.top && !rect.width && !rect.height)) {
    throw new Error('no caret rect');
  }
  return { x: rect.left + window.scrollX, y: rect.bottom + window.scrollY };
}

// Unified entry: picks the right technique, falls back to element bottom-left
export function getDropdownAnchor(el: Element): Point {
  const isCE = (el as HTMLElement).isContentEditable &&
    el.tagName !== 'TEXTAREA' &&
    el.tagName !== 'INPUT';
  try {
    return isCE
      ? getCaretAnchorCE()
      : getCaretAnchorTextarea(el as HTMLTextAreaElement | HTMLInputElement);
  } catch {
    const r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.bottom + window.scrollY };
  }
}

// Walk up to outermost contenteditable root (LinkedIn nests <p> inside editors)
export function getContentEditableRoot(el: Element): Element {
  let root: Element = el;
  while (root.parentElement?.isContentEditable) {
    root = root.parentElement;
  }
  return root;
}

// All editable text before the cursor in a contenteditable element
export function getCETextBeforeCaret(root: Element): string | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;

  const preRange = document.createRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString();
}

// Map flat char offset → DOM text node + offset (for applying suggestions in CE)
export function offsetToPosition(
  root: Element,
  offset: number,
): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let last: Text | null = null;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const len = node.textContent?.length ?? 0;
    last = node;
    if (remaining <= len) return { node, offset: remaining };
    remaining -= len;
  }
  if (last) return { node: last, offset: last.textContent?.length ?? 0 };
  return null;
}

export function offsetToRange(root: Element, start: number, end: number): Range | null {
  const startPos = offsetToPosition(root, start);
  const endPos = offsetToPosition(root, end);
  if (!startPos || !endPos) return null;
  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  return range;
}
