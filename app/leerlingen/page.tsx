import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function LeerlingenPage() {
  const { data: leerlingen } = await supabase
    .from("students")
    .select("*")
    .order("achternaam");

  return (
    <main className="min-h-screen p-10 bg-slate-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Leerlingen B2B
        </h1>

        <div className="bg-white rounded-xl shadow p-6">
          <ul className="space-y-2">
            {leerlingen?.map((leerling) => (
              <li key={leerling.id}>
                <Link href={`/leerlingen/${leerling.id}`}>
                  {leerling.roepnaam} {leerling.achternaam}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}