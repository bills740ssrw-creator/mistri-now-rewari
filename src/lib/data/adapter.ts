import type {
  AccountStatus,
  AdminStats,
  Booking,
  BookingDetail,
  BookingStatus,
  CreateBookingInput,
  CreateCustomerInput,
  CreateWorkerInput,
  EarningSummary,
  OrdersQuery,
  Paginated,
  Profile,
  Role,
  Service,
  ServiceInput,
  WorkerDocument,
  WorkerEarningsRow,
} from "@/lib/types";

export interface BookingViewer {
  id: string;
  role: Role;
}

export interface WorkerApprovalItem {
  worker: Profile;
  document: WorkerDocument | null;
}

export interface DataAdapter {
  /* Profiles */
  getProfileById(id: string): Promise<Profile | null>;
  getProfileByPhone(phone: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  listWorkers(status?: AccountStatus): Promise<Profile[]>;
  createCustomerProfile(userId: string, input: CreateCustomerInput): Promise<Profile>;
  createWorkerProfile(userId: string, input: CreateWorkerInput): Promise<Profile>;
  setWorkerOnline(workerId: string, online: boolean): Promise<void>;
  setWorkerApproved(workerId: string): Promise<void>;
  setWorkerRejected(workerId: string, reason: string): Promise<void>;
  listPendingWorkers(): Promise<WorkerApprovalItem[]>;
  getWorkerDocument(workerId: string): Promise<WorkerDocument | null>;
  countProfiles(role: Role): Promise<number>;

  /* Services */
  listServices(activeOnly?: boolean): Promise<Service[]>;
  getService(id: string): Promise<Service | null>;
  saveService(input: ServiceInput & { id?: string }): Promise<Service>;
  setServiceActive(id: string, active: boolean): Promise<void>;

  /* Bookings */
  createBooking(customerId: string, input: CreateBookingInput): Promise<Booking>;
  getBookingDetail(id: string, viewer: BookingViewer): Promise<BookingDetail | null>;
  listCustomerBookings(customerId: string): Promise<BookingDetail[]>;
  listWorkerBookings(workerId: string): Promise<BookingDetail[]>;
  listOpenJobs(category: string | null): Promise<BookingDetail[]>;
  acceptJob(bookingId: string, workerId: string): Promise<Booking>;
  moveToOnTheWay(bookingId: string, workerId: string): Promise<Booking>;
  verifyAndAdvance(
    bookingId: string,
    workerId: string,
    kind: "start" | "end",
    code: string,
  ): Promise<{ ok: boolean; error?: string; booking?: Booking }>;
  addBookingItem(
    bookingId: string,
    workerId: string,
    item: { name: string; quantity: number; unitPrice: number },
  ): Promise<void>;
  cancelBooking(bookingId: string, customerId: string, reason: string): Promise<void>;
  markPaymentPaid(bookingId: string, viewer: BookingViewer): Promise<void>;
  listAllBookings(query: OrdersQuery): Promise<Paginated<BookingDetail>>;
  reassignBooking(bookingId: string, workerId: string): Promise<void>;
  workerEarnings(workerId: string): Promise<{ summary: EarningSummary; rows: WorkerEarningsRow[] }>;

  /* Admin */
  adminStats(): Promise<AdminStats>;
  recentActivity(limit: number): Promise<BookingDetail[]>;
  resetDemoData?(): Promise<void>;
}

export interface BookingStatusCount {
  status: BookingStatus;
  count: number;
}
