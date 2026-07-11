'use client';

import { useState } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

/**
 * Idea Forge — playful AI game-concept generator. Calls /api/leo (forge task);
 * the Gemini key stays server-side. Degrades to an honest message when offline.
 */
export function IdeaForge() {
  const [prompt, setPrompt] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = prompt.trim();
    if (!input || loading) return;
    setLoading(true);
    setIdea('');
    try {
      const res = await fetch('/api/leo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'forge', input }),
      });
      const data = await res.json();
      setIdea(data.text ?? 'The Forge is quiet — try again in a moment.');
    } catch {
      setIdea('The Forge is quiet — try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mt-20 overflow-hidden rounded-2xl border border-gold/30 bg-white/[0.03] p-7">
      <BrainCircuit className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 text-gold/10" />
      <div className="relative">
        <h3 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-gold" /> The Idea Forge
          <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-medium text-gold">
            Gemini AI
          </span>
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-pearl/70">
          Stuck for a concept? Give Leo a vibe and the Forge will prototype a fresh game idea.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={generate} className="space-y-4">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. cyberpunk farming sim…"
              aria-label="Game idea vibe"
              className="w-full rounded-lg border border-white/15 bg-white/[0.04] p-3 text-sm text-pearl placeholder-pearl/40 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <BrainCircuit className="h-4 w-4" />
              {loading ? 'Forging…' : 'Generate concept'}
            </button>
          </form>
          <div className="flex min-h-[160px] flex-col justify-center rounded-lg border border-white/10 bg-black/20 p-5">
            {idea ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gold">
                {idea}
              </pre>
            ) : (
              <p className="text-center text-sm italic text-pearl/40">
                {loading ? 'Analysing game trends…' : 'Your concept will appear here.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
