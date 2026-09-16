import Link from "next/link";

export const metadata = {
  title: "Contact",
  description:
    "Contact LifeOS and Nexora Technologies for support, privacy, and security inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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

      <article className="max-w-5xl mx-auto px-6 py-16">
        <header className="max-w-2xl mb-14">
          <p className="text-sm text-primary font-medium mb-3">
            Contact
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            How can we help?
          </h1>

          <p className="mt-5 text-muted text-base sm:text-lg leading-7">
            Have a question about LifeOS, your account, privacy, or security?
            Find the appropriate contact option below.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">

          {/* General Support */}
          <section className="rounded-2xl border border-border bg-surface p-7">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
              ?
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              General Support
            </h2>

            <p className="mt-3 text-muted leading-7">
              For questions about using LifeOS, account problems, features,
              or general assistance, contact the LifeOS support team.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted">
                Support email
              </p>

              <a
                href="mailto:sayyadmohd10112009@gmail.com"
                className="mt-2 inline-block text-sm text-primary hover:opacity-80 transition-opacity break-all"
              >
                sayyadmohd10112009@gmail.com
              </a>

              <p className="mt-3 text-xs text-muted">
                Click the email address to contact LifeOS support.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="rounded-2xl border border-border bg-surface p-7">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
              P
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              Privacy Requests
            </h2>

            <p className="mt-3 text-muted leading-7">
              For privacy questions or requests concerning personal
              information, please contact us using the official support
              email.
            </p>

            <div className="mt-5">
              <a
                href="mailto:sayyadmohd10112009@gmail.com?subject=LifeOS%20Privacy%20Request"
                className="inline-flex items-center text-sm font-medium text-primary hover:opacity-80 transition-opacity"
              >
                Email Privacy Support →
              </a>
            </div>

            <div className="mt-4">
              <Link
                href="/privacy"
                className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Read Privacy Policy →
              </Link>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-border bg-surface p-7">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
              S
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              Security Reports
            </h2>

            <p className="mt-3 text-muted leading-7">
              If you discover a potential security vulnerability in LifeOS,
              please report it responsibly through the official support
              email.
            </p>

            <div className="mt-5">
              <a
                href="mailto:sayyadmohd10112009@gmail.com?subject=LifeOS%20Security%20Report"
                className="inline-flex items-center text-sm font-medium text-primary hover:opacity-80 transition-opacity"
              >
                Report a Security Issue →
              </a>
            </div>

            <div className="mt-4">
              <Link
                href="/security"
                className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                View Security Information →
              </Link>
            </div>
          </section>

          {/* Legal */}
          <section className="rounded-2xl border border-border bg-surface p-7">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
              L
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              Legal
            </h2>

            <p className="mt-3 text-muted leading-7">
              LifeOS is operated by{" "}
              <strong className="text-foreground">
                Nexora Technologies
              </strong>
              , the parent company of LifeOS.
            </p>

            <div className="mt-6 flex flex-wrap gap-5">
              <Link
                href="/terms"
                className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
              >
                Terms of Service →
              </Link>

              <Link
                href="/privacy"
                className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
              >
                Privacy Policy →
              </Link>
            </div>
          </section>
        </div>

        {/* Contact Directly */}
        <section className="mt-14 rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Contact LifeOS
          </h2>

          <p className="mt-4 max-w-3xl text-muted leading-7">
            For general support, privacy requests, security reports, or
            questions about LifeOS, you can contact the LifeOS support team
            directly.
          </p>

          <a
            href="mailto:sayyadmohd10112009@gmail.com"
            className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Email LifeOS Support
          </a>

          <p className="mt-4 text-sm text-muted break-all">
            sayyadmohd10112009@gmail.com
          </p>
        </section>

        {/* Nexora */}
        <section className="mt-6 rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            About Nexora Technologies
          </h2>

          <p className="mt-4 max-w-3xl text-muted leading-7">
            Nexora Technologies is the parent company of LifeOS. LifeOS is
            being developed as a personal operating system designed to bring
            productivity, organization, planning, and intelligent assistance
            into one connected experience.
          </p>
        </section>

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
              href="/security"
              className="hover:text-foreground transition-colors"
            >
              Security
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