import type { Config, Request } from '../protocol';
import { DEFAULT_CONFIG } from '../protocol';

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEY_CONFIG = 'config';
const KEY_DEFAULT_ENABLED = 'defaultEnabled';
const DOMAIN_PREFIX = 'domain:';

async function getConfig(): Promise<Config> {
  const r = await chrome.storage.local.get(KEY_CONFIG);
  return { ...DEFAULT_CONFIG, ...(r[KEY_CONFIG] ?? {}) };
}

async function setConfig(patch: Partial<Config>): Promise<void> {
  const current = await getConfig();
  await chrome.storage.local.set({ [KEY_CONFIG]: { ...current, ...patch } });
}

async function getDefaultStatus(): Promise<boolean> {
  const r = await chrome.storage.local.get(KEY_DEFAULT_ENABLED);
  // Default: enabled on all sites
  return r[KEY_DEFAULT_ENABLED] ?? true;
}

async function setDefaultStatus(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [KEY_DEFAULT_ENABLED]: enabled });
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, '');
}

async function getDomainStatus(domain: string): Promise<boolean> {
  const key = DOMAIN_PREFIX + normalizeDomain(domain);
  const r = await chrome.storage.local.get(key);
  // Return per-domain override if present, otherwise fall back to default
  if (key in r) return r[key] as boolean;
  return getDefaultStatus();
}

async function setDomainStatus(domain: string, enabled: boolean): Promise<void> {
  const key = DOMAIN_PREFIX + normalizeDomain(domain);
  await chrome.storage.local.set({ [key]: enabled });
}

async function clearDomainOverride(domain: string): Promise<void> {
  const key = DOMAIN_PREFIX + normalizeDomain(domain);
  await chrome.storage.local.remove(key);
}

async function getEnabledDomains(): Promise<string[]> {
  const all = await chrome.storage.local.get(null);
  const enabled: string[] = [];
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(DOMAIN_PREFIX) && v === true) {
      enabled.push(k.slice(DOMAIN_PREFIX.length));
    }
  }
  return enabled.sort();
}

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request: Request, _sender, sendResponse) => {
  const handle = async () => {
    switch (request.type) {
      case 'getConfig':
        return getConfig();
      case 'setConfig':
        await setConfig(request.config);
        return null;
      case 'getDomainStatus':
        return getDomainStatus(request.domain);
      case 'setDomainStatus':
        await setDomainStatus(request.domain, request.enabled);
        return null;
      case 'getDefaultStatus':
        return getDefaultStatus();
      case 'setDefaultStatus':
        await setDefaultStatus(request.enabled);
        return null;
      case 'getEnabledDomains':
        return getEnabledDomains();
      case 'clearDomainOverride':
        await clearDomainOverride(request.domain);
        return null;
      case 'openOptions':
        await chrome.runtime.openOptionsPage();
        return null;
    }
  };

  // Return true to signal async response
  handle().then(sendResponse).catch(err => {
    console.error('[vibe-typing bg] error:', err);
    sendResponse(null);
  });
  return true;
});

// ─── Install lifecycle ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.set({ installedOn: new Date().toISOString() });
  }
});
