var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { P as ProtocolClient } from "./ProtocolClient-CGKQZBsb.js";
const TRIGGERS = [
  { re: /@([^@\n]{2,80})\.$/, mode: "translate" },
  { re: /!!([^!\n]{2,80})\.$/, mode: "synonyms" },
  { re: /#([^#\n]{2,60})\.$/, mode: "analyze" }
];
function matchTrigger(text, isCE, enableTranslate, enableSynonyms, enableAnalyze) {
  const enabled = {
    translate: enableTranslate,
    synonyms: enableSynonyms,
    analyze: enableAnalyze
  };
  for (const { re, mode } of TRIGGERS) {
    if (!enabled[mode]) continue;
    const m = text.match(re);
    if (!m || m.index === void 0) continue;
    const fullMatch = m[0];
    const phrase = m[1].trim();
    const matchStart = m.index;
    const before = text.substring(0, matchStart);
    const sentCandidates = [
      before.lastIndexOf(". ") + 2,
      before.lastIndexOf("? ") + 2,
      before.lastIndexOf("! ") + 2
    ].filter((i) => i >= 2);
    const sentStart = sentCandidates.length ? Math.max(...sentCandidates) : 0;
    const context = before.substring(sentStart).trim();
    return { fullMatch, phrase, mode, matchStart, context, isCE };
  }
  return null;
}
function getContentEditableRoot(el) {
  var _a;
  let root = el;
  while ((_a = root.parentElement) == null ? void 0 : _a.isContentEditable) {
    root = root.parentElement;
  }
  return root;
}
function getCETextBeforeCaret(root) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  const preRange = document.createRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString();
}
function offsetToPosition(root, offset) {
  var _a, _b;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let last = null;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const len = ((_a = node.textContent) == null ? void 0 : _a.length) ?? 0;
    last = node;
    if (remaining <= len) return { node, offset: remaining };
    remaining -= len;
  }
  if (last) return { node: last, offset: ((_b = last.textContent) == null ? void 0 : _b.length) ?? 0 };
  return null;
}
function offsetToRange(root, start, end) {
  const startPos = offsetToPosition(root, start);
  const endPos = offsetToPosition(root, end);
  if (!startPos || !endPos) return null;
  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  return range;
}
async function callAgent(baseUrl, mode, phrase, context, signal) {
  const res = await fetch(`${baseUrl}/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, phrase, context }),
    signal
  });
  if (!res.ok) throw new Error(`Agent HTTP ${res.status}`);
  const { suggestions } = await res.json();
  return suggestions ?? [];
}
const MIRROR_STYLES = [
  "boxSizing",
  "width",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "fontVariant",
  "fontStretch",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "textAlign",
  "textTransform",
  "textIndent"
];
const mirrorPool = /* @__PURE__ */ new WeakMap();
function getOrCreateMirror(el) {
  let mirror = mirrorPool.get(el);
  if (mirror && document.contains(mirror)) {
    return mirror;
  }
  mirror = document.createElement("div");
  mirror.setAttribute("aria-hidden", "true");
  const ms = mirror.style;
  ms.position = "absolute";
  ms.visibility = "hidden";
  ms.pointerEvents = "none";
  ms.overflow = el.nodeName === "INPUT" ? "hidden" : "scroll";
  ms.whiteSpace = el.nodeName === "INPUT" ? "nowrap" : "pre-wrap";
  ms.wordBreak = "break-word";
  const cs = window.getComputedStyle(el);
  for (const prop of MIRROR_STYLES) {
    const kebab = prop.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
    ms.setProperty(kebab, cs.getPropertyValue(kebab));
  }
  document.body.appendChild(mirror);
  mirrorPool.set(el, mirror);
  return mirror;
}
function getSpanClientRectsTextarea(el, start, end) {
  var _a;
  const mirror = getOrCreateMirror(el);
  const elRect = el.getBoundingClientRect();
  const ms = mirror.style;
  ms.left = `${elRect.left + window.scrollX}px`;
  ms.top = `${elRect.top + window.scrollY}px`;
  ms.width = `${elRect.width}px`;
  ms.height = `${elRect.height}px`;
  const text = el.value;
  if (mirror.childNodes.length !== 1 || ((_a = mirror.firstChild) == null ? void 0 : _a.nodeType) !== Node.TEXT_NODE) {
    while (mirror.firstChild) mirror.removeChild(mirror.firstChild);
    mirror.appendChild(document.createTextNode(text));
  } else {
    mirror.firstChild.textContent = text;
  }
  mirror.scrollTop = el.scrollTop ?? 0;
  mirror.scrollLeft = el.scrollLeft ?? 0;
  const textNode = mirror.firstChild;
  const safeStart = Math.max(0, Math.min(start, text.length));
  const safeEnd = Math.max(safeStart, Math.min(end, text.length));
  if (safeStart === safeEnd) return [];
  const range = document.createRange();
  range.setStart(textNode, safeStart);
  range.setEnd(textNode, safeEnd);
  const rects = Array.from(range.getClientRects());
  return rects.filter(
    (r) => r.width > 0 && r.height > 0 && r.right > elRect.left && r.left < elRect.right && r.bottom > elRect.top && r.top < elRect.bottom
  );
}
function getSpanClientRectsCE(el, start, end) {
  const range = offsetToRange(el, start, end);
  if (!range) return [];
  return Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
}
function getSpanClientRects(el, start, end) {
  const isCE = el.isContentEditable && el.tagName !== "TEXTAREA" && el.tagName !== "INPUT";
  return isCE ? getSpanClientRectsCE(el, start, end) : getSpanClientRectsTextarea(el, start, end);
}
const UNDERLINE_STYLE = `
  .vt-lint-box {
    position: fixed;
    pointer-events: none;
    box-sizing: border-box;
    border-radius: 1px;
  }
  .vt-lint-box.loading {
    border-bottom: 2px dotted rgba(79, 70, 229, 0.35);
  }
  .vt-lint-box.ready {
    border-bottom: 2px solid rgba(79, 70, 229, 0.85);
    background: rgba(79, 70, 229, 0.06);
  }
`;
class HighlightRenderer {
  constructor() {
    __publicField(this, "host");
    __publicField(this, "shadow");
    __publicField(this, "boxes", []);
    this.host = document.createElement("div");
    this.host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:2147483646;overflow:visible;";
    document.body.appendChild(this.host);
    this.shadow = this.host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = UNDERLINE_STYLE;
    this.shadow.appendChild(style);
  }
  update(rectsByLint, ready = false) {
    for (const el of [...this.shadow.querySelectorAll(".vt-lint-box")]) {
      el.remove();
    }
    this.boxes = [];
    for (const { rects, lintIndex } of rectsByLint) {
      for (const rect of rects) {
        const div = document.createElement("div");
        div.className = `vt-lint-box ${ready ? "ready" : "loading"}`;
        div.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;
        this.shadow.appendChild(div);
        this.boxes.push({ rect, lintIndex });
      }
    }
  }
  hitTest(clientX, clientY) {
    for (const { rect, lintIndex } of this.boxes) {
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return lintIndex;
      }
    }
    return null;
  }
  clear() {
    for (const el of [...this.shadow.querySelectorAll(".vt-lint-box")]) {
      el.remove();
    }
    this.boxes = [];
  }
  destroy() {
    this.host.remove();
  }
}
const MODE_LABELS = {
  translate: "🌐 Gợi ý tiếng Anh",
  synonyms: "🔁 Từ đồng nghĩa",
  analyze: "🔬 Phân tích từ"
};
const LOADING_WORDS = {
  translate: ["Translating", "Interpreting", "Rephrasing", "Contextualizing", "Rendering", "Searching", "Expressing", "Converting"],
  synonyms: ["Searching", "Exploring", "Scanning", "Sifting", "Gathering", "Browsing", "Hunting", "Discovering"],
  analyze: ["Analyzing", "Dissecting", "Examining", "Parsing", "Unpacking", "Investigating", "Studying", "Exploring"]
};
let popup = null;
let loadingPopup = null;
let loadingInterval = null;
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function mountPopup(p, anchorRect) {
  const sx = window.scrollX;
  const sy = window.scrollY;
  p.style.cssText = `position:absolute;left:${anchorRect.left + sx}px;top:${anchorRect.bottom + sy + 4}px;`;
  document.body.appendChild(p);
  requestAnimationFrame(() => {
    p.classList.add("vt-lint-popup-open");
    const pr = p.getBoundingClientRect();
    if (pr.bottom > window.innerHeight - 8) {
      p.style.top = `${anchorRect.top + sy - pr.height - 4}px`;
    }
    if (pr.right > window.innerWidth - 8) {
      p.style.left = `${Math.max(8, window.innerWidth - pr.width - 8) + sx}px`;
    }
  });
}
function showLoadingPopup(anchorRect, match) {
  hideLoadingPopup();
  const words = LOADING_WORDS[match.mode] ?? ["Thinking", "Processing", "Searching", "Pondering", "Exploring", "Reflecting"];
  let idx = 0;
  const p = document.createElement("div");
  p.className = "vt-lint-popup";
  p.innerHTML = `
    <div class="vt-lp-loading-body">
      <span class="vt-lp-loading-word">${words[0]}</span>
      <span class="vt-lp-loading-suffix">…</span>
    </div>
  `.trim();
  mountPopup(p, anchorRect);
  loadingPopup = p;
  const wordEl = p.querySelector(".vt-lp-loading-word");
  loadingInterval = setInterval(() => {
    wordEl.classList.add("vt-fading");
    setTimeout(() => {
      idx = (idx + 1) % words.length;
      wordEl.textContent = words[idx];
      wordEl.classList.remove("vt-fading");
    }, 220);
  }, 1600);
}
function hideLoadingPopup() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
  if (!loadingPopup) return;
  loadingPopup.classList.remove("vt-lint-popup-open");
  const old = loadingPopup;
  setTimeout(() => {
    var _a;
    return (_a = old.parentNode) == null ? void 0 : _a.removeChild(old);
  }, 160);
  loadingPopup = null;
}
function hideSuggestionPopup() {
  if (!popup) return;
  popup.classList.remove("vt-lint-popup-open");
  const old = popup;
  setTimeout(() => {
    var _a;
    return (_a = old.parentNode) == null ? void 0 : _a.removeChild(old);
  }, 160);
  popup = null;
}
function showSuggestionPopup(anchorRect, match, suggestions, onApply, onDismiss) {
  hideSuggestionPopup();
  const p = document.createElement("div");
  p.className = "vt-lint-popup";
  const itemsHTML = suggestions.map((s, i) => {
    const meta = s.breakdown && s.meaning ? `<div class="vt-lp-meta">(${esc(s.breakdown)}: <em>${esc(s.meaning)}</em>)</div>` : s.breakdown ? `<div class="vt-lp-meta">${esc(s.breakdown)}</div>` : "";
    return `<li class="vt-lp-item" data-idx="${i}"><div class="vt-lp-phrase">${esc(s.phrase)}</div>${meta}</li>`;
  }).join("");
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
  p.querySelector(".vt-lp-close").addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    hideSuggestionPopup();
    onDismiss();
  });
  p.querySelector(".vt-lp-dismiss").addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    hideSuggestionPopup();
    onDismiss();
  });
  p.querySelectorAll(".vt-lp-item").forEach((item) => {
    item.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      const idx = Number(item.dataset.idx);
      onApply(suggestions[idx].phrase);
      hideSuggestionPopup();
    });
  });
  mountPopup(p, anchorRect);
  popup = p;
}
const isSuggestionPopupOpen = () => popup !== null;
const suggestionPopupContains = (el) => !!popup && !!el && popup.contains(el);
function leafNodes(node) {
  const children = Array.from(node.childNodes);
  if (children.length === 0) return [node];
  return children.flatMap(leafNodes);
}
function getRangeForTextSpan(target, start, end) {
  const leaves = leafNodes(target);
  const range = document.createRange();
  let traversed = 0;
  let startFound = false;
  for (const leaf of leaves) {
    if (leaf.nodeName === "BR") {
      traversed += 1;
      continue;
    }
    const text = leaf.textContent ?? "";
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
function findAncestor(el, predicate) {
  let cur = el;
  while (cur) {
    if (predicate(cur)) return cur;
    cur = cur.parentElement;
  }
  return null;
}
const getLexicalRoot = (el) => findAncestor(el, (n) => n.getAttribute("data-lexical-editor") === "true");
const getDraftRoot = (el) => findAncestor(el, (n) => {
  var _a;
  return (_a = n.classList) == null ? void 0 : _a.contains("public-DraftEditor-content");
});
const getCMRoot = (el) => findAncestor(el, (n) => {
  var _a;
  return (_a = n.classList) == null ? void 0 : _a.contains("cm-editor");
});
const getSlateRoot = (el) => findAncestor(el, (n) => n.getAttribute("data-slate-editor") === "true");
const getCkEditorRoot = (el) => findAncestor(el, (n) => {
  var _a;
  return (_a = n.classList) == null ? void 0 : _a.contains("ck-editor__editable");
});
function replaceTextInRange(sel, range, replacementText) {
  const { startContainer, endContainer } = range;
  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    const tn = startContainer;
    const old = tn.textContent ?? "";
    tn.textContent = old.substring(0, range.startOffset) + replacementText + old.substring(range.endOffset);
    const newRange = document.createRange();
    const cursor = range.startOffset + replacementText.length;
    newRange.setStart(tn, cursor);
    newRange.setEnd(tn, cursor);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
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
function selectSpanInEditor(el, start, end) {
  var _a;
  const sel = (_a = el.ownerDocument.defaultView) == null ? void 0 : _a.getSelection();
  if (!sel) return null;
  el.focus();
  const range = getRangeForTextSpan(el, start, end);
  if (!range) return null;
  sel.removeAllRanges();
  sel.addRange(range);
  return { sel, range };
}
function replaceFormElementValue(el, start, end, text) {
  el.focus();
  el.setSelectionRange(start, end);
  if (!document.execCommand("insertText", false, text)) {
    const v = el.value;
    el.value = v.substring(0, start) + text + v.substring(end);
    el.setSelectionRange(start + text.length, start + text.length);
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
}
function replaceLexicalValue(el, start, end, text) {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  replaceTextInRange(setup.sel, setup.range, text);
  el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: false }));
}
function replaceDraftValue(el, start, end, text) {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  const { sel, range } = setup;
  setTimeout(() => {
    const ev = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: text
    });
    el.dispatchEvent(ev);
    if (!ev.defaultPrevented) replaceTextInRange(sel, range, text);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText" }));
  }, 0);
}
function replaceCodeMirrorValue(el, start, end, text) {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  const { sel, range } = setup;
  const init2 = {
    bubbles: true,
    cancelable: true,
    inputType: "insertReplacementText",
    data: text
  };
  if ("StaticRange" in self) init2.targetRanges = [new StaticRange(range)];
  const ev = new InputEvent("beforeinput", init2);
  el.dispatchEvent(ev);
  if (!ev.defaultPrevented) {
    replaceTextInRange(sel, range, text);
    el.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      cancelable: false,
      inputType: "insertReplacementText",
      data: text
    }));
  }
}
function replaceRichTextEditorValue(el, start, end, text) {
  const setup = selectSpanInEditor(el, start, end);
  if (!setup) return;
  const { sel, range } = setup;
  const init2 = {
    bubbles: true,
    cancelable: true,
    inputType: "insertReplacementText",
    data: text
  };
  if ("StaticRange" in self) init2.targetRanges = [new StaticRange(range)];
  const ev = new InputEvent("beforeinput", init2);
  el.dispatchEvent(ev);
  if (!ev.defaultPrevented) {
    replaceTextInRange(sel, range, text);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: false }));
  }
}
function replaceGenericContentEditable(el, start, end, text) {
  const setup = selectSpanInEditor(el, start, end);
  if (setup) {
    replaceTextInRange(setup.sel, setup.range, text);
    el.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: false }));
    return;
  }
  el.textContent = (el.innerText ?? "").substring(0, start) + text + (el.innerText ?? "").substring(end);
  el.dispatchEvent(new InputEvent("input", { bubbles: true }));
}
function replaceTextSpan(el, start, end, replacement) {
  const isFormEl = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  if (isFormEl) {
    replaceFormElementValue(
      el,
      start,
      end,
      replacement
    );
  } else if (getLexicalRoot(el)) {
    replaceLexicalValue(el, start, end, replacement);
  } else if (getDraftRoot(el)) {
    replaceDraftValue(el, start, end, replacement);
  } else if (getCMRoot(el)) {
    replaceCodeMirrorValue(el, start, end, replacement);
  } else if (getSlateRoot(el) || getCkEditorRoot(el)) {
    replaceRichTextEditorValue(el, start, end, replacement);
  } else {
    replaceGenericContentEditable(el, start, end, replacement);
  }
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
let config = null;
let currentTarget = null;
let currentMatch = null;
let currentAbortCtrl = null;
let readySuggestions = null;
const triggerRenderer = new HighlightRenderer();
async function init() {
  const domain = window.location.hostname;
  const [cfg, enabled] = await Promise.all([
    ProtocolClient.getConfig(),
    ProtocolClient.getDomainStatus(domain)
  ]);
  config = cfg;
  if (!enabled) return;
  attachListeners();
  setInterval(() => {
    ProtocolClient.getConfig().catch(() => {
    });
  }, 400);
}
function clearTriggerState() {
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
function resolveTarget(el) {
  if (!el || !(el instanceof Element)) return null;
  const tag = el.tagName;
  if (tag === "TEXTAREA") return el;
  if (tag === "INPUT") {
    const t = (el.type || "text").toLowerCase();
    return t === "text" || t === "search" || t === "" ? el : null;
  }
  if (el.isContentEditable) return getContentEditableRoot(el);
  return null;
}
function isCEElement(el) {
  return el.isContentEditable && el.tagName !== "TEXTAREA" && el.tagName !== "INPUT";
}
function getTextBeforeCaret(el) {
  if (isCEElement(el)) return getCETextBeforeCaret(el);
  const input = el;
  if (!input.value) return null;
  const caret = typeof input.selectionEnd === "number" ? input.selectionEnd : input.value.length;
  return input.value.slice(0, caret);
}
function refreshHighlight(ready) {
  if (!currentMatch || !currentTarget) return;
  const rects = getSpanClientRects(
    currentTarget,
    currentMatch.matchStart,
    currentMatch.matchStart + currentMatch.fullMatch.length
  );
  triggerRenderer.update(rects.map((r, i) => ({ rects: [r], lintIndex: i })), ready);
}
async function detect(el) {
  if (!config) return;
  const text = getTextBeforeCaret(el);
  if (!text) {
    clearTriggerState();
    return;
  }
  const match = matchTrigger(
    text,
    isCEElement(el),
    config.enableTranslate,
    config.enableSynonyms,
    config.enableAnalyze
  );
  if (!match) {
    clearTriggerState();
    return;
  }
  if (currentMatch && currentTarget === el && currentMatch.matchStart === match.matchStart && currentMatch.fullMatch === match.fullMatch) return;
  if (currentAbortCtrl) currentAbortCtrl.abort();
  currentAbortCtrl = new AbortController();
  const { signal } = currentAbortCtrl;
  currentTarget = el;
  currentMatch = match;
  readySuggestions = null;
  hideSuggestionPopup();
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
      signal
    );
    if (signal.aborted) return;
    if (!suggestions.length) {
      clearTriggerState();
      return;
    }
    readySuggestions = suggestions;
    refreshHighlight(true);
    hideLoadingPopup();
    showSuggestionPopup(
      anchorRect,
      match,
      suggestions,
      (chosen) => {
        replaceTextSpan(el, match.matchStart, match.matchStart + match.fullMatch.length, chosen);
        clearTriggerState();
      },
      () => clearTriggerState()
    );
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      console.warn("[vibe-typing] Agent error:", err.message);
      clearTriggerState();
    }
  }
}
function onPointerDown(e) {
  if (suggestionPopupContains(e.target)) return;
  if (isSuggestionPopupOpen()) hideSuggestionPopup();
}
function handleEditableInput(e) {
  const el = resolveTarget(e.target);
  if (el) detect(el);
}
function attachListeners() {
  document.addEventListener("input", handleEditableInput, true);
  document.addEventListener("keyup", handleEditableInput, true);
  document.addEventListener("compositionend", handleEditableInput, true);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      clearTriggerState();
    }
  }, true);
  document.addEventListener("pointerdown", (e) => {
    onPointerDown(e);
  }, true);
  window.addEventListener("scroll", () => {
    if (currentMatch && currentTarget) {
      refreshHighlight(readySuggestions !== null);
    }
  }, { passive: true, capture: true });
}
init().catch(console.error);
//# sourceMappingURL=index.ts-cIiVjv5y.js.map
