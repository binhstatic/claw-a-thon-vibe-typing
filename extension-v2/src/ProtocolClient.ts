import type { Config } from './protocol';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const msg = (req: object): Promise<any> => chrome.runtime.sendMessage(req);

export const ProtocolClient = {
  getConfig: (): Promise<Config> => msg({ type: 'getConfig' }),
  setConfig: (config: Partial<Config>): Promise<null> => msg({ type: 'setConfig', config }),
  getDomainStatus: (domain: string): Promise<boolean> => msg({ type: 'getDomainStatus', domain }),
  setDomainStatus: (domain: string, enabled: boolean): Promise<null> =>
    msg({ type: 'setDomainStatus', domain, enabled }),
  getDefaultStatus: (): Promise<boolean> => msg({ type: 'getDefaultStatus' }),
  setDefaultStatus: (enabled: boolean): Promise<null> => msg({ type: 'setDefaultStatus', enabled }),
  getEnabledDomains: (): Promise<string[]> => msg({ type: 'getEnabledDomains' }),
  clearDomainOverride: (domain: string): Promise<null> => msg({ type: 'clearDomainOverride', domain }),
  openOptions: (): Promise<null> => msg({ type: 'openOptions' }),
};
