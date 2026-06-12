(() => {
  'use strict';

  // ─── DUMMY DATA ──────────────────────────────────────────────────────────
  const DUMMY = {
    translate: [
      {
        vi: ["dẫn đến tâm lý hoang mang", "dẫn đến hoang mang", "tâm lý hoang mang"],
        suggestions: [
          { phrase: "lead to feelings of confusion and anxiety",        breakdown: "lead to + feelings of + confusion and anxiety",         meaning: "gây ra cảm giác lúng túng và lo lắng" },
          { phrase: "result in a state of unease and uncertainty",       breakdown: "result in + a state of + unease and uncertainty",        meaning: "gây ra trạng thái không thoải mái và không chắc chắn" },
          { phrase: "cause emotional distress and insecurity",           breakdown: "cause + emotional distress and + insecurity",            meaning: "gây ra căng thẳng cảm xúc và sự bất an" },
        ],
      },
      {
        vi: ["áp lực học tập", "áp lực trong học tập"],
        suggestions: [
          { phrase: "academic pressure and stress",                      breakdown: "academic + pressure and + stress",                       meaning: "áp lực và căng thẳng trong học tập" },
          { phrase: "the burden of academic expectations",               breakdown: "the burden of + academic + expectations",                meaning: "gánh nặng của kỳ vọng học tập" },
          { phrase: "overwhelming scholastic demands",                   breakdown: "overwhelming + scholastic + demands",                    meaning: "những đòi hỏi học tập quá sức chịu đựng" },
        ],
      },
      {
        vi: ["hòa nhập với môi trường mới", "hòa nhập môi trường mới", "thích nghi với môi trường"],
        suggestions: [
          { phrase: "adapt to a new environment",                        breakdown: "adapt to + a new + environment",                        meaning: "thích nghi với một môi trường mới" },
          { phrase: "integrate into an unfamiliar setting",              breakdown: "integrate into + an unfamiliar + setting",              meaning: "hòa nhập vào một bối cảnh xa lạ" },
          { phrase: "acclimate to new surroundings",                     breakdown: "acclimate to + new + surroundings",                     meaning: "làm quen với môi trường xung quanh mới" },
        ],
      },
      {
        vi: ["phát triển bản thân", "phát triển bản thân mình"],
        suggestions: [
          { phrase: "foster personal growth and self-improvement",       breakdown: "foster + personal growth and + self-improvement",       meaning: "thúc đẩy sự phát triển cá nhân và tự hoàn thiện" },
          { phrase: "cultivate one's character and skills",              breakdown: "cultivate + one's character and + skills",              meaning: "rèn luyện tính cách và kỹ năng của bản thân" },
          { phrase: "enhance one's personal development",                breakdown: "enhance + one's + personal development",                meaning: "nâng cao sự phát triển cá nhân" },
        ],
      },
      {
        vi: ["nâng cao chất lượng cuộc sống", "cải thiện chất lượng sống"],
        suggestions: [
          { phrase: "improve the quality of life significantly",         breakdown: "improve + the quality of + life significantly",         meaning: "cải thiện đáng kể chất lượng cuộc sống" },
          { phrase: "elevate living standards and well-being",           breakdown: "elevate + living standards and + well-being",           meaning: "nâng cao mức sống và chất lượng cuộc sống" },
          { phrase: "enhance the overall standard of living",            breakdown: "enhance + the overall + standard of living",            meaning: "nâng cao mức sống chung" },
        ],
      },
      {
        vi: ["tăng cường kỹ năng giao tiếp", "phát triển kỹ năng giao tiếp", "kỹ năng giao tiếp"],
        suggestions: [
          { phrase: "strengthen communication skills",                   breakdown: "strengthen + communication + skills",                   meaning: "tăng cường kỹ năng giao tiếp" },
          { phrase: "develop effective interpersonal communication",     breakdown: "develop + effective + interpersonal communication",     meaning: "phát triển giao tiếp giữa cá nhân hiệu quả" },
          { phrase: "hone one's ability to communicate clearly",         breakdown: "hone + one's ability to + communicate clearly",         meaning: "mài giũa khả năng truyền đạt rõ ràng" },
        ],
      },
      {
        vi: ["mở rộng tầm nhìn", "mở rộng kiến thức", "mở mang kiến thức"],
        suggestions: [
          { phrase: "broaden one's horizons and perspectives",           breakdown: "broaden + one's horizons and + perspectives",           meaning: "mở rộng tầm nhìn và góc nhìn của bản thân" },
          { phrase: "expand one's worldview considerably",               breakdown: "expand + one's worldview + considerably",               meaning: "mở rộng đáng kể thế giới quan của bản thân" },
          { phrase: "gain a broader understanding of the world",         breakdown: "gain + a broader understanding of + the world",         meaning: "có được sự hiểu biết rộng hơn về thế giới" },
        ],
      },
      {
        vi: ["đối mặt với thách thức", "vượt qua thách thức", "đối phó với thách thức"],
        suggestions: [
          { phrase: "confront and overcome various challenges",          breakdown: "confront and + overcome + various challenges",          meaning: "đối mặt và vượt qua nhiều thách thức khác nhau" },
          { phrase: "tackle obstacles with resilience",                  breakdown: "tackle + obstacles with + resilience",                  meaning: "đương đầu với trở ngại bằng sự kiên cường" },
          { phrase: "navigate through difficult circumstances",          breakdown: "navigate through + difficult + circumstances",          meaning: "vượt qua những hoàn cảnh khó khăn" },
        ],
      },
      {
        vi: ["gây ra hậu quả nghiêm trọng", "hậu quả nghiêm trọng", "tác động tiêu cực"],
        suggestions: [
          { phrase: "give rise to serious consequences",                 breakdown: "give rise to + serious + consequences",                 meaning: "gây ra những hậu quả nghiêm trọng" },
          { phrase: "have severe and far-reaching repercussions",        breakdown: "have + severe and far-reaching + repercussions",        meaning: "có những hậu quả nặng nề và lan rộng" },
          { phrase: "trigger detrimental effects on society",            breakdown: "trigger + detrimental effects on + society",            meaning: "gây ra những tác động có hại đối với xã hội" },
        ],
      },
      {
        vi: ["góp phần vào sự phát triển", "đóng góp cho sự phát triển"],
        suggestions: [
          { phrase: "contribute to the overall development",             breakdown: "contribute to + the overall + development",             meaning: "đóng góp vào sự phát triển chung" },
          { phrase: "play a pivotal role in driving progress",           breakdown: "play + a pivotal role in + driving progress",           meaning: "đóng vai trò then chốt trong việc thúc đẩy tiến bộ" },
          { phrase: "be instrumental in fostering growth",               breakdown: "be instrumental in + fostering + growth",               meaning: "đóng vai trò quan trọng trong việc thúc đẩy tăng trưởng" },
        ],
      },
    ],

    synonyms: [
      {
        en: ["important", "significant"],
        suggestions: [
          { phrase: "crucial",        breakdown: "crucial (adj)",        meaning: "mang tính quyết định" },
          { phrase: "pivotal",        breakdown: "pivotal (adj)",        meaning: "then chốt, trọng tâm" },
          { phrase: "paramount",      breakdown: "paramount (adj)",      meaning: "tối quan trọng" },
          { phrase: "indispensable",  breakdown: "indispensable (adj)",  meaning: "không thể thiếu" },
        ],
      },
      {
        en: ["show", "demonstrate"],
        suggestions: [
          { phrase: "illustrate",  breakdown: "illustrate (v)",  meaning: "minh họa, làm rõ" },
          { phrase: "highlight",   breakdown: "highlight (v)",   meaning: "làm nổi bật" },
          { phrase: "underscore",  breakdown: "underscore (v)",  meaning: "nhấn mạnh" },
          { phrase: "exemplify",   breakdown: "exemplify (v)",   meaning: "làm ví dụ điển hình" },
        ],
      },
      {
        en: ["increase", "rise"],
        suggestions: [
          { phrase: "surge",        breakdown: "surge (v/n)",       meaning: "tăng vọt đột ngột" },
          { phrase: "escalate",     breakdown: "escalate (v)",      meaning: "leo thang, tăng dần" },
          { phrase: "skyrocket",    breakdown: "skyrocket (v)",     meaning: "tăng mạnh như tên lửa" },
          { phrase: "proliferate",  breakdown: "proliferate (v)",   meaning: "sinh sôi, phát triển nhanh" },
        ],
      },
    ],

    analyze: [
      {
        word: ["pressure"],
        suggestions: [
          { phrase: "pressure (n) /ˈpreʃər/",   breakdown: "press + -ure",           meaning: "áp lực, sức ép" },
          { phrase: "under pressure",            breakdown: "prepositional phrase",   meaning: "dưới áp lực" },
          { phrase: "peer pressure",             breakdown: "noun phrase",            meaning: "áp lực từ bạn bè" },
          { phrase: "put pressure on",           breakdown: "phrasal verb",           meaning: "gây áp lực lên" },
        ],
      },
      {
        word: ["challenge"],
        suggestions: [
          { phrase: "challenge (n/v) /ˈtʃælɪndʒ/",  breakdown: "noun + verb",              meaning: "thách thức; thách thức ai" },
          { phrase: "challenging (adj)",              breakdown: "challenge + -ing",         meaning: "đầy thử thách" },
          { phrase: "face challenges",                breakdown: "verb + noun collocation",  meaning: "đối mặt thách thức" },
          { phrase: "rise to the challenge",          breakdown: "idiomatic phrase",         meaning: "vượt qua thử thách" },
        ],
      },
    ],
  };

  // ─── TRIGGER PATTERNS ────────────────────────────────────────────────────
  // Trigger ends with a period '.' to confirm intent
  const TRIGGERS = [
    { re: /@([^@\n]{2,80})\.$/, mode: 'translate' },
    { re: /!!([^!\n]{2,80})\.$/, mode: 'synonyms' },
    { re: /#([^#\n]{2,60})\.$/, mode: 'analyze' },
  ];

  // ─── LOOKUP ──────────────────────────────────────────────────────────────
  function lookup(mode, phrase) {
    const q = phrase.trim().toLowerCase();
    if (mode === 'translate') {
      for (const entry of DUMMY.translate) {
        if (entry.vi.some(v => {
          const vn = v.toLowerCase();
          return vn === q || q.includes(vn) || vn.includes(q);
        })) return entry.suggestions;
      }
      return [{
        phrase: `[Cần tích hợp API dịch cho: "${phrase}"]`,
        breakdown: "dummy fallback",
        meaning: "chưa có dữ liệu mẫu cho cụm từ này",
      }];
    }
    if (mode === 'synonyms') {
      for (const entry of DUMMY.synonyms) {
        if (entry.en.some(w => q.includes(w.toLowerCase()))) return entry.suggestions;
      }
      return [{ phrase: `[Synonyms for "${phrase}"]`, breakdown: "fallback", meaning: "chưa có dữ liệu mẫu" }];
    }
    if (mode === 'analyze') {
      for (const entry of DUMMY.analyze) {
        if (entry.word.some(w => q.includes(w.toLowerCase()))) return entry.suggestions;
      }
      return [{ phrase: `[Analysis for "${phrase}"]`, breakdown: "fallback", meaning: "chưa có dữ liệu mẫu" }];
    }
    return [];
  }

  // ─── STATE ───────────────────────────────────────────────────────────────
  let dropdown = null;
  let currentTarget = null;
  let currentMatch = null;

  // ─── POSITIONING ─────────────────────────────────────────────────────────
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
    // Position mirror at same document location as el
    ms.left = `${elRect.left + window.scrollX}px`;
    ms.top  = `${elRect.top  + window.scrollY}px`;
    // Limit height so the mirror scrolls like the textarea
    ms.height = `${elRect.height}px`;
    ms.overflow = 'scroll';

    // Text before caret
    m.textContent = el.value.substring(0, caretPos);

    // Span to measure caret position
    const caret = document.createElement('span');
    caret.textContent = '\u200b'; // zero-width space
    m.appendChild(caret);

    document.body.appendChild(m);

    // Sync textarea scroll
    m.scrollTop = el.scrollTop;
    m.scrollLeft = el.scrollLeft;

    const caretRect = caret.getBoundingClientRect();
    document.body.removeChild(m);

    return {
      x: caretRect.left + window.scrollX,
      y: caretRect.bottom + window.scrollY,
    };
  }

  // ─── BUILD + SHOW DROPDOWN ───────────────────────────────────────────────
  const MODE_LABELS = {
    translate: '🌐 Gợi ý tiếng Anh',
    synonyms:  '🔁 Từ đồng nghĩa',
    analyze:   '🔬 Phân tích từ',
  };

  function showDropdown(el, match, suggestions) {
    removeDropdown();
    currentTarget = el;
    currentMatch  = match;

    const { x, y } = getDropdownAnchor(el);

    const d = document.createElement('div');
    d.id = 'vt-dropdown';
    d.className = 'vt-dropdown';

    // --- Header ---
    const hdr = document.createElement('div');
    hdr.className = 'vt-header';
    hdr.innerHTML =
      `<span class="vt-hlabel">${MODE_LABELS[match.mode]}</span>` +
      `<span class="vt-hphrase">&ldquo;${esc(match.phrase)}&rdquo;</span>` +
      `<button class="vt-close" title="Đóng">&#x2715;</button>`;
    d.appendChild(hdr);
    hdr.querySelector('.vt-close').addEventListener('mousedown', ev => {
      ev.preventDefault();
      removeDropdown();
    });

    // --- Context row ---
    if (match.mode === 'translate' && match.context) {
      const ctx = document.createElement('div');
      ctx.className = 'vt-context';
      ctx.innerHTML = `<b>Ngữ cảnh:</b> ${esc(match.context)}`;
      d.appendChild(ctx);
    }

    // --- Suggestion list ---
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

    // --- Footer ---
    const ft = document.createElement('div');
    ft.className = 'vt-footer';
    ft.innerHTML = '<kbd>Click</kbd> để chọn &nbsp;·&nbsp; <kbd>Esc</kbd> để đóng';
    d.appendChild(ft);

    document.body.appendChild(d);
    dropdown = d;

    // Position: initially place at (x, y), then correct overflow
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
        // flip above
        d.style.top = `${y - dr.height - 6}px`;
      }
    });
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

  // ─── APPLY CHOICE ────────────────────────────────────────────────────────
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

  // ─── DETECT TRIGGER IN TEXT ───────────────────────────────────────────────
  function detect(el) {
    const val = el.value;
    if (!val) return;

    // Read cursor position synchronously (called from input handler directly)
    const caret = typeof el.selectionEnd === 'number' ? el.selectionEnd : val.length;
    // Look at text from start up to caret
    const text = val.slice(0, caret);

    for (const { re, mode } of TRIGGERS) {
      const m = text.match(re);
      if (!m) continue;

      const fullMatch  = m[0];
      const phrase     = m[1].trim();

      // Find where this match starts in the full value
      // Use lastIndexOf on the text-up-to-caret slice (since m.index is relative to `text`)
      const matchStart = m.index;

      // Build context: sentence before the trigger
      const before = val.substring(0, matchStart);
      const sentStart = Math.max(
        before.lastIndexOf('. ') + 2,
        before.lastIndexOf('? ') + 2,
        before.lastIndexOf('! ') + 2,
        0
      );
      const context = before.substring(sentStart).trim();

      const suggestions = lookup(mode, phrase);
      if (!suggestions.length) continue;

      showDropdown(el, { fullMatch, phrase, mode, matchStart, context }, suggestions);
      return;
    }

    if (dropdown) removeDropdown();
  }

  // ─── EVENTS (document-level delegation) ──────────────────────────────────
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

  // ─── UTIL ─────────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
