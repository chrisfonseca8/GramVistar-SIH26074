import Link from "next/link";
import { RoleBadge } from "@/components/layout/RoleBadge";

const PIPELINE_STEPS = [
  {
    step: "1",
    title: "Seeded weather & environmental data",
    description:
      "Block-level forecast and historical weather, elevation, and soil data loaded straight into the browser — no server round-trip.",
  },
  {
    step: "2",
    title: "Derived variables & downscaling",
    description:
      "Humidity, heat index, frost risk, soil moisture, spray/irrigation windows and more are computed client-side, then spread from block-level to each of the 5 panchayats using elevation-aware interpolation.",
  },
  {
    step: "3",
    title: "Uncertainty",
    description:
      "A deterministic parameter-sensitivity ensemble gives every downscaled value a spread, so a Scientist can see how confident a reading actually is before acting on it.",
  },
  {
    step: "4",
    title: "Advisory drafting & review",
    description:
      "A Scientist builds a structured input per panchayat, generates a draft advisory, then edits, reviews, approves or rejects it before anything is published.",
  },
  {
    step: "5",
    title: "Farmer & Government advisories",
    description:
      "Approved advisories reach Farmers as plain-language field actions, and District/Block officials as a separate operational briefing — reviewed and published independently.",
  },
  {
    step: "6",
    title: "Feedback loop",
    description:
      "Farmers report back — crop stage, irrigation, pest sightings, damage, yield — and a Scientist sees every submission in one inbox, closing the loop back to the field.",
  },
];

const AUDIENCES = [
  {
    icon: "🔬",
    title: "Scientist / KVK",
    description:
      "Diagnostics, downscaled forecasts, uncertainty, crop-threshold tuning, and the advisory drafting/review workflow for every panchayat in the block.",
  },
  {
    icon: "🌾",
    title: "Farmer",
    description:
      "A mobile-first daily screen: today's actions, alerts, forecast, and the panchayat's published advisory in plain language — with Hindi support.",
  },
  {
    icon: "🏛️",
    title: "Government / District Administration",
    description:
      "Risk maps, vulnerability ranking, alert escalation, and a relief & resource allocator built from Scientist-approved advisories.",
  },
];

const FOOTER_PAGES = [
  { label: "Home", href: "#top" },
  { label: "Why", href: "#why" },
  { label: "Platform", href: "#platform" },
  { label: "Who it's for", href: "#who" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Home() {
  return (
    <main
      id="top"
      className="flex flex-1 flex-col bg-white font-[family-name:var(--font-inter),Inter,Helvetica,sans-serif]"
    >
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-6 py-4">
        <span className="text-base font-bold tracking-tight text-[#111827]">
          GramVistar
        </span>
        <div className="hidden items-center gap-7 text-sm font-medium text-[#374151] sm:flex">
          <a href="#why" className="transition hover:text-[#111827]">
            Why
          </a>
          <a href="#platform" className="transition hover:text-[#111827]">
            Platform
          </a>
          <a href="#who" className="transition hover:text-[#111827]">
            Who it&apos;s for
          </a>
          <a href="#about" className="transition hover:text-[#111827]">
            About
          </a>
          <a href="#contact" className="transition hover:text-[#111827]">
            Contact
          </a>
        </div>
        <RoleBadge compact variant="landing" />
      </nav>

      <section className="bg-white px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-[#111827] sm:text-7xl">
            GramVistar
          </h1>
          <p className="max-w-2xl text-base text-[#374151] sm:text-lg">
            A decision-support platform that turns block-level weather
            forecasts into panchayat-level agro-meteorological advisories —
            for Scientists, Farmers, and District/Block administrators.
          </p>
          <div className="mt-2">
            <RoleBadge variant="landing" />
          </div>
        </div>
      </section>

      <div className="px-6 pb-4">
        <div className="relative mx-auto h-64 w-full max-w-5xl overflow-hidden rounded-2xl sm:h-96">
          {/* eslint-disable-next-line @next/next/no-img-element -- this is a static export app with no next/image usage anywhere */}
          <img
            src="/images/farmer-field-hero.jpg"
            alt="A farmer in a rice field checking a weather advisory on a phone"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>

      <section id="why" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-[auto_1fr]">
          <h2 className="text-3xl font-bold text-[#15803d]">Why</h2>
          <div className="space-y-4 text-sm leading-relaxed text-[#374151] sm:text-base">
            <p>
              Weather forecasts are usually issued at the block level — one
              number for an area that actually contains several panchayats at
              different elevations, with different soils and different crops
              at different growth stages. A farmer deciding whether to
              irrigate today, or a district official deciding where to send
              relief water, needs more than a single block-wide reading.
            </p>
            <p>
              GramVistar closes that gap entirely client-side: it downscales
              block forecasts to each panchayat, runs the derived
              calculations a Scientist would normally do by hand (heat
              stress, frost risk, spray windows, soil moisture, and
              more), and turns the result into a reviewed, published advisory
              — one version for Farmers, a separate one for Government
              officials — instead of a raw number nobody can act on.
            </p>
            <p>
              Every calculation is a real, documented function over the
              app&apos;s own seeded data. Where something genuinely
              can&apos;t be computed — no dataset, no signal — the app says
              so explicitly rather than inventing a value.
            </p>
          </div>
        </div>
      </section>

      <section
        id="platform"
        className="border-y border-[#e5e7eb] bg-[#f9fafb] px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[#e5e7eb] bg-white p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#dcfce7] text-sm font-bold text-[#15803d]">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-bold text-[#111827]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="who" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            Who it&apos;s for
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="rounded-2xl border border-[#e5e7eb] bg-white p-5"
              >
                <span className="text-3xl text-[#15803d]">
                  {audience.icon}
                </span>
                <h3 className="mt-3 text-sm font-bold text-[#111827]">
                  {audience.title}
                </h3>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="border-y border-[#e5e7eb] bg-[#f9fafb] px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            About
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#374151] sm:text-base">
            GramVistar is an agro-meteorological decision-support platform
            that turns block-level weather forecasts into panchayat-level
            diagnostics, crop decision support, alerts, and advisories for
            Scientists, Farmers, and District/Block administrators.
          </p>
        </div>
      </section>

      <section id="contact" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            Contact
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#374151] sm:text-base">
            Questions about GramVistar? Reach the project team at{" "}
            <a
              href="mailto:contact@gramvistar.example"
              className="font-medium text-[#15803d] underline underline-offset-4 hover:text-[#166534]"
            >
              contact@gramvistar.example
            </a>
            .
          </p>
        </div>
      </section>

      <footer className="bg-[#111827] px-6 py-12 text-[#d1d5db]">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <span className="text-base font-bold text-white">
              GramVistar
            </span>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-[#9ca3af]">
              Turning block-level weather forecasts into panchayat-level
              agro-meteorological advisories.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-white uppercase">
              Pages
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {FOOTER_PAGES.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#9ca3af] transition hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide text-white uppercase">
              Connect
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-[#9ca3af] transition hover:text-white"
                >
                  Log In
                </Link>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-[#9ca3af] transition hover:text-white"
                >
                  Request Demo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl border-t border-[#1f2937] pt-6 text-center text-xs text-[#6b7280]">
          © 2026 GramVistar. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
