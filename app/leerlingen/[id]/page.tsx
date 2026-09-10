import Link from "next/link";
import { supabase } from "../../../lib/supabase";

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

  return (
    <main className="min-h-screen p-10 bg-slate-100">
      <div className="max-w-4xl mx-auto">
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
        </div>

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
            </div>
          ) : (
            <p>Nog geen softbalbeoordeling beschikbaar</p>
          )}
        </section>
      </div>
    </main>
  );
}
``