const MASKS = [
  { id: "academic", icon: "🎓", label: "Học thuật", description: "Văn phong học thuật, luận văn" },
  { id: "office", icon: "👔", label: "Văn phòng", description: "Email, tài liệu công việc" },
  { id: "writer", icon: "✍️", label: "Nhà văn", description: "Sáng tác, văn chương" },
  { id: "learner", icon: "🌱", label: "Mới học", description: "Giải thích đơn giản, dễ hiểu" },
  { id: "chat", icon: "💬", label: "Chat dạo", description: "Nhắn tin, bình luận online" },
  { id: "dev", icon: "👨‍💻", label: "Lập trình", description: "Docs, code comment, kỹ thuật" }
];
const DEFAULT_CONFIG = {
  agentBaseUrl: "https://endpoint-f0b1c066-9a31-44c0-b18a-866205de4ee2.agentbase-runtime.aiplatform.vngcloud.vn",
  enableTranslate: true,
  enableSynonyms: true,
  enableAnalyze: true,
  mask: "academic"
};
export {
  DEFAULT_CONFIG as D,
  MASKS as M
};
//# sourceMappingURL=protocol-D7dFRlSf.js.map
