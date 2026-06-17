# Vibe Typing

An AI writing assistant that helps Vietnamese students write academic English — directly inside any browser text field, without switching tabs or tools.

## How it works

Type a trigger pattern ending with a period (`.`) and a suggestion dropdown appears instantly at your cursor:

| Trigger | Mode | Example |
|---------|------|---------|
| `@cụm tiếng Việt.` | Translate | `…this policy @dẫn đến tâm lý hoang mang.` → 3 English suggestions |
| `!!English word.` | Synonyms | `a very !!important. issue` → 4 academic synonyms |
| `#word.` | Analyze | `#impact.` → pronunciation, collocations, derivatives, idioms |

Click a suggestion to insert it — the trigger is replaced automatically.

## Architecture

```
Chrome Extension / Web Playground
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

### Components

| Folder | What it is |
|--------|------------|
| `extension/` | Chrome Extension (Manifest V3) — content script, popup |
| `web/` | Static web playground — same trigger logic, runs in the browser |
| `agent/` | Node.js HTTP bridge — receives `/suggest` requests, calls the LLM |

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

### 2. Cài extension thủ công (Manual Installation)

Extension chưa publish lên Chrome Web Store, nên cần cài bằng cách load thủ công (Developer mode).

#### Bước 1 — Tải source code

Clone repo về máy hoặc tải ZIP:

```bash
git clone <repo-url>
# hoặc tải ZIP từ GitHub → Extract → nhớ đường dẫn thư mục extension/
```

#### Bước 2 — Mở trang quản lý extension

| Trình duyệt | Địa chỉ |
|-------------|---------|
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |
| Brave | `brave://extensions` |
| Arc | `chrome://extensions` (mở từ menu → Extensions) |

#### Bước 3 — Bật Developer mode

Gạt công tắc **Developer mode** (góc trên bên phải) sang **ON**.

#### Bước 4 — Load unpacked

1. Click **Load unpacked**
2. Chọn thư mục `extension/` trong repo (thư mục chứa `manifest.json`)
3. Click **Select Folder** / **Open**

Extension **Vibe Typing — Smart Translator** sẽ xuất hiện trong danh sách và icon hiện ở thanh toolbar.

#### Lưu ý khi cập nhật extension

Mỗi lần pull code mới hoặc sửa file trong `extension/`, cần reload lại extension:
- Vào trang extensions → tìm **Vibe Typing** → click icon **Reload** (↻)

### 3. Run the web playground locally

```bash
cd web
python3 -m http.server 5050
# Open http://localhost:5050
```

## Deployment

The agent and web service are deployed as Docker containers on **GreenNode AgentBase Runtime**.

### Agent

```bash
# Build & push
docker build --platform linux/amd64 -t <registry>/vibe-typing-agent:latest agent/
docker push <registry>/vibe-typing-agent:latest

# Deploy (via AgentBase CLI)
runtime create --name vibe-typing-agent --image <registry>/vibe-typing-agent:latest \
  --env-file agent/.env --flavor runtime-s2-general-2x4
```

The agent exposes:
- `GET /health` — liveness check
- `POST /suggest` — main inference endpoint

### Web

```bash
docker build --platform linux/amd64 -t <registry>/vibe-typing-web:latest web/
docker push <registry>/vibe-typing-web:latest

runtime create --name vibe-typing-web --image <registry>/vibe-typing-web:latest \
  --flavor runtime-s2-general-2x4
```

After deployment, update `extension/config.js` and `web/config.js` with the live endpoint URL.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PLATFORM_API_KEY` | Yes | VNG AI Platform API key |
| `LLM_BASE_URL` | No | LLM base URL (default: VNG MaaS endpoint) |
| `LLM_MODEL` | No | Model name (default: `google/gemma-4-31b-it`) |
| `PORT` | No | Server port (default: `8080`) |

Copy `agent/.env.example` to `agent/.env` and fill in the values. Never commit `.env`.

## API reference

### `POST /suggest`

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
