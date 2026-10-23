import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/customer/legal-page";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that apply when you book or perform home services through Mistri Now Rewari, operated by Lakshya Yadav Enterprises.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      description="The agreement between you, the independent professionals on our network, and Lakshya Yadav Enterprises."
      updated="23 October 2026"
      current="/terms"
    >
      <h2>1. These terms</h2>
      <p>
        These Terms govern your use of the Mistri Now Rewari website and booking service, operated by{" "}
        <strong>{BRAND.legalName}</strong> (&quot;we&quot;, &quot;us&quot;). By creating an account,
        booking a service or accepting a job, you agree to these Terms, our{" "}
        <Link href="/privacy">Privacy Policy</Link> and our{" "}
        <Link href="/refund">Cancellation &amp; Refund Policy</Link>. If you do not agree, please do
        not use the service.
      </p>

      <h2>2. What Mistri Now Rewari is</h2>
      <p>
        We operate a <strong>marketplace</strong> that connects customers in Rewari with independent,
        verified service professionals (&quot;professionals&quot;). Professionals are not our
        employees. They perform the work in their own capacity and are responsible for the quality and
        safety of that work. We verify identity, set the catalogue and fixed visit prices, assign
        jobs, record OTP-verified start and completion, and provide customer support.
      </p>

      <h2>3. Eligibility and your account</h2>
      <ul>
        <li>You must be at least 18 years old and legally able to enter into a contract.</li>
        <li>
          Sign-in uses a one-time password sent to your mobile number. Keep your phone and OTP secure.
          You are responsible for activity on your account.
        </li>
        <li>Provide accurate details. A wrong address or phone number can delay or prevent service.</li>
        <li>
          Professionals must complete Aadhaar verification and be approved by our team before
          accepting jobs. Approval can be refused or withdrawn for safety, fraud or quality reasons.
        </li>
      </ul>

      <h2>4. Bookings and pricing</h2>
      <ul>
        <li>
          The <strong>visit charge</strong> shown on each service card is fixed and final for the
          listed work. It includes inspection and the standard scope described on the card.
        </li>
        <li>
          Spare parts, extra material or additional labour beyond the listed scope must be quoted to
          you and added to the live bill <strong>only with your approval</strong>.
        </li>
        <li>
          Prices are in Indian Rupees and include applicable taxes where stated. A booking is
          confirmed when you see the confirmation screen and booking code.
        </li>
        <li>
          Slot availability is on a first-come basis. We assign the nearest suitable professional;
          assignment times vary with demand.
        </li>
      </ul>

      <h2>5. Payments</h2>
      <ul>
        <li>
          You may choose <strong>UPI online</strong> or <strong>cash/UPI after service</strong>. We do
          not store card or UPI credentials.
        </li>
        <li>
          For pay-after-service bookings, the amount is due once the work is completed and you have
          verified it with the completion OTP.
        </li>
        <li>For online payments, the booking is marked paid after the payment reference is confirmed.</li>
        <li>
          Never pay a professional outside the stated booking amount without an approved bill entry.
          Off-platform payments are not covered by our warranty or dispute support.
        </li>
      </ul>

      <h2>6. Your responsibilities as a customer</h2>
      <ul>
        <li>Provide safe, lawful access to the premises and accurate information about the issue.</li>
        <li>
          Share the <strong>start OTP</strong> only when the professional arrives, and the{" "}
          <strong>completion OTP</strong> only after the work is finished to your satisfaction.
        </li>
        <li>
          Do not ask a professional to perform unsafe, illegal or out-of-scope work, or to bypass the
          platform&apos;s OTP and billing process.
        </li>
        <li>Treat professionals with respect. Harassment or discrimination may lead to account suspension.</li>
      </ul>

      <h2>7. Professional obligations</h2>
      <ul>
        <li>Carry out assigned work safely, lawfully, and with reasonable skill and care.</li>
        <li>Quote spare parts before fitting them and record them in the app.</li>
        <li>Never ask a customer for an OTP over the phone or before arriving.</li>
        <li>Do not solicit customers for off-platform work or share customer data.</li>
        <li>Return to fix warranty issues within the stated 7-day window.</li>
        <li>Keep your availability accurate; repeated no-shows may lead to suspension.</li>
      </ul>

      <h2>8. Warranty</h2>
      <p>
        Every completed job carries a <strong>7-day workmanship warranty</strong> on the same issue.
        If the issue recurs within 7 days of completion, we will arrange a free revisit. The warranty
        does not cover new faults, damage caused by misuse, pre-existing conditions you did not
        disclose, or parts beyond the manufacturer&apos;s own warranty. Warranty support requires the
        booking to have been made and paid through the platform.
      </p>

      <h2>9. Cancellations and refunds</h2>
      <p>
        Cancellation windows, charges and refund timelines are set out in our{" "}
        <Link href="/refund">Cancellation &amp; Refund Policy</Link>. In short: cancellation is free
        before the professional starts work; once work has started, please raise the issue with
        support instead of cancelling.
      </p>

      <h2>10. Liability</h2>
      <p>
        We take reasonable care in verifying professionals and running the platform, but the services
        themselves are performed by independent professionals. To the extent permitted by law, our
        total liability for any claim relating to a booking is limited to the amount you paid for that
        booking. We are not liable for indirect or consequential losses, or for delays caused by
        events beyond our reasonable control. Nothing in these Terms excludes rights that cannot be
        excluded under Indian law, including your rights under the Consumer Protection Act, 2019.
      </p>

      <h2>11. Prohibited use</h2>
      <ul>
        <li>Impersonating another person or creating accounts with false details.</li>
        <li>Attempting to access another user&apos;s account or data.</li>
        <li>Scraping, reverse engineering or interfering with the platform&apos;s security.</li>
        <li>Using the platform for unlawful, abusive or fraudulent purposes.</li>
      </ul>

      <h2>12. Content and reviews</h2>
      <p>
        You grant us permission to use the photos, notes and feedback you submit for the purpose of
        completing and supporting your booking, including showing the professional the issue. Reviews
        may be displayed with your first name and area. We may remove content that is abusive, false
        or unlawful. All platform content, branding and software remain our property or that of our
        licensors.
      </p>

      <h2>13. Suspension and termination</h2>
      <p>
        We may suspend or close an account for breach of these Terms, safety concerns, fraud or
        repeated cancellations. You may stop using the platform at any time and ask us to close your
        account by contacting support.
      </p>

      <h2>14. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of India. Subject to applicable consumer law, courts at{" "}
        <strong>Rewari, Haryana</strong> have exclusive jurisdiction. Please raise any concern with
        support first — we will try to resolve it within 15 days.
      </p>

      <h2>15. Changes and contact</h2>
      <p>
        We may update these Terms as the service evolves; the date at the top will change and material
        updates will be notified in the app. Questions: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>{" "}
        or <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>. Registered address: {BRAND.address}.
      </p>
    </LegalPage>
  );
}
