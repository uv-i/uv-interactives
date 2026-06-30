'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Send, X } from 'lucide-react';
import { chatbot } from '@/content/data/chatbot';
import { useTheme } from '@/shared/state/themeStore';

type ChatMsg = { role: 'user' | 'assistant'; text: string; links?: PageLink[] };
type PageLink = { route: string; label: string };

const CYCLE_MS = 90_000;

function shuffleIndices(len: number): number[] {
  const arr = Array.from({ length: len }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PAGE_LINKS: { keywords: string[]; route: string; label: string }[] = [
  { keywords: ['dev lab', '/lab', 'teaching', 'unity tutorial', 'coin rush', 'oop pillars', 'learn'], route: '/lab', label: 'Dev Lab' },
  { keywords: ['guess in 10', 'uv originals', 'our games', 'games page', 'in development'], route: '/games', label: 'Games' },
  { keywords: ['contact', 'get in touch', 'reach out', 'send a message', 'email'], route: '/contact', label: 'Contact' },
];

function extractLinks(text: string): PageLink[] {
  const lower = text.toLowerCase();
  const found: PageLink[] = [];
  for (const p of PAGE_LINKS) {
    if (p.keywords.some((k) => lower.includes(k)) && !found.find((f) => f.route === p.route)) {
      found.push({ route: p.route, label: p.label });
    }
  }
  return found;
}

const randomIntro = () =>
  chatbot.intros[Math.floor(Math.random() * chatbot.intros.length)];

export function Leo() {
  const router = useRouter();
  const pathname = usePathname();
  const isDark = useTheme((s) => s.resolved === 'dusk');

  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: randomIntro() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<number[]>([]);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setShowBubble(false);
      if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    };
    window.addEventListener('leo:open', handler);
    return () => window.removeEventListener('leo:open', handler);
  }, []);

  // Idle teaser bubble — Fisher-Yates queue, advances every CYCLE_MS.
  useEffect(() => {
    if (open) return;
    if (pathname === '/lab' || pathname === '/games') return;

    const advance = () => {
      if (queueRef.current.length === 0) queueRef.current = shuffleIndices(chatbot.facts.length);
      setFactIndex(queueRef.current.shift()!);
    };

    const idle = setTimeout(() => {
      advance();
      setShowBubble(true);
      cycleRef.current = setInterval(advance, CYCLE_MS);
    }, 6000);

    return () => {
      clearTimeout(idle);
      if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    };
  }, [open, pathname]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    const history = messages.map(({ role, text: t }) => ({ role, text: t }));
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    try {
      const res = await fetch('/api/leo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'chat', input: text, system: chatbot.systemPrompt, history }),
      });
      const data = await res.json();
      const reply = data.text ?? "Leo's quiet right now -- try the Contact page!";
      setMessages((m) => [...m, { role: 'assistant', text: reply, links: extractLinks(reply) }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: "Leo can't connect right now. Try the Contact page!" }]);
    } finally {
      setTyping(false);
    }
  };

  const dismiss = () => {
    if (cycleRef.current) { clearInterval(cycleRef.current); cycleRef.current = null; }
    setShowBubble(false);
  };

  const fact = chatbot.facts[factIndex];
  const go = (route: string) => { router.push(route); setOpen(false); setShowBubble(false); };

  const panel = isDark
    ? 'bg-violet-night/95 border-white/15 text-pearl'
    : 'bg-white/95 border-gold/40 text-ink';

  return (
    <>
      {/* Idle teaser bubble */}
      <AnimatePresence>
        {showBubble && !open && fact && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`fixed bottom-28 right-6 z-50 hidden max-w-[260px] cursor-pointer select-none rounded-2xl rounded-br-none border border-gold shadow-[0_0_20px_rgba(245,166,35,0.45)] md:block ${isDark ? 'bg-violet-night/95 text-pearl' : 'bg-white/95 text-ink'}`}
            onClick={() => { dismiss(); fact.route ? go(fact.route) : setOpen(true); }}
          >
            {/* X dismiss */}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={(e) => { e.stopPropagation(); dismiss(); }}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-gray-800 text-gray-400 hover:bg-red-500 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>

            <div className="p-4 pb-3">
              {/* Header */}
              <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                <span className="text-lg">🦁</span> Leo says:
              </p>

              {/* Fact text — key drives fade-in on each new fact */}
              <p
                key={`text-${factIndex}`}
                className="mb-2 text-xs font-medium leading-relaxed"
                style={{ animation: 'leoFadeIn 0.4s ease-out' }}
              >
                {fact.text}
              </p>

              {/* Route label */}
              {fact.routeLabel && (
                <p className="mb-3 flex items-center gap-1 text-[10px] font-bold text-gold">
                  <ArrowRight className="h-3 w-3" /> {fact.routeLabel}
                </p>
              )}

              {/* Pagination dots */}
              <div className="mb-3 flex justify-center gap-1.5">
                {chatbot.facts.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${i === factIndex ? 'bg-gold' : 'bg-gold/30'}`}
                    style={{ width: i === factIndex ? '16px' : '6px', height: '6px' }}
                  />
                ))}
              </div>

              {/* Progress bar — key resets the shrink animation each cycle */}
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  key={`bar-${factIndex}`}
                  className="h-full bg-gold"
                  style={{ animation: `leoBubbleShrink ${CYCLE_MS}ms linear forwards`, width: '100%', transformOrigin: 'left' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher FAB */}
      <button
        type="button"
        aria-label={open ? 'Close Leo' : 'Open Leo, the guide'}
        onClick={() => { setOpen((o) => !o); setShowBubble(false); }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-xl text-ink shadow-glow transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : '🦁'}
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className={`fixed bottom-24 right-6 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border shadow-glow ${panel}`}
          >
            <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="text-lg">🦁</span>
              <div>
                <p className="text-sm font-semibold">Leo</p>
                <p className="text-[11px] opacity-60">UV Interactives guide</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-[10px] opacity-50">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Online
              </span>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <span
                    className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-gold text-ink'
                        : isDark ? 'bg-white/10' : 'bg-ink/5'
                    }`}
                  >
                    {m.text}
                  </span>
                  {m.links && m.links.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <button
                          key={l.route}
                          type="button"
                          onClick={() => go(l.route)}
                          className="inline-flex items-center gap-1 rounded-full border border-gold/50 px-2.5 py-1 text-xs font-medium text-gold hover:bg-gold/10"
                        >
                          {l.label} <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <p className="text-left text-sm opacity-50">Leo is typing…</p>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Leo anything…"
                aria-label="Message Leo"
                className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm placeholder:opacity-50 focus:border-gold/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={typing}
                aria-label="Send"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink disabled:opacity-50 focus:outline-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
