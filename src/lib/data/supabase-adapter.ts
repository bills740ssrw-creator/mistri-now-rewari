import type {
  AccountStatus,
  AdminStats,
  BookingDetail,
  BookingStatus,
  CreateCustomerInput,
  CreateWorkerInput,
  EarningSummary,
  OrdersQuery,
  Paginated,
  Role,
  ServiceInput,
  WorkerDocument,
  WorkerEarningsRow,
} from "@/lib/types";
import type { BookingViewer, DataAdapter, WorkerApprovalItem } from "@/lib/data/adapter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WORKER_DOCS_BUCKET } from "@/lib/supabase/config";
import {
  BOOKING_SELECT,
  mapBookingDetail,
  mapDocument,
  mapProfile,
  mapService,
  type BookingRow,
  type DocumentRow,
  type ProfileRow,
  type ServiceRow,
} from "@/lib/supabase/mappers";
import { istDateKey } from "@/lib/format";
import { normalizePhone } from "@/lib/validation";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function fail(error: { message?: string; code?: string } | null, fallback: string): never {
  if (error?.code === "23505") {
    throw new Error("This mobile number is already registered. Please log in instead.");
  }
  throw new Error(error?.message?.replace(/^.*?:\s*/, "") || fallback);
}

async function signedDocs(client: Client, docs: WorkerDocument[]): Promise<WorkerDocument[]> {
  const paths = docs.flatMap((doc) => [doc.aadhaarFrontUrl, doc.aadhaarBackUrl]);
  if (!paths.length) return docs;
  const { data } = await client.storage.from(WORKER_DOCS_BUCKET).createSignedUrls(paths, 60 * 15);
  if (!data) return docs;
  const map = new Map<string, string>();
  for (const item of data) {
    if (item.signedUrl) map.set(item.path ?? "", item.signedUrl);
  }
  return docs.map((doc) => ({
    ...doc,
    aadhaarFrontUrl: map.get(doc.aadhaarFrontUrl) ?? doc.aadhaarFrontUrl,
    aadhaarBackUrl: map.get(doc.aadhaarBackUrl) ?? doc.aadhaarBackUrl,
  }));
}

async function bookingDetailById(
  client: Client,
  id: string,
  viewer: BookingViewer,
): Promise<BookingDetail | null> {
  const { data, error } = await client
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error, "Could not load this booking");
  if (!data) return null;

  let otps: { start_otp: string; end_otp: string } | null = null;
  if (viewer.role === "customer" || viewer.role === "admin") {
    const { data: otpData } = await client
      .from("booking_otps")
      .select("start_otp, end_otp")
      .eq("booking_id", id)
      .maybeSingle();
    otps = otpData ?? null;
  }
  return mapBookingDetail(data as unknown as BookingRow, otps);
}

function mapRows(rows: unknown): BookingDetail[] {
  return (rows as BookingRow[]).map((row) => mapBookingDetail(row)).filter(Boolean) as BookingDetail[];
}

export function createSupabaseAdapter(): DataAdapter {
  const adapter: DataAdapter = {
    async getProfileById(id) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) fail(error, "Could not load profile");
      return data ? mapProfile(data as ProfileRow) : null;
    },

    async getProfileByPhone(phone) {
      const client = await createSupabaseServerClient();
      const normalized = normalizePhone(phone);
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("phone", normalized)
        .maybeSingle();
      if (error && error.code !== "PGRST116") fail(error, "Could not load profile");
      return data ? mapProfile(data as ProfileRow) : null;
    },

    async getProfileByEmail(email) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .ilike("email", email.trim().toLowerCase())
        .maybeSingle();
      if (error && error.code !== "PGRST116") fail(error, "Could not load profile");
      return data ? mapProfile(data as ProfileRow) : null;
    },

    async listWorkers(status?: AccountStatus) {
      const client = await createSupabaseServerClient();
      let query = client.from("profiles").select("*").eq("role", "worker");
      if (status) query = query.eq("status", status);
      const { data, error } = await query.order("jobs_completed", { ascending: false });
      if (error) fail(error, "Could not load workers");
      return (data as ProfileRow[]).map(mapProfile);
    },

    async createCustomerProfile(_userId, input: CreateCustomerInput) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client.rpc("complete_onboarding", {
        p_role: "customer",
        p_full_name: input.fullName,
        p_phone: normalizePhone(input.phone),
        p_email: input.email ?? null,
        p_category: null,
        p_terms: input.termsAccepted,
        p_front_path: null,
        p_back_path: null,
      });
      if (error) fail(error, "Could not create your account");
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("Could not create your account");
      return mapProfile(row as ProfileRow);
    },

    async createWorkerProfile(_userId, input: CreateWorkerInput) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client.rpc("complete_onboarding", {
        p_role: "worker",
        p_full_name: input.fullName,
        p_phone: normalizePhone(input.phone),
        p_email: input.email ?? null,
        p_category: input.serviceCategory,
        p_terms: input.termsAccepted,
        p_front_path: input.aadhaarFrontUrl,
        p_back_path: input.aadhaarBackUrl,
      });
      if (error) fail(error, "Could not create your worker account");
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("Could not create your worker account");
      return mapProfile(row as ProfileRow);
    },

    async setWorkerOnline(_workerId, online) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("set_worker_online", { p_online: online });
      if (error) fail(error, "Could not update your availability");
    },

    async setWorkerApproved(workerId) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("review_worker", {
        p_worker_id: workerId,
        p_decision: "APPROVE",
        p_reason: null,
      });
      if (error) fail(error, "Could not approve this worker");
    },

    async setWorkerRejected(workerId, reason) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("review_worker", {
        p_worker_id: workerId,
        p_decision: "REJECT",
        p_reason: reason,
      });
      if (error) fail(error, "Could not reject this worker");
    },

    async listPendingWorkers(): Promise<WorkerApprovalItem[]> {
      const client = await createSupabaseServerClient();
      const { data: workers, error } = await client
        .from("profiles")
        .select("*")
        .eq("role", "worker")
        .eq("status", "PENDING_APPROVAL")
        .order("created_at", { ascending: true });
      if (error) fail(error, "Could not load pending workers");
      const profiles = (workers as ProfileRow[]).map(mapProfile);
      if (!profiles.length) return [];

      const { data: docs } = await client
        .from("worker_documents")
        .select("*")
        .in(
          "worker_id",
          profiles.map((profile) => profile.id),
        );
      const mapped = await signedDocs(client, (docs as DocumentRow[] | null)?.map(mapDocument) ?? []);
      return profiles.map((worker) => ({
        worker,
        document: mapped.find((doc) => doc.workerId === worker.id) ?? null,
      }));
    },

    async getWorkerDocument(workerId) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("worker_documents")
        .select("*")
        .eq("worker_id", workerId)
        .maybeSingle();
      if (error && error.code !== "PGRST116") fail(error, "Could not load documents");
      if (!data) return null;
      const [resolved] = await signedDocs(client, [mapDocument(data as DocumentRow)]);
      return resolved ?? null;
    },

    async countProfiles(role: Role) {
      const client = await createSupabaseServerClient();
      const { count, error } = await client
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", role);
      if (error) fail(error, "Could not count profiles");
      return count ?? 0;
    },

    async listServices(activeOnly = true) {
      const client = await createSupabaseServerClient();
      let query = client.from("services").select("*");
      if (activeOnly) query = query.eq("is_active", true);
      const { data, error } = await query.order("price", { ascending: true });
      if (error) fail(error, "Could not load services");
      return (data as ServiceRow[]).map(mapService);
    },

    async getService(id) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client.from("services").select("*").eq("id", id).maybeSingle();
      if (error) fail(error, "Could not load service");
      return data ? mapService(data as ServiceRow) : null;
    },

    async saveService(input: ServiceInput & { id?: string }) {
      const client = await createSupabaseServerClient();
      const payload = {
        title: input.title.trim(),
        price: input.price,
        description: input.description.trim(),
        category: input.category,
        badge: input.badge?.trim() || null,
        icon: input.icon,
        duration_mins: input.durationMins,
        is_active: input.isActive,
      };
      const query = input.id
        ? client.from("services").update(payload).eq("id", input.id).select("*").single()
        : client.from("services").insert(payload).select("*").single();
      const { data, error } = await query;
      if (error) fail(error, "Could not save this service");
      return mapService(data as ServiceRow);
    },

    async setServiceActive(id, active) {
      const client = await createSupabaseServerClient();
      const { error } = await client.from("services").update({ is_active: active }).eq("id", id);
      if (error) fail(error, "Could not update this service");
    },

    async createBooking(customerId, input) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client.rpc("create_booking", {
        p_service_id: input.serviceId,
        p_address: input.address,
        p_scheduled_time: input.scheduledTime,
        p_payment_method: input.paymentMethod,
        p_notes: input.notes ?? null,
        p_issue_media: input.issueMedia ?? [],
      });
      if (error) fail(error, "Could not create your booking");
      const id = data as unknown as string;
      const detail = await bookingDetailById(client, id, { id: customerId, role: "customer" });
      if (!detail) throw new Error("Booking created but could not be loaded");
      return detail.booking;
    },

    async getBookingDetail(id, viewer) {
      const client = await createSupabaseServerClient();
      return bookingDetailById(client, id, viewer);
    },

    async listCustomerBookings(customerId) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("bookings")
        .select(BOOKING_SELECT)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) fail(error, "Could not load your bookings");
      return mapRows(data);
    },

    async listWorkerBookings(workerId) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("bookings")
        .select(BOOKING_SELECT)
        .eq("worker_id", workerId)
        .order("created_at", { ascending: false });
      if (error) fail(error, "Could not load your jobs");
      return mapRows(data);
    },

    async listOpenJobs(category) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("bookings")
        .select(BOOKING_SELECT)
        .eq("status", "PENDING")
        .is("worker_id", null)
        .order("created_at", { ascending: true })
        .limit(12);
      if (error) fail(error, "Could not load nearby jobs");
      const rows = mapRows(data);
      return category ? rows.filter((row) => row.service.category === category) : rows;
    },

    async acceptJob(bookingId, workerId) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("worker_accept_booking", {
        p_booking_id: bookingId,
      });
      if (error) fail(error, "Could not accept this job");
      const detail = await bookingDetailById(client, bookingId, { id: workerId, role: "worker" });
      if (!detail) throw new Error("Job accepted but could not be loaded");
      return detail.booking;
    },

    async moveToOnTheWay(bookingId, workerId) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("worker_set_on_the_way", {
        p_booking_id: bookingId,
      });
      if (error) fail(error, "Could not update the job");
      const detail = await bookingDetailById(client, bookingId, { id: workerId, role: "worker" });
      if (!detail) throw new Error("Job updated but could not be loaded");
      return detail.booking;
    },

    async verifyAndAdvance(bookingId, workerId, kind, code) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client.rpc("verify_booking_otp", {
        p_booking_id: bookingId,
        p_kind: kind,
        p_code: code,
      });
      if (error) return { ok: false, error: error.message };
      const result = data as { ok?: boolean; error?: string } | null;
      if (!result?.ok) {
        return { ok: false, error: result?.error ?? "Could not verify this OTP" };
      }
      const detail = await bookingDetailById(client, bookingId, { id: workerId, role: "worker" });
      return { ok: true, booking: detail?.booking };
    },

    async addBookingItem(bookingId, _workerId, item) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("add_booking_item", {
        p_booking_id: bookingId,
        p_name: item.name.trim(),
        p_quantity: item.quantity,
        p_unit_price: item.unitPrice,
      });
      if (error) fail(error, "Could not add this spare part");
    },

    async cancelBooking(bookingId, _customerId, reason) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("cancel_booking", {
        p_booking_id: bookingId,
        p_reason: reason,
      });
      if (error) fail(error, "Could not cancel this booking");
    },

    async markPaymentPaid(bookingId, _viewer) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("mark_booking_paid", { p_booking_id: bookingId });
      if (error) fail(error, "Could not update payment status");
    },

    async listAllBookings(query: OrdersQuery): Promise<Paginated<BookingDetail>> {
      const client = await createSupabaseServerClient();
      const page = Math.max(1, query.page ?? 1);
      const pageSize = Math.min(50, Math.max(5, query.pageSize ?? 10));
      const status = query.status && query.status !== "ALL" ? query.status : null;

      const { data, error } = await client.rpc("admin_orders", {
        p_status: status,
        p_q: query.q?.trim() || null,
        p_limit: pageSize,
        p_offset: (page - 1) * pageSize,
      });
      if (error) fail(error, "Could not load orders");
      const ids = ((data as { id: string; total_count: number }[] | null) ?? []).map((row) => row.id);
      const total = Number((data as { total_count: number }[] | null)?.[0]?.total_count ?? 0);
      if (!ids.length) {
        return { rows: [], total, page: 1, pageSize, pageCount: 1 };
      }
      const { data: rows, error: rowsError } = await client
        .from("bookings")
        .select(BOOKING_SELECT)
        .in("id", ids);
      if (rowsError) fail(rowsError, "Could not load orders");

      const byId = new Map(
        mapRows(rows).map((detail) => [detail.booking.id, detail] as const),
      );
      const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as BookingDetail[];
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      return { rows: ordered, total, page: Math.min(page, pageCount), pageSize, pageCount };
    },

    async reassignBooking(bookingId, workerId) {
      const client = await createSupabaseServerClient();
      const { error } = await client.rpc("admin_reassign_booking", {
        p_booking_id: bookingId,
        p_worker_id: workerId,
      });
      if (error) fail(error, "Could not reassign this booking");
    },

    async workerEarnings(workerId) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("bookings")
        .select("id, code, total_amount, completed_at, created_at, services(title)")
        .eq("worker_id", workerId)
        .eq("status", "COMPLETED")
        .order("completed_at", { ascending: false });
      if (error) fail(error, "Could not load earnings");

      const rowsRaw = (data ?? []) as unknown as {
        id: string;
        code: string;
        total_amount: number | string;
        completed_at: string | null;
        created_at: string;
        services: { title: string } | null;
      }[];

      const todayKey = istDateKey();
      const now = Date.now();
      const weekStart = now - 6 * 86_400_000;
      const monthStart = now - 29 * 86_400_000;
      const summary: EarningSummary = {
        today: 0,
        week: 0,
        month: 0,
        lifetime: 0,
        completedJobs: rowsRaw.length,
        averageTicket: 0,
        daily: [],
      };

      for (const row of rowsRaw) {
        const amount = Number(row.total_amount);
        const at = new Date(row.completed_at ?? row.created_at);
        summary.lifetime += amount;
        if (istDateKey(at) === todayKey) summary.today += amount;
        if (at.getTime() >= weekStart) summary.week += amount;
        if (at.getTime() >= monthStart) summary.month += amount;
      }
      summary.averageTicket = rowsRaw.length ? summary.lifetime / rowsRaw.length : 0;
      summary.daily = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(Date.now() - (6 - index) * 86_400_000);
        const key = istDateKey(date);
        const amount = rowsRaw
          .filter((row) => istDateKey(row.completed_at ?? row.created_at) === key)
          .reduce((total, row) => total + Number(row.total_amount), 0);
        return {
          date: key,
          label: new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
            timeZone: "Asia/Kolkata",
          }).format(date),
          amount,
        };
      });

      const rows: WorkerEarningsRow[] = rowsRaw.slice(0, 12).map((row) => ({
        bookingId: row.id,
        code: row.code,
        serviceTitle: row.services?.title ?? "Service",
        completedAt: row.completed_at ?? row.created_at,
        amount: Number(row.total_amount),
      }));

      return { summary, rows };
    },

    async adminStats(): Promise<AdminStats> {
      const client = await createSupabaseServerClient();
      const [metricsRes, seriesRes] = await Promise.all([
        client.rpc("admin_metrics"),
        client.rpc("admin_daily_series", { p_days: 14 }),
      ]);
      if (metricsRes.error) fail(metricsRes.error, "Could not load dashboard metrics");
      if (seriesRes.error) fail(seriesRes.error, "Could not load dashboard series");

      const m = (metricsRes.data ?? {}) as Record<string, number | Record<string, number>>;
      const num = (key: string) => Number(m[key] ?? 0);
      const breakdown = (m.status_breakdown ?? {}) as Record<string, number>;
      const daily = ((seriesRes.data ?? []) as {
        day: string;
        orders: number | string;
        revenue: number | string;
      }[]).map((row) => {
        const date = new Date(`${row.day}T12:00:00+05:30`);
        return {
          date: row.day,
          label: new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",
          }).format(date),
          orders: Number(row.orders),
          revenue: Number(row.revenue),
        };
      });

      return {
        revenue: {
          today: num("revenue_today"),
          month: num("revenue_month"),
          lifetime: num("revenue_lifetime"),
        },
        activeBookings: num("active_bookings"),
        totalBookings: num("total_bookings"),
        completedBookings: num("completed_bookings"),
        registeredWorkers: num("registered_workers"),
        activeWorkers: num("active_workers"),
        onlineWorkers: num("online_workers"),
        pendingApprovals: num("pending_approvals"),
        customers: num("customers"),
        averageTicket: num("average_ticket"),
        completionRate: num("completion_rate"),
        daily,
        statusBreakdown: (
          ["PENDING", "ASSIGNED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as BookingStatus[]
        ).map((status) => ({ status, count: Number(breakdown[status] ?? 0) })),
      };
    },

    async recentActivity(limit) {
      const client = await createSupabaseServerClient();
      const { data, error } = await client
        .from("bookings")
        .select(BOOKING_SELECT)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) fail(error, "Could not load recent activity");
      return mapRows(data);
    },
  };

  return adapter;
}
