import { D as DEFAULT_CONFIG } from "./protocol-D7dFRlSf.js";
const KEY_CONFIG = "config";
const KEY_DEFAULT_ENABLED = "defaultEnabled";
const DOMAIN_PREFIX = "domain:";
async function getConfig() {
  const r = await chrome.storage.local.get(KEY_CONFIG);
  return { ...DEFAULT_CONFIG, ...r[KEY_CONFIG] ?? {} };
}
async function setConfig(patch) {
  const current = await getConfig();
  await chrome.storage.local.set({ [KEY_CONFIG]: { ...current, ...patch } });
}
async function getDefaultStatus() {
  const r = await chrome.storage.local.get(KEY_DEFAULT_ENABLED);
  return r[KEY_DEFAULT_ENABLED] ?? true;
}
async function setDefaultStatus(enabled) {
  await chrome.storage.local.set({ [KEY_DEFAULT_ENABLED]: enabled });
}
function normalizeDomain(domain) {
  return domain.replace(/^www\./, "");
}
async function getDomainStatus(domain) {
  const key = DOMAIN_PREFIX + normalizeDomain(domain);
  const r = await chrome.storage.local.get(key);
  if (key in r) return r[key];
  return getDefaultStatus();
}
async function setDomainStatus(domain, enabled) {
  const key = DOMAIN_PREFIX + normalizeDomain(domain);
  await chrome.storage.local.set({ [key]: enabled });
}
async function clearDomainOverride(domain) {
  const key = DOMAIN_PREFIX + normalizeDomain(domain);
  await chrome.storage.local.remove(key);
}
async function getEnabledDomains() {
  const all = await chrome.storage.local.get(null);
  const enabled = [];
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(DOMAIN_PREFIX) && v === true) {
      enabled.push(k.slice(DOMAIN_PREFIX.length));
    }
  }
  return enabled.sort();
}
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const handle = async () => {
    switch (request.type) {
      case "getConfig":
        return getConfig();
      case "setConfig":
        await setConfig(request.config);
        return null;
      case "getDomainStatus":
        return getDomainStatus(request.domain);
      case "setDomainStatus":
        await setDomainStatus(request.domain, request.enabled);
        return null;
      case "getDefaultStatus":
        return getDefaultStatus();
      case "setDefaultStatus":
        await setDefaultStatus(request.enabled);
        return null;
      case "getEnabledDomains":
        return getEnabledDomains();
      case "clearDomainOverride":
        await clearDomainOverride(request.domain);
        return null;
      case "openOptions":
        await chrome.runtime.openOptionsPage();
        return null;
    }
  };
  handle().then(sendResponse).catch((err) => {
    console.error("[vibe-typing bg] error:", err);
    sendResponse(null);
  });
  return true;
});
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.set({ installedOn: (/* @__PURE__ */ new Date()).toISOString() });
  }
});
//# sourceMappingURL=index.ts-DK3hpe4z.js.map
