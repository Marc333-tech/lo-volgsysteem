import Image from "next/image";
import Link from "next/link";

type Klas = {
  name: string;
  href: string;
};

const klassenPerLeerjaar: Record<string, Klas[]> = {
  "1": [{ name: "B1B", href: "/klassen/b1b" }],
  "2": [
    { name: "B2B", href: "/klassen/b2b" },
    { name: "B2D", href: "/klassen/b2d" },
  ],
  "3": [
    { name: "H3A", href: "/klassen/h3a" },
    { name: "H3B", href: "/klassen/h3b" },
  ],
  "4": [
    { name: "BZ4A", href: "/klassen/bz4a" },
    { name: "H4A", href: "/klassen/h4a" },
    { name: "H4B", href: "/klassen/h4b" },
  ],
  "5": [{ name: "H5A", href: "/klassen/h5a" }],
  "6": [],
};

function KlasCard({ klas }: { klas: Klas }) {
  return (
    <Link
      href={klas.href}
      className="group rounded-2xl bg-white p-6 shadow-lg shadow-[#362665]/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#362665]/20 focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
    >
      <div className="mb-8 flex items-start justify-between">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#362665]/10 text-3xl"
          aria-hidden="true"
        >
          📚
        </span>
        <span
          className="text-2xl text-[#362665] transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </div>
      <h2 className="text-2xl font-bold text-[#362665]">{klas.name}</h2>
      <p className="mt-3 text-lg text-slate-600">Bekijk klas</p>
    </Link>
  );
}

export default async function LeerjaarPage({
  params,
}: {
  params: Promise<{ jaar: string }>;
}) {
  const { jaar } = await params;
  const klassen = klassenPerLeerjaar[jaar] ?? [];

  return (
    <main className="min-h-screen bg-[#f5f3f8] px-6 py-10 sm:px-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 max-w-2xl">
          <Image
            src="/logo.svg"
            alt="RSG Ter Apel"
            width={180}
            height={78}
            className="mb-8 h-auto w-40 sm:w-48"
            priority
          />
          <Link
            href="/"
            className="mb-8 inline-block rounded-lg font-semibold text-[#362665] transition-colors hover:text-[#EF8A00] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
          >
            ← Terug naar dashboard
          </Link>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#EF8A00]">
            RSG Ter Apel
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#362665] sm:text-5xl">
            Leerjaar {jaar}
          </h1>
          <div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
        </header>

        {klassen.length > 0 ? (
          <section
            aria-label={`Klassen van leerjaar ${jaar}`}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {klassen.map((klas) => (
              <KlasCard key={klas.name} klas={klas} />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl bg-white p-6 text-lg text-slate-600 shadow-lg shadow-[#362665]/10">
            Geen klassen beschikbaar
          </div>
        )}
      </div>
    </main>
  );
}
