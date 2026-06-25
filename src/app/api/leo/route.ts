import { NextResponse } from 'next/server';

/**
 * Leo's AI backend — a thin server-side proxy to Gemini so the API key never
 * reaches the browser. One route serves three jobs (`task`):
 *   - chat   : Leo conversation (client passes `system` + `history`)
 *   - polish : rewrite a contact message
 *   - forge  : generate a game-concept from a vibe (Idea Forge)
 *
 * If GEMINI_API_KEY is unset or the upstream call fails, we return an honest
 * offline message with `offline: true` (HTTP 200) — the UI degrades gracefully.
 */

export const runtime = 'nodejs';

// ponytail: use stable alias; -lite variant had inconsistent availability
const MODEL = 'gemini-2.5-flash';
const MAX_INPUT = 4000;

type Task = 'chat' | 'polish' | 'forge';
type Msg = { role: 'user' | 'assistant'; text: string };

const OFFLINE: Record<Task, string> = {
  chat: "Leo can't connect right now. Drop us a line on the Contact page and we'll get right back to you!",
  polish: '', // polish offline -> caller keeps original text
  forge: 'The Forge is cooling down - try again in a moment, or sketch your idea and send it via Contact!',
};

// ponytail: server owns the polish/forge prompts so the client stays dumb.
function buildPrompt(task: Task, input: string) {
  if (task === 'polish') {
    return {
      system: 'You are a professional communications assistant.',
      prompt: '',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Rewrite the following message to be professional, warm, and clear - suitable for contacting a game studio about a project, collaboration, or learning question: "${input}". Keep it under 150 words. Return only the rewritten message.`,
            },
          ],
        },
      ],
    };
  }
  // forge
  return {
    system:
      'You are a visionary game-design assistant helping brainstorm new concepts. Be creative, concise, and inspiring.',
    prompt: '',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Create a unique, high-concept game idea based on these keywords/vibe: "${input}". Format the response exactly as:\nTITLE: [Game Title]\nGENRE: [Genre / Platform]\nPITCH: [One compelling sentence pitch]\nMECHANIC: [The core gameplay mechanic in one or two sentences]\nTWIST: [One surprising element that makes it stand out]`,
          },
        ],
      },
    ],
  };
}

async function callGemini(
  key: string,
  system: string,
  contents: { role?: string; parts: { text: string }[] }[],
) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      }),
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${body?.error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return String(text).trim();
}

export async function POST(req: Request) {
  let body: { task?: string; input?: string; system?: string; history?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const task = body.task as Task;
  const input = typeof body.input === 'string' ? body.input.trim() : '';

  // Input validation at the trust boundary.
  if (task !== 'chat' && task !== 'polish' && task !== 'forge') {
    return NextResponse.json({ error: 'Unknown task' }, { status: 400 });
  }
  if (!input) {
    return NextResponse.json({ error: 'Empty input' }, { status: 400 });
  }
  if (input.length > MAX_INPUT) {
    return NextResponse.json({ error: 'Input too long' }, { status: 413 });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ text: OFFLINE[task], offline: true });
  }

  let system: string;
  let contents: { role?: string; parts: { text: string }[] }[];
  if (task === 'chat') {
    system = typeof body.system === 'string' ? body.system : '';
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.text).slice(0, MAX_INPUT) }],
      })),
      { role: 'user', parts: [{ text: input }] },
    ];
  } else {
    const built = buildPrompt(task, input);
    system = built.system;
    contents = built.contents;
  }

  try {
    const text = await callGemini(key, system, contents);
    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[leo] Gemini error:', msg);
    return NextResponse.json({ text: OFFLINE[task], offline: true });
  }
}
