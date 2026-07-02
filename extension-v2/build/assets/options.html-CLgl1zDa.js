import { l as listen_to_event_and_reset_event, c as current_batch, t as tick, u as untrack, r as render_effect, d as delegate, s as state, p as proxy, o as onMount, i as if_block, a as template_effect, g as get, b as delegated, e as append, f as pop, h as sibling, j as from_html, k as push, m as child, n as set_text, q as set, v as each, w as setupTheme, x as mount } from "./theme-D14rce3a.js";
import { P as ProtocolClient } from "./ProtocolClient-CGKQZBsb.js";
function bind_value(input, get2, set2 = get2) {
  var batches = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(input, "input", async (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (current_batch !== null) {
      batches.add(current_batch);
    }
    await tick();
    if (value !== (value = get2())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      var length = input.value.length;
      input.value = value ?? "";
      if (end !== null) {
        var new_length = input.value.length;
        if (start === end && end === length && new_length > length) {
          input.selectionStart = new_length;
          input.selectionEnd = new_length;
        } else {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, new_length);
        }
      }
    }
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the updated value from the input instead.
    // If defaultValue is set, then value == defaultValue
    // TODO Svelte 6: remove input.value check and set to empty string?
    untrack(get2) == null && input.value
  ) {
    set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
    if (current_batch !== null) {
      batches.add(current_batch);
    }
  }
  render_effect(() => {
    var value = get2();
    if (input === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      if (batches.has(batch)) {
        return;
      }
    }
    if (is_numberlike_input(input) && value === to_number(input.value)) {
      return;
    }
    if (input.type === "date" && !value && !input.value) {
      return;
    }
    if (value !== input.value) {
      input.value = value ?? "";
    }
  });
}
function bind_checked(input, get2, set2 = get2) {
  listen_to_event_and_reset_event(input, "change", (is_reset) => {
    var value = is_reset ? input.defaultChecked : input.checked;
    set2(value);
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the update value from the input instead.
    // If defaultChecked is set, then checked == defaultChecked
    untrack(get2) == null
  ) {
    set2(input.checked);
  }
  render_effect(() => {
    var value = get2();
    input.checked = Boolean(value);
  });
}
function is_numberlike_input(input) {
  var type = input.type;
  return type === "number" || type === "range";
}
function to_number(value) {
  return value === "" ? null : +value;
}
var root = from_html(`<span class="text-green-600 text-xs font-semibold">✓ Kết nối thành công</span>`);
var root_1 = from_html(`<span class="text-red-500 text-xs font-semibold">✗ Không kết nối được</span>`);
var root_2 = from_html(`<li class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"><span class="font-mono text-xs text-gray-700"> </span> <button class="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none cursor-pointer" title="Xóa override">✕</button></li>`);
var root_3 = from_html(`<section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4"> </h2> <ul class="flex flex-col gap-1.5"></ul></section>`);
var root_4 = from_html(`<span class="text-green-600 text-sm font-medium">✓ Đã lưu</span>`);
var root_5 = from_html(`<div class="min-h-screen bg-gray-50 font-sans text-[13px] text-gray-800 p-6"><div class="max-w-2xl mx-auto"><div class="mb-6"><h1 class="text-xl font-bold text-gray-900">🔤 Vibe Typing — Cài đặt</h1> <p class="text-sm text-gray-500 mt-0.5">Cấu hình AI translation extension</p></div> <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Agent API</h2> <div class="mb-3"><label class="block text-xs font-medium text-gray-600 mb-1" for="api-url">API Base URL</label> <input id="api-url" type="url" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" placeholder="https://..."/></div> <div class="flex items-center gap-3"><button class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"> </button> <!></div></section> <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Triggers</h2> <div class="flex flex-col gap-4"><label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">@</span> <div><div class="font-medium text-gray-700">Translate</div> <div class="text-xs text-gray-400">@[tiếng Việt]. → gợi ý tiếng Anh theo ngữ cảnh</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label> <label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">!!</span> <div><div class="font-medium text-gray-700">Synonyms</div> <div class="text-xs text-gray-400">!![từ EN]. → từ đồng nghĩa</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label> <label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">#</span> <div><div class="font-medium text-gray-700">Analyze</div> <div class="text-xs text-gray-400">#[từ vựng]. → phân tích chi tiết</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label> <label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">??</span> <div><div class="font-medium text-gray-700">Lint</div> <div class="text-xs text-gray-400">??[câu văn]. → kiểm tra ngữ pháp & chính tả</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label></div></section> <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Mặc định</h2> <label class="flex items-center justify-between cursor-pointer"><div><div class="font-medium text-gray-700">Bật trên tất cả trang</div> <div class="text-xs text-gray-400 mt-0.5">Khi tắt, chỉ hoạt động trên trang được bật thủ công qua popup</div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label></section> <!> <div class="flex items-center justify-end gap-3"><!> <button class="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"> </button></div></div></div>`);
function Options($$anchor, $$props) {
  push($$props, true);
  let agentBaseUrl = state("");
  let enableTranslate = state(true);
  let enableSynonyms = state(true);
  let enableAnalyze = state(true);
  let enableLint = state(true);
  let defaultEnabled = state(true);
  let domains = state(proxy([]));
  let testStatus = state("idle");
  let saveStatus = state("idle");
  async function load() {
    const [cfg, def, doms] = await Promise.all([
      ProtocolClient.getConfig(),
      ProtocolClient.getDefaultStatus(),
      ProtocolClient.getEnabledDomains()
    ]);
    set(agentBaseUrl, cfg.agentBaseUrl, true);
    set(enableTranslate, cfg.enableTranslate, true);
    set(enableSynonyms, cfg.enableSynonyms, true);
    set(enableAnalyze, cfg.enableAnalyze, true);
    set(enableLint, cfg.enableLint, true);
    set(defaultEnabled, def, true);
    set(domains, doms, true);
  }
  async function save() {
    set(saveStatus, "saving");
    const cfg = {
      agentBaseUrl: get(agentBaseUrl),
      enableTranslate: get(enableTranslate),
      enableSynonyms: get(enableSynonyms),
      enableAnalyze: get(enableAnalyze),
      enableLint: get(enableLint)
    };
    await Promise.all([
      ProtocolClient.setConfig(cfg),
      ProtocolClient.setDefaultStatus(get(defaultEnabled))
    ]);
    set(saveStatus, "saved");
    setTimeout(() => set(saveStatus, "idle"), 2e3);
  }
  async function testConnection() {
    set(testStatus, "checking");
    try {
      const res = await fetch(`${get(agentBaseUrl)}/health`, { signal: AbortSignal.timeout(5e3) });
      set(testStatus, res.ok ? "ok" : "fail", true);
    } catch {
      set(testStatus, "fail");
    }
    setTimeout(() => set(testStatus, "idle"), 3e3);
  }
  async function removeDomain(domain) {
    await ProtocolClient.clearDomainOverride(domain);
    set(domains, get(domains).filter((d) => d !== domain), true);
  }
  onMount(load);
  var div = root_5();
  var div_1 = child(div);
  var section = sibling(child(div_1), 2);
  var div_2 = sibling(child(section), 2);
  var input = sibling(child(div_2), 2);
  var div_3 = sibling(div_2, 2);
  var button = child(div_3);
  var text = child(button);
  var node = sibling(button, 2);
  {
    var consequent = ($$anchor2) => {
      var span = root();
      append($$anchor2, span);
    };
    var consequent_1 = ($$anchor2) => {
      var span_1 = root_1();
      append($$anchor2, span_1);
    };
    if_block(node, ($$render) => {
      if (get(testStatus) === "ok") $$render(consequent);
      else if (get(testStatus) === "fail") $$render(consequent_1, 1);
    });
  }
  var section_1 = sibling(section, 2);
  var div_4 = sibling(child(section_1), 2);
  var label = child(div_4);
  var input_1 = sibling(child(label), 2);
  var label_1 = sibling(label, 2);
  var input_2 = sibling(child(label_1), 2);
  var label_2 = sibling(label_1, 2);
  var input_3 = sibling(child(label_2), 2);
  var label_3 = sibling(label_2, 2);
  var input_4 = sibling(child(label_3), 2);
  var section_2 = sibling(section_1, 2);
  var label_4 = sibling(child(section_2), 2);
  var input_5 = sibling(child(label_4), 2);
  var node_1 = sibling(section_2, 2);
  {
    var consequent_2 = ($$anchor2) => {
      var section_3 = root_3();
      var h2 = child(section_3);
      var text_1 = child(h2);
      var ul = sibling(h2, 2);
      each(ul, 20, () => get(domains), (domain) => domain, ($$anchor3, domain) => {
        var li = root_2();
        var span_2 = child(li);
        var text_2 = child(span_2);
        var button_1 = sibling(span_2, 2);
        template_effect(() => set_text(text_2, domain));
        delegated("click", button_1, () => removeDomain(domain));
        append($$anchor3, li);
      });
      template_effect(() => set_text(text_1, `Trang đã bật riêng (${get(domains).length ?? ""})`));
      append($$anchor2, section_3);
    };
    if_block(node_1, ($$render) => {
      if (get(domains).length > 0) $$render(consequent_2);
    });
  }
  var div_5 = sibling(node_1, 2);
  var node_2 = child(div_5);
  {
    var consequent_3 = ($$anchor2) => {
      var span_3 = root_4();
      append($$anchor2, span_3);
    };
    if_block(node_2, ($$render) => {
      if (get(saveStatus) === "saved") $$render(consequent_3);
    });
  }
  var button_2 = sibling(node_2, 2);
  var text_3 = child(button_2);
  template_effect(() => {
    button.disabled = get(testStatus) === "checking";
    set_text(text, get(testStatus) === "checking" ? "Đang kiểm tra..." : "Kiểm tra kết nối");
    button_2.disabled = get(saveStatus) === "saving";
    set_text(text_3, get(saveStatus) === "saving" ? "Đang lưu..." : "Lưu cài đặt");
  });
  bind_value(input, () => get(agentBaseUrl), ($$value) => set(agentBaseUrl, $$value));
  delegated("click", button, testConnection);
  bind_checked(input_1, () => get(enableTranslate), ($$value) => set(enableTranslate, $$value));
  bind_checked(input_2, () => get(enableSynonyms), ($$value) => set(enableSynonyms, $$value));
  bind_checked(input_3, () => get(enableAnalyze), ($$value) => set(enableAnalyze, $$value));
  bind_checked(input_4, () => get(enableLint), ($$value) => set(enableLint, $$value));
  bind_checked(input_5, () => get(defaultEnabled), ($$value) => set(defaultEnabled, $$value));
  delegated("click", button_2, save);
  append($$anchor, div);
  pop();
}
delegate(["click"]);
setupTheme();
mount(Options, { target: document.getElementById("app") });
//# sourceMappingURL=options.html-CLgl1zDa.js.map
