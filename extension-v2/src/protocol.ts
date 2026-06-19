export interface Config {
  agentBaseUrl: string;
  enableTranslate: boolean;
  enableSynonyms: boolean;
  enableAnalyze: boolean;
}

export const DEFAULT_CONFIG: Config = {
  agentBaseUrl:
    'https://endpoint-f0b1c066-9a31-44c0-b18a-866205de4ee2.agentbase-runtime.aiplatform.vngcloud.vn',
  enableTranslate: true,
  enableSynonyms: true,
  enableAnalyze: true,
};

export type Request =
  | { type: 'getConfig' }
  | { type: 'setConfig'; config: Partial<Config> }
  | { type: 'getDomainStatus'; domain: string }
  | { type: 'setDomainStatus'; domain: string; enabled: boolean }
  | { type: 'getDefaultStatus' }
  | { type: 'setDefaultStatus'; enabled: boolean }
  | { type: 'getEnabledDomains' }
  | { type: 'clearDomainOverride'; domain: string }
  | { type: 'openOptions' };
