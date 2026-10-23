export type Role = "customer" | "worker" | "admin";

export type AccountStatus = "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";

export type BookingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ON_THE_WAY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ServiceCategory =
  | "plumbing"
  | "electrical"
  | "appliance"
  | "cooling"
  | "fabrication";

export type PaymentMethod = "UPI" | "COD";

export type PaymentStatus = "PENDING" | "PAID";

export type ServiceIcon =
  | "wrench"
  | "zap"
  | "droplets"
  | "washing-machine"
  | "flame"
  | "filter"
  | "snowflake"
  | "wind";

export interface Profile {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: Role;
  status: AccountStatus;
  serviceCategory: ServiceCategory | null;
  isOnline: boolean;
  rating: number;
  jobsCompleted: number;
  avatarUrl: string | null;
  termsAcceptedAt: string | null;
  createdAt: string;
}

export interface Service {
  id: string;
  title: string;
  price: number;
  description: string;
  category: ServiceCategory;
  badge: string | null;
  icon: ServiceIcon;
  durationMins: number;
  isActive: boolean;
  createdAt: string;
}

export interface WorkerDocument {
  id: string;
  workerId: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface IssueMedia {
  name: string;
  type: string;
  url: string;
}

export interface Booking {
  id: string;
  code: string;
  customerId: string;
  workerId: string | null;
  serviceId: string;
  status: BookingStatus;
  address: string;
  baseAmount: number;
  totalAmount: number;
  scheduledTime: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  notes: string | null;
  issueMedia: IssueMedia[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Only exposed to the booking's customer and admins. */
  startOtp?: string | null;
  endOtp?: string | null;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
}

export interface BookingDetail {
  booking: Booking;
  service: Service;
  customer: Pick<Profile, "id" | "fullName" | "phone">;
  worker: Pick<
    Profile,
    "id" | "fullName" | "phone" | "rating" | "jobsCompleted" | "avatarUrl" | "serviceCategory"
  > | null;
  items: BookingItem[];
}

export interface EarningSummary {
  today: number;
  week: number;
  month: number;
  lifetime: number;
  completedJobs: number;
  averageTicket: number;
  daily: { date: string; label: string; amount: number }[];
}

export interface AdminStats {
  revenue: { today: number; month: number; lifetime: number };
  activeBookings: number;
  totalBookings: number;
  completedBookings: number;
  registeredWorkers: number;
  activeWorkers: number;
  onlineWorkers: number;
  pendingApprovals: number;
  customers: number;
  averageTicket: number;
  completionRate: number;
  daily: { date: string; label: string; orders: number; revenue: number }[];
  statusBreakdown: { status: BookingStatus; count: number }[];
}

export interface WorkerEarningsRow {
  bookingId: string;
  code: string;
  serviceTitle: string;
  completedAt: string;
  amount: number;
}

export interface CreateBookingInput {
  serviceId: string;
  address: string;
  scheduledTime: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  issueMedia?: IssueMedia[];
}

export interface CreateWorkerInput {
  fullName: string;
  phone: string;
  serviceCategory: ServiceCategory;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  termsAccepted: boolean;
  email?: string;
}

export interface CreateCustomerInput {
  fullName: string;
  phone: string;
  email?: string;
  termsAccepted: boolean;
}

export interface ServiceInput {
  title: string;
  price: number;
  description: string;
  category: ServiceCategory;
  badge?: string | null;
  icon: ServiceIcon;
  durationMins: number;
  isActive: boolean;
}

export interface OrdersQuery {
  status?: BookingStatus | "ALL";
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
