import Link from "next/link";
import { RoleBadge } from "@/components/layout/RoleBadge";

const PIPELINE_STEPS = [
  {
    step: "1",
    title: "Seeded weather & environmental data",
    description:
      "Block-level forecast and historical weather, elevation, and soil data for Chas Block, Bokaro District, loaded straight into the browser — no server round-trip.",
  },
  {
    step: "2",
    title: "Derived variables & downscaling",
    description:
      "Humidity, heat index, frost risk, soil moisture deficit, spray/irrigation windows and more are computed client-side, then spread from block-level to each of the 5 panchayats using elevation-aware interpolation.",
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
      "A Scientist builds a structured input per panchayat, generates a draft advisory (Gemini or a deterministic mock), then edits, reviews, approves or rejects it before anything is published.",
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

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <span className="text-sm font-bold tracking-tight">GramVistar</span>
        <div className="hidden items-center gap-6 text-sm text-foreground/60 sm:flex">
          <a href="#why" className="hover:text-foreground">
            Why
          </a>
          <a href="#platform" className="hover:text-foreground">
            Platform
          </a>
          <a href="#who" className="hover:text-foreground">
            Who it&apos;s for
          </a>
        </div>
        <RoleBadge compact />
      </nav>

      <section className="bg-[#123a1a] px-6 py-20 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            GramVistar
          </h1>
          <p className="max-w-2xl text-base text-white/80 sm:text-lg">
            A decision-support platform that turns block-level weather
            forecasts into panchayat-level agro-meteorological advisories —
            for Scientists, Farmers, and District/Block administrators.
          </p>
          <RoleBadge />
        </div>
      </section>

      <div className="relative h-64 w-full overflow-hidden sm:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element -- this is a static export app with no next/image usage anywhere */}
        <img
          src="/images/farmer-field-hero.jpg"
          alt="A farmer in a rice field checking a weather advisory on a phone"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <section id="why" className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-[auto_1fr]">
          <h2 className="text-3xl font-bold text-primary">Why</h2>
          <div className="space-y-4 text-sm leading-relaxed text-foreground/70 sm:text-base">
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
              stress, frost risk, spray windows, soil moisture deficit, and
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
        className="border-y border-border bg-surface-muted px-6 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-foreground/60">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="who" className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">Who it&apos;s for</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <span className="text-3xl">{audience.icon}</span>
                <h3 className="mt-3 text-sm font-semibold">
                  {audience.title}
                </h3>
                <p className="mt-1 text-xs text-foreground/60">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 text-center text-xs text-foreground/50">
          <p className="font-semibold text-foreground/70">GramVistar</p>
          <p>
            A frontend prototype — mock authentication, local seeded data,
            and clearly labeled simulated actions throughout.
          </p>
          <Link href="/login" className="underline underline-offset-4">
            Launch Portal
          </Link>
        </div>
      </footer>
    </main>
  );
}
