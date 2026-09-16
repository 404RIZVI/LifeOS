import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LifeOS — Your Personal Operating System",
    template: "%s | LifeOS",
  },
  description:
    "LifeOS brings your tasks, goals, habits, calendar, study, finance, and career into one place, and helps you decide what to focus on next.",
  verification: {
    google: "_M_VjtYoaaWfKKv9T_KUD5VbJ042FELqZx4_XnjckqI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}