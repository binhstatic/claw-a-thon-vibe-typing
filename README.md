# Vibe Typing

> **[⬇ Tải extension](https://chromewebstore.google.com/detail/vibe-typing-%E2%80%94-smart-trans/hcfadbiljgfholhkepmnoiebhccidjkf)**

An AI writing assistant that helps Vietnamese professionals write in English — directly inside any browser text field, without switching tabs or tools.

## Triggers

Type a trigger pattern and a suggestion popup appears instantly at the cursor:

| Trigger             | Mode      | Kết thúc | Ví dụ                              | Kết quả                                        |
| ------------------- | --------- | -------- | ---------------------------------- | ---------------------------------------------- |
| `@[tiếng Việt].`    | Translate | `.`      | `@dẫn đến tâm lý hoang mang.`      | 3 gợi ý tiếng Anh theo ngữ cảnh                |
| `!![English word].` | Synonyms  | `.`      | `!!important.`                     | 4 từ đồng nghĩa                                |
| `#[word].`          | Analyze   | `.`      | `#impact.`                         | Phát âm, collocation, nghĩa, thành ngữ         |
| `/lint[câu văn]/`   | Lint      | `/`      | `/lint He go to school yesterday/` | Sửa ngữ pháp, giải thích lý do bằng tiếng Việt |

Click a suggestion to replace the trigger text in place — works in Gmail, Google Docs, Notion, Slack, Teams, and any web text field.

> **Lưu ý `/lint`:** Dùng dấu `/` để mở và đóng trigger, tránh xung đột với dấu `.` của các trigger khác. Ví dụ: `/lint The students was happy./`

## Tính năng nổi bật

- **4 trigger modes** — dịch, từ đồng nghĩa, phân tích từ, kiểm tra ngữ pháp
- **6 phong cách viết (Mask)** — Academic, Office, Writer, Learner, Chat, Dev
- **Lint thông minh** — chỉ sửa lỗi ngữ pháp, không paraphrase, giải thích lý do sửa bằng tiếng Việt
- **Giới hạn ký tự** — hỗ trợ câu dài tới 500–1000 ký tự
- **Bật/tắt theo domain** — kiểm soát từng trang web qua popup
- Hoạt động trên `<textarea>`, `<input>`, và `contentEditable` (Gmail, Notion, v.v.)

## Architecture

```
Chrome Extension (extension-v2/)
        │
        │  POST /suggest  {mode, phrase, context, mask}
        ▼
  Agent Server (Node.js + Express)
  deployed on GreenNode AgentBase Runtime
        │
        │  OpenAI-compatible API
        ▼
  VNG AI Platform (MaaS LLM)
  model: google/gemma-4-31b-it
```

### Repository structure

| Folder          | What it is                                                  |
| --------------- | ----------------------------------------------------------- |
| `extension-v2/` | Chrome Extension MV3 — TypeScript + Svelte 5 + Vite         |
| `agent/`        | Node.js HTTP bridge — nhận `/suggest`, gọi LLM              |
| `web/`          | Static web playground — cùng trigger logic, không cần build |

## Getting started

### 1. Cài extension (nhanh nhất)

1. Tải file **[vibe-typing.zip](https://github.com/binhstatic/claw-a-thon-vibe-typing/releases/latest/download/vibe-typing.zip)** từ Releases
2. Giải nén ra một thư mục
3. Mở `chrome://extensions` (hoặc `edge://extensions`, `brave://extensions`)
4. Bật **Developer mode** (góc trên phải)
5. Click **Load unpacked** → chọn thư mục vừa giải nén
6. Click icon Vibe Typing trên toolbar → **⚙ Cài đặt** → nhập **API Base URL**

#### Cập nhật extension

```bash
cd extension-v2 && npm run build && npm run zip
```

Sau đó vào trang extensions → tìm **Vibe Typing** → click **Reload** (↻).

### 2. Build từ source

```bash
cd extension-v2
npm install
npm run build
# Output: extension-v2/build/

npm run zip
# Output: extension-v2/vibe-typing.zip
```

### 3. Chạy agent locally

```bash
cd agent
cp .env.example .env
# Điền AI_PLATFORM_API_KEY vào .env
npm install
npm start
# Agent chạy tại http://localhost:8080
```

### 4. Chạy web playground

```bash
cd web
python3 -m http.server 5050
# Mở http://localhost:5050
```

## Deployment

Agent được deploy dưới dạng Docker container trên **GreenNode AgentBase Runtime**.

```bash
# Build & push
docker build --platform linux/amd64 -t <registry>/vibe-typing-agent:latest agent/
docker push <registry>/vibe-typing-agent:latest

# Deploy
runtime create --name vibe-typing-agent --image <registry>/vibe-typing-agent:latest \
  --env-file agent/.env --flavor runtime-s2-general-2x4
```

Sau khi deploy, cập nhật endpoint URL trong trang Settings của extension.

## Environment variables

| Variable              | Required | Description                                   |
| --------------------- | -------- | --------------------------------------------- |
| `AI_PLATFORM_API_KEY` | Yes      | VNG AI Platform API key                       |
| `LLM_BASE_URL`        | No       | LLM base URL (default: VNG MaaS endpoint)     |
| `LLM_MODEL`           | No       | Model name (default: `google/gemma-4-31b-it`) |
| `PORT`                | No       | Server port (default: `8080`)                 |

Copy `agent/.env.example` to `agent/.env`. Never commit `.env`.

## API reference

### `POST /suggest`

Request:

```json
{
  "mode": "translate" | "synonyms" | "analyze" | "lint",
  "phrase": "string",
  "context": "string (optional)",
  "mask": "academic" | "office" | "writer" | "learner" | "chat" | "dev"
}
```

Response:

```json
{
  "suggestions": [
    {
      "phrase": "corrected or suggested text",
      "breakdown": "grammatical label or error types fixed",
      "meaning": "giải thích bằng tiếng Việt"
    }
  ]
}
```

**Số lượng suggestions theo mode:**

| Mode        | Số lượng                  |
| ----------- | ------------------------- |
| `translate` | Đúng 3                    |
| `synonyms`  | Đúng 4                    |
| `analyze`   | Đúng 4                    |
| `lint`      | 1–3 (tuỳ số lỗi tìm được) |

### `GET /health`

```json
{"status": "ok", "service": "vibe-typing-agent", "backend": "vng-aip-direct"}
```

## Extension tech stack

| Tool               | Version | Role                                                  |
| ------------------ | ------- | ----------------------------------------------------- |
| TypeScript         | 5.x     | Type-safe content script và background service worker |
| Svelte 5           | 5.x     | Options page và popup UI                              |
| Vite               | 5.x     | Build tool                                            |
| @crxjs/vite-plugin | 2.x     | MV3 manifest + HMR wiring                             |
| Tailwind CSS       | 4.x     | Options page styling                                  |
