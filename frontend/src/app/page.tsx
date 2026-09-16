import Link from "next/link";

const FEATURES = [
  { title: "Tasks", desc: "Create, prioritize, and track tasks with due dates, subtasks, and recurring reminders." },
  { title: "Goals", desc: "Set goals with milestones and see real progress computed from your actual activity." },
  { title: "Habits", desc: "Build streaks with server-validated completion — no gaming the count." },
  { title: "Calendar", desc: "Day, week, and month views for events, deadlines, and study sessions." },
  { title: "Finance", desc: "Track income, expenses, and budgets. Your data, never shared across accounts." },
  { title: "AI Assistant", desc: "Ask what to focus on today. Answers are grounded in your own data, not guesses." },
];

export default function LandingPage() {
  return (
    <div>
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg">LifeOS</span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/auth/login" className="text-muted hover:text-foreground">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          What should you focus on today?
        </h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          LifeOS brings your tasks, goals, habits, calendar, study, and finances into one
          place — and helps you decide what actually matters right now.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90"
          >
            Start using LifeOS
          </Link>
          <Link href="/features" className="px-6 py-3 rounded-md font-medium border border-border hover:bg-surface">
            See features
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-border rounded-lg p-6 bg-surface">
              <h3 className="font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} LifeOS</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/security" className="hover:text-foreground">Security</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
