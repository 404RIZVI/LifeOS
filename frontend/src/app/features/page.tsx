const FEATURES = [
  {
    title: "Tasks",
    description: "Plan, organize, and track everything you need to get done.",
  },
  {
    title: "Goals",
    description: "Turn your long-term ambitions into clear, actionable goals.",
  },
  {
    title: "Habits",
    description: "Build consistent routines and monitor your progress.",
  },
  {
    title: "Calendar",
    description: "Keep your schedule and important events organized.",
  },
  {
    title: "Notes",
    description: "Capture ideas, information, and things you want to remember.",
  },
  {
    title: "Finance",
    description: "Track accounts, transactions, and your personal finances.",
  },
  {
    title: "LifeOS AI",
    description: "Get intelligent assistance across your personal operating system.",
  },
  {
    title: "Voice Assistant",
    description: "Interact with LifeOS using voice input and spoken responses.",
  },
  {
    title: "Privacy & Security",
    description: "Keep your personal LifeOS data protected and under your control.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-primary font-medium mb-3">LifeOS Features</p>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Everything you need to run your life in one place.
          </h1>

          <p className="mt-6 text-muted text-lg">
            LifeOS brings your tasks, goals, habits, calendar, notes, finance,
            and AI assistance together into one personal operating system.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-6 hover:opacity-90 transition"
            >
              <h2 className="text-xl font-semibold">{feature.title}</h2>

              <p className="mt-3 text-muted leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}