    import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for LifeOS, operated by Nexora Technologies.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            LifeOS
          </Link>

          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to LifeOS
          </Link>
        </div>
      </nav>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-sm text-primary font-medium mb-3">
            Legal
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Terms of Service
          </h1>

          <p className="mt-4 text-muted">
            Last updated: September 16, 2026
          </p>
        </header>

        <div className="space-y-10 text-sm sm:text-base leading-7 text-muted">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>

            <p>
              By accessing or using LifeOS, you agree to these Terms of
              Service. If you do not agree with these terms, please do not
              use the service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. About LifeOS
            </h2>

            <p>
              LifeOS is a personal productivity and personal operating
              system platform operated by{" "}
              <strong className="text-foreground">
                Nexora Technologies
              </strong>
              , the parent company of LifeOS.
            </p>

            <p className="mt-4">
              LifeOS is designed to help users organize and manage areas of
              their digital life, including tasks, goals, habits, calendar
              events, notes, finances, study activities, and AI-assisted
              productivity features.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Your Account
            </h2>

            <p>
              You are responsible for providing accurate information when
              creating an account and for keeping your account credentials
              secure. You are also responsible for activity performed
              through your account.
            </p>

            <p className="mt-4">
              Do not share your password or authentication credentials with
              other people. If you believe your account has been accessed
              without authorization, contact LifeOS support.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Your Data
            </h2>

            <p>
              You retain responsibility for the information you enter into
              LifeOS. LifeOS stores account and application data in order to
              provide the features of the service.
            </p>

            <p className="mt-4">
              You should not use LifeOS as the sole place to store critical
              information without maintaining appropriate backups.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Acceptable Use
            </h2>

            <p>
              You agree not to misuse LifeOS, attempt to gain unauthorized
              access to the service, interfere with its operation, abuse
              authentication systems, or use the service for unlawful
              purposes.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. AI Assistant
            </h2>

            <p>
              LifeOS may provide AI-assisted responses, recommendations,
              summaries, planning assistance, and other generated content.
              AI-generated information may be incomplete, inaccurate, or
              unsuitable for a particular situation.
            </p>

            <p className="mt-4">
              AI responses should be treated as assistance rather than
              professional advice. You are responsible for reviewing
              important information before relying on it.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Financial Features
            </h2>

            <p>
              LifeOS may provide tools for recording and organizing income,
              expenses, budgets, and other financial information. These
              features are provided for organizational and informational
              purposes.
            </p>

            <p className="mt-4">
              LifeOS does not provide personalized financial, investment,
              tax, accounting, or legal advice unless explicitly stated
              otherwise.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Service Availability and Changes
            </h2>

            <p>
              LifeOS may modify, improve, suspend, or discontinue parts of
              the service from time to time. Features may change as the
              service develops.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. Account Suspension or Termination
            </h2>

            <p>
              Access to LifeOS may be suspended or terminated if an account
              violates these Terms, creates a security risk, or is used in
              a way that may harm the service or other users.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. Intellectual Property
            </h2>

            <p>
              LifeOS, its software, branding, interface, design, and related
              materials are owned by or licensed to Nexora Technologies and
              are protected by applicable intellectual-property laws.
            </p>

            <p className="mt-4">
              You may not copy, modify, distribute, or commercially exploit
              protected LifeOS materials without appropriate permission.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Disclaimer
            </h2>

            <p>
              LifeOS is provided on an availability basis. While reasonable
              efforts may be made to keep the service reliable and secure,
              uninterrupted operation and complete accuracy of all features
              cannot be guaranteed.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              12. Limitation of Liability
            </h2>

            <p>
              To the extent permitted by applicable law, Nexora Technologies
              and LifeOS will not be responsible for indirect, incidental,
              special, or consequential losses arising from use of the
              service.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Changes to These Terms
            </h2>

            <p>
              These Terms may be updated when LifeOS changes or new features
              are introduced. The updated version will be published on this
              page with a revised update date.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              14. Contact
            </h2>

            <p>
              LifeOS is operated by{" "}
              <strong className="text-foreground">
                Nexora Technologies
              </strong>
              .
            </p>

            <p className="mt-4">
              If you have questions about these Terms of Service, LifeOS,
              or its services, please contact Nexora Technologies through
              the official support channel provided on the LifeOS website.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-6 text-sm text-muted">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href="/security"
              className="hover:text-foreground transition-colors"
            >
              Security
            </Link>

            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>

            <Link
              href="/"
              className="hover:text-foreground transition-colors"
            >
              LifeOS Home
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted">
            © {new Date().getFullYear()} Nexora Technologies. LifeOS is a
            product of Nexora Technologies.
          </p>
        </footer>
      </article>
    </main>
  );
}