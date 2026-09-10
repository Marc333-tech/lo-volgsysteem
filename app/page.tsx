import { supabase } from "../lib/supabase";

export default async function Home() {
  const { count: leerlingCount } = await supabase
    .from("students")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { count: klasCount } = await supabase
    .from("classes")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { count: sportCount } = await supabase
    .from("sports")
    .select("*", {
      count: "exact",
      head: true,
    });

  return (
    <main className="min-h-screen p-10 bg-slate-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          LO Volgsysteem RSG Ter Apel
        </h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold">Klassen</h2>
            <p className="text-4xl mt-3">{klasCount}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold">Leerlingen</h2>
            <p className="text-4xl mt-3">{leerlingCount}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-bold">Sporten</h2>
            <p className="text-4xl mt-3">{sportCount}</p>
          </div>
        </div>
      </div>
    </main>
  );
}