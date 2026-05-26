import { Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiServer, FiShield, FiCpu, FiClock, FiUsers, FiFileText } from "react-icons/fi";

const sections = [
  {
    icon: FiFileText,
    title: "Information We Collect",
    content: [
      "We collect the following categories of information to provide the Bridge service:",
      "Account Information: When you sign up, we collect your email address and any profile details you provide (name, job title, target region, skills).",
      "Content You Submit: This includes job descriptions you paste or upload, your resume or experience summaries, files you attach (.pdf, .docx, .txt), and any URLs you ask us to fetch.",
      "Usage Data: We collect anonymized information about how you interact with the app (feature usage, page views) to improve the product. This cannot be traced back to you personally.",
    ],
  },
  {
    icon: FiCpu,
    title: "How We Use Your Information",
    content: [
      "We use your information solely to deliver and improve the Bridge service:",
      "Core Analysis: Job descriptions and experience summaries are sent to Google Gemini (our AI provider) to generate fit analyses, gap assessments, cover letters, and translation reports.",
      "Account Management: Your email and profile data are used to authenticate you, save your analysis history, and personalize your experience.",
      "Product Improvement: Aggregated, anonymized usage data helps us understand which features to build next.",
    ],
  },
  {
    icon: FiShield,
    title: "AI Processing & Data Handling",
    content: [
      "Bridge uses Google Gemini (gemini-2.5-flash and fallback models) to analyze your content. Here's how your data is handled:",
      "Transmission: Resume and job description text is sent to Google's API solely for the duration of the analysis request. Google does not use this data to train their models.",
      "No Persistent Storage: Google does not retain your content after the API response is returned.",
      "Caching: Analysis results are saved in your private Supabase store so you can revisit them later. You can delete any analysis at any time.",
    ],
  },
  {
    icon: FiServer,
    title: "Data Storage & Security",
    content: [
      "All user data is stored in Supabase, a HIPAA-compliant cloud database provider hosted on AWS.",
      "Row-Level Security: Every database query is scoped to your authenticated user ID. No user can access another user's data.",
      "Encryption: Data is encrypted in transit (TLS 1.3) and at rest (AES-256).",
      "File Uploads: Uploaded files are processed entirely in your browser. The extracted text is sent to our servers; the raw file is deleted after processing.",
    ],
  },
  {
    icon: FiClock,
    title: "Data Retention & Deletion",
    content: [
      "You control your data:",
      "Analysis History: Each analysis you run is saved to your account. You can delete individual analyses from the Projects page at any time.",
      "Account Deletion: You can delete your entire account and all associated data from the Profile page. This permanently removes all your analyses, personal information, and uploaded content.",
      "Backup Deletion: Deleted data is purged from active databases immediately and from backups within 30 days.",
    ],
  },
  {
    icon: FiUsers,
    title: "Third-Party Services",
    content: [
      "Bridge relies on the following third-party services to function. Each has its own privacy policy governing data handling:",
      "Supabase (supabase.com) — Authentication, database, and file storage.",
      "Google Gemini (cloud.google.com) — AI-powered resume analysis.",
      "Sentry (sentry.io) — Error monitoring and crash reporting (no personal data included).",
      "We never sell your personal information to any third party.",
    ],
  },
  {
    icon: FiShield,
    title: "Your Rights",
    content: [
      "Depending on your jurisdiction, you may have the following rights regarding your personal data:",
      "Right to Access: Request a copy of the data we hold about you.",
      "Right to Rectification: Correct inaccurate or incomplete data via your Profile page.",
      "Right to Deletion: Delete your data as described in the Data Retention section above.",
      "Right to Data Portability: Export your analysis history in a machine-readable format.",
      "To exercise any of these rights, contact us at the email below.",
    ],
  },
  {
    icon: FiFileText,
    title: "Cookies",
    content: [
      "Bridge uses only essential cookies required for authentication (Supabase Auth session tokens). We do not use tracking cookies, advertising cookies, or third-party analytics cookies.",
      "Session tokens are stored in your browser's local storage and are cleared when you sign out.",
    ],
  },
  {
    icon: FiFileText,
    title: "Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time. Material changes will be announced via email (if you have an account) or through an in-app notice. Continued use of Bridge after changes take effect constitutes acceptance of the updated policy.",
    ],
  },
  {
    icon: FiMail,
    title: "Contact",
    content: [
      "If you have questions, concerns, or requests regarding this privacy policy or your data, please reach out:",
      "Email: privacy@bridgeapp.com",
      "You may also open an issue on our project repository.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-8 w-fit"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight mb-1 font-cabinet">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: May 2026</p>

        <div className="space-y-10">
          {sections.map(({ icon: Icon, title, content }) => (
            <section key={title}>
              <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 mb-3">
                <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                {title}
              </h2>
              <div className="space-y-2">
                {content.map((line, i) => (
                  <p
                    key={i}
                    className={`text-sm leading-relaxed ${
                      line.startsWith("Account") ||
                      line.startsWith("Content") ||
                      line.startsWith("Usage") ||
                      line.startsWith("Core") ||
                      line.startsWith("Account Management") ||
                      line.startsWith("Product") ||
                      line.startsWith("Transmission") ||
                      line.startsWith("No Persistent") ||
                      line.startsWith("Caching") ||
                      line.startsWith("Row-Level") ||
                      line.startsWith("Encryption") ||
                      line.startsWith("File Uploads") ||
                      line.startsWith("Analysis History") ||
                      line.startsWith("Account Deletion") ||
                      line.startsWith("Backup") ||
                      line.startsWith("Supabase") ||
                      line.startsWith("Google") ||
                      line.startsWith("Sentry") ||
                      line.startsWith("Right to Access") ||
                      line.startsWith("Right to Rectification") ||
                      line.startsWith("Right to Deletion") ||
                      line.startsWith("Right to Data") ||
                      line.startsWith("Session") ||
                      line.startsWith("Email") ||
                      line.startsWith("You may also")
                        ? "text-zinc-600 pl-4 border-l-2 border-zinc-200"
                        : i === 0
                          ? "text-zinc-500"
                          : "text-zinc-600 pl-4 border-l-2 border-zinc-200"
                    }`}
                  >
                    {line.startsWith("Email:") ? (
                      <>
                        Email:{" "}
                        <a href="mailto:privacy@bridgeapp.com" className="text-zinc-900 underline underline-offset-2 hover:text-zinc-600 transition-colors">
                          privacy@bridgeapp.com
                        </a>
                      </>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
