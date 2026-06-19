import { c as create_text, b as block, g as get, i as internal_set, a as current_batch, d as branch, e as each_key_duplicate, s as should_defer_append, f as derived_safe_equal, E as EACH_INDEX_REACTIVE, h as source, j as EACH_ITEM_REACTIVE, k as EACH_ITEM_IMMUTABLE, m as mutable_source, l as is_array, n as array_from, o as EFFECT_OFFSCREEN, D as DESTROYED, r as resume_effect, p as pause_effect, I as INERT, B as BRANCH_EFFECT, q as clear_text_content, t as move_effect, u as destroy_effect, v as get_next_sibling, w as listen_to_event_and_reset_event, x as tick, y as untrack, z as render_effect, A as delegate, C as state, F as proxy, G as onMount, H as if_block, J as template_effect, K as delegated, L as append, M as pop, N as sibling, O as from_html, P as push, Q as child, R as set_text, S as set, T as setupTheme, U as mount } from "./theme-DkLCqHxA.js";
import { P as ProtocolClient } from "./ProtocolClient-CGKQZBsb.js";
function pause_effects(state2, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  var group;
  var remaining = to_destroy.length;
  for (var i = 0; i < length; i++) {
    let effect = to_destroy[i];
    pause_effect(
      effect,
      () => {
        if (group) {
          group.pending.delete(effect);
          group.done.add(effect);
          if (group.pending.size === 0) {
            var groups = (
              /** @type {Set<EachOutroGroup>} */
              state2.outrogroups
            );
            destroy_effects(state2, array_from(group.done));
            groups.delete(group);
            if (groups.size === 0) {
              state2.outrogroups = null;
            }
          }
        } else {
          remaining -= 1;
        }
      },
      false
    );
  }
  if (remaining === 0) {
    var fast_path = transitions.length === 0 && controlled_anchor !== null;
    if (fast_path) {
      var anchor = (
        /** @type {Element} */
        controlled_anchor
      );
      var parent_node = (
        /** @type {Element} */
        anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(anchor);
      state2.items.clear();
    }
    destroy_effects(state2, to_destroy, !fast_path);
  } else {
    group = {
      pending: new Set(to_destroy),
      done: /* @__PURE__ */ new Set()
    };
    (state2.outrogroups ?? (state2.outrogroups = /* @__PURE__ */ new Set())).add(group);
  }
}
function destroy_effects(state2, to_destroy, remove_dom = true) {
  var preserved_effects;
  if (state2.pending.size > 0) {
    preserved_effects = /* @__PURE__ */ new Set();
    for (const keys of state2.pending.values()) {
      for (const key of keys) {
        preserved_effects.add(
          /** @type {EachItem} */
          state2.items.get(key).e
        );
      }
    }
  }
  for (var i = 0; i < to_destroy.length; i++) {
    var e = to_destroy[i];
    if (preserved_effects == null ? void 0 : preserved_effects.has(e)) {
      e.f |= EFFECT_OFFSCREEN;
      const fragment = document.createDocumentFragment();
      move_effect(e, fragment);
    } else {
      destroy_effect(to_destroy[i], remove_dom);
    }
  }
}
var offscreen_anchor;
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var items = /* @__PURE__ */ new Map();
  {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = parent_node.appendChild(create_text());
  }
  var fallback = null;
  var each_array = derived_safe_equal(() => {
    var collection = get_collection();
    return (
      /** @type {V[]} */
      is_array(collection) ? collection : collection == null ? [] : array_from(collection)
    );
  });
  var array;
  var pending = /* @__PURE__ */ new Map();
  var first_run = true;
  function commit(batch) {
    if ((state2.effect.f & DESTROYED) !== 0) {
      return;
    }
    state2.pending.delete(batch);
    state2.fallback = fallback;
    reconcile(state2, array, anchor, flags, get_key);
    if (fallback !== null) {
      if (array.length === 0) {
        if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
          resume_effect(fallback);
        } else {
          fallback.f ^= EFFECT_OFFSCREEN;
          move(fallback, null, anchor);
        }
      } else {
        pause_effect(fallback, () => {
          fallback = null;
        });
      }
    }
  }
  function discard(batch) {
    state2.pending.delete(batch);
  }
  var effect = block(() => {
    array = /** @type {V[]} */
    get(each_array);
    var length = array.length;
    var keys = /* @__PURE__ */ new Set();
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    for (var index = 0; index < length; index += 1) {
      var value = array[index];
      var key = get_key(value, index);
      var item = first_run ? null : items.get(key);
      if (item) {
        if (item.v) internal_set(item.v, value);
        if (item.i) internal_set(item.i, index);
        if (defer) {
          batch.unskip_effect(item.e);
        }
      } else {
        item = create_item(
          items,
          first_run ? anchor : offscreen_anchor ?? (offscreen_anchor = create_text()),
          value,
          key,
          index,
          render_fn,
          flags,
          get_collection
        );
        if (!first_run) {
          item.e.f |= EFFECT_OFFSCREEN;
        }
        items.set(key, item);
      }
      keys.add(key);
    }
    if (length === 0 && fallback_fn && !fallback) {
      if (first_run) {
        fallback = branch(() => fallback_fn(anchor));
      } else {
        fallback = branch(() => fallback_fn(offscreen_anchor ?? (offscreen_anchor = create_text())));
        fallback.f |= EFFECT_OFFSCREEN;
      }
    }
    if (length > keys.size) {
      {
        each_key_duplicate();
      }
    }
    if (!first_run) {
      pending.set(batch, keys);
      if (defer) {
        for (const [key2, item2] of items) {
          if (!keys.has(key2)) {
            batch.skip_effect(item2.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(discard);
      } else {
        commit(batch);
      }
    }
    get(each_array);
  });
  var state2 = { effect, items, pending, outrogroups: null, fallback };
  first_run = false;
}
function skip_to_branch(effect) {
  while (effect !== null && (effect.f & BRANCH_EFFECT) === 0) {
    effect = effect.next;
  }
  return effect;
}
function reconcile(state2, array, anchor, flags, get_key) {
  var _a;
  var length = array.length;
  var items = state2.items;
  var current = skip_to_branch(state2.effect.first);
  var seen;
  var prev = null;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var effect;
  var i;
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    effect = /** @type {EachItem} */
    items.get(key).e;
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        group.pending.delete(effect);
        group.done.delete(effect);
      }
    }
    if ((effect.f & INERT) !== 0) {
      resume_effect(effect);
    }
    if ((effect.f & EFFECT_OFFSCREEN) !== 0) {
      effect.f ^= EFFECT_OFFSCREEN;
      if (effect === current) {
        move(effect, null, anchor);
      } else {
        var next = prev ? prev.next : current;
        if (effect === state2.effect.last) {
          state2.effect.last = effect.prev;
        }
        if (effect.prev) effect.prev.next = effect.next;
        if (effect.next) effect.next.prev = effect.prev;
        link(state2, prev, effect);
        link(state2, effect, next);
        move(effect, next, anchor);
        prev = effect;
        matched = [];
        stashed = [];
        current = skip_to_branch(prev.next);
        continue;
      }
    }
    if (effect !== current) {
      if (seen !== void 0 && seen.has(effect)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(effect);
          move(effect, current, anchor);
          link(state2, effect.prev, effect.next);
          link(state2, effect, prev === null ? state2.effect.first : prev.next);
          link(state2, prev, effect);
          prev = effect;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== effect) {
        (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
        stashed.push(current);
        current = skip_to_branch(current.next);
      }
      if (current === null) {
        continue;
      }
    }
    if ((effect.f & EFFECT_OFFSCREEN) === 0) {
      matched.push(effect);
    }
    prev = effect;
    current = skip_to_branch(effect.next);
  }
  if (state2.outrogroups !== null) {
    for (const group of state2.outrogroups) {
      if (group.pending.size === 0) {
        destroy_effects(state2, array_from(group.done));
        (_a = state2.outrogroups) == null ? void 0 : _a.delete(group);
      }
    }
    if (state2.outrogroups.size === 0) {
      state2.outrogroups = null;
    }
  }
  if (current !== null || seen !== void 0) {
    var to_destroy = [];
    if (seen !== void 0) {
      for (effect of seen) {
        if ((effect.f & INERT) === 0) {
          to_destroy.push(effect);
        }
      }
    }
    while (current !== null) {
      if ((current.f & INERT) === 0 && current !== state2.fallback) {
        to_destroy.push(current);
      }
      current = skip_to_branch(current.next);
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = length === 0 ? anchor : null;
      pause_effects(state2, to_destroy, controlled_anchor);
    }
  }
}
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
  var v = (flags & EACH_ITEM_REACTIVE) !== 0 ? (flags & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
  var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index) : null;
  return {
    v,
    i,
    e: branch(() => {
      render_fn(anchor, v ?? value, i ?? index, get_collection);
      return () => {
        items.delete(key);
      };
    })
  };
}
function move(effect, next, anchor) {
  if (!effect.nodes) return;
  var node = effect.nodes.start;
  var end = effect.nodes.end;
  var dest = next && (next.f & EFFECT_OFFSCREEN) === 0 ? (
    /** @type {EffectNodes} */
    next.nodes.start
  ) : anchor;
  while (node !== null) {
    var next_node = (
      /** @type {TemplateNode} */
      get_next_sibling(node)
    );
    dest.before(node);
    if (node === end) {
      return;
    }
    node = next_node;
  }
}
function link(state2, prev, next) {
  if (prev === null) {
    state2.effect.first = next;
  } else {
    prev.next = next;
  }
  if (next === null) {
    state2.effect.last = prev;
  } else {
    next.prev = prev;
  }
}
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
var root_5 = from_html(`<div class="min-h-screen bg-gray-50 font-sans text-[13px] text-gray-800 p-6"><div class="max-w-2xl mx-auto"><div class="mb-6"><h1 class="text-xl font-bold text-gray-900">🔤 Vibe Typing — Cài đặt</h1> <p class="text-sm text-gray-500 mt-0.5">Cấu hình AI translation extension</p></div> <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Agent API</h2> <div class="mb-3"><label class="block text-xs font-medium text-gray-600 mb-1" for="api-url">API Base URL</label> <input id="api-url" type="url" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" placeholder="https://..."/></div> <div class="flex items-center gap-3"><button class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"> </button> <!></div></section> <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Triggers</h2> <div class="flex flex-col gap-4"><label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">@</span> <div><div class="font-medium text-gray-700">Translate</div> <div class="text-xs text-gray-400">@[tiếng Việt]. → gợi ý tiếng Anh theo ngữ cảnh</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label> <label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">!!</span> <div><div class="font-medium text-gray-700">Synonyms</div> <div class="text-xs text-gray-400">!![từ EN]. → từ đồng nghĩa</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label> <label class="flex items-center justify-between cursor-pointer"><div class="flex items-center gap-3"><span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">#</span> <div><div class="font-medium text-gray-700">Analyze</div> <div class="text-xs text-gray-400">#[từ vựng]. → phân tích chi tiết</div></div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label></div></section> <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm"><h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Mặc định</h2> <label class="flex items-center justify-between cursor-pointer"><div><div class="font-medium text-gray-700">Bật trên tất cả trang</div> <div class="text-xs text-gray-400 mt-0.5">Khi tắt, chỉ hoạt động trên trang được bật thủ công qua popup</div></div> <input type="checkbox" class="w-4 h-4 accent-indigo-600 cursor-pointer"/></label></section> <!> <div class="flex items-center justify-end gap-3"><!> <button class="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"> </button></div></div></div>`);
function Options($$anchor, $$props) {
  push($$props, true);
  let agentBaseUrl = state("");
  let enableTranslate = state(true);
  let enableSynonyms = state(true);
  let enableAnalyze = state(true);
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
    set(defaultEnabled, def, true);
    set(domains, doms, true);
  }
  async function save() {
    set(saveStatus, "saving");
    const cfg = {
      agentBaseUrl: get(agentBaseUrl),
      enableTranslate: get(enableTranslate),
      enableSynonyms: get(enableSynonyms),
      enableAnalyze: get(enableAnalyze)
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
  var section_2 = sibling(section_1, 2);
  var label_3 = sibling(child(section_2), 2);
  var input_4 = sibling(child(label_3), 2);
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
  bind_checked(input_4, () => get(defaultEnabled), ($$value) => set(defaultEnabled, $$value));
  delegated("click", button_2, save);
  append($$anchor, div);
  pop();
}
delegate(["click"]);
setupTheme();
mount(Options, { target: document.getElementById("app") });
//# sourceMappingURL=options.html-BrNw1GOj.js.map
