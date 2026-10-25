import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: "Mistri Now Rewari — Plumber, Electrician & AC Repair at Home",
    template: "%s · Mistri Now Rewari",
  },
  description:
    "Book verified plumbers, electricians, RO and AC technicians in Rewari. Fixed prices, 1-hour response, 7-day service warranty. A unit of Lakshya Yadav Enterprises.",
  applicationName: BRAND.name,
  keywords: [
    "plumber in Rewari",
    "electrician Rewari",
    "AC repair Rewari",
    "RO service Rewari",
    "home services Rewari",
    "Mistri Now Rewari",
    "washing machine repair Rewari",
  ],
  authors: [{ name: BRAND.legalName }],
  creator: BRAND.legalName,
  publisher: BRAND.legalName,
  category: "home services",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: BRAND.name,
    title: "Mistri Now Rewari — Home services at fixed prices",
    description:
      "Verified plumbers, electricians and AC technicians at your door in Rewari. 7-day warranty. A unit of Lakshya Yadav Enterprises.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Mistri Now Rewari — trusted home services in Rewari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mistri Now Rewari — Home services at fixed prices",
    description:
      "Verified plumbers, electricians and AC technicians at your door in Rewari. 7-day warranty.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf6",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: BRAND.name,
  legalName: BRAND.legalName,
  description:
    "Local home-services marketplace in Rewari offering plumbing, electrical, RO, washing machine, welding and AC services.",
  url: BRAND.siteUrl,
  telephone: `+91${BRAND.phone}`,
  priceRange: "₹199–₹3,399",
  image: `${BRAND.siteUrl}/og.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: BRAND.city,
    addressRegion: BRAND.state,
    postalCode: BRAND.pincode,
    addressCountry: "IN",
  },
  areaServed: {
    "@type": "City",
    name: "Rewari",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "07:00",
    closes: "21:00",
  },
  makesOffer: [
    "Plumber",
    "Electrician",
    "RO Service",
    "Washing Machine Repair",
    "Welding",
    "AC Service",
    "AC Gas Filling",
  ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${bricolage.variable}`}
    >
      <body>
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-cream-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            className: "font-sans",
            style: { borderRadius: "16px" },
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
      </body>
    </html>
  );
}
