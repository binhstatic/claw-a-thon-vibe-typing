# Vibe Typing — Web Demo

Static demo site showcasing the three Vibe Typing use cases, with a live playground
that calls the same AgentBase runtime the browser extension uses.

- `index.html` — landing page + guided playground
- `styles.css` — styling (page + suggestion dropdown)
- `app.js` — trigger detection, caret-anchored dropdown, agent calls
- `config.js` — `AGENT_BASE_URL` (update when the runtime endpoint changes)

## Use cases

| Trigger | Mode | Example |
| --- | --- | --- |
| `@cụm.` | translate | `…this @dẫn đến tâm lý hoang mang.` |
| `!!từ.` | synonyms | `a very !!important. issue` |
| `#từ.` | analyze | `#impact.` |

Always end the phrase with a period `.` to fire a suggestion.

## Run locally

```bash
cd web
python3 -m http.server 5050
# open http://localhost:5050
```

## Deploy to Vercel

It's a pure static site — no build step.

**Dashboard:** New Project → import this repo → set **Root Directory** to `web` →
Framework Preset **Other** → Deploy.

**CLI:**

```bash
npm i -g vercel
cd web
vercel        # preview
vercel --prod # production
```

The agent endpoint sends `Access-Control-Allow-Origin: *`, so the deployed page can
call it directly from the browser.
