# Vibe Typing

An AI writing assistant that helps Vietnamese professionals write in English — directly inside any browser text field, without switching tabs or tools.

## How it works

Type a trigger pattern ending with a period (`.`) and a suggestion popup appears instantly:

| Trigger | Mode | Example |
|---------|------|---------|
| `@cụm tiếng Việt.` | Translate | `@dẫn đến tâm lý hoang mang.` → English suggestions with context |
| `!!English word.` | Synonyms | `!!important.` → academic synonyms |
| `#word.` | Analyze | `#impact.` → pronunciation, collocations, meaning |

Click a suggestion to replace the trigger text — works in Gmail, Teams, Notion, Slack, and any other web text field.

## Architecture

```
Chrome Extension (extension-v2/)
        │
        │  POST /suggest  {mode, phrase, context}
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

| Folder | What it is |
|--------|------------|
| `extension-v2/` | Chrome Extension MV3 — TypeScript + Svelte 5 + Vite |
| `agent/` | Node.js HTTP bridge — receives `/suggest`, calls the LLM |
| `web/` | Static web playground — same trigger logic, no build needed |

## Getting started

### 1. Run the agent locally

```bash
cd agent
cp .env.example .env
# Fill in AI_PLATFORM_API_KEY in .env
npm install
npm start
# Agent runs on http://localhost:8080
```

### 2. Build the extension

```bash
cd extension-v2
npm install
npm run build
# Output: extension-v2/build/
```

To create a ZIP for the Chrome Web Store:

```bash
npm run zip
# Output: extension-v2/vibe-typing.zip
```

### 3. Cài extension thủ công (Manual Installation)

#### Bước 1 — Build

Chạy lệnh build ở trên. Kết quả nằm trong `extension-v2/build/`.

#### Bước 2 — Mở trang quản lý extension

| Trình duyệt | Địa chỉ |
|-------------|---------|
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |
| Brave | `brave://extensions` |
| Arc | `chrome://extensions` |

#### Bước 3 — Bật Developer mode

Gạt **Developer mode** (góc trên bên phải) sang **ON**.

#### Bước 4 — Load unpacked

1. Click **Load unpacked**
2. Chọn thư mục `extension-v2/build/` (thư mục chứa `manifest.json`)
3. Click **Select Folder** / **Open**

Extension **Vibe Typing — Smart Translator** sẽ xuất hiện trong danh sách.

#### Bước 5 — Cấu hình

Click icon Vibe Typing trên toolbar → **Settings** → nhập URL của agent vào ô **API Base URL**.

#### Cập nhật extension

Mỗi lần sửa code trong `extension-v2/src/`:

```bash
cd extension-v2 && npm run build
```

Sau đó vào trang extensions → tìm **Vibe Typing** → click **Reload** (↻).

### 4. Run the web playground

```bash
cd web
python3 -m http.server 5050
# Open http://localhost:5050
```

## Deployment

The agent is deployed as a Docker container on **GreenNode AgentBase Runtime**.

```bash
# Build & push
docker build --platform linux/amd64 -t <registry>/vibe-typing-agent:latest agent/
docker push <registry>/vibe-typing-agent:latest

# Deploy
runtime create --name vibe-typing-agent --image <registry>/vibe-typing-agent:latest \
  --env-file agent/.env --flavor runtime-s2-general-2x4
```

The agent exposes:
- `GET /health` — liveness check
- `POST /suggest` — main inference endpoint

After deployment, set the live endpoint URL in the extension's Settings page.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PLATFORM_API_KEY` | Yes | VNG AI Platform API key |
| `LLM_BASE_URL` | No | LLM base URL (default: VNG MaaS endpoint) |
| `LLM_MODEL` | No | Model name (default: `google/gemma-4-31b-it`) |
| `PORT` | No | Server port (default: `8080`) |

Copy `agent/.env.example` to `agent/.env`. Never commit `.env`.

## API reference

### `POST /suggest`

Request:

```json
{
  "mode": "translate" | "synonyms" | "analyze",
  "phrase": "string",
  "context": "string (optional)"
}
```

Response:

```json
{
  "suggestions": [
    {
      "phrase": "academic phrasing",
      "breakdown": "grammatical structure or label",
      "meaning": "Vietnamese explanation"
    }
  ]
}
```

## Extension tech stack

| Tool | Version | Role |
|------|---------|------|
| TypeScript | 5.x | Type-safe content script and background service worker |
| Svelte 5 | 5.x | Options page and popup UI |
| Vite | 5.x | Build tool |
| @crxjs/vite-plugin | 2.x | MV3 manifest + HMR wiring |
| Tailwind CSS | 4.x | Options page styling |
