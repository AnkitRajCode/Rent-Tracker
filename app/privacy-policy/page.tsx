import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how RentTracker collects, uses, and protects your personal data.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "**Owner accounts:** When you sign up as a property owner, we collect your email address and optionally your full name and phone number.",
      "**Property & tenant data:** Information you enter - property names, addresses, house details, tenant names, phone numbers, email addresses, Aadhaar numbers, move-in dates, rent amounts, and payment records - is stored securely in your account.",
      "**Document uploads:** Agreement files and Aadhaar documents you upload are stored in Supabase Storage, scoped to your account.",
      "**Tenant portal:** When a tenant accesses the portal via email OTP, their email address is used solely to authenticate and display their own tenancy data.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To provide core rent-tracking functionality: managing properties, houses, tenants, and payment records.",
      "To send one-time passcodes (OTP) to tenants for secure, password-free portal access.",
      "To display relevant data only to the authenticated owner or the specific tenant it belongs to.",
      "We do **not** use your data for advertising, analytics resale, or any purpose beyond operating this application.",
    ],
  },
  {
    title: "3. Data Storage & Security",
    body: [
      "All data is stored on Supabase (PostgreSQL), hosted on infrastructure compliant with SOC 2 and ISO 27001 standards.",
      "Row-Level Security (RLS) policies are enforced at the database level - owners can only access their own records, and tenants can only read their own tenancy data.",
      "Passwords are never stored in plain text. Owner accounts use Supabase Auth (bcrypt-hashed). Tenant access uses stateless email OTP with no password at all.",
      "All data in transit is encrypted using TLS 1.2 or higher.",
    ],
  },
  {
    title: "4. Data Sharing",
    body: [
      "We do **not** sell, rent, or trade your personal information to third parties.",
      "Data may be shared only with the following sub-processors needed to operate the service: Supabase Inc. (database & auth), and Google Fonts (font delivery via CDN - no personal data is involved).",
      "We may disclose data if required by law or to protect the rights and safety of users.",
    ],
  },
  {
    title: "5. Tenant Data & Owner Responsibility",
    body: [
      "Owners are responsible for obtaining appropriate consent from tenants before entering their personal information (name, phone, email, Aadhaar) into this system.",
      "Owners control whether a tenant can access the portal (`can_login` flag) and whether deposit refund information is visible to the tenant.",
      "Tenants may contact the owner directly to request correction or deletion of their data.",
    ],
  },
  {
    title: "6. Cookies & Local Storage",
    body: [
      "This application uses cookies set by Supabase Auth to maintain your login session. These are strictly necessary cookies and are not used for tracking.",
      "No third-party advertising or analytics cookies are used.",
    ],
  },
  {
    title: "7. Data Retention",
    body: [
      "Your data is retained as long as your account is active.",
      "Vacated tenant records are preserved in the `tenant_history` table for your records but are no longer active.",
      "To request deletion of your account and all associated data, contact us at the address below.",
    ],
  },
  {
    title: "8. Your Rights",
    body: [
      "You have the right to access, correct, and delete your personal data.",
      "As an owner, you can manage all your data directly through the dashboard.",
      "As a tenant, you may contact the property owner or reach us directly to request data access or deletion.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated effective date.",
      "Continued use of the application after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "10. Contact Us",
    body: [
      "If you have any questions about this Privacy Policy, please contact:",
      "**NextGenUI** - Created & Designed by Ankit Raj and Satyajeet Ramnit",
      "Email: privacy@nextgenui.in",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#030304]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0F1115]/80 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-[#EA580C]/40 flex items-center justify-center">
            <Image src="/rent_logo.png" alt="RentTracker" width={16} height={16} />
          </div>
          <span className="font-heading font-bold text-white text-sm">
            Rent<span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">Tracker</span>
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-mono text-[#94A3B8] hover:text-[#F7931A] transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/40 flex items-center justify-center flex-shrink-0 mt-1">
            <Shield className="w-5 h-5 text-[#F7931A]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-[#94A3B8] text-sm font-mono mt-1">
              Effective date: <span className="text-[#F7931A]">May 1, 2026</span>
            </p>
            <p className="text-[#94A3B8] text-sm mt-2 max-w-xl">
              This Privacy Policy explains how RentTracker (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;)
              collects, uses, and protects information when you use our application.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-[#0F1115] border border-white/10 rounded-2xl p-6"
            >
              <h2 className="font-heading text-base font-semibold text-white mb-3">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.body.map((item, i) => (
                  <li key={i} className="text-[#94A3B8] text-sm leading-relaxed flex gap-2">
                    <span className="text-[#F7931A] mt-1 flex-shrink-0">›</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: item
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>'),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center space-y-1">
          <p className="text-[#94A3B8] text-xs font-mono">
            &copy; 2026 NextGenUI. All Rights Reserved.
          </p>
          <p className="text-[#94A3B8]/60 text-xs font-mono">
            Created &amp; Designed by Ankit Raj | Satyajeet Ramnit
          </p>
          <p className="text-[#94A3B8]/40 text-xs font-mono mt-2">
            Released under the{" "}
            <Link href="/license" className="text-[#F7931A]/70 hover:text-[#F7931A] transition-colors">
              MIT License
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
