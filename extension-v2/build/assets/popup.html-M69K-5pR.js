import { C as CLASS_CACHE, A as ATTRIBUTES_CACHE, N as NAMESPACE_HTML, y as get_prototype_of, z as get_descriptors, d as delegate, k as push, s as state, p as proxy, o as onMount, h as sibling, m as child, i as if_block, v as each, a as template_effect, b as delegated, e as append, f as pop, j as from_html, q as set, g as get, n as set_text, B as index, D as comment, E as first_child, F as text, w as setupTheme, x as mount } from "./theme-D14rce3a.js";
import { P as ProtocolClient } from "./ProtocolClient-CGKQZBsb.js";
import { D as DEFAULT_CONFIG, M as MASKS, a as MODELS } from "./protocol-BvvgTOsg.js";
const whitespace = [..." 	\n\r\f \v\uFEFF"];
function to_class(value, hash, directives) {
  var classname = value == null ? "" : "" + value;
  if (directives) {
    for (var key of Object.keys(directives)) {
      if (directives[key]) {
        classname = classname ? classname + " " + key : key;
      } else if (classname.length) {
        var len = key.length;
        var a = 0;
        while ((a = classname.indexOf(key, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
  var prev = (
    /** @type {any} */
    dom[CLASS_CACHE]
  );
  if (prev !== value || prev === void 0) {
    var next_class_name = to_class(value, hash, next_classes);
    {
      if (next_class_name == null) {
        dom.removeAttribute("class");
      } else {
        dom.className = next_class_name;
      }
    }
    dom[CLASS_CACHE] = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key in next_classes) {
      var is_present = !!next_classes[key];
      if (prev_classes == null || is_present !== !!prev_classes[key]) {
        dom.classList.toggle(key, is_present);
      }
    }
  }
  return next_classes;
}
const IS_CUSTOM_ELEMENT = Symbol("is custom element");
const IS_HTML = Symbol("is html");
function set_attribute(element, attribute, value, skip_warning) {
  var attributes = get_attributes(element);
  if (attributes[attribute] === (attributes[attribute] = value)) return;
  if (value == null) {
    element.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element).includes(attribute)) {
    element[attribute] = value;
  } else {
    element.setAttribute(attribute, value);
  }
}
function get_attributes(element) {
  var _a;
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    element[_a = ATTRIBUTES_CACHE] ?? (element[_a] = {
      [IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
      [IS_HTML]: element.namespaceURI === NAMESPACE_HTML
    })
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element) {
  var cache_key = element.getAttribute("is") || element.nodeName;
  var setters = setters_cache.get(cache_key);
  if (setters) return setters;
  setters_cache.set(cache_key, setters = []);
  var descriptors;
  var proto = element;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key in descriptors) {
      if (descriptors[key].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      key !== "innerHTML" && key !== "textContent" && key !== "innerText") {
        setters.push(key);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
var root = from_html(`<div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 svelte-c965ga"><div class="min-w-0 svelte-c965ga"><div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-0.5 svelte-c965ga">Trang web này</div> <div class="text-sm font-medium text-gray-700 truncate svelte-c965ga"> </div></div> <button aria-label="Toggle extension on this site"><span></span></button></div>`);
var root_1 = from_html(`<button><span class="text-[18px] leading-none svelte-c965ga"> </span> <span class="text-[10px] font-medium leading-tight svelte-c965ga"> </span></button>`);
var root_2 = from_html(`<p class="mt-1.5 text-[10.5px] text-indigo-600 font-medium text-center svelte-c965ga"> </p>`);
var root_3 = from_html(`<div class="w-[320px] font-sans text-[13px] text-gray-800 bg-white svelte-c965ga"><div class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-[14px] svelte-c965ga"><h1 class="text-base font-bold mb-0.5 svelte-c965ga">🔤 Vibe Typing</h1> <p class="text-[11.5px] opacity-80 svelte-c965ga">Smart translation while you write</p> <div class="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5 text-[11px] svelte-c965ga"><span class="w-1.5 h-1.5 bg-green-400 rounded-full svelte-c965ga" style="animation: blink 2s infinite"></span> Đang hoạt động</div></div> <!> <div class="px-3 py-3 border-b border-gray-100 svelte-c965ga"><div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-2 svelte-c965ga">Phong cách viết</div> <div class="grid grid-cols-3 gap-1.5 svelte-c965ga"></div> <!></div> <div class="px-3 py-3 border-b border-gray-100 svelte-c965ga"><div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-2 svelte-c965ga">Model AI</div> <div class="grid grid-cols-4 gap-1.5 svelte-c965ga"></div> <!></div> <div class="px-4 py-3 border-b border-gray-100 svelte-c965ga"><div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-2.5 svelte-c965ga">Cách sử dụng</div> <div class="flex flex-col gap-2 svelte-c965ga"><div class="flex items-start gap-2.5 svelte-c965ga"><span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center svelte-c965ga">@</span> <span class="text-[12.5px] text-gray-700 leading-snug svelte-c965ga">Gõ <em class="text-violet-700 not-italic font-medium svelte-c965ga">@[tiếng Việt].</em> → gợi ý <em class="text-violet-700 not-italic font-medium svelte-c965ga">tiếng Anh</em></span></div> <div class="flex items-start gap-2.5 svelte-c965ga"><span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center svelte-c965ga">!!</span> <span class="text-[12.5px] text-gray-700 leading-snug svelte-c965ga">Gõ <em class="text-violet-700 not-italic font-medium svelte-c965ga">!![từ EN].</em> → <em class="text-violet-700 not-italic font-medium svelte-c965ga">từ đồng nghĩa</em></span></div> <div class="flex items-start gap-2.5 svelte-c965ga"><span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center svelte-c965ga">#</span> <span class="text-[12.5px] text-gray-700 leading-snug svelte-c965ga">Gõ <em class="text-violet-700 not-italic font-medium svelte-c965ga">#[từ].</em> → <em class="text-violet-700 not-italic font-medium svelte-c965ga">phân tích từ</em></span></div> <div class="flex items-start gap-2.5 svelte-c965ga"><span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center svelte-c965ga">??</span> <span class="text-[12.5px] text-gray-700 leading-snug svelte-c965ga">Gõ <em class="text-violet-700 not-italic font-medium svelte-c965ga">??[câu văn].</em> → <em class="text-violet-700 not-italic font-medium svelte-c965ga">kiểm tra ngữ pháp</em></span></div></div></div> <div class="px-4 py-2.5 text-[11.5px] text-gray-500 bg-gray-50 border-b border-gray-100 leading-relaxed svelte-c965ga"><strong class="text-gray-700 svelte-c965ga">Ví dụ:</strong> Gõ <code class="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[11px] svelte-c965ga">@dẫn đến tâm lý hoang mang.</code> → dropdown xuất hiện ngay tại con trỏ. <br class="mt-1 svelte-c965ga"/>Dùng <strong class="text-gray-700 svelte-c965ga">dấu chấm (.)</strong> để kết thúc.</div> <div class="px-4 py-2 text-[11px] text-gray-400 bg-gray-50 text-center svelte-c965ga">Powered by <strong class="text-gray-600 svelte-c965ga">OpenClaw</strong> <div class="inline-flex items-center gap-1.5 mt-1 svelte-c965ga"><span></span> <span class="svelte-c965ga"><!></span></div> <br class="svelte-c965ga"/> <button class="mt-1 text-indigo-500 hover:text-indigo-700 underline cursor-pointer svelte-c965ga">⚙ Cài đặt</button></div></div>`);
function Popup($$anchor, $$props) {
  push($$props, true);
  let domain = state("");
  let enabled = state(true);
  let agentStatus = state("checking");
  let selectedMask = state("academic");
  let selectedModel = state(proxy(DEFAULT_CONFIG.model));
  async function getCurrentDomain() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!(tab == null ? void 0 : tab.url)) return "";
    try {
      return new URL(tab.url).hostname;
    } catch {
      return "";
    }
  }
  async function checkHealth(url) {
    set(agentStatus, "checking");
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4e3) });
      set(agentStatus, res.ok ? "online" : "offline", true);
    } catch {
      set(agentStatus, "offline");
    }
  }
  async function toggleDomain() {
    set(enabled, !get(enabled));
    await ProtocolClient.setDomainStatus(get(domain), get(enabled));
  }
  async function selectMask(id) {
    set(selectedMask, id, true);
    await ProtocolClient.setConfig({ mask: id });
  }
  async function selectModel(id) {
    set(selectedModel, id, true);
    await ProtocolClient.setConfig({ model: id });
  }
  function openOptions() {
    ProtocolClient.openOptions();
    window.close();
  }
  onMount(async () => {
    set(domain, await getCurrentDomain(), true);
    const [cfg, status] = await Promise.all([
      ProtocolClient.getConfig(),
      ProtocolClient.getDomainStatus(get(domain))
    ]);
    set(enabled, status, true);
    set(selectedMask, cfg.mask ?? "academic", true);
    set(selectedModel, cfg.model ?? DEFAULT_CONFIG.model, true);
    checkHealth(cfg.agentBaseUrl);
  });
  var div = root_3();
  var node = sibling(child(div), 2);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root();
      var div_2 = child(div_1);
      var div_3 = sibling(child(div_2), 2);
      var text2 = child(div_3);
      var button = sibling(div_2, 2);
      let classes;
      var span = child(button);
      let classes_1;
      template_effect(() => {
        set_text(text2, get(domain));
        classes = set_class(button, 1, "shrink-0 relative inline-flex items-center w-10 h-5 rounded-full transition-colors cursor-pointer focus:outline-none svelte-c965ga", null, classes, {
          "bg-indigo-600": get(enabled),
          "bg-gray-300": !get(enabled)
        });
        classes_1 = set_class(span, 1, "absolute w-4 h-4 bg-white rounded-full shadow transition-transform svelte-c965ga", null, classes_1, {
          "translate-x-5": get(enabled),
          "translate-x-0.5": !get(enabled)
        });
      });
      delegated("click", button, toggleDomain);
      append($$anchor2, div_1);
    };
    if_block(node, ($$render) => {
      if (get(domain)) $$render(consequent);
    });
  }
  var div_4 = sibling(node, 2);
  var div_5 = sibling(child(div_4), 2);
  each(div_5, 21, () => MASKS, index, ($$anchor2, mask) => {
    var button_1 = root_1();
    let classes_2;
    var span_1 = child(button_1);
    var text_1 = child(span_1);
    var span_2 = sibling(span_1, 2);
    var text_2 = child(span_2);
    template_effect(() => {
      set_attribute(button_1, "title", get(mask).description);
      classes_2 = set_class(button_1, 1, "mask-btn flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all cursor-pointer svelte-c965ga", null, classes_2, {
        "mask-active": get(selectedMask) === get(mask).id,
        "mask-inactive": get(selectedMask) !== get(mask).id
      });
      set_text(text_1, get(mask).icon);
      set_text(text_2, get(mask).label);
    });
    delegated("click", button_1, () => selectMask(get(mask).id));
    append($$anchor2, button_1);
  });
  var node_1 = sibling(div_5, 2);
  each(node_1, 17, () => MASKS, index, ($$anchor2, mask) => {
    var fragment = comment();
    var node_2 = first_child(fragment);
    {
      var consequent_1 = ($$anchor3) => {
        var p = root_2();
        var text_3 = child(p);
        template_effect(() => set_text(text_3, get(mask).description));
        append($$anchor3, p);
      };
      if_block(node_2, ($$render) => {
        if (get(selectedMask) === get(mask).id) $$render(consequent_1);
      });
    }
    append($$anchor2, fragment);
  });
  var div_6 = sibling(div_4, 2);
  var div_7 = sibling(child(div_6), 2);
  each(div_7, 21, () => MODELS, index, ($$anchor2, model) => {
    var button_2 = root_1();
    let classes_3;
    var span_3 = child(button_2);
    var text_4 = child(span_3);
    var span_4 = sibling(span_3, 2);
    var text_5 = child(span_4);
    template_effect(() => {
      set_attribute(button_2, "title", get(model).description);
      classes_3 = set_class(button_2, 1, "mask-btn flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all cursor-pointer svelte-c965ga", null, classes_3, {
        "mask-active": get(selectedModel) === get(model).id,
        "mask-inactive": get(selectedModel) !== get(model).id
      });
      set_text(text_4, get(model).icon);
      set_text(text_5, get(model).label);
    });
    delegated("click", button_2, () => selectModel(get(model).id));
    append($$anchor2, button_2);
  });
  var node_3 = sibling(div_7, 2);
  each(node_3, 17, () => MODELS, index, ($$anchor2, model) => {
    var fragment_1 = comment();
    var node_4 = first_child(fragment_1);
    {
      var consequent_2 = ($$anchor3) => {
        var p_1 = root_2();
        var text_6 = child(p_1);
        template_effect(() => set_text(text_6, get(model).description));
        append($$anchor3, p_1);
      };
      if_block(node_4, ($$render) => {
        if (get(selectedModel) === get(model).id) $$render(consequent_2);
      });
    }
    append($$anchor2, fragment_1);
  });
  var div_8 = sibling(div_6, 6);
  var div_9 = sibling(child(div_8), 3);
  var span_5 = child(div_9);
  let classes_4;
  var span_6 = sibling(span_5, 2);
  var node_5 = child(span_6);
  {
    var consequent_3 = ($$anchor2) => {
      var text_7 = text("Đang kiểm tra server...");
      append($$anchor2, text_7);
    };
    var consequent_4 = ($$anchor2) => {
      var text_8 = text("Agent server: online");
      append($$anchor2, text_8);
    };
    var alternate = ($$anchor2) => {
      var text_9 = text("Agent server: offline");
      append($$anchor2, text_9);
    };
    if_block(node_5, ($$render) => {
      if (get(agentStatus) === "checking") $$render(consequent_3);
      else if (get(agentStatus) === "online") $$render(consequent_4, 1);
      else $$render(alternate, -1);
    });
  }
  var button_3 = sibling(div_9, 4);
  template_effect(() => classes_4 = set_class(span_5, 1, "w-1.5 h-1.5 rounded-full svelte-c965ga", null, classes_4, {
    "bg-green-400": get(agentStatus) === "online",
    "bg-red-400": get(agentStatus) === "offline",
    "bg-gray-300": get(agentStatus) === "checking"
  }));
  delegated("click", button_3, openOptions);
  append($$anchor, div);
  pop();
}
delegate(["click"]);
setupTheme();
mount(Popup, { target: document.getElementById("app") });
//# sourceMappingURL=popup.html-M69K-5pR.js.map
