import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";

const leerjaren = [1, 2, 3, 4, 5, 6];

function LeerjaarCard({ leerjaar }: { leerjaar: number }) {
  return (
    <Link
      href={`/leerjaren/${leerjaar}`}
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
      <h2 className="text-xl font-bold text-[#362665]">Leerjaar {leerjaar}</h2>
      <p className="mt-3 text-sm text-slate-500">Bekijk leerjaar {leerjaar}</p>
    </Link>
  );
};

export default async function Home() {
  async function signOut() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f3f8] px-6 py-10 sm:px-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Image
              src="/logo.svg"
              alt="RSG Ter Apel"
              width={180}
              height={78}
              className="mb-8 h-auto w-40 sm:w-48"
              priority
            />
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#EF8A00]">
              RSG Ter Apel
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-[#362665] sm:text-5xl">
              LO Volgsysteem RSG Ter Apel
            </h1>
            <div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="whitespace-nowrap rounded-lg bg-[#362665] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2b1e51] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
            >
              Uitloggen
            </button>
          </form>
        </header>

        <section aria-label="Leerjaren" className="grid gap-5 md:grid-cols-2">
          {leerjaren.map((leerjaar) => (
            <LeerjaarCard key={leerjaar} leerjaar={leerjaar} />
          ))}
        </section>
      </div>
    </main>
  );
}