'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Send, X } from 'lucide-react';
// ponytail: direct data import -- Leo is a client-only singleton mounted in providers.tsx
// with no server boundary to inject through. Acceptable exception to the repository pattern.
import { chatbot } from '@/content/data/chatbot';
import { useTheme } from '@/shared/state/themeStore';

/**
 * Leo -- the lion-cub guide. Floating launcher + chat window.
 * Talks to the server route /api/leo (key stays server-side); degrades to an
 * honest offline message when the AI is unreachable.
 *
 * ponytail: link-chips, fact-cycling and idle-bubble are inlined here -- small
 * enough that separate hooks/util files would be more files, not less code.
 */

type ChatMsg = { role: 'user' | 'assistant'; text: string; links?: PageLink[] };
type PageLink = { route: string; label: string };

// Keyword -> route chips surfaced under an AI reply.
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
  const isDark = useTheme((s) => s.theme === 'dusk');

  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: randomIntro() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Allow the 3D LeoOrb (or anything) to open the chat.
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setShowBubble(false);
    };
    window.addEventListener('leo:open', handler);
    return () => window.removeEventListener('leo:open', handler);
  }, []);

  // Idle teaser bubble -- appears after inactivity, cycles facts. Hidden on
  // /lab and /games (already focused there) and when the window is open.
  useEffect(() => {
    if (open) return;
    if (pathname === '/lab' || pathname === '/games') return;
    let cycle: ReturnType<typeof setInterval>;
    const idle = setTimeout(() => {
      setFactIndex(Math.floor(Math.random() * chatbot.facts.length));
      setShowBubble(true);
      cycle = setInterval(
        () => setFactIndex((i) => (i + 1) % chatbot.facts.length),
        90_000,
      );
    }, 6000);
    return () => {
      clearTimeout(idle);
      clearInterval(cycle);
    };
  }, [open, pathname]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    try {
      const res = await fetch('/api/leo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'chat',
          input: text,
          system: chatbot.systemPrompt,
          history,
        }),
      });
      const data = await res.json();
      const reply = data.text ?? "Leo's quiet right now -- try the Contact page!";
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: reply, links: extractLinks(reply) },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: "Leo can't connect right now. Try the Contact page!" },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const fact = chatbot.facts[factIndex];
  const go = (route: string) => {
    router.push(route);
    setOpen(false);
    setShowBubble(false);
  };

  const panel = isDark
    ? 'bg-violet-night/95 border-white/15 text-pearl'
    : 'bg-white/95 border-gold/40 text-ink';

  return (
    <>
      {/* Idle teaser bubble */}
      <AnimatePresence>
        {showBubble && !open && fact && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => (fact.route ? go(fact.route) : setOpen(true))}
            className={`fixed bottom-28 right-6 z-50 hidden max-w-[260px] rounded-2xl rounded-br-none border p-4 text-left text-sm shadow-glow backdrop-blur-xl md:block ${panel}`}
          >
            {fact.text}
            {fact.routeLabel && (
              <span className="mt-2 flex items-center gap-1 font-semibold text-gold">
                {fact.routeLabel} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <button
        type="button"
        aria-label={open ? 'Close Leo' : 'Open Leo, the guide'}
        onClick={() => {
          setOpen((o) => !o);
          setShowBubble(false);
        }}
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
            className={`fixed bottom-24 right-6 z-50 flex h-[28rem] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border shadow-glow backdrop-blur-xl ${panel}`}
          >
            <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="text-lg">🦁</span>
              <div>
                <p className="text-sm font-semibold">Leo</p>
                <p className="text-[11px] opacity-60">UV Interactives guide</p>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <span
                    className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-gold text-ink'
                        : isDark
                          ? 'bg-white/10'
                          : 'bg-ink/5'
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
                <p className="text-left text-sm opacity-50">Leo is typing...</p>
              )}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Leo anything..."
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
