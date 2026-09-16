import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for LifeOS, operated by Nexora Technologies.",
};

export default function PrivacyPage() {
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
            Legal
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Privacy Policy
          </h1>

          <p className="mt-4 text-muted">
            Last updated: September 16, 2026
          </p>
        </header>

        <div className="space-y-10 text-sm sm:text-base leading-7 text-muted">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Introduction
            </h2>

            <p>
              This Privacy Policy explains how LifeOS collects, uses, stores,
              and protects information when you use the LifeOS service.
            </p>

            <p className="mt-4">
              LifeOS is operated by{" "}
              <strong className="text-foreground">
                Nexora Technologies
              </strong>
              , the parent company of LifeOS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Information We Collect
            </h2>

            <p>
              Depending on the features you use, LifeOS may collect and store
              the following categories of information:
            </p>

            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Account information such as email address and authentication data.</li>
              <li>Profile information that you choose to provide.</li>
              <li>Tasks, subtasks, priorities, categories, and due dates.</li>
              <li>Goals and progress information.</li>
              <li>Habit information and completion records.</li>
              <li>Calendar events and scheduling information.</li>
              <li>Notes and other content that you create.</li>
              <li>Financial records that you choose to enter, such as income and expenses.</li>
              <li>Messages and conversations submitted to LifeOS AI.</li>
              <li>Technical information required to operate and secure the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. How We Use Information
            </h2>

            <p>
              Information may be used to provide, maintain, secure, and
              improve LifeOS and its features.
            </p>

            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>To authenticate and manage user accounts.</li>
              <li>To save and display the information you create.</li>
              <li>To provide tasks, goals, habits, calendar, notes, and finance features.</li>
              <li>To provide AI-assisted productivity features.</li>
              <li>To protect the service against abuse and unauthorized access.</li>
              <li>To diagnose technical problems and improve reliability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. LifeOS AI
            </h2>

            <p>
              When you use LifeOS AI, the messages and relevant LifeOS
              information required to provide the requested functionality
              may be processed to generate a response.
            </p>

            <p className="mt-4">
              AI-generated responses may be inaccurate or incomplete. Do not
              enter sensitive information into AI conversations unless you
              are comfortable with it being processed to provide the AI
              feature.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Financial Information
            </h2>

            <p>
              LifeOS may allow you to store financial information such as
              income, expenses, accounts, and transactions.
            </p>

            <p className="mt-4">
              This information is provided by you for personal organization.
              LifeOS does not use these features to provide personalized
              financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              6. Cookies and Sessions
            </h2>

            <p>
              LifeOS may use cookies or similar technologies to maintain
              authenticated sessions, support security features, and provide
              essential functionality.
            </p>

            <p className="mt-4">
              Essential cookies may be required for parts of LifeOS to
              function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              7. Data Security
            </h2>

            <p>
              We use reasonable technical and organizational measures
              intended to protect information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>

            <p className="mt-4">
              However, no internet service or electronic storage system can
              be guaranteed to be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              8. Data Sharing
            </h2>

            <p>
              LifeOS is designed so that user data belongs to the account
              that created it and is not intentionally shared with other
              LifeOS user accounts.
            </p>

            <p className="mt-4">
              Information may be processed by service providers or
              infrastructure required to operate LifeOS, where applicable.
              Information may also be disclosed when required by law or
              necessary to protect the security and integrity of the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              9. Data Retention
            </h2>

            <p>
              Information may be retained for as long as necessary to
              provide LifeOS services, maintain account functionality,
              comply with applicable obligations, resolve disputes, and
              enforce agreements.
            </p>

            <p className="mt-4">
              Retention periods may vary depending on the type of
              information and the feature involved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              10. Your Choices and Rights
            </h2>

            <p>
              Depending on applicable law and the features available in
              LifeOS, you may have rights concerning your personal
              information, including rights to access, correct, export, or
              request deletion of certain information.
            </p>

            <p className="mt-4">
              Requests can be made through the official LifeOS support
              channel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              11. Children's Privacy
            </h2>

            <p>
              LifeOS is not intended to knowingly collect personal
              information from children where doing so would violate
              applicable law. If you believe a child has provided personal
              information improperly, please contact us through the
              official support channel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              12. Third-Party Services
            </h2>

            <p>
              LifeOS may use third-party infrastructure, authentication,
              analytics, communication, AI, hosting, or other services as
              the platform develops.
            </p>

            <p className="mt-4">
              Such services may process information according to their own
              privacy policies and applicable agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              13. Changes to This Privacy Policy
            </h2>

            <p>
              This Privacy Policy may be updated when LifeOS introduces new
              features, changes its data practices, or when required by
              applicable law.
            </p>

            <p className="mt-4">
              The latest version will always be published on this page with
              an updated effective date.
            </p>
          </section>

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
              For privacy-related questions or requests, please contact
              Nexora Technologies through the official LifeOS support
              channel.
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