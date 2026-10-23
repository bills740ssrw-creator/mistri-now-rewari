import type {
  AccountStatus,
  Booking,
  BookingDetail,
  BookingStatus,
  IssueMedia,
  PaymentMethod,
  PaymentStatus,
  Profile,
  Role,
  Service,
  ServiceCategory,
  ServiceIcon,
  VerificationStatus,
  WorkerDocument,
} from "@/lib/types";

export interface ProfileRow {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string;
  role: Role;
  status: AccountStatus;
  service_category: string | null;
  is_online: boolean;
  rating: number | string | null;
  jobs_completed: number | null;
  avatar_url: string | null;
  terms_accepted_at: string | null;
  created_at: string;
}

export interface ServiceRow {
  id: string;
  title: string;
  price: number | string;
  description: string;
  category: string;
  badge: string | null;
  icon: string;
  duration_mins: number;
  is_active: boolean;
  created_at: string;
}

export interface BookingRow {
  id: string;
  code: string;
  customer_id: string;
  worker_id: string | null;
  service_id: string;
  status: BookingStatus;
  address: string;
  base_amount: number | string;
  total_amount: number | string;
  scheduled_time: string;
  created_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  notes: string | null;
  issue_media: unknown;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  services?: ServiceRow | null;
  customer?: Pick<ProfileRow, "id" | "full_name" | "phone"> | null;
  worker?:
    | (Pick<
        ProfileRow,
        "id" | "full_name" | "phone" | "rating" | "jobs_completed" | "avatar_url" | "service_category"
      > & { full_name: string })
    | null;
  items?: BookingItemRow[] | null;
}

export interface BookingItemRow {
  id: string;
  booking_id: string;
  name: string;
  quantity: number;
  unit_price: number | string;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  worker_id: string;
  aadhaar_front_url: string;
  aadhaar_back_url: string;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  created_at: string;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    phone: row.phone ?? "",
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    status: row.status,
    serviceCategory: (row.service_category as ServiceCategory | null) ?? null,
    isOnline: Boolean(row.is_online),
    rating: Number(row.rating ?? 0),
    jobsCompleted: Number(row.jobs_completed ?? 0),
    avatarUrl: row.avatar_url,
    termsAcceptedAt: row.terms_accepted_at,
    createdAt: row.created_at,
  };
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    description: row.description,
    category: row.category as ServiceCategory,
    badge: row.badge,
    icon: row.icon as ServiceIcon,
    durationMins: row.duration_mins,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function mapDocument(row: DocumentRow): WorkerDocument {
  return {
    id: row.id,
    workerId: row.worker_id,
    aadhaarFrontUrl: row.aadhaar_front_url,
    aadhaarBackUrl: row.aadhaar_back_url,
    verificationStatus: row.verification_status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}

export function mapIssueMedia(value: unknown): IssueMedia[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "Attachment",
      type: typeof item.type === "string" ? item.type : "image/jpeg",
      url: typeof item.url === "string" ? item.url : "",
    }))
    .filter((item) => item.url.length > 0);
}

export function mapBookingRow(
  row: BookingRow,
  otps?: { start_otp: string; end_otp: string } | null,
): Booking {
  return {
    id: row.id,
    code: row.code,
    customerId: row.customer_id,
    workerId: row.worker_id,
    serviceId: row.service_id,
    status: row.status,
    address: row.address,
    baseAmount: Number(row.base_amount),
    totalAmount: Number(row.total_amount),
    scheduledTime: row.scheduled_time,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    cancelledReason: row.cancelled_reason,
    notes: row.notes,
    issueMedia: mapIssueMedia(row.issue_media),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    startOtp: otps?.start_otp ?? null,
    endOtp: otps?.end_otp ?? null,
  };
}

export function mapBookingDetail(
  row: BookingRow,
  otps?: { start_otp: string; end_otp: string } | null,
): BookingDetail | null {
  if (!row.services) return null;
  return {
    booking: mapBookingRow(row, otps),
    service: mapService(row.services),
    customer: {
      id: row.customer?.id ?? row.customer_id,
      // Customer identity is only exposed once a worker is assigned (RLS).
      fullName: row.customer?.full_name ?? "Mistri Now customer",
      phone: row.customer?.phone ?? "",
    },
    worker: row.worker
      ? {
          id: row.worker.id,
          fullName: row.worker.full_name,
          phone: row.worker.phone ?? "",
          rating: Number(row.worker.rating ?? 0),
          jobsCompleted: Number(row.worker.jobs_completed ?? 0),
          avatarUrl: row.worker.avatar_url,
          serviceCategory: (row.worker.service_category as ServiceCategory | null) ?? null,
        }
      : null,
    items: (row.items ?? [])
      .map((item) => ({
        id: item.id,
        bookingId: item.booking_id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        createdAt: item.created_at,
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

export const BOOKING_SELECT = `
  id, code, customer_id, worker_id, service_id, status, address, base_amount, total_amount,
  scheduled_time, created_at, completed_at, cancelled_at, cancelled_reason, notes,
  issue_media, payment_method, payment_status,
  services:services(*),
  customer:profiles!bookings_customer_id_fkey(id, full_name, phone),
  worker:profiles!bookings_worker_id_fkey(id, full_name, phone, rating, jobs_completed, avatar_url, service_category),
  items:booking_items(*)
`;
