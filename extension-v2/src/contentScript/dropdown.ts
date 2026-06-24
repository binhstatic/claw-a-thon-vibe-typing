import type { TriggerMatch } from './triggers';
import type { Suggestion } from './api';

export type ApplyCallback = (phrase: string) => void;

const MODE_LABELS: Record<string, string> = {
  translate: '🌐 Gợi ý tiếng Anh',
  synonyms: '🔁 Từ đồng nghĩa',
  analyze: '🔬 Phân tích từ',
  lint: '✅ Kiểm tra ngữ pháp',
};

let dropdown: HTMLElement | null = null;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function placeDropdown(d: HTMLElement, x: number, y: number): void {
  d.style.left = `${x}px`;
  d.style.top = `${y + 6}px`;
  requestAnimationFrame(() => {
    d.classList.add('vt-visible');
    const dr = d.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (dr.right > vw - 8) {
      d.style.left = `${Math.max(8, vw - dr.width - 8) + window.scrollX}px`;
    }
    if (dr.bottom > vh - 8) {
      d.style.top = `${y - dr.height - 6}px`;
    }
  });
}

function makeHeader(match: TriggerMatch): HTMLElement {
  const hdr = document.createElement('div');
  hdr.className = 'vt-header';
  hdr.innerHTML =
    `<span class="vt-hlabel">${MODE_LABELS[match.mode]}</span>` +
    `<span class="vt-hphrase">&ldquo;${esc(match.phrase)}&rdquo;</span>` +
    `<button class="vt-close" title="Đóng">&#x2715;</button>`;
  hdr.querySelector('.vt-close')!.addEventListener('mousedown', ev => {
    ev.preventDefault();
    removeDropdown();
  });
  return hdr;
}

export function removeDropdown(): void {
  if (!dropdown) return;
  dropdown.classList.remove('vt-visible');
  const old = dropdown;
  setTimeout(() => old.parentNode?.removeChild(old), 180);
  dropdown = null;
}

export function showLoadingDropdown(x: number, y: number, match: TriggerMatch): void {
  removeDropdown();
  const d = document.createElement('div');
  d.id = 'vt-dropdown';
  d.className = 'vt-dropdown';
  d.appendChild(makeHeader(match));

  const loading = document.createElement('div');
  loading.className = 'vt-loading';
  loading.innerHTML = '<div class="vt-spinner"></div><span>OpenClaw đang xử lý...</span>';
  d.appendChild(loading);

  document.body.appendChild(d);
  dropdown = d;
  placeDropdown(d, x, y);
}

export function showSuggestions(
  x: number,
  y: number,
  match: TriggerMatch,
  suggestions: Suggestion[],
  onApply: ApplyCallback,
): void {
  removeDropdown();
  const d = document.createElement('div');
  d.id = 'vt-dropdown';
  d.className = 'vt-dropdown';
  d.appendChild(makeHeader(match));

  if (match.mode === 'translate' && match.context) {
    const ctx = document.createElement('div');
    ctx.className = 'vt-context';
    ctx.innerHTML = `<b>Ngữ cảnh:</b> ${esc(match.context)}`;
    d.appendChild(ctx);
  }

  const ul = document.createElement('ul');
  ul.className = 'vt-list';
  for (const s of suggestions) {
    const li = document.createElement('li');
    li.className = 'vt-item';
    li.innerHTML =
      `<div class="vt-phrase">${esc(s.phrase)}</div>` +
      `<div class="vt-meta">(${esc(s.breakdown ?? '')}: <em>${esc(s.meaning ?? '')}</em>)</div>`;
    li.addEventListener('mousedown', ev => {
      ev.preventDefault();
      onApply(s.phrase);
    });
    ul.appendChild(li);
  }
  d.appendChild(ul);

  const ft = document.createElement('div');
  ft.className = 'vt-footer';
  ft.innerHTML =
    '<kbd>Click</kbd> để chọn &nbsp;·&nbsp; <kbd>Esc</kbd> để đóng &nbsp;·&nbsp; ⚡ OpenClaw';
  d.appendChild(ft);

  document.body.appendChild(d);
  dropdown = d;
  placeDropdown(d, x, y);
}

export const isDropdownOpen = (): boolean => dropdown !== null;

export const dropdownContains = (el: EventTarget | null): boolean =>
  !!dropdown && !!el && dropdown.contains(el as Node);
