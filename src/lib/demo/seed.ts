import type {
  Booking,
  BookingItem,
  Profile,
  Service,
  ServiceCategory,
  WorkerDocument,
} from "@/lib/types";
import { SERVICE_SEED } from "@/lib/constants";
import { bookingCode } from "@/lib/format";
import { generateOtp } from "@/lib/otp";

export interface DemoDb {
  version: number;
  seededAt: string;
  profiles: Profile[];
  services: Service[];
  bookings: Booking[];
  workerDocuments: WorkerDocument[];
  bookingItems: BookingItem[];
}

const ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const CUSTOMER_ANJALI = "00000000-0000-4000-8000-000000000002";
const CUSTOMER_ROHIT = "00000000-0000-4000-8000-000000000003";
const CUSTOMER_PRIYA = "00000000-0000-4000-8000-000000000004";
const WORKER_IMRAN = "00000000-0000-4000-8000-000000000011";
const WORKER_SUNIL = "00000000-0000-4000-8000-000000000012";
const WORKER_RAMESH = "00000000-0000-4000-8000-000000000013";
const WORKER_MAHESH = "00000000-0000-4000-8000-000000000014";
const WORKER_DEEPAK = "00000000-0000-4000-8000-000000000015";
const WORKER_SANJAY = "00000000-0000-4000-8000-000000000016";

const SERVICE_IDS = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
  "10000000-0000-4000-8000-000000000004",
  "10000000-0000-4000-8000-000000000005",
  "10000000-0000-4000-8000-000000000006",
  "10000000-0000-4000-8000-000000000007",
  "10000000-0000-4000-8000-000000000008",
];

const ADDRESSES = [
  "House 214, Sector 4, Rewari, Haryana 123401",
  "B-12, Circular Road, near SBI Bank, Rewari",
  "45, Model Town, Near Jain Chowk, Rewari",
  "Plot 8, Bawal Road, Rewari, Haryana 123401",
  "H.No 77, New Colony, Rewari",
  "Shop 3, Garhi Bolni Road, Rewari",
  "C-21, Housing Board Colony, Rewari",
  "Near Bus Stand, Old Court Road, Rewari",
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60_000).toISOString();
}

function serviceIdByTitle(title: string): string {
  const index = SERVICE_SEED.findIndex((service) => service.title === title);
  return SERVICE_IDS[index] ?? SERVICE_IDS[0]!;
}

function aadhaarCard(name: string, aadhaar: string, side: "front" | "back"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="480" viewBox="0 0 760 480">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#f2ecdd"/>
    </linearGradient>
  </defs>
  <rect width="760" height="480" rx="22" fill="url(#bg)"/>
  <rect x="0" y="0" width="760" height="52" rx="22" fill="#0b6e4f"/>
  <rect x="0" y="30" width="760" height="22" fill="#0b6e4f"/>
  <text x="28" y="35" font-family="Arial" font-size="17" font-weight="bold" fill="#ffffff">GOVERNMENT OF INDIA</text>
  <text x="620" y="35" font-family="Arial" font-size="13" fill="#d7f5e8">SAMPLE DOC</text>
  <circle cx="120" cy="180" r="62" fill="#dcefe7"/>
  <circle cx="120" cy="162" r="24" fill="#9dc7b7"/>
  <path d="M78 216c8-30 26-44 42-44s34 14 42 44z" fill="#9dc7b7"/>
  <text x="212" y="128" font-family="Arial" font-size="15" fill="#7a7a6a">Name</text>
  <text x="212" y="156" font-family="Arial" font-size="24" font-weight="bold" fill="#1d2a24">${name}</text>
  <text x="212" y="202" font-family="Arial" font-size="15" fill="#7a7a6a">Aadhaar Number</text>
  <text x="212" y="232" font-family="Courier New" font-size="27" letter-spacing="4" font-weight="bold" fill="#1d2a24">${aadhaar}</text>
  <text x="212" y="280" font-family="Arial" font-size="13" fill="#6b6b5f">Enrolment No. 1145/28${side === "front" ? "401" : "402"}</text>
  <text x="212" y="306" font-family="Arial" font-size="13" fill="#6b6b5f">To verify, scan the QR code</text>
  <rect x="600" y="150" width="110" height="110" fill="#ffffff" stroke="#cbbfa5" stroke-width="2"/>
  <g fill="#1d2a24">
    <rect x="612" y="162" width="26" height="26"/><rect x="672" y="162" width="26" height="26"/>
    <rect x="612" y="222" width="26" height="26"/><rect x="646" y="196" width="12" height="12"/>
    <rect x="666" y="218" width="12" height="12"/><rect x="690" y="238" width="12" height="12"/>
    <rect x="642" y="240" width="12" height="12"/><rect x="668" y="248" width="26" height="10"/>
  </g>
  <rect x="28" y="350" width="180" height="8" rx="4" fill="#f2a33a"/>
  <rect x="28" y="366" width="180" height="8" rx="4" fill="#ffffff" stroke="#dddddd"/>
  <rect x="28" y="382" width="180" height="8" rx="4" fill="#138a52"/>
  <text x="28" y="430" font-family="Arial" font-size="14" fill="#6b6b5f">This is a synthetic sample used for the Mistri Now demo.</text>
  <text x="28" y="452" font-family="Arial" font-size="14" fill="#6b6b5f">No real Aadhaar data is stored or displayed.</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function profile(
  partial: Pick<Profile, "id" | "phone" | "fullName" | "role"> & Partial<Profile>,
): Profile {
  return {
    email: null,
    status: "ACTIVE",
    serviceCategory: null,
    isOnline: false,
    rating: 4.8,
    jobsCompleted: 0,
    avatarUrl: null,
    termsAcceptedAt: iso(-60 * 24 * 120),
    createdAt: iso(-60 * 24 * 120),
    ...partial,
  };
}

export function buildSeedDb(): DemoDb {
  const now = Date.now();
  const profiles: Profile[] = [
    profile({
      id: ADMIN_ID,
      phone: "+918307121221",
      email: "admin@mistrinow.in",
      fullName: "Lakshya Yadav",
      role: "admin",
      createdAt: iso(-60 * 24 * 400),
    }),
    profile({
      id: CUSTOMER_ANJALI,
      phone: "+919876543210",
      email: "anjali.sharma@example.com",
      fullName: "Anjali Sharma",
      role: "customer",
      createdAt: iso(-60 * 24 * 90),
    }),
    profile({
      id: CUSTOMER_ROHIT,
      phone: "+919876543211",
      fullName: "Rohit Verma",
      role: "customer",
      createdAt: iso(-60 * 24 * 65),
    }),
    profile({
      id: CUSTOMER_PRIYA,
      phone: "+919876543212",
      fullName: "Priya Singh",
      role: "customer",
      createdAt: iso(-60 * 24 * 40),
    }),
    profile({
      id: WORKER_IMRAN,
      phone: "+919812345672",
      fullName: "Imran Khan",
      role: "worker",
      serviceCategory: "cooling",
      isOnline: true,
      rating: 4.9,
      jobsCompleted: 428,
      createdAt: iso(-60 * 24 * 300),
    }),
    profile({
      id: WORKER_SUNIL,
      phone: "+919812345671",
      fullName: "Sunil Yadav",
      role: "worker",
      serviceCategory: "electrical",
      isOnline: true,
      rating: 4.8,
      jobsCompleted: 356,
      createdAt: iso(-60 * 24 * 260),
    }),
    profile({
      id: WORKER_RAMESH,
      phone: "+919812345670",
      fullName: "Ramesh Kumar",
      role: "worker",
      serviceCategory: "plumbing",
      isOnline: false,
      rating: 4.8,
      jobsCompleted: 512,
      createdAt: iso(-60 * 24 * 340),
    }),
    profile({
      id: WORKER_SANJAY,
      phone: "+919812345677",
      fullName: "Sanjay Chauhan",
      role: "worker",
      serviceCategory: "appliance",
      isOnline: true,
      rating: 4.7,
      jobsCompleted: 289,
      createdAt: iso(-60 * 24 * 190),
    }),
    profile({
      id: WORKER_MAHESH,
      phone: "+919812345675",
      fullName: "Mahesh Chand",
      role: "worker",
      serviceCategory: "fabrication",
      status: "PENDING_APPROVAL",
      rating: 0,
      jobsCompleted: 0,
      createdAt: iso(-60 * 30),
    }),
    profile({
      id: WORKER_DEEPAK,
      phone: "+919812345676",
      fullName: "Deepak Sharma",
      role: "worker",
      serviceCategory: "cooling",
      status: "PENDING_APPROVAL",
      rating: 0,
      jobsCompleted: 0,
      createdAt: iso(-60 * 8),
    }),
  ];

  const services: Service[] = SERVICE_SEED.map((service, index) => ({
    id: SERVICE_IDS[index]!,
    title: service.title,
    price: service.price,
    description: service.description,
    category: service.category,
    badge: service.badge,
    icon: service.icon,
    durationMins: service.durationMins,
    isActive: true,
    createdAt: iso(-60 * 24 * 300),
  }));

  const workerDocuments: WorkerDocument[] = [
    {
      id: "20000000-0000-4000-8000-000000000001",
      workerId: WORKER_MAHESH,
      aadhaarFrontUrl: aadhaarCard("Mahesh Chand", "XXXX XXXX 8842", "front"),
      aadhaarBackUrl: aadhaarCard("Mahesh Chand", "XXXX XXXX 8842", "back"),
      verificationStatus: "PENDING",
      rejectionReason: null,
      createdAt: iso(-60 * 30),
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      workerId: WORKER_DEEPAK,
      aadhaarFrontUrl: aadhaarCard("Deepak Sharma", "XXXX XXXX 1179", "front"),
      aadhaarBackUrl: aadhaarCard("Deepak Sharma", "XXXX XXXX 1179", "back"),
      verificationStatus: "PENDING",
      rejectionReason: null,
      createdAt: iso(-60 * 8),
    },
    {
      id: "20000000-0000-4000-8000-000000000003",
      workerId: WORKER_IMRAN,
      aadhaarFrontUrl: aadhaarCard("Imran Khan", "XXXX XXXX 5521", "front"),
      aadhaarBackUrl: aadhaarCard("Imran Khan", "XXXX XXXX 5521", "back"),
      verificationStatus: "APPROVED",
      rejectionReason: null,
      createdAt: iso(-60 * 24 * 300),
    },
  ];

  const bookings: Booking[] = [];
  const bookingItems: BookingItem[] = [];
  const random = mulberry32(20261023);
  const customers = [CUSTOMER_ANJALI, CUSTOMER_ROHIT, CUSTOMER_PRIYA];
  const workerByCategory: Record<ServiceCategory, string> = {
    plumbing: WORKER_RAMESH,
    electrical: WORKER_SUNIL,
    cooling: WORKER_IMRAN,
    appliance: WORKER_SANJAY,
    fabrication: WORKER_SANJAY,
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  for (let daysAgo = 13; daysAgo >= 1; daysAgo -= 1) {
    const orders = 2 + Math.floor(random() * 3);
    for (let j = 0; j < orders; j += 1) {
      const service = services[Math.floor(random() * services.length)]!;
      const workerId = workerByCategory[service.category];
      const completed = random() > 0.09;
      const cancelled = !completed;
      const scheduled = new Date(
        startOfToday.getTime() - daysAgo * 86_400_000 + (9 + j * 2) * 3_600_000,
      );
      const hasParts = completed && random() > 0.62;
      const partsAmount = hasParts
        ? [180, 240, 350, 420, 650][Math.floor(random() * 5)]!
        : 0;
      const id = crypto.randomUUID();
      const booking: Booking = {
        id,
        code: bookingCode(id),
        customerId: customers[Math.floor(random() * customers.length)]!,
        workerId: completed ? workerId : null,
        serviceId: service.id,
        status: cancelled ? "CANCELLED" : "COMPLETED",
        address: ADDRESSES[Math.floor(random() * ADDRESSES.length)]!,
        baseAmount: service.price,
        totalAmount: service.price + partsAmount,
        scheduledTime: scheduled.toISOString(),
        createdAt: new Date(scheduled.getTime() - 5 * 3_600_000).toISOString(),
        completedAt: completed ? new Date(scheduled.getTime() + 75 * 60_000).toISOString() : null,
        cancelledAt: cancelled ? new Date(scheduled.getTime() - 40 * 60_000).toISOString() : null,
        cancelledReason: cancelled ? "Customer rescheduled the visit" : null,
        notes: null,
        issueMedia: [],
        paymentMethod: random() > 0.55 ? "UPI" : "COD",
        paymentStatus: completed ? "PAID" : "PENDING",
        startOtp: completed ? generateOtp() : null,
        endOtp: completed ? generateOtp() : null,
      };
      bookings.push(booking);
      if (hasParts) {
        bookingItems.push({
          id: crypto.randomUUID(),
          bookingId: id,
          name: ["Copper pipe", "MCB 32A", "Gas top-up kit", "RO membrane", "Fan capacitor"][
            Math.floor(random() * 5)
          ]!,
          quantity: 1,
          unitPrice: partsAmount,
          createdAt: booking.completedAt ?? booking.createdAt,
        });
      }
    }
  }

  const pushBooking = (booking: Omit<Booking, "code">) => {
    bookings.push({ ...booking, code: bookingCode(booking.id) });
  };

  pushBooking({
    id: crypto.randomUUID(),
    customerId: CUSTOMER_ANJALI,
    workerId: WORKER_IMRAN,
    serviceId: serviceIdByTitle("AC Gas Filling"),
    status: "ON_THE_WAY",
    address: ADDRESSES[2]!,
    baseAmount: 3399,
    totalAmount: 3399,
    scheduledTime: new Date(now + 45 * 60_000).toISOString(),
    createdAt: new Date(now - 55 * 60_000).toISOString(),
    completedAt: null,
    cancelledAt: null,
    cancelledReason: null,
    notes: "Split AC is not cooling since yesterday. Please carry a leak detector.",
    issueMedia: [],
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    startOtp: "4821",
    endOtp: "7390",
  });

  pushBooking({
    id: crypto.randomUUID(),
    customerId: CUSTOMER_ROHIT,
    workerId: WORKER_SUNIL,
    serviceId: serviceIdByTitle("Electrician"),
    status: "ASSIGNED",
    address: ADDRESSES[1]!,
    baseAmount: 199,
    totalAmount: 199,
    scheduledTime: new Date(now + 2 * 3_600_000).toISOString(),
    createdAt: new Date(now - 40 * 60_000).toISOString(),
    completedAt: null,
    cancelledAt: null,
    cancelledReason: null,
    notes: "Two bedroom switches are sparking.",
    issueMedia: [],
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    startOtp: generateOtp(),
    endOtp: generateOtp(),
  });

  pushBooking({
    id: crypto.randomUUID(),
    customerId: CUSTOMER_ROHIT,
    workerId: null,
    serviceId: serviceIdByTitle("Plumber"),
    status: "PENDING",
    address: ADDRESSES[0]!,
    baseAmount: 350,
    totalAmount: 350,
    scheduledTime: new Date(now + 3 * 3_600_000).toISOString(),
    createdAt: new Date(now - 12 * 60_000).toISOString(),
    completedAt: null,
    cancelledAt: null,
    cancelledReason: null,
    notes: "Kitchen sink drain is blocked.",
    issueMedia: [],
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    startOtp: generateOtp(),
    endOtp: generateOtp(),
  });

  pushBooking({
    id: crypto.randomUUID(),
    customerId: CUSTOMER_PRIYA,
    workerId: null,
    serviceId: serviceIdByTitle("AC Service"),
    status: "PENDING",
    address: ADDRESSES[4]!,
    baseAmount: 499,
    totalAmount: 499,
    scheduledTime: new Date(now + 4 * 3_600_000).toISOString(),
    createdAt: new Date(now - 8 * 60_000).toISOString(),
    completedAt: null,
    cancelledAt: null,
    cancelledReason: null,
    notes: "Annual service before summer.",
    issueMedia: [],
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    startOtp: generateOtp(),
    endOtp: generateOtp(),
  });

  pushBooking({
    id: crypto.randomUUID(),
    customerId: CUSTOMER_PRIYA,
    workerId: null,
    serviceId: serviceIdByTitle("Electrician"),
    status: "PENDING",
    address: ADDRESSES[5]!,
    baseAmount: 199,
    totalAmount: 199,
    scheduledTime: new Date(now + 5 * 3_600_000).toISOString(),
    createdAt: new Date(now - 4 * 60_000).toISOString(),
    completedAt: null,
    cancelledAt: null,
    cancelledReason: null,
    notes: "Fan regulator not working in the shop.",
    issueMedia: [],
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    startOtp: generateOtp(),
    endOtp: generateOtp(),
  });

  const completedTodayId = crypto.randomUUID();
  pushBooking({
    id: completedTodayId,
    customerId: CUSTOMER_ANJALI,
    workerId: WORKER_RAMESH,
    serviceId: serviceIdByTitle("Plumber"),
    status: "COMPLETED",
    address: ADDRESSES[2]!,
    baseAmount: 350,
    totalAmount: 590,
    scheduledTime: new Date(now - 4 * 3_600_000).toISOString(),
    createdAt: new Date(now - 6 * 3_600_000).toISOString(),
    completedAt: new Date(now - 2 * 3_600_000).toISOString(),
    cancelledAt: null,
    cancelledReason: null,
    notes: "Wash basin tap replacement.",
    issueMedia: [],
    paymentMethod: "COD",
    paymentStatus: "PAID",
    startOtp: generateOtp(),
    endOtp: generateOtp(),
  });
  bookingItems.push({
    id: crypto.randomUUID(),
    bookingId: completedTodayId,
    name: "Brass tap + Teflon tape",
    quantity: 1,
    unitPrice: 240,
    createdAt: new Date(now - 3 * 3_600_000).toISOString(),
  });

  return {
    version: 1,
    seededAt: new Date().toISOString(),
    profiles,
    services,
    bookings,
    workerDocuments,
    bookingItems,
  };
}

export const DEMO_IDS = {
  ADMIN_ID,
  CUSTOMER_ANJALI,
  WORKER_IMRAN,
  WORKER_MAHESH,
  WORKER_SUNIL,
};
