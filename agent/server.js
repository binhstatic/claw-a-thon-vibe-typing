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

// ─── MASK DEFINITIONS ─────────────────────────────────────────────────────────
const MASKS = {
  academic: {
    system:
      'You are a writing assistant for Vietnamese students learning academic English. ' +
      'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
      'no code blocks, no extra text before or after the array.',
    translateStyle:
      'STYLE: Formal academic English for essays, theses, and research papers. ' +
      'Use sophisticated vocabulary, complex sentence structures, and scholarly phrasing. ' +
      'AVOID contractions, slang, casual language, or spoken idioms. ' +
      'Examples of acceptable phrasing: "it is worth noting that", "one might argue that", "the evidence suggests".',
    synonymsStyle:
      'STYLE: Formal academic register. Prefer Latinate or Greek-rooted words, technical collocations. ' +
      'AVOID colloquial or informal alternatives.',
    analyzeStyle:
      'STYLE: Academic register. Include formal grammar labels (e.g. "transitive verb", "nominalization"), ' +
      'scholarly collocations, and research-writing contexts.',
  },
  office: {
    system:
      'You are a writing assistant helping Vietnamese professionals write formal business English. ' +
      'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
      'no code blocks, no extra text before or after the array.',
    translateStyle:
      'STYLE: Professional business English for emails, reports, and corporate documents. ' +
      'Use polite, formal language with clear and direct phrasing. ' +
      'AVOID slang, excessive informality, or academic jargon. ' +
      'Examples: "please find attached", "I would like to follow up on", "we appreciate your prompt response".',
    synonymsStyle:
      'STYLE: Professional workplace register. Prefer clear, formal alternatives used in business contexts. ' +
      'AVOID overly academic or too casual words.',
    analyzeStyle:
      'STYLE: Business/professional register. Highlight formality level, politeness markers, ' +
      'and common business-email usage patterns.',
  },
  writer: {
    system:
      'You are a writing assistant for Vietnamese creative writers expressing themselves in English. ' +
      'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
      'no code blocks, no extra text before or after the array.',
    translateStyle:
      'STYLE: Vivid, expressive literary English for fiction, poetry, and creative prose. ' +
      'Choose words with emotional resonance, imagery, and stylistic flair. ' +
      'AVOID dry or purely functional phrasing. Vary sentence rhythm for effect. ' +
      'Examples: "a storm of doubt", "swallowed by silence", "the weight of unspoken words".',
    synonymsStyle:
      'STYLE: Literary/creative register. Highlight connotations, emotional tone, and metaphorical potential. ' +
      'Include vivid or poetic alternatives alongside neutral ones.',
    analyzeStyle:
      'STYLE: Literary analysis. Cover connotations, emotional resonance, imagery potential, ' +
      'and how the word functions in creative/poetic contexts.',
  },
  learner: {
    system:
      'You are a friendly language tutor helping Vietnamese learners improve their English step by step. ' +
      'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
      'no code blocks, no extra text before or after the array.',
    translateStyle:
      'STYLE: Simple, clear, everyday English for beginners and intermediate learners. ' +
      'Use short sentences, common vocabulary (A2–B1 level), and natural spoken phrasing. ' +
      'AVOID complex grammar, uncommon words, or idioms that learners may not know. ' +
      'Examples: "Is that right?", "I think so too", "That makes sense".',
    synonymsStyle:
      'STYLE: Learner-friendly. Explain usage differences simply, flag common mistakes, ' +
      'and show difficulty level (easy/medium). AVOID overwhelming with rare vocabulary.',
    analyzeStyle:
      'STYLE: Learner-friendly explanations. Include simple grammar tips, example sentences ' +
      'for common patterns, and memory aids (mnemonics, visual associations).',
  },
  chat: {
    system:
      'You are a casual writing assistant helping Vietnamese users chat naturally in English online. ' +
      'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
      'no code blocks, no extra text before or after the array.',
    translateStyle:
      'STYLE: Casual, informal spoken English for texting, Discord, Twitter, and online chats. ' +
      'Use contractions, abbreviations, short punchy phrases, and natural colloquialisms. ' +
      'AVOID formal, academic, or business-style language — this is everyday conversation. ' +
      'Examples: "right?", "isn\'t it tho", "am I right lol", "no cap", "fr though".',
    synonymsStyle:
      'STYLE: Casual/colloquial register. Include slang, informal alternatives, and internet-native expressions. ' +
      'AVOID formal or academic synonyms.',
    analyzeStyle:
      'STYLE: Casual everyday language. Cover informal usage, common slang, internet culture references, ' +
      'and emoji-compatible expressions. Keep explanations short and friendly.',
  },
  dev: {
    system:
      'You are a technical writing assistant helping Vietnamese developers write precise, clear English. ' +
      'Respond with ONLY a valid JSON array — no markdown fences, no explanation, ' +
      'no code blocks, no extra text before or after the array.',
    translateStyle:
      'STYLE: Precise, concise technical English for documentation, code comments, and developer communication. ' +
      'Prefer unambiguous, direct phrasing. Use imperative or declarative forms typical in technical writing. ' +
      'AVOID flowery, literary, or overly formal bureaucratic language. ' +
      'Examples: "is this correct?", "does this hold?", "verify that", "ensure that".',
    synonymsStyle:
      'STYLE: Technical writing register. Prioritize precision and unambiguous meaning. ' +
      'Prefer terms with established technical definitions. AVOID colloquial or ambiguous alternatives.',
    analyzeStyle:
      'STYLE: Technical documentation. Focus on formal definitions, precise usage in specs/APIs/READMEs, ' +
      'and common developer community usage.',
  },
};

// ─── PROMPT BUILDERS ──────────────────────────────────────────────────────────
function buildPrompt(mode, phrase, context, mask) {
  const m = MASKS[mask] || MASKS.academic;

  if (mode === 'translate') {
    return (
      `${m.system}\n\n` +
      `Translate the Vietnamese phrase below into English. Give exactly 3 options.\n` +
      `${m.translateStyle}\n\n` +
      `Vietnamese phrase: "${phrase}"\n` +
      (context ? `Surrounding context: "${context}"\n` : '') +
      `\nReturn exactly 3 objects:\n` +
      `[{"phrase":"<English phrase>","breakdown":"<grammatical structure>","meaning":"<Vietnamese explanation>"},...]`
    );
  }
  if (mode === 'synonyms') {
    return (
      `${m.system}\n\n` +
      `Suggest 4 synonyms for the English word/phrase below.\n` +
      `${m.synonymsStyle}\n\n` +
      `Word/phrase: "${phrase}"\n` +
      `\nReturn exactly 4 objects:\n` +
      `[{"phrase":"<synonym>","breakdown":"<word (part of speech) /pronunciation/>","meaning":"<Vietnamese meaning>"},...]`
    );
  }
  if (mode === 'analyze') {
    return (
      `${m.system}\n\n` +
      `Analyze the English word below. Provide 4 entries covering:\n` +
      `1. Base form with pronunciation and part of speech\n` +
      `2. Common collocation or prepositional phrase\n` +
      `3. Adjective or adverb derivative\n` +
      `4. Idiomatic expression\n` +
      `${m.analyzeStyle}\n\n` +
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
  const { mode, phrase, context = '', mask = 'academic' } = req.body;

  if (!mode || !phrase) {
    return res.status(400).json({ error: '"mode" and "phrase" are required' });
  }

  let prompt;
  try {
    prompt = buildPrompt(mode, phrase, context, mask);
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
