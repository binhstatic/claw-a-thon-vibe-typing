import { offsetToRange } from './caretPosition';

// CSS properties that affect text layout — same list as caretPosition.ts
const MIRROR_STYLES = [
  'boxSizing', 'width',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant', 'fontStretch',
  'lineHeight', 'letterSpacing', 'wordSpacing',
  'textAlign', 'textTransform', 'textIndent',
] as const;

// Pooled mirror divs per textarea/input — avoids layout thrashing on every render
const mirrorPool = new WeakMap<HTMLTextAreaElement | HTMLInputElement, HTMLDivElement>();

function getOrCreateMirror(el: HTMLTextAreaElement | HTMLInputElement): HTMLDivElement {
  let mirror = mirrorPool.get(el);
  if (mirror && document.contains(mirror)) {
    return mirror;
  }

  mirror = document.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');

  const ms = mirror.style;
  ms.position = 'absolute';
  ms.visibility = 'hidden';
  ms.pointerEvents = 'none';
  ms.overflow = el.nodeName === 'INPUT' ? 'hidden' : 'scroll';
  ms.whiteSpace = el.nodeName === 'INPUT' ? 'nowrap' : 'pre-wrap';
  ms.wordBreak = 'break-word';

  const cs = window.getComputedStyle(el);
  for (const prop of MIRROR_STYLES) {
    const kebab = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
    ms.setProperty(kebab, cs.getPropertyValue(kebab));
  }

  document.body.appendChild(mirror);
  mirrorPool.set(el, mirror);
  return mirror;
}

function getSpanClientRectsTextarea(
  el: HTMLTextAreaElement | HTMLInputElement,
  start: number,
  end: number,
): DOMRect[] {
  const mirror = getOrCreateMirror(el);

  // Sync mirror position with textarea's current viewport position
  const elRect = el.getBoundingClientRect();
  const ms = mirror.style;
  ms.left = `${elRect.left + window.scrollX}px`;
  ms.top = `${elRect.top + window.scrollY}px`;
  ms.width = `${elRect.width}px`;
  ms.height = `${elRect.height}px`;

  const text = (el as HTMLInputElement).value;

  // Keep a single text node for Range operations
  if (
    mirror.childNodes.length !== 1 ||
    mirror.firstChild?.nodeType !== Node.TEXT_NODE
  ) {
    while (mirror.firstChild) mirror.removeChild(mirror.firstChild);
    mirror.appendChild(document.createTextNode(text));
  } else {
    (mirror.firstChild as Text).textContent = text;
  }

  // Sync textarea internal scroll so hidden text is correctly offset
  mirror.scrollTop = (el as HTMLTextAreaElement).scrollTop ?? 0;
  mirror.scrollLeft = (el as HTMLTextAreaElement).scrollLeft ?? 0;

  const textNode = mirror.firstChild as Text;
  const safeStart = Math.max(0, Math.min(start, text.length));
  const safeEnd = Math.max(safeStart, Math.min(end, text.length));
  if (safeStart === safeEnd) return [];

  const range = document.createRange();
  range.setStart(textNode, safeStart);
  range.setEnd(textNode, safeEnd);

  const rects = Array.from(range.getClientRects());

  // Clip to textarea's visible area
  return rects.filter(
    r =>
      r.width > 0 &&
      r.height > 0 &&
      r.right > elRect.left &&
      r.left < elRect.right &&
      r.bottom > elRect.top &&
      r.top < elRect.bottom,
  );
}

function getSpanClientRectsCE(el: HTMLElement, start: number, end: number): DOMRect[] {
  const range = offsetToRange(el, start, end);
  if (!range) return [];
  return Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0);
}

export function getSpanClientRects(el: Element, start: number, end: number): DOMRect[] {
  const isCE =
    (el as HTMLElement).isContentEditable &&
    el.tagName !== 'TEXTAREA' &&
    el.tagName !== 'INPUT';

  return isCE
    ? getSpanClientRectsCE(el as HTMLElement, start, end)
    : getSpanClientRectsTextarea(el as HTMLTextAreaElement | HTMLInputElement, start, end);
}
