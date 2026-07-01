'use client';

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? '';
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? '';
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? '';

const field =
  'w-full rounded-lg border border-white/15 bg-white/[0.04] p-3 text-sm text-pearl placeholder-pearl/40 transition-colors focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20';

type Form = { name: string; email: string; subject: string; message: string };
const EMPTY: Form = { name: '', email: '', subject: '', message: '' };

/**
 * Contact form — sends via EmailJS REST (client-side; public keys only).
 * Submissions land in the studio inbox using the existing EmailJS template.
 */
export function ContactForm() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [polishing, setPolishing] = useState(false);

  // Rewrite the message via the server AI route (key stays server-side).
  const polish = async () => {
    if (!form.message.trim() || polishing) return;
    setPolishing(true);
    try {
      const res = await fetch('/api/leo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'polish', input: form.message }),
      });
      const data = await res.json();
      if (data.text) setForm((p) => ({ ...p, message: data.text }));
    } catch {
      /* keep original message on failure */
    } finally {
      setPolishing(false);
    }
  };

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: {
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
          },
        }),
      });
      if (!res.ok) throw new Error('send failed');
      setSent(true);
      setForm(EMPTY);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/30 bg-white/[0.03] py-16 text-center">
        <div className="mb-3 text-4xl">🛥️</div>
        <h3 className="text-xl font-semibold text-pearl">Message sent!</h3>
        <p className="mt-2 text-sm text-pearl/70">Thanks for reaching out — we’ll get back to you soon.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-medium text-gold hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          value={form.name}
          onChange={change}
          type="text"
          required
          placeholder="Your name"
          aria-label="Your name"
          className={field}
        />
        <input
          name="email"
          value={form.email}
          onChange={change}
          type="email"
          required
          placeholder="Your email"
          aria-label="Your email"
          className={field}
        />
      </div>
      <input
        name="subject"
        value={form.subject}
        onChange={change}
        type="text"
        required
        placeholder="Subject"
        aria-label="Subject"
        className={field}
      />
      <textarea
        name="message"
        value={form.message}
        onChange={change}
        rows={5}
        required
        placeholder="Tell us what you’re building or learning…"
        aria-label="Message"
        className={field}
      />

      {error ? (
        <p className="text-xs text-red-400">
          Something went wrong — please email us directly at the address on the right.
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={polish}
          disabled={polishing || !form.message.trim()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gold transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {polishing ? 'Polishing…' : 'Polish with AI'}
        </button>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
