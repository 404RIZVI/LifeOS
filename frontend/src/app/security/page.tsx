import Link from "next/link";

export const metadata = {
  title: "Security",
  description:
    "Security practices and principles for LifeOS, operated by Nexora Technologies.",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
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

      <article className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-12">
          <p className="text-sm text-primary font-medium mb-3">
            Security
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            LifeOS Security
          </h1>

          <p className="mt-4 text-muted">
            Last updated: September 16, 2026
          </p>
        </header>

        <div className="space-y-10 text-sm sm:text-base leading-7 text-muted">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Our Approach to Security
            </h2>

            <p>
              LifeOS is designed with security and privacy in mind. We use
              technical and organizational safeguards intended to protect
              user accounts, application data, and the availability of the
              service.
            </p>

            <p className="mt-4">
              LifeOS is operated by{" "}
              <strong className="text-foreground">
                Nexora Technologies
              </strong>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Account Security
            </h2>

            <p>
              LifeOS uses authentication mechanisms designed to prevent
              unauthorized access to user accounts.
            </p>

            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Authenticated access to protected application features.</li>
              <li>Session-based security for authenticated users.</li>
              <li>Password protection for account credentials.</li>
              <li>Server-side authorization checks for protected resources.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Data Protection
            </h2>

            <p>
              LifeOS is designed to restrict access to user data to
              authorized accounts and application processes.
            </p>

            <p className="mt-4">
              Application data may include tasks, goals, habits, calendar
              events, notes, financial records, and AI conversations created
              by users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Secure Communication
            </h2>

            <p>
              Production deployments of LifeOS should use HTTPS/TLS to
              protect information transmitted between users and the service.
            </p>

            <p className="mt-4">
              Security configurations may differ between development and
              production environments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Security Headers
            </h2>

            <p>
              LifeOS uses security-related HTTP headers intended to reduce
              common web security risks.
            </p>

            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Content Security Policy controls.</li>
              <li>Frame and embedding protections.</li>
              <li>Content type protections.</li>
              <li>Referrer policy controls.</li>
              <li>Permissions policy controls.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Access Control
            </h2>

            <p>
              Protected LifeOS resources are intended to be accessible only
              to properly authenticated and authorized users.
            </p>

            <p className="mt-4">
              Server-side authorization is used rather than relying only on
              frontend visibility or interface controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Infrastructure Security
            </h2>

            <p>
              LifeOS may use infrastructure services such as databases,
              caching systems, hosting providers, and other supporting
              services.
            </p>

            <p className="mt-4">
              Production infrastructure should be configured using
              appropriate access controls, protected credentials, network
              restrictions, backups, monitoring, and security updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Secrets and Credentials
            </h2>

            <p>
              Production secrets such as database credentials, authentication
              secrets, API keys, and service credentials should not be
              included in publicly accessible source code.
            </p>

            <p className="mt-4">
              Developers and administrators should use appropriate secret
              management practices when deploying LifeOS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. AI Security
            </h2>

            <p>
              LifeOS AI is designed to operate within the application's
              authenticated environment. AI-generated content should not be
              treated as a security or authorization mechanism.
            </p>

            <p className="mt-4">
              Users should avoid submitting highly sensitive information
              unless the applicable LifeOS privacy documentation explicitly
              describes how that information is processed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. Voice Features
            </h2>

            <p>
              LifeOS may provide browser-based voice input and text-to-speech
              functionality. Depending on the browser and implementation,
              voice processing may involve browser or third-party services.
            </p>

            <p className="mt-4">
              Microphone access is controlled through browser permissions.
              Users can manage microphone permissions through their browser
              settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Monitoring and Incident Response
            </h2>

            <p>
              Security and operational monitoring may be used to identify
              errors, abuse, suspicious activity, and infrastructure
              problems.
            </p>

            <p className="mt-4">
              If a security incident affecting users is identified, LifeOS
              will take reasonable steps appropriate to the circumstances
              and applicable requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              12. Responsible Security Reporting
            </h2>

            <p>
              If you discover a potential security vulnerability in LifeOS,
              please report it responsibly through the official LifeOS
              support channel.
            </p>

            <p className="mt-4">
              Please do not intentionally access, modify, delete, or expose
              another user's information while investigating a suspected
              security issue.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Security Limitations
            </h2>

            <p>
              No online service can guarantee absolute security. Security
              measures reduce risk but cannot eliminate every possible
              threat.
            </p>

            <p className="mt-4">
              Users should maintain strong passwords, protect their
              authentication credentials, keep their devices secure, and
              avoid sharing account access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              14. Changes to Security Practices
            </h2>

            <p>
              LifeOS may improve or change its security architecture,
              infrastructure, authentication systems, and operational
              practices as the service develops.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              15. Contact
            </h2>

            <p>
              LifeOS is operated by{" "}
              <strong className="text-foreground">
                Nexora Technologies
              </strong>
              .
            </p>

            <p className="mt-4">
              Security-related reports should be submitted through the
              official LifeOS support channel.
            </p>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-6 text-sm text-muted">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>

            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
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