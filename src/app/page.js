import { RoleBadge } from "@/components/layout/RoleBadge";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          GramVistar
        </h1>
        <p className="mt-4 text-base text-foreground/70">
          A decision-support platform turning block-level weather forecasts
          into panchayat-level agro-meteorological advisories.
        </p>
      </div>

      <RoleBadge />
    </main>
  );
}
