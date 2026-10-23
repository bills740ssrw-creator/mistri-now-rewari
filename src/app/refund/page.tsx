import type { Metadata } from "next";
import { LegalPage } from "@/components/customer/legal-page";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cancellation & refund policy",
  description:
    "When you can cancel a Mistri Now Rewari booking, what it costs, and how refunds and warranty revisits are handled.",
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Cancellation & refunds"
      description="Clear, practical rules for cancelling a booking, getting a refund, or claiming the 7-day warranty."
      updated="23 October 2026"
      current="/refund"
    >
      <h2>1. Before work starts — free cancellation</h2>
      <p>
        You can cancel free of charge from the booking page while the booking is{" "}
        <strong>Pending</strong> or <strong>Assigned</strong> (before the professional starts
        travelling or begins work). No cancellation fee applies and any online payment is refunded in
        full.
      </p>
      <p>
        If the professional is already on the way and you need to cancel, call{" "}
        <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>. We will try to stop the visit; a visit
        charge may apply if the professional has already reached your address.
      </p>

      <h2>2. After work starts</h2>
      <p>
        Once the start OTP has been verified and work is in progress, the booking cannot be cancelled
        in the app. If something is wrong, raise it with support immediately so we can pause the job or
        arrange a correction. Charges for work already completed and parts already fitted remain
        payable.
      </p>

      <h2>3. Professional no-show or late arrival</h2>
      <ul>
        <li>
          If no professional arrives within the booked window (or within a reasonable extension we
          agree with you), report it to support with your booking code.
        </li>
        <li>
          We will first try to reassign another available professional. If that is not possible or you
          prefer not to continue, the booking is cancelled free of charge.
        </li>
        <li>Any amount paid online for a no-show booking is refunded in full.</li>
      </ul>

      <h2>4. Refund timelines</h2>
      <ul>
        <li>
          <strong>UPI online payments:</strong> approved refunds are initiated to the original payment
          method. Banks and UPI apps typically credit within <strong>5–7 business days</strong>.
        </li>
        <li>
          <strong>Cash payments:</strong> refunds are made by UPI transfer to the number you provide,
          or adjusted against a future booking, as agreed with support.
        </li>
        <li>
          <strong>Part-refunds</strong> (for example, a part that was charged but not fitted) are
          calculated after reviewing the bill and the professional&apos;s report.
        </li>
      </ul>
      <p>
        In this demo build there are no real payment transfers; payment statuses are illustrative.
      </p>

      <h2>5. 7-day warranty revisit</h2>
      <p>
        If the same issue returns within <strong>7 days</strong> of a completed job, we will arrange a
        free revisit. The warranty covers workmanship on the reported issue. It does not cover new
        faults, misuse, undisclosed pre-existing problems, or consumable parts beyond the
        manufacturer&apos;s warranty.
      </p>
      <p>
        To claim: call or email support with your booking code within the 7-day window. Please do not
        book a new paid visit for a warranty issue.
      </p>

      <h2>6. Billing disputes</h2>
      <p>
        If you believe a charge is incorrect, contact us before paying (for pay-after-service
        bookings) or within 7 days of payment. We will compare the approved bill entries, the
        professional&apos;s report and any photos. Where a charge was not approved or not justified,
        we will correct the bill and refund the difference.
      </p>

      <h2>7. How to request a cancellation or refund</h2>
      <ul>
        <li>
          In the app: open <strong>My bookings → the booking → Cancel booking</strong> (available
          before work starts).
        </li>
        <li>
          By phone: <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>, 7 AM – 9 PM, all days.
        </li>
        <li>
          By email: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> with your booking code and a
          short description.
        </li>
      </ul>
      <p>
        We aim to acknowledge refund requests within 2 business days and complete approved refunds as
        described above. If you are unhappy with the outcome, you may escalate to our grievance channel
        listed in the <a href="/privacy">Privacy Policy</a> or approach the appropriate consumer forum.
      </p>
    </LegalPage>
  );
}
