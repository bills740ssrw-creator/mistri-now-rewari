import type {
  AdminStats,
  Booking,
  BookingDetail,
  BookingStatus,
  EarningSummary,
  OrdersQuery,
  Paginated,
  Profile,
  Role,
  Service,
  WorkerEarningsRow,
} from "@/lib/types";
import type { BookingViewer, DataAdapter, WorkerApprovalItem } from "@/lib/data/adapter";
import { readDb, mutateDb, resetDemoDb } from "@/lib/demo/store";
import type { DemoDb } from "@/lib/demo/seed";
import { bookingCode, istDateKey } from "@/lib/format";
import { isActiveBooking, canCustomerCancel } from "@/lib/booking";
import { generateOtp, otpMatches } from "@/lib/otp";
import { normalizePhone } from "@/lib/validation";
import { round2 } from "@/lib/utils";

function fail(message: string): never {
  throw new Error(message);
}

function findProfile(db: DemoDb, id: string | null): Profile | null {
  if (!id) return null;
  return db.profiles.find((profile) => profile.id === id) ?? null;
}

function toDetail(db: DemoDb, booking: Booking, viewer?: BookingViewer): BookingDetail {
  const service = db.services.find((item) => item.id === booking.serviceId);
  const customer = findProfile(db, booking.customerId);
  const worker = findProfile(db, booking.workerId);
  if (!service || !customer) fail("Booking references missing data");

  const canSeeOtp =
    viewer?.role === "admin" ||
    (viewer?.role === "customer" && viewer.id === booking.customerId);

  return {
    booking: canSeeOtp
      ? booking
      : {
          ...booking,
          startOtp: null,
          endOtp: null,
        },
    service,
    customer: { id: customer.id, fullName: customer.fullName, phone: customer.phone },
    worker: worker
      ? {
          id: worker.id,
          fullName: worker.fullName,
          phone: worker.phone,
          rating: worker.rating,
          jobsCompleted: worker.jobsCompleted,
          avatarUrl: worker.avatarUrl,
          serviceCategory: worker.serviceCategory,
        }
      : null,
    items: db.bookingItems
      .filter((item) => item.bookingId === booking.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
}

function findBooking(db: DemoDb, id: string): Booking {
  const booking = db.bookings.find((item) => item.id === id);
  if (!booking) fail("Booking not found");
  return booking;
}

function recalc(db: DemoDb, booking: Booking): void {
  const parts = db.bookingItems
    .filter((item) => item.bookingId === booking.id)
    .reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  booking.totalAmount = round2(booking.baseAmount + parts);
}

function badgeFor(count: number): string {
  if (count === 0) return "0";
  if (count > 99) return "99+";
  return String(count);
}

export function createDemoAdapter(): DataAdapter {
  const adapter: DataAdapter = {
    async getProfileById(id) {
      const db = await readDb();
      return findProfile(db, id);
    },

    async getProfileByPhone(phone) {
      const db = await readDb();
      const normalized = normalizePhone(phone);
      return db.profiles.find((profile) => profile.phone === normalized) ?? null;
    },

    async getProfileByEmail(email) {
      const db = await readDb();
      const normalized = email.trim().toLowerCase();
      return db.profiles.find((profile) => profile.email?.toLowerCase() === normalized) ?? null;
    },

    async listWorkers(status) {
      const db = await readDb();
      return db.profiles
        .filter((profile) => profile.role === "worker")
        .filter((profile) => (status ? profile.status === status : true))
        .sort((a, b) => b.jobsCompleted - a.jobsCompleted);
    },

    async createCustomerProfile(_userId, input) {
      return mutateDb((db) => {
        const phone = normalizePhone(input.phone);
        if (db.profiles.some((profile) => profile.phone === phone)) {
          fail("This mobile number is already registered. Please log in instead.");
        }
        const now = new Date().toISOString();
        const profile: Profile = {
          id: crypto.randomUUID(),
          phone,
          email: input.email ?? null,
          fullName: input.fullName.trim(),
          role: "customer",
          status: "ACTIVE",
          serviceCategory: null,
          isOnline: false,
          rating: 5,
          jobsCompleted: 0,
          avatarUrl: null,
          termsAcceptedAt: input.termsAccepted ? now : null,
          createdAt: now,
        };
        db.profiles.push(profile);
        return profile;
      });
    },

    async createWorkerProfile(_userId, input) {
      return mutateDb((db) => {
        const phone = normalizePhone(input.phone);
        if (db.profiles.some((profile) => profile.phone === phone)) {
          fail("This mobile number is already registered. Please log in instead.");
        }
        const now = new Date().toISOString();
        const profile: Profile = {
          id: crypto.randomUUID(),
          phone,
          email: input.email ?? null,
          fullName: input.fullName.trim(),
          role: "worker",
          status: "PENDING_APPROVAL",
          serviceCategory: input.serviceCategory,
          isOnline: false,
          rating: 0,
          jobsCompleted: 0,
          avatarUrl: null,
          termsAcceptedAt: input.termsAccepted ? now : null,
          createdAt: now,
        };
        db.profiles.push(profile);
        db.workerDocuments.push({
          id: crypto.randomUUID(),
          workerId: profile.id,
          aadhaarFrontUrl: input.aadhaarFrontUrl,
          aadhaarBackUrl: input.aadhaarBackUrl,
          verificationStatus: "PENDING",
          rejectionReason: null,
          createdAt: now,
        });
        return profile;
      });
    },

    async setWorkerOnline(workerId, online) {
      await mutateDb((db) => {
        const profile = findProfile(db, workerId);
        if (!profile || profile.role !== "worker") fail("Worker not found");
        if (profile.status !== "ACTIVE") fail("Your account is not active yet");
        profile.isOnline = online;
      });
    },

    async setWorkerApproved(workerId) {
      await mutateDb((db) => {
        const profile = findProfile(db, workerId);
        if (!profile || profile.role !== "worker") fail("Worker not found");
        profile.status = "ACTIVE";
        const document = db.workerDocuments.find((item) => item.workerId === workerId);
        if (document) {
          document.verificationStatus = "APPROVED";
          document.rejectionReason = null;
        }
      });
    },

    async setWorkerRejected(workerId, reason) {
      await mutateDb((db) => {
        const profile = findProfile(db, workerId);
        if (!profile || profile.role !== "worker") fail("Worker not found");
        profile.status = "SUSPENDED";
        profile.isOnline = false;
        const document = db.workerDocuments.find((item) => item.workerId === workerId);
        if (document) {
          document.verificationStatus = "REJECTED";
          document.rejectionReason = reason;
        }
      });
    },

    async listPendingWorkers(): Promise<WorkerApprovalItem[]> {
      const db = await readDb();
      return db.profiles
        .filter((profile) => profile.role === "worker" && profile.status === "PENDING_APPROVAL")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((worker) => ({
          worker,
          document: db.workerDocuments.find((doc) => doc.workerId === worker.id) ?? null,
        }));
    },

    async getWorkerDocument(workerId) {
      const db = await readDb();
      return db.workerDocuments.find((doc) => doc.workerId === workerId) ?? null;
    },

    async countProfiles(role: Role) {
      const db = await readDb();
      return db.profiles.filter((profile) => profile.role === role).length;
    },

    async listServices(activeOnly = true) {
      const db = await readDb();
      return db.services
        .filter((service) => (activeOnly ? service.isActive : true))
        .sort((a, b) => a.price - b.price);
    },

    async getService(id) {
      const db = await readDb();
      return db.services.find((service) => service.id === id) ?? null;
    },

    async saveService(input) {
      return mutateDb((db) => {
        if (input.id) {
          const service = db.services.find((item) => item.id === input.id);
          if (!service) fail("Service not found");
          Object.assign(service, {
            title: input.title.trim(),
            price: input.price,
            description: input.description.trim(),
            category: input.category,
            badge: input.badge?.trim() || null,
            icon: input.icon,
            durationMins: input.durationMins,
            isActive: input.isActive,
          });
          return service;
        }
        const service: Service = {
          id: crypto.randomUUID(),
          title: input.title.trim(),
          price: input.price,
          description: input.description.trim(),
          category: input.category,
          badge: input.badge?.trim() || null,
          icon: input.icon,
          durationMins: input.durationMins,
          isActive: input.isActive,
          createdAt: new Date().toISOString(),
        };
        db.services.push(service);
        return service;
      });
    },

    async setServiceActive(id, active) {
      await mutateDb((db) => {
        const service = db.services.find((item) => item.id === id);
        if (!service) fail("Service not found");
        service.isActive = active;
      });
    },

    async createBooking(customerId, input) {
      return mutateDb((db) => {
        const customer = findProfile(db, customerId);
        if (!customer || customer.role !== "customer") fail("Please sign in as a customer");
        const service = db.services.find((item) => item.id === input.serviceId);
        if (!service || !service.isActive) fail("This service is not available right now");

        const scheduled = new Date(input.scheduledTime);
        if (Number.isNaN(scheduled.getTime())) fail("Choose a valid time slot");
        if (scheduled.getTime() < Date.now() - 15 * 60_000) fail("That time slot has already passed");

        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        const booking: Booking = {
          id,
          code: bookingCode(id),
          customerId,
          workerId: null,
          serviceId: service.id,
          status: "PENDING",
          address: input.address.trim(),
          baseAmount: service.price,
          totalAmount: service.price,
          scheduledTime: scheduled.toISOString(),
          createdAt: now,
          completedAt: null,
          cancelledAt: null,
          cancelledReason: null,
          notes: input.notes?.trim() || null,
          issueMedia: input.issueMedia ?? [],
          paymentMethod: input.paymentMethod,
          paymentStatus: "PENDING",
          startOtp: generateOtp(),
          endOtp: generateOtp(),
        };
        db.bookings.push(booking);
        return booking;
      });
    },

    async getBookingDetail(id, viewer) {
      const db = await readDb();
      const booking = db.bookings.find((item) => item.id === id);
      if (!booking) return null;
      if (viewer.role === "customer" && booking.customerId !== viewer.id) return null;
      if (viewer.role === "worker" && booking.workerId !== viewer.id) {
        if (booking.status !== "PENDING" || booking.workerId) return null;
      }
      return toDetail(db, booking, viewer);
    },

    async listCustomerBookings(customerId) {
      const db = await readDb();
      return db.bookings
        .filter((booking) => booking.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((booking) => toDetail(db, booking, { id: customerId, role: "customer" }));
    },

    async listWorkerBookings(workerId) {
      const db = await readDb();
      return db.bookings
        .filter((booking) => booking.workerId === workerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((booking) => toDetail(db, booking, { id: workerId, role: "worker" }));
    },

    async listOpenJobs(category) {
      const db = await readDb();
      return db.bookings
        .filter((booking) => booking.status === "PENDING" && !booking.workerId)
        .filter((booking) => {
          if (!category) return true;
          const service = db.services.find((item) => item.id === booking.serviceId);
          return service?.category === category;
        })
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, 8)
        .map((booking) => toDetail(db, booking, { id: "worker", role: "worker" }));
    },

    async acceptJob(bookingId, workerId) {
      return mutateDb((db) => {
        const worker = findProfile(db, workerId);
        if (!worker || worker.role !== "worker") fail("Worker not found");
        if (worker.status !== "ACTIVE") fail("Your account is not approved yet");
        const booking = findBooking(db, bookingId);
        if (booking.status !== "PENDING" || booking.workerId) {
          fail("Sorry, this job was just taken by another professional");
        }
        const service = db.services.find((item) => item.id === booking.serviceId);
        if (worker.serviceCategory && service && worker.serviceCategory !== service.category) {
          fail("This job belongs to a different trade");
        }
        booking.workerId = workerId;
        booking.status = "ASSIGNED";
        return booking;
      });
    },

    async moveToOnTheWay(bookingId, workerId) {
      return mutateDb((db) => {
        const booking = findBooking(db, bookingId);
        if (booking.workerId !== workerId) fail("This job is not assigned to you");
        if (booking.status !== "ASSIGNED") fail("Job is not in the assigned state");
        booking.status = "ON_THE_WAY";
        return booking;
      });
    },

    async verifyAndAdvance(bookingId, workerId, kind, code) {
      return mutateDb((db) => {
        const booking = findBooking(db, bookingId);
        if (booking.workerId !== workerId) return { ok: false, error: "This job is not assigned to you" };
        if (kind === "start") {
          if (booking.status !== "ON_THE_WAY" && booking.status !== "ASSIGNED") {
            return { ok: false, error: "Job is not ready to start" };
          }
          if (!otpMatches(booking.startOtp, code)) {
            return { ok: false, error: "Incorrect start OTP. Ask the customer to read it again." };
          }
          booking.status = "IN_PROGRESS";
          return { ok: true, booking };
        }
        if (booking.status !== "IN_PROGRESS") {
          return { ok: false, error: "Start the job before completing it" };
        }
        if (!otpMatches(booking.endOtp, code)) {
          return { ok: false, error: "Incorrect completion OTP. Ask the customer to read it again." };
        }
        booking.status = "COMPLETED";
        booking.completedAt = new Date().toISOString();
        if (booking.paymentMethod === "UPI" || booking.paymentStatus === "PENDING") {
          booking.paymentStatus = "PAID";
        }
        const worker = findProfile(db, workerId);
        if (worker) worker.jobsCompleted += 1;
        return { ok: true, booking };
      });
    },

    async addBookingItem(bookingId, workerId, item) {
      await mutateDb((db) => {
        const booking = findBooking(db, bookingId);
        if (booking.workerId !== workerId) fail("This job is not assigned to you");
        if (!["ASSIGNED", "ON_THE_WAY", "IN_PROGRESS"].includes(booking.status)) {
          fail("Spare parts can only be added while the job is active");
        }
        if (item.quantity < 1 || item.unitPrice < 1) fail("Enter a valid part quantity and price");
        db.bookingItems.push({
          id: crypto.randomUUID(),
          bookingId,
          name: item.name.trim(),
          quantity: item.quantity,
          unitPrice: round2(item.unitPrice),
          createdAt: new Date().toISOString(),
        });
        recalc(db, booking);
      });
    },

    async cancelBooking(bookingId, customerId, reason) {
      await mutateDb((db) => {
        const booking = findBooking(db, bookingId);
        if (booking.customerId !== customerId) fail("Booking not found");
        if (!canCustomerCancel(booking.status)) {
          fail("This booking can no longer be cancelled. Please call support.");
        }
        booking.status = "CANCELLED";
        booking.cancelledAt = new Date().toISOString();
        booking.cancelledReason = reason;
        booking.paymentStatus = "PENDING";
      });
    },

    async markPaymentPaid(bookingId, viewer) {
      await mutateDb((db) => {
        const booking = findBooking(db, bookingId);
        const owns =
          viewer.role === "admin" ||
          (viewer.role === "customer" && booking.customerId === viewer.id);
        if (!owns) fail("Booking not found");
        booking.paymentStatus = "PAID";
      });
    },

    async listAllBookings(query: OrdersQuery): Promise<Paginated<BookingDetail>> {
      const db = await readDb();
      const page = Math.max(1, query.page ?? 1);
      const pageSize = Math.min(50, Math.max(5, query.pageSize ?? 10));
      const status = query.status ?? "ALL";
      const q = query.q?.trim().toLowerCase() ?? "";

      let rows = db.bookings.filter((booking) => (status === "ALL" ? true : booking.status === status));
      if (q) {
        rows = rows.filter((booking) => {
          const detail = toDetail(db, booking, { id: "admin", role: "admin" });
          const haystack = [
            detail.booking.code,
            detail.service.title,
            detail.customer.fullName,
            detail.customer.phone,
            detail.booking.address,
            detail.worker?.fullName ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });
      }
      rows = rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const total = rows.length;
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, pageCount);
      const slice = rows.slice((safePage - 1) * pageSize, safePage * pageSize);
      return {
        rows: slice.map((booking) => toDetail(db, booking, { id: "admin", role: "admin" })),
        total,
        page: safePage,
        pageSize,
        pageCount,
      };
    },

    async reassignBooking(bookingId, workerId) {
      await mutateDb((db) => {
        const booking = findBooking(db, bookingId);
        const worker = findProfile(db, workerId);
        if (!worker || worker.role !== "worker") fail("Choose a valid worker");
        if (worker.status !== "ACTIVE") fail("Worker is not active");
        if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
          fail("Completed or cancelled bookings cannot be reassigned");
        }
        booking.workerId = workerId;
        if (booking.status === "PENDING") booking.status = "ASSIGNED";
      });
    },

    async workerEarnings(workerId) {
      const db = await readDb();
      const completed = db.bookings
        .filter((booking) => booking.workerId === workerId && booking.status === "COMPLETED")
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

      const todayKey = istDateKey();
      const now = Date.now();
      const weekStart = now - 6 * 86_400_000;
      const monthStart = now - 29 * 86_400_000;

      const summary: EarningSummary = {
        today: 0,
        week: 0,
        month: 0,
        lifetime: 0,
        completedJobs: completed.length,
        averageTicket: 0,
        daily: [],
      };

      for (const booking of completed) {
        const at = new Date(booking.completedAt ?? booking.createdAt);
        summary.lifetime += booking.totalAmount;
        if (istDateKey(at) === todayKey) summary.today += booking.totalAmount;
        if (at.getTime() >= weekStart) summary.week += booking.totalAmount;
        if (at.getTime() >= monthStart) summary.month += booking.totalAmount;
      }
      summary.averageTicket = completed.length ? summary.lifetime / completed.length : 0;
      summary.daily = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(Date.now() - (6 - index) * 86_400_000);
        const key = istDateKey(date);
        const amount = completed
          .filter((booking) => istDateKey(booking.completedAt ?? booking.createdAt) === key)
          .reduce((total, booking) => total + booking.totalAmount, 0);
        return {
          date: key,
          label: new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
            timeZone: "Asia/Kolkata",
          }).format(date),
          amount,
        };
      });

      const rows: WorkerEarningsRow[] = completed.slice(0, 12).map((booking) => {
        const service = db.services.find((item) => item.id === booking.serviceId);
        return {
          bookingId: booking.id,
          code: booking.code,
          serviceTitle: service?.title ?? "Service",
          completedAt: booking.completedAt ?? booking.createdAt,
          amount: booking.totalAmount,
        };
      });

      return { summary, rows };
    },

    async adminStats(): Promise<AdminStats> {
      const db = await readDb();
      const completed = db.bookings.filter((booking) => booking.status === "COMPLETED");
      const cancelled = db.bookings.filter((booking) => booking.status === "CANCELLED");
      const active = db.bookings.filter((booking) => isActiveBooking(booking.status));
      const todayKey = istDateKey();
      const monthStart = Date.now() - 29 * 86_400_000;
      const workers = db.profiles.filter((profile) => profile.role === "worker");

      const lifetimeRevenue = completed.reduce((total, booking) => total + booking.totalAmount, 0);
      const todayRevenue = completed
        .filter((booking) => istDateKey(booking.completedAt ?? booking.createdAt) === todayKey)
        .reduce((total, booking) => total + booking.totalAmount, 0);
      const monthRevenue = completed
        .filter(
          (booking) =>
            new Date(booking.completedAt ?? booking.createdAt).getTime() >= monthStart,
        )
        .reduce((total, booking) => total + booking.totalAmount, 0);

      const daily = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(Date.now() - (13 - index) * 86_400_000);
        const key = istDateKey(date);
        const dayBookings = db.bookings.filter(
          (booking) => istDateKey(booking.createdAt) === key,
        );
        return {
          date: key,
          label: new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",
          }).format(date),
          orders: dayBookings.length,
          revenue: dayBookings
            .filter((booking) => booking.status === "COMPLETED")
            .reduce((total, booking) => total + booking.totalAmount, 0),
        };
      });

      const statusBreakdown = (
        ["PENDING", "ASSIGNED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as BookingStatus[]
      ).map((status) => ({
        status,
        count: db.bookings.filter((booking) => booking.status === status).length,
      }));

      return {
        revenue: { today: todayRevenue, month: monthRevenue, lifetime: lifetimeRevenue },
        activeBookings: active.length,
        totalBookings: db.bookings.length,
        completedBookings: completed.length,
        registeredWorkers: workers.length,
        activeWorkers: workers.filter((worker) => worker.status === "ACTIVE").length,
        onlineWorkers: workers.filter((worker) => worker.isOnline && worker.status === "ACTIVE").length,
        pendingApprovals: workers.filter((worker) => worker.status === "PENDING_APPROVAL").length,
        customers: db.profiles.filter((profile) => profile.role === "customer").length,
        averageTicket: completed.length ? lifetimeRevenue / completed.length : 0,
        completionRate: completed.length + cancelled.length
          ? (completed.length / (completed.length + cancelled.length)) * 100
          : 0,
        daily,
        statusBreakdown,
      };
    },

    async recentActivity(limit) {
      const db = await readDb();
      return db.bookings
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit)
        .map((booking) => toDetail(db, booking, { id: "admin", role: "admin" }));
    },

    async resetDemoData() {
      await resetDemoDb();
    },
  };

  return adapter;
}

/** Small helper kept for future demo-only diagnostics. */
export function demoBadgeCount(count: number): string {
  return badgeFor(count);
}
