import type { Metadata } from "next";
import { LegalPage } from "@/components/customer/legal-page";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Mistri Now Rewari collects, uses, stores and protects personal data for customers and service professionals.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      description="What we collect, why we need it, who can see it, and how you can control it."
      updated="23 October 2026"
      current="/privacy"
    >
      <h2>1. Who we are</h2>
      <p>
        Mistri Now Rewari is a home-services booking platform operated by{" "}
        <strong>{BRAND.legalName}</strong>, Rewari, Haryana {BRAND.pincode}. For the purposes of
        India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act), we act as the{" "}
        <strong>Data Fiduciary</strong> for the personal data described below.
      </p>
      <p>
        Questions or requests: <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or{" "}
        <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> mobile number (verified by OTP), full name, optional email,
          and the role you choose (customer or professional).
        </li>
        <li>
          <strong>Booking data:</strong> service selected, address, preferred time slot, notes you
          add, photos you attach on the issue, and the status history of the job.
        </li>
        <li>
          <strong>Payment data:</strong> payment method chosen (UPI or cash after service), payment
          status and booking amount. We do <strong>not</strong> receive or store card numbers, UPI
          PINs or bank credentials. UPI payments are processed by your UPI app and bank.
        </li>
        <li>
          <strong>Professional verification data:</strong> Aadhaar images, trade category, and
          verification decision. Aadhaar is collected solely to verify identity before a professional
          can accept jobs.
        </li>
        <li>
          <strong>Technical data:</strong> basic logs such as IP address, device/browser type and
          error records, used for security and debugging.
        </li>
        <li>
          <strong>Communications:</strong> support calls, emails or messages, and the booking they
          relate to.
        </li>
      </ul>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To create and secure your account, including OTP verification.</li>
        <li>To assign a professional, share the job details needed to perform it, and let you track it live.</li>
        <li>To verify professionals&apos; identity and keep the marketplace safe.</li>
        <li>To calculate bills, record payments and handle warranties or disputes.</li>
        <li>To provide support and send service messages (not marketing spam).</li>
        <li>To detect fraud, prevent abuse, and comply with legal or accounting obligations.</li>
      </ul>
      <p>
        Under the DPDP Act we rely on your <strong>consent</strong> (for example, when you create an
        account or upload photos/Aadhaar) and on <strong>legitimate uses</strong> permitted by law
        (such as safety, fraud prevention and legal compliance). You can withdraw consent at any time
        by contacting us; this will not affect processing already carried out.
      </p>

      <h2>4. Who can see your data</h2>
      <ul>
        <li>
          <strong>Your assigned professional</strong> sees your name, phone number, address, service,
          notes and issue photos — only for jobs assigned to them.
        </li>
        <li>
          <strong>Our operations team</strong> sees bookings, contact details and Aadhaar documents
          for support, verification and dispute handling. Access is role-restricted.
        </li>
        <li>
          <strong>Service providers</strong> process data on our instructions: our database, auth and
          file-storage provider (Supabase), our hosting provider, and UPI payment apps when you choose
          to pay online. They are not permitted to use your data for their own marketing.
        </li>
        <li>
          <strong>Authorities</strong> where we are legally required to disclose information, or to
          protect someone&apos;s safety.
        </li>
      </ul>
      <p>
        <strong>We do not sell personal data</strong> and we do not share Aadhaar images with
        customers.
      </p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>
          <strong>Booking and payment records:</strong> retained for up to 8 years where needed for
          accounting, tax, warranty and dispute purposes.
        </li>
        <li>
          <strong>Account data:</strong> retained while your account is active. If you ask us to close
          it, we delete or anonymise data that we are not legally required to keep.
        </li>
        <li>
          <strong>Aadhaar documents:</strong> retained while the professional is active and for a
          reasonable period afterwards for dispute resolution. You can request deletion after account
          closure, subject to legal retention duties.
        </li>
        <li>
          <strong>Issue photos:</strong> kept with the booking record so warranty claims and disputes
          can be reviewed.
        </li>
      </ul>

      <h2>6. How we protect it</h2>
      <p>
        Access is protected by OTP-based sign-in, role-based permissions and database row-level
        security, so customers only see their own bookings and professionals only see jobs assigned
        to them. Aadhaar files are stored in a private storage bucket accessible only to the
        verification team. Data in transit is encrypted using HTTPS. No system is perfectly secure;
        if a breach affects you, we will notify you and the relevant authority as required by law.
      </p>

      <h2>7. Your rights</h2>
      <ul>
        <li>Ask for a copy of the personal data we hold about you.</li>
        <li>Correct inaccurate or incomplete data (name, email, address).</li>
        <li>Ask us to delete data we no longer need, subject to legal retention.</li>
        <li>Withdraw consent for future processing.</li>
        <li>Nominate a person to exercise your rights in the event of death or incapacity.</li>
        <li>Complain to us first, and to the Data Protection Board of India if unresolved.</li>
      </ul>
      <p>
        To exercise any right, contact us with your registered mobile number and the request. We aim
        to respond within 30 days.
      </p>

      <h2>8. Grievance redressal</h2>
      <p>
        <strong>Grievance Officer:</strong> [Name and designation to be appointed before launch —
        attorney review pending]. Until the appointment is published, please contact the support team
        at <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or{" "}
        <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>, {BRAND.address}. We will acknowledge your
        complaint and work to resolve it within the timelines required by applicable law.
      </p>

      <h2>9. Children</h2>
      <p>
        The platform is intended for people aged 18 and above. We do not knowingly collect personal
        data from children. If you believe a child has created an account, contact us and we will
        remove it.
      </p>

      <h2>10. Cookies and local storage</h2>
      <p>
        We use a session cookie to keep you signed in, and limited browser storage for interface
        preferences. We do not run third-party advertising trackers. Disabling cookies may prevent
        sign-in from working.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy as the service changes. The &quot;last updated&quot; date at the top
        will change, and material updates will be notified in the app or by SMS where appropriate.
      </p>
    </LegalPage>
  );
}
