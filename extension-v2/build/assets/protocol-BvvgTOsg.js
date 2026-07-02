const MASKS = [
  { id: "academic", icon: "🎓", label: "Học thuật", description: "Văn phong học thuật, luận văn" },
  { id: "office", icon: "👔", label: "Văn phòng", description: "Email, tài liệu công việc" },
  { id: "writer", icon: "✍️", label: "Nhà văn", description: "Sáng tác, văn chương" },
  { id: "learner", icon: "🌱", label: "Mới học", description: "Giải thích đơn giản, dễ hiểu" },
  { id: "chat", icon: "💬", label: "Chat dạo", description: "Nhắn tin, bình luận online" },
  { id: "dev", icon: "👨‍💻", label: "Lập trình", description: "Docs, code comment, kỹ thuật" }
];
const MODELS = [
  { id: "google/gemma-4-31b-it", icon: "💎", label: "Gemma 4", description: "Google Gemma 4 31B — mặc định, cân bằng" },
  { id: "minimax/minimax-m2.5", icon: "⚡", label: "MiniMax", description: "MiniMax M2.5 — phản hồi nhanh" },
  { id: "qwen/qwen3-5-27b", icon: "🧠", label: "Qwen3.5", description: "Qwen3.5 27B — mạnh về đa ngôn ngữ" },
  { id: "openai/gpt-4o", icon: "🤖", label: "GPT-4o", description: "OpenAI GPT-4o — chất lượng cao" }
];
const DEFAULT_CONFIG = {
  agentBaseUrl: "https://endpoint-f0b1c066-9a31-44c0-b18a-866205de4ee2.agentbase-runtime.aiplatform.vngcloud.vn",
  enableTranslate: true,
  enableSynonyms: true,
  enableAnalyze: true,
  enableLint: true,
  mask: "academic",
  model: "google/gemma-4-31b-it"
};
export {
  DEFAULT_CONFIG as D,
  MASKS as M,
  MODELS as a
};
//# sourceMappingURL=protocol-BvvgTOsg.js.map
