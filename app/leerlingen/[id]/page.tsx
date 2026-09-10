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

        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">Sportonderdelen</h2>
          <div className="space-y-2">
            <Link
              href={`/leerlingen/${id}/softbal`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100"
            >
              <span>
                {softbalScore
                  ? `🥎 Softbal ✅ ${getGrade(softbalAverage!)}`
                  : "🥎 Softbal ❌ Nog niet beoordeeld"}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/leerlingen/${id}/volleybal`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100"
            >
              <span>
                {volleybalScore
                  ? `🏐 Volleybal ✅ ${getGrade(volleybalAverage!)}`
                  : "🏐 Volleybal ❌ Nog niet beoordeeld"}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/leerlingen/${id}/basketbal`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100"
            >
              <span>🏀 Basketbal ❌ Nog niet beoordeeld</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/leerlingen/${id}/handbal`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100"
            >
              <span>🤾 Handbal ❌ Nog niet beoordeeld</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/leerlingen/${id}/hockey`}
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-slate-100"
            >
              <span>🏑 Hockey ❌ Nog niet beoordeeld</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
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
``