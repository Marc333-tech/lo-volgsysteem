import Link from "next/link";
import { supabase } from "../../../lib/supabase";

function calculateAverage(scores: number[]) {
  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function getGrade(average: number) {
  if (average < 2) {
    return "O";
  }

  if (average < 3) {
    return "V";
  }

  return "G";
}

const loOnderdelen = [
  {
    title: "LO1 Spel",
    onderdelen: [
      { name: "Softbal", icon: "🥎", slug: "softbal" },
      { name: "Volleybal", icon: "🏐", slug: "volleybal" },
      { name: "Basketbal", icon: "🏀" },
      { name: "Hockey", icon: "🏑" },
    ],
  },
  {
    title: "LO2 Turnen",
    onderdelen: [{ name: "Acrogym", icon: "🤸" }],
  },
  {
    title: "LO3 Atletiek",
    onderdelen: [
      { name: "Verspringen", icon: "🏃" },
      { name: "Kogelstoten", icon: "🏋️" },
      { name: "Hordenlopen", icon: "🏃" },
      { name: "80m sprint", icon: "🏃" },
      { name: "Vortex werpen", icon: "🥏" },
    ],
  },
  {
    title: "LO4 Klimmen",
    onderdelen: [
      { name: "Klimmen", icon: "🧗" },
      { name: "Zekeren", icon: "🧗" },
    ],
  },
  {
    title: "LO5 Conditie",
    onderdelen: [
      { name: "RSG Run", icon: "🏃" },
      { name: "Shuttle Run", icon: "🏃" },
    ],
  },
];

export default async function LeerlingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: leerling } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!leerling) {
    return (
      <main className="p-10">
        Leerling niet gevonden
      </main>
    );
  }

  const { data: softbalScore } = await supabase
    .from("softbal_scores")
    .select(
      "tactiek_veldpartij, tactiek_slagpartij, werpen_vangen, slaan",
    )
    .eq("student_id", Number(id))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: volleybalScore } = await supabase
    .from("volleybal_scores")
    .select("inzet, techniek, tactiek")
    .eq("student_id", Number(id))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const softbalValues = softbalScore
    ? [
        Number(softbalScore.tactiek_veldpartij),
        Number(softbalScore.tactiek_slagpartij),
        Number(softbalScore.werpen_vangen),
        Number(softbalScore.slaan),
      ]
    : null;
  const volleybalValues = volleybalScore
    ? [
        Number(volleybalScore.inzet),
        Number(volleybalScore.techniek),
        Number(volleybalScore.tactiek),
      ]
    : null;
  const softbalAverage = softbalValues
    ? calculateAverage(softbalValues)
    : null;
  const volleybalAverage = volleybalValues
    ? calculateAverage(volleybalValues)
    : null;

  return (
    <main className="min-h-screen p-10 bg-slate-100">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/klassen/${encodeURIComponent(leerling.klas)}`}
          className="mb-6 inline-block text-slate-700 hover:text-slate-900"
        >
          ← Terug naar klas
        </Link>

        <h1 className="text-4xl font-bold mb-6">
          {leerling.roepnaam} {leerling.achternaam}
        </h1>

        <div className="bg-white rounded-xl shadow p-6">
          <p>
            <strong>Stamnummer:</strong> {leerling.stamnummer}
          </p>

          <p>
            <strong>Klas:</strong> {leerling.klas}
          </p>

          <Link
            href={`/leerlingen/${id}/softbal`}
            className="inline-block mt-6 rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Softbal beoordelen
          </Link>

          <Link
            href={`/leerlingen/${id}/volleybal`}
            className="ml-3 inline-block rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
          >
            Volleybal beoordelen
          </Link>
        </div>

        <section className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold text-[#362665]">LO curriculum</h2>
          {loOnderdelen.map((groep) => (
            <section key={groep.title} className="rounded-2xl bg-white p-6 shadow-lg shadow-[#362665]/10">
              <h3 className="mb-4 text-xl font-bold text-[#362665]">{groep.title}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groep.onderdelen.map((onderdeel) => {
                  const isSoftbal = onderdeel.slug === "softbal";
                  const isVolleybal = onderdeel.slug === "volleybal";
                  const score = isSoftbal
                    ? softbalScore
                    : isVolleybal
                      ? volleybalScore
                      : null;
                  const average = isSoftbal
                    ? softbalAverage
                    : isVolleybal
                      ? volleybalAverage
                      : null;
                  const status = score
                    ? `✅ Beoordeeld · ${getGrade(average!)}`
                    : "❌ Nog niet beoordeeld";
                  const content = (
                    <>
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#362665]/10 text-2xl" aria-hidden="true">
                          {onderdeel.icon}
                        </span>
                        {(isSoftbal || isVolleybal) && (
                          <span className="text-xl text-[#362665]" aria-hidden="true">→</span>
                        )}
                      </div>
                      <h4 className="mt-5 text-lg font-bold text-[#362665]">{onderdeel.name}</h4>
                      <p className="mt-2 text-sm font-semibold text-slate-600">{status}</p>
                    </>
                  );

                  return isSoftbal || isVolleybal ? (
                    <Link
                      key={onderdeel.name}
                      href={`/leerlingen/${id}/${onderdeel.slug}`}
                      className="group rounded-xl border border-[#362665]/10 p-4 transition-all hover:-translate-y-1 hover:border-[#EF8A00]/50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={onderdeel.name} className="rounded-xl border border-[#362665]/10 p-4">
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Softbal</h2>

          {softbalScore ? (
            <div className="space-y-2">
              <p>
                <strong>Tactiek veldpartij:</strong>{" "}
                {softbalScore.tactiek_veldpartij}
              </p>
              <p>
                <strong>Tactiek slagpartij:</strong>{" "}
                {softbalScore.tactiek_slagpartij}
              </p>
              <p>
                <strong>Werpen en vangen:</strong> {softbalScore.werpen_vangen}
              </p>
              <p>
                <strong>Slaan:</strong> {softbalScore.slaan}
              </p>
              <p>
                <strong>Gemiddelde:</strong> {softbalAverage?.toFixed(2)}
              </p>
              <p>
                <strong>Cijfer:</strong> {getGrade(softbalAverage!)}
              </p>
            </div>
          ) : (
            <p>Nog geen softbalbeoordeling beschikbaar</p>
          )}
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Volleybal</h2>

          {volleybalScore ? (
            <div className="space-y-2">
              <p>
                <strong>Inzet:</strong> {volleybalScore.inzet}
              </p>
              <p>
                <strong>Techniek:</strong> {volleybalScore.techniek}
              </p>
              <p>
                <strong>Tactiek:</strong> {volleybalScore.tactiek}
              </p>
              <p>
                <strong>Gemiddelde:</strong> {volleybalAverage?.toFixed(2)}
              </p>
              <p>
                <strong>Cijfer:</strong> {getGrade(volleybalAverage!)}
              </p>
            </div>
          ) : (
            <p>Nog geen volleybalbeoordeling beschikbaar</p>
          )}
        </section>
      </div>
    </main>
  );
}
