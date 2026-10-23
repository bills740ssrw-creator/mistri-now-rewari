"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Service, ServiceCategory, ServiceIcon as ServiceIconKey, ServiceInput } from "@/lib/types";
import { CATEGORY_META, CATEGORY_OPTIONS, SERVICE_ICON_KEYS } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import { saveServiceAction, toggleServiceAction } from "@/lib/actions/admin";
import { ServiceIcon } from "@/components/ui/service-icon";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export function ServiceManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(service: Service, active: boolean) {
    setBusyId(service.id);
    try {
      const result = await toggleServiceAction({ serviceId: service.id, active });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(active ? `${service.title} is live.` : `${service.title} hidden.`);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-ink-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <div>
          <h2 className="font-display text-[18px] font-bold text-ink-950">Services &amp; pricing</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-500">
            {services.filter((service) => service.isActive).length} live ·{" "}
            {services.filter((service) => !service.isActive).length} hidden
          </p>
        </div>
        <Button variant="brand" size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-3.5 w-3.5" /> Add service
        </Button>
      </div>

      <ul className="divide-y divide-ink-100">
        {services.map((service) => (
          <li key={service.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1",
                CATEGORY_META[service.category].tint,
                CATEGORY_META[service.category].ring,
              )}
            >
              <ServiceIcon name={service.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
                {service.title}
                {service.badge ? (
                  <span className="rounded-full bg-saffron-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-saffron-700">
                    {service.badge}
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-[10.5px] text-ink-400">
                <span>{CATEGORY_META[service.category].label}</span>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock3 className="h-2.5 w-2.5" /> {service.durationMins} min
                </span>
              </p>
            </div>
            <p className="w-20 text-right font-display text-[15px] font-extrabold text-ink-950">
              {formatINR(service.price)}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(service)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition hover:border-brand-300 hover:text-brand-700"
                aria-label={`Edit ${service.title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {busyId === service.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
              ) : (
                <Switch
                  checked={service.isActive}
                  onChange={(next) => toggle(service, next)}
                  label={`${service.isActive ? "Hide" : "Show"} ${service.title}`}
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      {editing ? (
        <ServiceEditor
          key={editing === "new" ? "new" : editing.id}
          service={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function ServiceEditor({
  service,
  onClose,
  onSaved,
}: {
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(service?.title ?? "");
  const [price, setPrice] = useState(service ? String(service.price) : "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [category, setCategory] = useState<ServiceCategory>(service?.category ?? "plumbing");
  const [icon, setIcon] = useState<ServiceIconKey>(service?.icon ?? "wrench");
  const [duration, setDuration] = useState(service ? String(service.durationMins) : "60");
  const [badge, setBadge] = useState(service?.badge ?? "");
  const [active, setActive] = useState(service?.isActive ?? true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const input: ServiceInput & { id?: string } = {
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        icon,
        durationMins: Number(duration),
        badge: badge.trim() || null,
        isActive: active,
      };
      if (service) input.id = service.id;
      const result = await saveServiceAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(service ? "Service updated." : "Service added.");
      onSaved();
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={service ? `Edit ${service.title}` : "Add a service"}
      description="Prices are the fixed visit charge shown on the storefront."
      size="md"
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" size="md" className="flex-1" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {service ? "Save changes" : "Add service"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_0.6fr]">
          <Field label="Service name" htmlFor="svc-title">
            <Input
              id="svc-title"
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, 60))}
              placeholder="e.g. Geyser Repair"
            />
          </Field>
          <Field label="Visit price (₹)" htmlFor="svc-price">
            <Input
              id="svc-price"
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="499"
            />
          </Field>
        </div>
        <Field label="Description" htmlFor="svc-desc">
          <Textarea
            id="svc-desc"
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 240))}
            className="min-h-[76px]"
            placeholder="What's included in the visit?"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Category" htmlFor="svc-cat">
            <Select
              id="svc-cat"
              value={category}
              onChange={(event) => setCategory(event.target.value as ServiceCategory)}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Duration (min)" htmlFor="svc-duration">
            <Input
              id="svc-duration"
              inputMode="numeric"
              value={duration}
              onChange={(event) => setDuration(event.target.value.replace(/\D/g, "").slice(0, 3))}
            />
          </Field>
          <Field label="Icon" htmlFor="svc-icon">
            <Select
              id="svc-icon"
              value={icon}
              onChange={(event) => setIcon(event.target.value as ServiceIconKey)}
            >
              {SERVICE_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key.replace("-", " ")}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field
          label="Badge"
          htmlFor="svc-badge"
          optional
          hint="Shown on the card, e.g. Bestseller or Most Popular."
        >
          <Input
            id="svc-badge"
            value={badge}
            onChange={(event) => setBadge(event.target.value.slice(0, 24))}
            placeholder="Bestseller"
          />
        </Field>
        <Checkbox
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          label="Show this service on the storefront"
        />
        {error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
