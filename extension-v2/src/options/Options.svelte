<script lang="ts">
  import { onMount } from 'svelte';
  import { ProtocolClient } from '../ProtocolClient';
  import type { Config } from '../protocol';

  let agentBaseUrl = $state('');
  let enableTranslate = $state(true);
  let enableSynonyms = $state(true);
  let enableAnalyze = $state(true);
  let enableLint = $state(true);
  let defaultEnabled = $state(true);
  let domains = $state<string[]>([]);

  let testStatus = $state<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');

  async function load(): Promise<void> {
    const [cfg, def, doms] = await Promise.all([
      ProtocolClient.getConfig(),
      ProtocolClient.getDefaultStatus(),
      ProtocolClient.getEnabledDomains(),
    ]);
    agentBaseUrl = cfg.agentBaseUrl;
    enableTranslate = cfg.enableTranslate;
    enableSynonyms = cfg.enableSynonyms;
    enableAnalyze = cfg.enableAnalyze;
    enableLint = cfg.enableLint;
    defaultEnabled = def;
    domains = doms;
  }

  async function save(): Promise<void> {
    saveStatus = 'saving';
    const cfg: Partial<Config> = {
      agentBaseUrl,
      enableTranslate,
      enableSynonyms,
      enableAnalyze,
      enableLint,
    };
    await Promise.all([
      ProtocolClient.setConfig(cfg),
      ProtocolClient.setDefaultStatus(defaultEnabled),
    ]);
    saveStatus = 'saved';
    setTimeout(() => (saveStatus = 'idle'), 2000);
  }

  async function testConnection(): Promise<void> {
    testStatus = 'checking';
    try {
      const res = await fetch(`${agentBaseUrl}/health`, { signal: AbortSignal.timeout(5000) });
      testStatus = res.ok ? 'ok' : 'fail';
    } catch {
      testStatus = 'fail';
    }
    setTimeout(() => (testStatus = 'idle'), 3000);
  }

  async function removeDomain(domain: string): Promise<void> {
    await ProtocolClient.clearDomainOverride(domain);
    domains = domains.filter(d => d !== domain);
  }

  onMount(load);
</script>

<div class="min-h-screen bg-gray-50 font-sans text-[13px] text-gray-800 p-6">
  <div class="max-w-2xl mx-auto">

    <!-- Title -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">🔤 Vibe Typing — Cài đặt</h1>
      <p class="text-sm text-gray-500 mt-0.5">Cấu hình AI translation extension</p>
    </div>

    <!-- Agent API -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
      <h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Agent API</h2>

      <div class="mb-3">
        <label class="block text-xs font-medium text-gray-600 mb-1" for="api-url">
          API Base URL
        </label>
        <input
          id="api-url"
          type="url"
          bind:value={agentBaseUrl}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div class="flex items-center gap-3">
        <button
          onclick={testConnection}
          disabled={testStatus === 'checking'}
          class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {testStatus === 'checking' ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
        </button>
        {#if testStatus === 'ok'}
          <span class="text-green-600 text-xs font-semibold">✓ Kết nối thành công</span>
        {:else if testStatus === 'fail'}
          <span class="text-red-500 text-xs font-semibold">✗ Không kết nối được</span>
        {/if}
      </div>
    </section>

    <!-- Triggers -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
      <h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Triggers</h2>

      <div class="flex flex-col gap-4">
        <label class="flex items-center justify-between cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">@</span>
            <div>
              <div class="font-medium text-gray-700">Translate</div>
              <div class="text-xs text-gray-400">@[tiếng Việt]. → gợi ý tiếng Anh theo ngữ cảnh</div>
            </div>
          </div>
          <input type="checkbox" bind:checked={enableTranslate} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
        </label>

        <label class="flex items-center justify-between cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">!!</span>
            <div>
              <div class="font-medium text-gray-700">Synonyms</div>
              <div class="text-xs text-gray-400">!![từ EN]. → từ đồng nghĩa</div>
            </div>
          </div>
          <input type="checkbox" bind:checked={enableSynonyms} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
        </label>

        <label class="flex items-center justify-between cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">#</span>
            <div>
              <div class="font-medium text-gray-700">Analyze</div>
              <div class="text-xs text-gray-400">#[từ vựng]. → phân tích chi tiết</div>
            </div>
          </div>
          <input type="checkbox" bind:checked={enableAnalyze} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
        </label>

        <label class="flex items-center justify-between cursor-pointer">
          <div class="flex items-center gap-3">
            <span class="bg-violet-100 text-violet-800 font-mono text-xs font-bold px-2 py-0.5 rounded min-w-[36px] text-center">??</span>
            <div>
              <div class="font-medium text-gray-700">Lint</div>
              <div class="text-xs text-gray-400">??[câu văn]. → kiểm tra ngữ pháp & chính tả</div>
            </div>
          </div>
          <input type="checkbox" bind:checked={enableLint} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
        </label>
      </div>
    </section>

    <!-- Default behavior -->
    <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
      <h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">Mặc định</h2>
      <label class="flex items-center justify-between cursor-pointer">
        <div>
          <div class="font-medium text-gray-700">Bật trên tất cả trang</div>
          <div class="text-xs text-gray-400 mt-0.5">
            Khi tắt, chỉ hoạt động trên trang được bật thủ công qua popup
          </div>
        </div>
        <input type="checkbox" bind:checked={defaultEnabled} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
      </label>
    </section>

    <!-- Domain overrides -->
    {#if domains.length > 0}
    <section class="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
      <h2 class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-4">
        Trang đã bật riêng ({domains.length})
      </h2>
      <ul class="flex flex-col gap-1.5">
        {#each domains as domain (domain)}
          <li class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
            <span class="font-mono text-xs text-gray-700">{domain}</span>
            <button
              onclick={() => removeDomain(domain)}
              class="text-gray-400 hover:text-red-500 transition-colors text-sm leading-none cursor-pointer"
              title="Xóa override"
            >
              ✕
            </button>
          </li>
        {/each}
      </ul>
    </section>
    {/if}

    <!-- Save -->
    <div class="flex items-center justify-end gap-3">
      {#if saveStatus === 'saved'}
        <span class="text-green-600 text-sm font-medium">✓ Đã lưu</span>
      {/if}
      <button
        onclick={save}
        disabled={saveStatus === 'saving'}
        class="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {saveStatus === 'saving' ? 'Đang lưu...' : 'Lưu cài đặt'}
      </button>
    </div>

  </div>
</div>
