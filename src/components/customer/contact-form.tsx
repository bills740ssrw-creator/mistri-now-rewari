"use client";

import { useState } from "react";
import { Check, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

const TOPICS = [
  "Booking help",
  "Payment or refund",
  "Warranty claim",
  "Worker application",
  "Report a safety issue",
  "Something else",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Add a few details so we can help.");
      return;
    }
    setSending(true);
    const subject = `[${topic}] Support request from ${name.trim()}`;
    const body = [
      `Name: ${name.trim()}`,
      `Phone: +91 ${phone}`,
      `Topic: ${topic}`,
      "",
      message.trim(),
      "",
      "Sent from the Mistri Now Rewari website.",
    ].join("\n");
    const mailto = `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      await navigator.clipboard.writeText(body).catch(() => undefined);
      window.location.href = mailto;
      setSent(true);
      toast.success("Opening your email app with the message ready to send.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start rounded-3xl border border-brand-200 bg-brand-50/60 p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
        <h2 className="mt-4 font-display text-[20px] font-bold text-ink-950">
          Your message is ready to send
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-600">
          We opened your email app with the details filled in. If nothing happened, email us directly
          at <a href={`mailto:${BRAND.email}`} className="font-semibold text-brand-700 underline underline-offset-2">{BRAND.email}</a>{" "}
          or call <a href={BRAND.phoneHref} className="font-semibold text-brand-700 underline underline-offset-2">{BRAND.phoneDisplay}</a>.
          The message was also copied to your clipboard.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={() => {
            setSent(false);
            setMessage("");
          }}
        >
          Write another message
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-brand-600" />
        <h2 className="font-display text-[19px] font-bold text-ink-950">Send us a message</h2>
      </div>
      <p className="mt-1 text-[12px] text-ink-500">
        This opens your email app — no account or app install needed. For urgent jobs, please call.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="mt-5 space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Your name" htmlFor="contact-name">
            <Input
              id="contact-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 60))}
              placeholder="Anjali Sharma"
              required
            />
          </Field>
          <Field label="Mobile number" htmlFor="contact-phone">
            <div className="flex items-center gap-2">
              <span className="flex h-12 shrink-0 items-center rounded-2xl border border-ink-200 bg-cream-100/60 px-3 text-[13px] font-semibold text-ink-700">
                +91
              </span>
              <Input
                id="contact-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                required
              />
            </div>
          </Field>
        </div>
        <Field label="What is this about?" htmlFor="contact-topic">
          <Select
            id="contact-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            {TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Message"
          htmlFor="contact-message"
          hint="Include your booking code (MRW-…) if you have one."
        >
          <Textarea
            id="contact-message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 800))}
            className="min-h-[120px]"
            placeholder="Tell us what happened and how we can help."
            required
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="brand" size="md" disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Prepare message
          </Button>
          <p className="text-[10.5px] text-ink-400">
            We reply within one business day. Support hours 7 AM – 9 PM.
          </p>
        </div>
      </form>
    </div>
  );
}
