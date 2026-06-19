const msg = (req) => chrome.runtime.sendMessage(req);
const ProtocolClient = {
  getConfig: () => msg({ type: "getConfig" }),
  setConfig: (config) => msg({ type: "setConfig", config }),
  getDomainStatus: (domain) => msg({ type: "getDomainStatus", domain }),
  setDomainStatus: (domain, enabled) => msg({ type: "setDomainStatus", domain, enabled }),
  getDefaultStatus: () => msg({ type: "getDefaultStatus" }),
  setDefaultStatus: (enabled) => msg({ type: "setDefaultStatus", enabled }),
  getEnabledDomains: () => msg({ type: "getEnabledDomains" }),
  clearDomainOverride: (domain) => msg({ type: "clearDomainOverride", domain }),
  openOptions: () => msg({ type: "openOptions" })
};
export {
  ProtocolClient as P
};
//# sourceMappingURL=ProtocolClient-CGKQZBsb.js.map
