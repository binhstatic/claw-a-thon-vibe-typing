import type { TriggerMatch } from './triggers';
import type { Suggestion } from './api';

const MODE_LABELS: Record<string, string> = {
  translate: '🌐 Gợi ý tiếng Anh',
  synonyms: '🔁 Từ đồng nghĩa',
  analyze: '🔬 Phân tích từ',
};

let popup: HTMLElement | null = null;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function hideSuggestionPopup(): void {
  if (!popup) return;
  popup.classList.remove('vt-lint-popup-open');
  const old = popup;
  setTimeout(() => old.parentNode?.removeChild(old), 160);
  popup = null;
}

export function showSuggestionPopup(
  anchorRect: DOMRect,
  match: TriggerMatch,
  suggestions: Suggestion[],
  onApply: (chosen: string) => void,
  onDismiss: () => void,
): void {
  hideSuggestionPopup();

  const p = document.createElement('div');
  p.className = 'vt-lint-popup';

  const itemsHTML = suggestions.map((s, i) => {
    const meta = s.breakdown && s.meaning
      ? `<div class="vt-lp-meta">(${esc(s.breakdown)}: <em>${esc(s.meaning)}</em>)</div>`
      : s.breakdown
        ? `<div class="vt-lp-meta">${esc(s.breakdown)}</div>`
        : '';
    return `<li class="vt-lp-item" data-idx="${i}"><div class="vt-lp-phrase">${esc(s.phrase)}</div>${meta}</li>`;
  }).join('');

  p.innerHTML = `
    <div class="vt-lp-header">
      <span class="vt-lp-mode">${MODE_LABELS[match.mode] ?? match.mode}</span>
      <span class="vt-lp-phrase-tag">&ldquo;${esc(match.phrase)}&rdquo;</span>
      <button class="vt-lp-close" title="Đóng">&#x2715;</button>
    </div>
    <ul class="vt-lp-list">${itemsHTML}</ul>
    <div class="vt-lp-footer">
      <button class="vt-lp-dismiss">Bỏ qua</button>
    </div>
  `.trim();

  const sx = window.scrollX;
  const sy = window.scrollY;
  p.style.cssText = `position:absolute;left:${anchorRect.left + sx}px;top:${anchorRect.bottom + sy + 4}px;`;

  p.querySelector('.vt-lp-close')!.addEventListener('mousedown', ev => {
    ev.preventDefault();
    hideSuggestionPopup();
    onDismiss();
  });

  p.querySelector('.vt-lp-dismiss')!.addEventListener('mousedown', ev => {
    ev.preventDefault();
    hideSuggestionPopup();
    onDismiss();
  });

  p.querySelectorAll<HTMLLIElement>('.vt-lp-item').forEach(item => {
    item.addEventListener('mousedown', ev => {
      ev.preventDefault();
      const idx = Number(item.dataset.idx);
      onApply(suggestions[idx].phrase);
      hideSuggestionPopup();
    });
  });

  document.body.appendChild(p);
  popup = p;

  requestAnimationFrame(() => {
    p.classList.add('vt-lint-popup-open');
    const pr = p.getBoundingClientRect();
    if (pr.bottom > window.innerHeight - 8) {
      p.style.top = `${anchorRect.top + sy - pr.height - 4}px`;
    }
    if (pr.right > window.innerWidth - 8) {
      p.style.left = `${Math.max(8, window.innerWidth - pr.width - 8) + sx}px`;
    }
  });
}

export const isSuggestionPopupOpen = (): boolean => popup !== null;

export const suggestionPopupContains = (el: EventTarget | null): boolean =>
  !!popup && !!el && popup.contains(el as Node);
