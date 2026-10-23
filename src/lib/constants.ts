import type {
  BookingStatus,
  ServiceCategory,
  ServiceIcon,
} from "@/lib/types";

export const BRAND = {
  name: "Mistri Now Rewari",
  shortName: "Mistri Now",
  legalName: "Lakshya Yadav Enterprises",
  legalLine: "A unit of Lakshya Yadav Enterprises",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "8307121221",
  phoneDisplay: "+91 83071 21221",
  phoneHref: "tel:+918307121221",
  whatsapp: "https://wa.me/918307121221",
  email: "support@mistrinow.in",
  adminEmail: "admin@mistrinow.in",
  city: "Rewari",
  state: "Haryana",
  pincode: "123401",
  address: "Rewari, Haryana 123401",
  hours: "7:00 AM to 9:00 PM, all 7 days",
  upiId: process.env.NEXT_PUBLIC_UPI_ID ?? "mistrinowrewari@upi",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100",
} as const;

export const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; short: string; tint: string; ring: string }
> = {
  plumbing: {
    label: "Plumbing",
    short: "Plumber",
    tint: "from-sky-500/15 to-sky-500/5 text-sky-700",
    ring: "ring-sky-500/20",
  },
  electrical: {
    label: "Electrical",
    short: "Electrician",
    tint: "from-amber-500/18 to-amber-500/5 text-amber-700",
    ring: "ring-amber-500/20",
  },
  appliance: {
    label: "Appliances",
    short: "Appliance repair",
    tint: "from-violet-500/15 to-violet-500/5 text-violet-700",
    ring: "ring-violet-500/20",
  },
  cooling: {
    label: "Cooling",
    short: "AC & cooling",
    tint: "from-emerald-500/15 to-emerald-500/5 text-emerald-700",
    ring: "ring-emerald-500/20",
  },
  fabrication: {
    label: "Fabrication",
    short: "Welding",
    tint: "from-orange-500/15 to-orange-500/5 text-orange-700",
    ring: "ring-orange-500/20",
  },
};

export const CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "plumbing", label: "Plumber" },
  { value: "electrical", label: "Electrician" },
  { value: "cooling", label: "AC / RO Technician" },
  { value: "appliance", label: "Appliance Repair" },
  { value: "fabrication", label: "Welder / Fabricator" },
];

export const SERVICE_ICON_KEYS: ServiceIcon[] = [
  "wrench",
  "zap",
  "droplets",
  "washing-machine",
  "flame",
  "filter",
  "snowflake",
  "wind",
];

export const STATUS_META: Record<
  BookingStatus,
  {
    label: string;
    customerLabel: string;
    description: string;
    tone: string;
    dot: string;
    step: number | null;
  }
> = {
  PENDING: {
    label: "Pending",
    customerLabel: "Booking confirmed",
    description: "We are assigning the closest verified professional.",
    tone: "bg-amber-50 text-amber-800 ring-amber-600/15",
    dot: "bg-amber-500",
    step: 0,
  },
  ASSIGNED: {
    label: "Assigned",
    customerLabel: "Partner assigned",
    description: "Your professional has accepted the job.",
    tone: "bg-sky-50 text-sky-800 ring-sky-600/15",
    dot: "bg-sky-500",
    step: 1,
  },
  ON_THE_WAY: {
    label: "On the way",
    customerLabel: "On the way",
    description: "Your professional is heading to your address.",
    tone: "bg-indigo-50 text-indigo-800 ring-indigo-600/15",
    dot: "bg-indigo-500",
    step: 2,
  },
  IN_PROGRESS: {
    label: "In progress",
    customerLabel: "Work started",
    description: "The job is underway at your address.",
    tone: "bg-violet-50 text-violet-800 ring-violet-600/15",
    dot: "bg-violet-500",
    step: 2,
  },
  COMPLETED: {
    label: "Completed",
    customerLabel: "Completed",
    description: "Job completed. Your 7-day warranty is now active.",
    tone: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
    dot: "bg-emerald-500",
    step: 3,
  },
  CANCELLED: {
    label: "Cancelled",
    customerLabel: "Cancelled",
    description: "This booking was cancelled.",
    tone: "bg-rose-50 text-rose-800 ring-rose-600/15",
    dot: "bg-rose-500",
    step: null,
  },
};

export const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "ASSIGNED",
  "ON_THE_WAY",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const TIMELINE_STEPS = [
  { key: "PENDING", label: "Booking confirmed", icon: "check" },
  { key: "ASSIGNED", label: "Partner assigned", icon: "user" },
  { key: "ON_THE_WAY", label: "On the way", icon: "navigation" },
  { key: "COMPLETED", label: "Completed", icon: "sparkles" },
] as const;

export const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = 7 + i;
  return {
    value: `${String(hour).padStart(2, "0")}:00`,
    label: `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? "AM" : "PM"}`,
    hour,
  };
});

export const MAX_ADVANCE_DAYS = 14;

export const DEMO_OTP = "123456";
export const DEMO_ADMIN_EMAIL = "admin@mistrinow.in";
export const DEMO_ADMIN_PASSWORD = "Admin@123";

export const DEMO_ACCOUNTS = [
  {
    role: "customer" as const,
    label: "Customer",
    name: "Anjali Sharma",
    phone: "9876543210",
    hint: "Bookings, live tracking, payments",
  },
  {
    role: "worker" as const,
    label: "Verified worker",
    name: "Imran Khan",
    phone: "9812345672",
    hint: "Live jobs, OTP, earnings",
  },
  {
    role: "worker" as const,
    label: "Pending worker",
    name: "Mahesh Chand",
    phone: "9812345675",
    hint: "See the approval holding screen",
  },
  {
    role: "admin" as const,
    label: "Admin",
    name: "Platform admin",
    phone: DEMO_ADMIN_EMAIL,
    hint: "Approvals, orders, pricing",
  },
];

export const SERVICE_SEED = [
  {
    title: "Plumber",
    price: 350,
    description: "Tap, leak, fitting and blockage fixes by a verified plumber.",
    category: "plumbing" as ServiceCategory,
    badge: null,
    icon: "wrench" as ServiceIcon,
    durationMins: 60,
  },
  {
    title: "Electrician",
    price: 199,
    description: "Switch, socket, fan, MCB and wiring repairs. Parts extra.",
    category: "electrical" as ServiceCategory,
    badge: "Same-day",
    icon: "zap" as ServiceIcon,
    durationMins: 45,
  },
  {
    title: "RO Service",
    price: 299,
    description: "Full RO service — TDS check, filter cleaning and sanitisation.",
    category: "cooling" as ServiceCategory,
    badge: null,
    icon: "droplets" as ServiceIcon,
    durationMins: 60,
  },
  {
    title: "Washing Machine",
    price: 300,
    description: "Top-load and front-load repair, installation and demo.",
    category: "appliance" as ServiceCategory,
    badge: null,
    icon: "washing-machine" as ServiceIcon,
    durationMins: 60,
  },
  {
    title: "Welding",
    price: 300,
    description: "Grill, gate, railing and on-site fabrication work.",
    category: "fabrication" as ServiceCategory,
    badge: null,
    icon: "flame" as ServiceIcon,
    durationMins: 90,
  },
  {
    title: "RO Filter",
    price: 350,
    description: "Genuine filter replacement with a 7-day fitment warranty.",
    category: "cooling" as ServiceCategory,
    badge: null,
    icon: "filter" as ServiceIcon,
    durationMins: 45,
  },
  {
    title: "AC Service",
    price: 499,
    description: "Deep clean, gas pressure check and cooling performance tune-up.",
    category: "cooling" as ServiceCategory,
    badge: "Bestseller",
    icon: "snowflake" as ServiceIcon,
    durationMins: 75,
  },
  {
    title: "AC Gas Filling",
    price: 3399,
    description: "Complete gas top-up with leak test and 30-day performance warranty.",
    category: "cooling" as ServiceCategory,
    badge: "Most Popular",
    icon: "wind" as ServiceIcon,
    durationMins: 120,
  },
];
