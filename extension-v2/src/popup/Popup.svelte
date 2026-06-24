<script lang="ts">
  import { onMount } from 'svelte';
  import { ProtocolClient } from '../ProtocolClient';
  import { MASKS } from '../protocol';
  import type { MaskId } from '../protocol';

  let domain = $state('');
  let enabled = $state(true);
  let agentStatus = $state<'checking' | 'online' | 'offline'>('checking');
  let selectedMask = $state<MaskId>('academic');

  async function getCurrentDomain(): Promise<string> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return '';
    try { return new URL(tab.url).hostname; } catch { return ''; }
  }

  async function checkHealth(url: string): Promise<void> {
    agentStatus = 'checking';
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) });
      agentStatus = res.ok ? 'online' : 'offline';
    } catch {
      agentStatus = 'offline';
    }
  }

  async function toggleDomain(): Promise<void> {
    enabled = !enabled;
    await ProtocolClient.setDomainStatus(domain, enabled);
  }

  async function selectMask(id: MaskId): Promise<void> {
    selectedMask = id;
    await ProtocolClient.setConfig({ mask: id });
  }

  function openOptions(): void {
    ProtocolClient.openOptions();
    window.close();
  }

  onMount(async () => {
    domain = await getCurrentDomain();
    const [cfg, status] = await Promise.all([
      ProtocolClient.getConfig(),
      ProtocolClient.getDomainStatus(domain),
    ]);
    enabled = status;
    selectedMask = cfg.mask ?? 'academic';
    checkHealth(cfg.agentBaseUrl);
  });
</script>

<div class="w-[320px] font-sans text-[13px] text-gray-800 bg-white">
  <!-- Header -->
  <div class="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-[14px]">
    <h1 class="text-base font-bold mb-0.5">🔤 Vibe Typing</h1>
    <p class="text-[11.5px] opacity-80">Smart translation while you write</p>
    <div class="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5 text-[11px]">
      <span class="w-1.5 h-1.5 bg-green-400 rounded-full" style="animation: blink 2s infinite"></span>
      Đang hoạt động
    </div>
  </div>

  <!-- Domain toggle -->
  {#if domain}
  <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
    <div class="min-w-0">
      <div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Trang web này</div>
      <div class="text-sm font-medium text-gray-700 truncate">{domain}</div>
    </div>
    <button
      onclick={toggleDomain}
      class="shrink-0 relative inline-flex items-center w-10 h-5 rounded-full transition-colors cursor-pointer focus:outline-none"
      class:bg-indigo-600={enabled}
      class:bg-gray-300={!enabled}
      aria-label="Toggle extension on this site"
    >
      <span
        class="absolute w-4 h-4 bg-white rounded-full shadow transition-transform"
        class:translate-x-5={enabled}
        class:translate-x-0.5={!enabled}
      ></span>
    </button>
  </div>
  {/if}

  <!-- Mask selector -->
  <div class="px-3 py-3 border-b border-gray-100">
    <div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-2">Phong cách viết</div>
    <div class="grid grid-cols-3 gap-1.5">
      {#each MASKS as mask}
        <button
          onclick={() => selectMask(mask.id)}
          title={mask.description}
          class="mask-btn flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all cursor-pointer"
          class:mask-active={selectedMask === mask.id}
          class:mask-inactive={selectedMask !== mask.id}
        >
          <span class="text-[18px] leading-none">{mask.icon}</span>
          <span class="text-[10px] font-medium leading-tight">{mask.label}</span>
        </button>
      {/each}
    </div>
    {#each MASKS as mask}
      {#if selectedMask === mask.id}
        <p class="mt-1.5 text-[10.5px] text-indigo-600 font-medium text-center">{mask.description}</p>
      {/if}
    {/each}
  </div>

  <!-- Trigger guide -->
  <div class="px-4 py-3 border-b border-gray-100">
    <div class="text-[10.5px] font-bold text-gray-400 uppercase tracking-wide mb-2.5">Cách sử dụng</div>
    <div class="flex flex-col gap-2">
      <div class="flex items-start gap-2.5">
        <span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center">@</span>
        <span class="text-[12.5px] text-gray-700 leading-snug">Gõ <em class="text-violet-700 not-italic font-medium">@[tiếng Việt].</em> → gợi ý <em class="text-violet-700 not-italic font-medium">tiếng Anh</em></span>
      </div>
      <div class="flex items-start gap-2.5">
        <span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center">!!</span>
        <span class="text-[12.5px] text-gray-700 leading-snug">Gõ <em class="text-violet-700 not-italic font-medium">!![từ EN].</em> → <em class="text-violet-700 not-italic font-medium">từ đồng nghĩa</em></span>
      </div>
      <div class="flex items-start gap-2.5">
        <span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center">#</span>
        <span class="text-[12.5px] text-gray-700 leading-snug">Gõ <em class="text-violet-700 not-italic font-medium">#[từ].</em> → <em class="text-violet-700 not-italic font-medium">phân tích từ</em></span>
      </div>
      <div class="flex items-start gap-2.5">
        <span class="shrink-0 bg-violet-100 text-violet-800 font-mono text-[12px] font-bold px-2 py-0.5 rounded min-w-[36px] text-center">/lint</span>
        <span class="text-[12.5px] text-gray-700 leading-snug">Gõ <em class="text-violet-700 not-italic font-medium">/lint[câu văn]/</em> → <em class="text-violet-700 not-italic font-medium">kiểm tra ngữ pháp</em></span>
      </div>
    </div>
  </div>

  <!-- Example -->
  <div class="px-4 py-2.5 text-[11.5px] text-gray-500 bg-gray-50 border-b border-gray-100 leading-relaxed">
    <strong class="text-gray-700">Ví dụ:</strong> Gõ
    <code class="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[11px]">@dẫn đến tâm lý hoang mang.</code>
    → dropdown xuất hiện ngay tại con trỏ.
    <br class="mt-1"/>Dùng <strong class="text-gray-700">dấu chấm (.)</strong> để kết thúc.
  </div>

  <!-- Footer -->
  <div class="px-4 py-2 text-[11px] text-gray-400 bg-gray-50 text-center">
    Powered by <strong class="text-gray-600">OpenClaw</strong>
    <div class="inline-flex items-center gap-1.5 mt-1">
      <span
        class="w-1.5 h-1.5 rounded-full"
        class:bg-green-400={agentStatus === 'online'}
        class:bg-red-400={agentStatus === 'offline'}
        class:bg-gray-300={agentStatus === 'checking'}
      ></span>
      <span>
        {#if agentStatus === 'checking'}Đang kiểm tra server...
        {:else if agentStatus === 'online'}Agent server: online
        {:else}Agent server: offline{/if}
      </span>
    </div>
    <br />
    <button onclick={openOptions} class="mt-1 text-indigo-500 hover:text-indigo-700 underline cursor-pointer">
      ⚙ Cài đặt
    </button>
  </div>
</div>

<style>
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .mask-active {
    background-color: #ede9fe;
    border-color: #7c3aed;
    color: #5b21b6;
  }

  .mask-inactive {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #4b5563;
  }

  .mask-inactive:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
  }
</style>
