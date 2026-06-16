'use strict';

require('dotenv').config();

const express = require('express');
const https   = require('https');

const PORT      = process.env.PORT          || 8080;
const API_KEY   = process.env.AI_PLATFORM_API_KEY;
const LLM_BASE  = process.env.LLM_BASE_URL  || 'your_llm_base_url_here';
const LLM_MODEL = process.env.LLM_MODEL     || 'your_llm_model_here';

if (!API_KEY) {
  console.error('[vibe-typing] ERROR: AI_PLATFORM_API_KEY is not set');
  process.exit(1);
}

const { hostname: LLM_HOST, pathname } = new URL(LLM_BASE);
const LLM_PATH = pathname.replace(/\/$/, '');

// ─── EXPRESS APP ──────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── DIRECT LLM CALL ─────────────────────────────────────────────────────────
function callLLM(prompt) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({
      model:       LLM_MODEL,
      messages:    [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens:  20000,
    }));

    const req = https.request({
      hostname: LLM_HOST,
      path:     `${LLM_PATH}/chat/completions`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${API_KEY}`,
        'Content-Length': body.length,
      },
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed  = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content;
          if (!content) reject(new Error(data));
          else resolve(content);
        } catch (_) {
          reject(new Error(`Invalid JSON from LLM: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30_000, () => req.destroy(new Error('LLM request timeout')));
    req.write(body);
    req.end();
  });
}

// ─── PROMPT BUILDERS ──────────────────────────────────────────────────────────
const SYSTEM =
  'You are a writing assistant for Vietnamese students learning academic English. ' +
  'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
  'no code blocks, no extra text before or after the array.';

function buildPrompt(mode, phrase, context) {
  if (mode === 'translate') {
    return (
      `${SYSTEM}\n\n` +
      `Suggest 3 English translations for the Vietnamese phrase below, suitable for academic essay writing.\n` +
      `Vietnamese phrase: "${phrase}"\n` +
      (context ? `Surrounding context: "${context}"\n` : '') +
      `\nReturn exactly 3 objects:\n` +
      `[{"phrase":"<English phrase>","breakdown":"<grammatical structure>","meaning":"<Vietnamese explanation>"},...]`
    );
  }
  if (mode === 'synonyms') {
    return (
      `${SYSTEM}\n\n` +
      `Suggest 4 synonyms for the English word/phrase below, suitable for academic writing.\n` +
      `Word/phrase: "${phrase}"\n` +
      `\nReturn exactly 4 objects:\n` +
      `[{"phrase":"<synonym>","breakdown":"<word (part of speech) /pronunciation/>","meaning":"<Vietnamese meaning>"},...]`
    );
  }
  if (mode === 'analyze') {
    return (
      `${SYSTEM}\n\n` +
      `Analyze the English word below. Provide 4 entries covering:\n` +
      `1. Base form with pronunciation and part of speech\n` +
      `2. Common collocation or prepositional phrase\n` +
      `3. Adjective or adverb derivative\n` +
      `4. Idiomatic expression\n` +
      `Word: "${phrase}"\n` +
      `\nReturn exactly 4 objects:\n` +
      `[{"phrase":"<entry>","breakdown":"<grammatical label>","meaning":"<Vietnamese explanation>"},...]`
    );
  }
  throw new Error(`Unknown mode: ${mode}`);
}

// ─── JSON EXTRACTOR ───────────────────────────────────────────────────────────
function extractJSON(raw) {
  const start = raw.indexOf('[');
  const end   = raw.lastIndexOf(']');
  if (start === -1 || end <= start) throw new Error('No JSON array in LLM response');
  return JSON.parse(raw.slice(start, end + 1));
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'vibe-typing-agent', backend: 'vng-aip-direct' });
});

app.post('/suggest', async (req, res) => {
  const { mode, phrase, context = '' } = req.body;

  if (!mode || !phrase) {
    return res.status(400).json({ error: '"mode" and "phrase" are required' });
  }

  let prompt;
  try {
    prompt = buildPrompt(mode, phrase, context);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  try {
    const raw         = await callLLM(prompt);
    const suggestions = extractJSON(raw);
    res.json({ suggestions });
  } catch (e) {
    console.error('[vibe-typing]', e.message);
    res.status(502).json({ error: e.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[vibe-typing] Agent server → http://0.0.0.0:${PORT}`);
  console.log(`[vibe-typing] LLM backend  → ${LLM_HOST} (${LLM_MODEL})`);
});
