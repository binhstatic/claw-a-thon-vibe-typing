(() => {
  'use strict';

  // ─── TRIGGER PATTERNS (mirror the extension) ───────────────────────────────
  const TRIGGERS = [
    { re: /@([^@\n]{2,80})\.$/, mode: 'translate' },
    { re: /!!([^!\n]{2,80})\.$/, mode: 'synonyms' },
    { re: /#([^#\n]{2,60})\.$/, mode: 'analyze' },
  ];

  const MODE_LABELS = {
    translate: '🌐 Gợi ý tiếng Anh',
    synonyms:  '🔁 Từ đồng nghĩa',
    analyze:   '🔬 Phân tích từ',
  };

  const AGENT_URL = `${AGENT_BASE_URL}/suggest`;

  const input = document.getElementById('pg-input');

  let dropdown = null;
  let currentMatch = null;
  let abortCtrl = null;

  // ─── AGENT CALL ────────────────────────────────────────────────────────────
  async function callAgent(mode, phrase, context, signal) {
    const res = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, phrase, context }),
      signal,
    });
    if (!res.ok) throw new Error(`Agent HTTP ${res.status}`);
    const { suggestions } = await res.json();
    return suggestions;
  }

  // ─── CARET POSITION (mirror-div technique) ─────────────────────────────────
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
    ms.whiteSpace = 'pre-wrap';
    ms.wordBreak = 'break-word';
    COPY_STYLES.forEach(p => { ms[p] = cs[p]; });
    ms.left = `${elRect.left + window.scrollX}px`;
    ms.top  = `${elRect.top  + window.scrollY}px`;
    ms.height = `${elRect.height}px`;
    ms.overflow = 'scroll';

    m.textContent = el.value.substring(0, caretPos);
    const caret = document.createElement('span');
    caret.textContent = '​';
    m.appendChild(caret);

    document.body.appendChild(m);
    m.scrollTop = el.scrollTop;
    m.scrollLeft = el.scrollLeft;
    const caretRect = caret.getBoundingClientRect();
    document.body.removeChild(m);

    return { x: caretRect.left + window.scrollX, y: caretRect.bottom + window.scrollY };
  }

  function anchorFor(el) {
    try { return getCaretAnchor(el); }
    catch (_) {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.bottom + window.scrollY };
    }
  }

  // ─── DROPDOWN RENDERING ────────────────────────────────────────────────────
  function placeDropdown(d, x, y) {
    d.style.left = `${x}px`;
    d.style.top  = `${y + 6}px`;
    requestAnimationFrame(() => {
      d.classList.add('vt-visible');
      const dr = d.getBoundingClientRect();
      if (dr.right > window.innerWidth - 8) {
        d.style.left = `${Math.max(8, window.innerWidth - dr.width - 8) + window.scrollX}px`;
      }
      if (dr.bottom > window.innerHeight - 8) {
        d.style.top = `${y - dr.height - 6 + window.scrollY}px`;
      }
    });
  }

  function makeHeader(match) {
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

  function baseDropdown(match) {
    removeDropdown();
    currentMatch = match;
    const d = document.createElement('div');
    d.className = 'vt-dropdown';
    d.appendChild(makeHeader(match));
    return d;
  }

  function showLoading(match) {
    const d = baseDropdown(match);
    const l = document.createElement('div');
    l.className = 'vt-loading';
    l.innerHTML = '<div class="vt-spinner"></div><span>OpenClaw đang xử lý…</span>';
    d.appendChild(l);
    mount(d, match);
  }

  function showError(match, msg) {
    const d = baseDropdown(match);
    const e = document.createElement('div');
    e.className = 'vt-error';
    e.textContent = `Không lấy được gợi ý: ${msg}`;
    d.appendChild(e);
    mount(d, match);
  }

  function showSuggestions(match, suggestions) {
    const d = baseDropdown(match);

    if (match.mode === 'translate' && match.context) {
      const ctx = document.createElement('div');
      ctx.className = 'vt-context';
      ctx.innerHTML = `<b>Ngữ cảnh:</b> ${esc(match.context)}`;
      d.appendChild(ctx);
    }

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

    const ft = document.createElement('div');
    ft.className = 'vt-footer';
    ft.innerHTML = 'Click để chèn · Esc để đóng · ⚡ OpenClaw';
    d.appendChild(ft);

    mount(d, match);
  }

  function mount(d, match) {
    const { x, y } = anchorFor(input);
    document.body.appendChild(d);
    dropdown = d;
    placeDropdown(d, x, y);
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

  // ─── APPLY CHOICE ──────────────────────────────────────────────────────────
  function applyChoice(chosen) {
    if (!currentMatch) return;
    const { fullMatch, matchStart } = currentMatch;
    const v = input.value;
    const before = v.substring(0, matchStart);
    const after  = v.substring(matchStart + fullMatch.length);
    input.value = before + chosen + after;
    const caret = matchStart + chosen.length;
    input.setSelectionRange(caret, caret);
    input.focus();
    removeDropdown();
  }

  // ─── DETECT TRIGGER ────────────────────────────────────────────────────────
  async function detect() {
    const v = input.value;
    const caret = typeof input.selectionEnd === 'number' ? input.selectionEnd : v.length;
    const text = v.slice(0, caret);
    if (!text) { if (dropdown) removeDropdown(); return; }

    for (const { re, mode } of TRIGGERS) {
      const m = text.match(re);
      if (!m) continue;

      const fullMatch = m[0];
      const phrase = m[1].trim();
      const matchStart = m.index;

      const before = text.substring(0, matchStart);
      const sentStart = Math.max(
        before.lastIndexOf('. ') + 2,
        before.lastIndexOf('? ') + 2,
        before.lastIndexOf('! ') + 2,
        0
      );
      const context = before.substring(sentStart).trim();
      const match = { fullMatch, phrase, mode, matchStart, context };

      if (abortCtrl) abortCtrl.abort();
      abortCtrl = new AbortController();
      const { signal } = abortCtrl;

      showLoading(match);
      try {
        const suggestions = await callAgent(mode, phrase, context, signal);
        if (!signal.aborted) {
          if (suggestions && suggestions.length) showSuggestions(match, suggestions);
          else showError(match, 'không có kết quả');
        }
      } catch (err) {
        if (err.name !== 'AbortError') showError(match, err.message);
      }
      return;
    }

    if (dropdown) removeDropdown();
  }

  // ─── EVENTS ────────────────────────────────────────────────────────────────
  input.addEventListener('input', detect);
  input.addEventListener('click', () => { if (dropdown) removeDropdown(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dropdown) { e.stopPropagation(); removeDropdown(); }
  }, true);

  document.addEventListener('mousedown', e => {
    if (dropdown && !dropdown.contains(e.target) && e.target !== input) removeDropdown();
  }, true);

  window.addEventListener('scroll', () => { if (dropdown) removeDropdown(); }, { passive: true });
  window.addEventListener('resize', () => { if (dropdown) removeDropdown(); });

  // ─── GUIDED EXAMPLES ───────────────────────────────────────────────────────
  // Chips fill the textarea and auto-trigger; card buttons scroll + fill.
  // Place the caret right after the trigger so detection fires even when the
  // example has trailing text after the phrase (e.g. "!!important. issue").
  const TRIGGER_ANYWHERE = [
    /@[^@\n]{2,80}\./,
    /!![^!\n]{2,80}\./,
    /#[^#\n]{2,60}\./,
  ];
  function caretAfterTrigger(value) {
    let pos = value.length;
    for (const re of TRIGGER_ANYWHERE) {
      const m = value.match(re);
      if (m) pos = Math.min(pos, m.index + m[0].length);
    }
    return pos;
  }

  function fillAndTrigger(value) {
    input.value = value;
    input.focus();
    const caret = caretAfterTrigger(value);
    input.setSelectionRange(caret, caret);
    detect();
  }

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => fillAndTrigger(chip.dataset.fill));
  });

  const CARD_EXAMPLES = {
    translate: '…the new policy @dẫn đến tâm lý hoang mang.',
    synonyms:  'This is a very !!important. issue',
    analyze:   '#impact.',
  };
  document.querySelectorAll('.card-try').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('playground').scrollIntoView({ behavior: 'smooth' });
      const ex = CARD_EXAMPLES[btn.dataset.try];
      setTimeout(() => fillAndTrigger(ex), 450);
    });
  });

  // ─── SERVER HEALTH PILL ────────────────────────────────────────────────────
  (async function checkServer() {
    const dot = document.getElementById('server-dot');
    const label = document.getElementById('server-label');
    try {
      const res = await fetch(`${AGENT_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error();
      dot.className = 'pill-dot online';
      label.textContent = 'Agent: online';
    } catch (_) {
      dot.className = 'pill-dot offline';
      label.textContent = 'Agent: offline';
    }
  })();

  // ─── UTIL ──────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
