"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_OPTIONS, DEMO_ACCOUNTS, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/constants";
import type { ServiceCategory } from "@/lib/types";
import {
  adminLoginAction,
  completeCustomerSignupAction,
  completeWorkerSignupAction,
  requestOtpAction,
  uploadWorkerDocAction,
  verifyOtpAction,
} from "@/lib/auth/actions";
import { compressImageFile } from "@/lib/client/image";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Step = "phone" | "otp" | "role" | "customer" | "worker" | "admin";

export function AuthFlow({ next, demo }: { next?: string; demo: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(demo ? "123456" : null);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  function go(path: string) {
    router.push(path);
    router.refresh();
  }

  async function sendOtp(resend = false) {
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await requestOtpAction({ phone });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.demoOtp) setDemoOtp(result.demoOtp);
      setStep("otp");
      setCooldown(30);
      toast.success(resend ? "A fresh OTP is on its way." : result.message);
    } finally {
      setPending(false);
    }
  }

  async function verify() {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await verifyOtpAction({ phone, token: otp, next });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!result.needsOnboarding) {
        toast.success("Welcome back.");
        go(result.redirectTo);
        return;
      }
      toast.success("Number verified. One quick step.");
      setStep("role");
    } finally {
      setPending(false);
    }
  }

  async function demoLogin(accountPhone: string, isAdmin = false) {
    setPending(true);
    setError(null);
    try {
      if (isAdmin) {
        const result = await adminLoginAction({
          email: DEMO_ADMIN_EMAIL,
          password: DEMO_ADMIN_PASSWORD,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        toast.success("Signed in as the platform admin.");
        go(result.redirectTo);
        return;
      }
      const result = await verifyOtpAction({ phone: accountPhone, token: "123456", next });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.needsOnboarding) {
        setPhone(accountPhone);
        setStep("role");
        return;
      }
      toast.success("Signed in with a demo account.");
      go(result.redirectTo);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex rounded-full border border-ink-200 bg-white p-1">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("phone");
          }}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-[12.5px] font-semibold transition",
            step !== "admin" ? "bg-ink-950 text-cream-50" : "text-ink-500 hover:text-ink-900",
          )}
        >
          Customer / worker
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("admin");
          }}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-[12.5px] font-semibold transition",
            step === "admin" ? "bg-ink-950 text-cream-50" : "text-ink-500 hover:text-ink-900",
          )}
        >
          Admin login
        </button>
      </div>

      <div key={step} className="mt-6 animate-[fade-up_.3s_cubic-bezier(.16,1,.3,1)]">
        {step === "phone" ? (
          <PhoneStep
            phone={phone}
            setPhone={setPhone}
            pending={pending}
            error={error}
            onSubmit={() => sendOtp(false)}
          />
        ) : null}

        {step === "otp" ? (
          <OtpStep
            phone={phone}
            otp={otp}
            setOtp={setOtp}
            pending={pending}
            error={error}
            cooldown={cooldown}
            demoOtp={demoOtp}
            otpRef={otpRef}
            onVerify={verify}
            onResend={() => sendOtp(true)}
            onBack={() => {
              setOtp("");
              setError(null);
              setStep("phone");
            }}
          />
        ) : null}

        {step === "role" ? (
          <RoleStep
            onPick={(role) => {
              setError(null);
              setStep(role === "worker" ? "worker" : "customer");
            }}
            onBack={() => {
              setError(null);
              setStep("otp");
            }}
          />
        ) : null}

        {step === "customer" ? (
          <CustomerStep
            phone={phone}
            pending={pending}
            error={error}
            setPending={setPending}
            setError={setError}
            onDone={go}
            onBack={() => {
              setError(null);
              setStep("role");
            }}
          />
        ) : null}

        {step === "worker" ? (
          <WorkerStep
            phone={phone}
            pending={pending}
            error={error}
            setPending={setPending}
            setError={setError}
            onDone={go}
            onBack={() => {
              setError(null);
              setStep("role");
            }}
          />
        ) : null}

        {step === "admin" ? (
          <AdminStep
            pending={pending}
            error={error}
            setPending={setPending}
            setError={setError}
            onDone={go}
            demo={demo}
          />
        ) : null}
      </div>

      {demo && step !== "admin" ? (
        <div className="mt-7 rounded-2xl border border-dashed border-saffron-300 bg-saffron-50/60 p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-saffron-800">
            <Sparkles className="h-3 w-3" /> Demo shortcuts
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-saffron-900/70">
            Jump straight into a seeded account. OTP is always 123456 in this build.
          </p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.phone + account.role}
                type="button"
                disabled={pending}
                onClick={() => demoLogin(account.phone, account.role === "admin")}
                className="flex items-center justify-between gap-2 rounded-xl border border-saffron-200 bg-white px-3 py-2 text-left transition hover:border-saffron-400 disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-ink-900">
                    {account.name}
                  </span>
                  <span className="block truncate text-[10.5px] text-ink-500">
                    {account.label} · {account.phone}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-400">
        By continuing you agree to our{" "}
        <Link href="/terms" className="font-medium text-ink-600 underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-medium text-ink-600 underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function StepHeading({ title, copy }: { title: string; copy: ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-ink-950">
        {title}
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{copy}</p>
    </div>
  );
}

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700" role="alert">
      {error}
    </p>
  );
}

function PhoneStep({
  phone,
  setPhone,
  pending,
  error,
  onSubmit,
}: {
  phone: string;
  setPhone: (value: string) => void;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <>
      <StepHeading
        title="Your home, handled."
        copy="Sign in with your mobile number. New here? We'll set up your profile in under a minute."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <Field label="Mobile number" htmlFor="auth-phone">
          <div className="flex items-center gap-2">
            <span className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl border border-ink-200 bg-cream-100/60 px-3 text-[14px] font-semibold text-ink-700">
              <Phone className="h-4 w-4 text-ink-400" /> +91
            </span>
            <Input
              id="auth-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              className="tracking-wide"
              required
            />
          </div>
        </Field>
        <ErrorNote error={error} />
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP…
            </>
          ) : (
            <>
              Send OTP <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream-100/70 p-3.5 text-[11.5px] leading-relaxed text-ink-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        We only use your number for booking updates and OTP sign-in. No marketing spam, ever.
      </div>

      <div className="mt-6 border-t border-ink-100 pt-5">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-900">
          <Wrench className="h-4 w-4 text-brand-600" /> Are you a mistri?
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
          Verify your number, add your Aadhaar and start accepting jobs after approval. Choose{" "}
          <span className="font-semibold text-ink-700">“I&apos;m a professional”</span> on the next
          step.
        </p>
      </div>
    </>
  );
}

function OtpStep({
  phone,
  otp,
  setOtp,
  pending,
  error,
  cooldown,
  demoOtp,
  otpRef,
  onVerify,
  onResend,
  onBack,
}: {
  phone: string;
  otp: string;
  setOtp: (value: string) => void;
  pending: boolean;
  error: string | null;
  cooldown: number;
  demoOtp: string | null;
  otpRef: React.RefObject<HTMLInputElement | null>;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <StepHeading
        title="Enter the code"
        copy={
          <>
            We sent a 6-digit OTP to <span className="font-semibold text-ink-800">+91 {phone}</span>.
          </>
        }
      />
      {demoOtp ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 px-3.5 py-2.5">
          <p className="text-[12px] text-saffron-900">
            Demo OTP: <span className="font-mono font-bold">{demoOtp}</span>
          </p>
          <button
            type="button"
            onClick={() => setOtp(demoOtp)}
            className="rounded-full bg-saffron-400 px-3 py-1 text-[11px] font-bold text-ink-950"
          >
            Autofill
          </button>
        </div>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onVerify();
        }}
        className="space-y-4"
      >
        <Field label="6-digit code" htmlFor="auth-otp">
          <Input
            id="auth-otp"
            ref={otpRef}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className="h-14 text-center font-mono text-[22px] tracking-[0.45em]"
            maxLength={6}
            required
          />
        </Field>
        <ErrorNote error={error} />
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              Verify &amp; continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-[12px]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-medium text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Change number
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || pending}
          className="inline-flex items-center gap-1 font-semibold text-brand-700 transition disabled:text-ink-400"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
      </div>
    </>
  );
}

function RoleStep({
  onPick,
  onBack,
}: {
  onPick: (role: "customer" | "worker") => void;
  onBack: () => void;
}) {
  return (
    <>
      <StepHeading
        title="How will you use Mistri Now?"
        copy="Choose how you'd like to get started. You can add the other role later with support."
      />
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => onPick("customer")}
          className="group flex w-full items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 text-left transition hover:border-brand-400 hover:shadow-soft"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <UserRound className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-bold text-ink-900">I need a service</span>
            <span className="block text-[12px] text-ink-500">
              Book plumbers, electricians, AC and RO technicians.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </button>
        <button
          type="button"
          onClick={() => onPick("worker")}
          className="group flex w-full items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 text-left transition hover:border-brand-400 hover:shadow-soft"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-700">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-bold text-ink-900">I&apos;m a professional</span>
            <span className="block text-[12px] text-ink-500">
              Get verified, receive jobs and track earnings.
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </button>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
    </>
  );
}

function CustomerStep({
  phone,
  pending,
  error,
  setPending,
  setError,
  onDone,
  onBack,
}: {
  phone: string;
  pending: boolean;
  error: string | null;
  setPending: (value: boolean) => void;
  setError: (value: string | null) => void;
  onDone: (path: string) => void;
  onBack: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const result = await completeCustomerSignupAction({
        fullName,
        phone,
        email: email.trim() || undefined,
        termsAccepted: terms,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Account created. Let's get your first job booked.");
      onDone(result.redirectTo);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <StepHeading
        title="Tell us your name"
        copy="This is what your professional sees when you book. Your number is already verified."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <Field label="Full name" htmlFor="customer-name">
          <Input
            id="customer-name"
            autoComplete="name"
            placeholder="e.g. Anjali Sharma"
            value={fullName}
            onChange={(event) => setFullName(event.target.value.slice(0, 60))}
            required
          />
        </Field>
        <Field label="Email" htmlFor="customer-email" optional hint="For receipts and warranty reminders.">
          <Input
            id="customer-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Checkbox
          checked={terms}
          onChange={(event) => setTerms(event.target.checked)}
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-ink-900 underline underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-ink-900 underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
        <ErrorNote error={error} />
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={pending || !terms}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create my account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
    </>
  );
}

function WorkerStep({
  phone,
  pending,
  error,
  setPending,
  setError,
  onDone,
  onBack,
}: {
  phone: string;
  pending: boolean;
  error: string | null;
  setPending: (value: boolean) => void;
  setError: (value: string | null) => void;
  onDone: (path: string) => void;
  onBack: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [terms, setTerms] = useState(false);
  const [front, setFront] = useState<{ path: string; preview: string } | null>(null);
  const [back, setBack] = useState<{ path: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState<"front" | "back" | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  async function handleDoc(side: "front" | "back", file?: File) {
    if (!file) return;
    setUploading(side);
    try {
      const dataUrl = await compressImageFile(file, { maxDim: 1400, quality: 0.8 });
      const result = await uploadWorkerDocAction({ dataUrl, side });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const payload = { path: result.path, preview: dataUrl };
      if (side === "front") setFront(payload);
      else setBack(payload);
      toast.success(`${side === "front" ? "Front" : "Back"} side uploaded.`);
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function submit() {
    if (!front || !back) {
      setError("Upload both sides of your Aadhaar.");
      return;
    }
    if (!category) {
      setError("Choose the trade you work in.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await completeWorkerSignupAction({
        fullName,
        phone,
        serviceCategory: category,
        termsAccepted: terms,
        aadhaarFrontUrl: front.path,
        aadhaarBackUrl: back.path,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Application submitted. We'll review it within 24 hours.");
      onDone(result.redirectTo);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <StepHeading
        title="Join as a verified professional"
        copy="Aadhaar verification keeps customers safe and gets you more jobs. Approval usually takes under 24 hours."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <Field label="Full name (as on Aadhaar)" htmlFor="worker-name">
          <Input
            id="worker-name"
            autoComplete="name"
            placeholder="e.g. Imran Khan"
            value={fullName}
            onChange={(event) => setFullName(event.target.value.slice(0, 60))}
            required
          />
        </Field>
        <Field label="Your trade" htmlFor="worker-trade">
          <Select
            id="worker-trade"
            value={category}
            onChange={(event) => setCategory(event.target.value as ServiceCategory)}
            required
          >
            <option value="">Select a trade</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <div>
          <p className="text-[13px] font-semibold text-ink-800">Aadhaar card</p>
          <p className="text-[11px] text-ink-400">
            Stored privately. Only our verification team can view it.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <DocTile
              label="Front side"
              preview={front?.preview}
              busy={uploading === "front"}
              onClick={() => frontRef.current?.click()}
            />
            <DocTile
              label="Back side"
              preview={back?.preview}
              busy={uploading === "back"}
              onClick={() => backRef.current?.click()}
            />
          </div>
          <input
            ref={frontRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void handleDoc("front", event.target.files?.[0])}
          />
          <input
            ref={backRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => void handleDoc("back", event.target.files?.[0])}
          />
        </div>

        <Checkbox
          checked={terms}
          onChange={(event) => setTerms(event.target.checked)}
          label={
            <>
              I confirm the documents are mine and agree to the{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-ink-900 underline underline-offset-2">
                Terms
              </Link>
              , including the code of conduct and 7-day warranty policy.
            </>
          }
        />
        <ErrorNote error={error} />
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          disabled={pending || !terms || uploading !== null}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Submit for verification <BadgeCheck className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
    </>
  );
}

function DocTile({
  label,
  preview,
  busy,
  onClick,
}: {
  label: string;
  preview?: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-[104px] flex-col items-center justify-center overflow-hidden rounded-2xl border text-center transition",
        preview
          ? "border-brand-300 bg-brand-50/40"
          : "border-dashed border-ink-300 bg-white hover:border-brand-400 hover:bg-brand-50/30",
      )}
    >
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`${label} preview`} className="h-full w-full object-cover" />
          <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold text-brand-700">
            <Check className="h-2.5 w-2.5" /> Uploaded
          </span>
        </>
      ) : busy ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          <span className="mt-1 text-[10.5px] text-ink-500">Uploading…</span>
        </>
      ) : (
        <>
          <Upload className="h-5 w-5 text-ink-400" />
          <span className="mt-1 text-[11.5px] font-semibold text-ink-700">{label}</span>
          <span className="text-[9.5px] text-ink-400">JPG, PNG · max 2.5 MB</span>
        </>
      )}
    </button>
  );
}

function AdminStep({
  pending,
  error,
  setPending,
  setError,
  onDone,
  demo,
}: {
  pending: boolean;
  error: string | null;
  setPending: (value: boolean) => void;
  setError: (value: string | null) => void;
  onDone: (path: string) => void;
  demo: boolean;
}) {
  const [email, setEmail] = useState(demo ? DEMO_ADMIN_EMAIL : "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const result = await adminLoginAction({ email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Signed in as admin.");
      onDone(result.redirectTo);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <StepHeading
        title="Admin control room"
        copy="Restricted access for the Mistri Now operations team."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <Field label="Admin email" htmlFor="admin-email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="pl-10"
              placeholder="admin@mistrinow.in"
              required
            />
          </div>
        </Field>
        <Field label="Password" htmlFor="admin-password">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              id="admin-password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pl-10 pr-11"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 hover:text-ink-700"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <ErrorNote error={error} />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" /> Enter dashboard
            </>
          )}
        </Button>
      </form>
      {demo ? (
        <p className="mt-4 rounded-xl bg-cream-100/80 px-3 py-2.5 text-center text-[11.5px] text-ink-500">
          Demo credentials pre-filled — password is{" "}
          <span className="font-mono font-semibold text-ink-800">{DEMO_ADMIN_PASSWORD}</span>
        </p>
      ) : null}
    </>
  );
}
