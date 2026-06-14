(() => {
  'use strict';

  // ─── TRIGGER PATTERNS ────────────────────────────────────────────────────────
  // Trigger ends with a period '.' to confirm intent
  const TRIGGERS = [
    { re: /@([^@\n]{2,80})\.$/, mode: 'translate' },
    { re: /!!([^!\n]{2,80})\.$/, mode: 'synonyms' },
    { re: /#([^#\n]{2,60})\.$/, mode: 'analyze' },
  ];

  // ─── AGENT CALL ──────────────────────────────────────────────────────────────
  const AGENT_URL = `${AGENT_BASE_URL}/suggest`;

  async function callAgent(mode, phrase, context, signal) {
    const res = await fetch(AGENT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ mode, phrase, context }),
      signal,
    });
    if (!res.ok) throw new Error(`Agent HTTP ${res.status}`);
    const { suggestions } = await res.json();
    return suggestions;
  }

  // ─── STATE ───────────────────────────────────────────────────────────────────
  let dropdown           = null;
  let currentTarget      = null;
  let currentMatch       = null;
  let currentAbortCtrl   = null;

  // ─── POSITIONING ─────────────────────────────────────────────────────────────
  // Simple, reliable: place dropdown below the textarea's bottom edge.
  // For precise caret position, use the mirror-div technique with fallback.
  function getDropdownAnchor(el) {
    try {
      return getCaretAnchor(el);
    } catch (_) {
      const r = el.getBoundingClientRect();
      return {
        x: r.left + window.scrollX,
        y: r.bottom + window.scrollY,
      };
    }
  }

  // Mirror-div caret position — returns {x, y} in document coordinates
  const COPY_STYLES = [
    'boxSizing','width','height','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
    'borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle',
    'fontFamily','fontSize','fontStyle','fontWeight','fontVariant','fontStretch',
    'lineHeight','letterSpacing','wordSpacing','textAlign','textTransform','textIndent',
    'overflowX','overflowY',
  ];

  function getCaretAnchor(el) {
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
    COPY_STYLES.forEach(p => { ms[p] = cs[p]; });
    ms.left = `${elRect.left + window.scrollX}px`;
    ms.top  = `${elRect.top  + window.scrollY}px`;
    ms.height = `${elRect.height}px`;
    ms.overflow = 'scroll';

    m.textContent = el.value.substring(0, caretPos);

    const caret = document.createElement('span');
    caret.textContent = '​'; // zero-width space
    m.appendChild(caret);

    document.body.appendChild(m);
    m.scrollTop = el.scrollTop;
    m.scrollLeft = el.scrollLeft;

    const caretRect = caret.getBoundingClientRect();
    document.body.removeChild(m);

    return {
      x: caretRect.left + window.scrollX,
      y: caretRect.bottom + window.scrollY,
    };
  }

  // ─── BUILD + SHOW DROPDOWN ───────────────────────────────────────────────────
  const MODE_LABELS = {
    translate: '🌐 Gợi ý tiếng Anh',
    synonyms:  '🔁 Từ đồng nghĩa',
    analyze:   '🔬 Phân tích từ',
  };

  function _placeDropdown(d, x, y) {
    d.style.left = `${x}px`;
    d.style.top  = `${y + 6}px`;
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

  function _makeHeader(match) {
    const hdr = document.createElement('div');
    hdr.className = 'vt-header';
    hdr.innerHTML =
      `<span class="vt-hlabel">${MODE_LABELS[match.mode]}</span>` +
      `<span class="vt-hphrase">&ldquo;${esc(match.phrase)}&rdquo;</span>` +
      `<button class="vt-close" title="Đóng">&#x2715;</button>`;
    hdr.querySelector('.vt-close').addEventListener('mousedown', ev => {
      ev.preventDefault();
      removeDropdown();
    });
    return hdr;
  }

  function showLoadingDropdown(el, match) {
    removeDropdown();
    currentTarget = el;
    currentMatch  = match;

    const { x, y } = getDropdownAnchor(el);
    const d = document.createElement('div');
    d.id = 'vt-dropdown';
    d.className = 'vt-dropdown';

    d.appendChild(_makeHeader(match));

    const loading = document.createElement('div');
    loading.className = 'vt-loading';
    loading.innerHTML = '<div class="vt-spinner"></div><span>OpenClaw đang xử lý...</span>';
    d.appendChild(loading);

    document.body.appendChild(d);
    dropdown = d;
    _placeDropdown(d, x, y);
  }

  function showDropdown(el, match, suggestions) {
    removeDropdown();
    currentTarget = el;
    currentMatch  = match;

    const { x, y } = getDropdownAnchor(el);
    const d = document.createElement('div');
    d.id = 'vt-dropdown';
    d.className = 'vt-dropdown';

    d.appendChild(_makeHeader(match));

    // Context row (translate only)
    if (match.mode === 'translate' && match.context) {
      const ctx = document.createElement('div');
      ctx.className = 'vt-context';
      ctx.innerHTML = `<b>Ngữ cảnh:</b> ${esc(match.context)}`;
      d.appendChild(ctx);
    }

    // Suggestion list
    const ul = document.createElement('ul');
    ul.className = 'vt-list';
    suggestions.forEach(s => {
      const li = document.createElement('li');
      li.className = 'vt-item';
      li.innerHTML =
        `<div class="vt-phrase">${esc(s.phrase)}</div>` +
        `<div class="vt-meta">(${esc(s.breakdown)}: <em>${esc(s.meaning)}</em>)</div>`;
      li.addEventListener('mousedown', ev => {
        ev.preventDefault();
        applyChoice(s.phrase);
      });
      ul.appendChild(li);
    });
    d.appendChild(ul);

    // Footer
    const ft = document.createElement('div');
    ft.className = 'vt-footer';
    ft.innerHTML = '<kbd>Click</kbd> để chọn &nbsp;·&nbsp; <kbd>Esc</kbd> để đóng &nbsp;·&nbsp; ⚡ OpenClaw';
    d.appendChild(ft);

    document.body.appendChild(d);
    dropdown = d;
    _placeDropdown(d, x, y);
  }

  function removeDropdown() {
    if (dropdown) {
      dropdown.classList.remove('vt-visible');
      const old = dropdown;
      setTimeout(() => old.parentNode && old.parentNode.removeChild(old), 180);
      dropdown = null;
    }
    currentMatch = null;
  }

  // ─── APPLY CHOICE ────────────────────────────────────────────────────────────
  function applyChoice(chosen) {
    if (!currentTarget || !currentMatch) return;
    const el = currentTarget;
    const { fullMatch, matchStart } = currentMatch;
    const before = el.value.substring(0, matchStart);
    const after  = el.value.substring(matchStart + fullMatch.length);
    el.value = before + chosen + after;
    const caret = matchStart + chosen.length;
    el.setSelectionRange(caret, caret);
    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    removeDropdown();
  }

  // ─── DETECT TRIGGER IN TEXT ───────────────────────────────────────────────────
  async function detect(el) {
    const val = el.value;
    if (!val) return;

    const caret = typeof el.selectionEnd === 'number' ? el.selectionEnd : val.length;
    const text  = val.slice(0, caret);

    for (const { re, mode } of TRIGGERS) {
      const m = text.match(re);
      if (!m) continue;

      const fullMatch  = m[0];
      const phrase     = m[1].trim();
      const matchStart = m.index;

      const before    = val.substring(0, matchStart);
      const sentStart = Math.max(
        before.lastIndexOf('. ') + 2,
        before.lastIndexOf('? ') + 2,
        before.lastIndexOf('! ') + 2,
        0
      );
      const context = before.substring(sentStart).trim();
      const match   = { fullMatch, phrase, mode, matchStart, context };

      // Cancel any in-flight request
      if (currentAbortCtrl) currentAbortCtrl.abort();
      currentAbortCtrl = new AbortController();
      const { signal } = currentAbortCtrl;

      showLoadingDropdown(el, match);

      try {
        const suggestions = await callAgent(mode, phrase, context, signal);
        if (!signal.aborted && suggestions && suggestions.length) {
          showDropdown(el, match, suggestions);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[vibe-typing] Agent error:', err.message);
          removeDropdown();
        }
      }
      return;
    }

    if (dropdown) removeDropdown();
  }

  // ─── EVENTS (document-level delegation) ──────────────────────────────────────
  document.addEventListener('input', e => {
    const el = e.target;
    if (!isEditable(el)) return;
    detect(el);
  }, true); // capture phase — fires before any page handler

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dropdown) {
      e.stopPropagation();
      removeDropdown();
    }
  }, true);

  document.addEventListener('mousedown', e => {
    if (dropdown && !dropdown.contains(e.target)) removeDropdown();
  }, true);

  document.addEventListener('scroll', () => { if (dropdown) removeDropdown(); }, { passive: true, capture: true });

  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
      const t = (el.type || 'text').toLowerCase();
      return t === 'text' || t === 'search' || t === '';
    }
    return false;
  }

  // ─── UTIL ─────────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
