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

function gradeToValue(grade: string) {
  return grade === "G" ? 3 : grade === "V" ? 2 : 1;
}

function hasResult(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function GradeBadge({ grade }: { grade: string | null }) {
  const badge =
    grade === "G"
      ? "🟢 G Goed"
      : grade === "V"
        ? "🟡 V Voldoende"
        : grade === "O"
          ? "🔴 O Onvoldoende"
          : "⚪ Nog niet beoordeeld";
  const className =
    grade === "G"
      ? "bg-green-100 text-green-800"
      : grade === "V"
        ? "bg-yellow-100 text-yellow-800"
        : grade === "O"
          ? "bg-red-100 text-red-800"
          : "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${className}`}>
      {badge}
    </span>
  );
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
    onderdelen: [{ name: "Acrogym", icon: "🤸", slug: "acrogym" }],
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
      { name: "Shuttle Run", icon: "📈" },
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

  const { data: acrogymScore } = await supabase
    .from("acrogym_scores")
    .select("inzet, techniek, ontwerpen")
    .eq("student_id", Number(id))
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: conditieScore } = await supabase
    .from("conditie_scores")
    .select("inzet, technisch, tactisch, limieten, rsg_run, shuttle_run")
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
  const lo1Grades = [
    softbalAverage !== null ? gradeToValue(getGrade(softbalAverage)) : null,
    volleybalAverage !== null ? gradeToValue(getGrade(volleybalAverage)) : null,
  ].filter((grade): grade is number => grade !== null);
  const lo1Average = lo1Grades.length
    ? calculateAverage(lo1Grades)
    : null;
  const lo1Grade = lo1Average === null ? null : getGrade(lo1Average);
  const lo2Grades = acrogymScore
    ? [
        acrogymScore.inzet,
        acrogymScore.techniek,
        acrogymScore.ontwerpen,
      ].map((score) => gradeToValue(getGrade(Number(score))))
    : [];
  const lo2Average = lo2Grades.length
    ? calculateAverage(lo2Grades)
    : null;
  const lo2Grade = lo2Average === null ? null : getGrade(lo2Average);
  const lo5Grades = conditieScore
    ? [
        conditieScore.inzet,
        conditieScore.technisch,
        conditieScore.tactisch,
        conditieScore.limieten,
      ].map((score) => gradeToValue(getGrade(Number(score))))
    : [];
  const lo5Average = lo5Grades.length
    ? calculateAverage(lo5Grades)
    : null;
  const lo5Grade = lo5Average === null ? null : getGrade(lo5Average);
  const loProgress = {
    "LO1 Spel": {
      assessed: Number(Boolean(softbalScore)) + Number(Boolean(volleybalScore)),
      total: 4,
    },
    "LO2 Turnen": { assessed: Number(Boolean(acrogymScore)), total: 1 },
    "LO3 Atletiek": { assessed: 0, total: 5 },
    "LO4 Klimmen": { assessed: 0, total: 2 },
    "LO5 Conditie": {
      assessed:
        Number(hasResult(conditieScore?.rsg_run)) +
        Number(hasResult(conditieScore?.shuttle_run)),
      total: 2,
    },
  };
  const loResultRows = [
    { name: "LO1 Spel", grade: lo1Grade, progress: loProgress["LO1 Spel"] },
    { name: "LO2 Turnen", grade: lo2Grade, progress: loProgress["LO2 Turnen"] },
    { name: "LO3 Atletiek", grade: null, progress: loProgress["LO3 Atletiek"] },
    { name: "LO4 Klimmen", grade: null, progress: loProgress["LO4 Klimmen"] },
    { name: "LO5 Conditie", grade: lo5Grade, progress: loProgress["LO5 Conditie"] },
  ];

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
        </div>

        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-[#362665]">LO Resultaten</h2>
          <div className="divide-y divide-slate-200">
            {loResultRows.map(({ name, grade, progress }) => (
              <div
                key={name}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="font-semibold text-slate-800">{name}</span>
                <span className="flex items-center gap-3">
                  <GradeBadge grade={grade} />
                  <span className="text-sm font-semibold text-slate-500">
                    {progress.assessed}/{progress.total} onderdelen
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-6">
          <h2 className="text-2xl font-bold text-[#362665]">LO curriculum</h2>
          {loOnderdelen.map((groep) => (
            <section key={groep.title} className="rounded-2xl bg-white p-6 shadow-lg shadow-[#362665]/10">
              <h3 className="mb-4 text-xl font-bold text-[#362665]">
                {groep.title}
                {groep.title === "LO1 Spel" && (
                  <span className="ml-2 align-middle">
                    <GradeBadge grade={lo1Grade} />
                  </span>
                )}
                {groep.title === "LO2 Turnen" && (
                  <span className="ml-2 align-middle">
                    <GradeBadge grade={lo2Grade} />
                  </span>
                )}
                {groep.title === "LO5 Conditie" && (
                  <span className="ml-2 align-middle">
                    <GradeBadge grade={lo5Grade} />
                  </span>
                )}
                <span className="ml-2 text-sm font-semibold text-slate-500">
                  {loProgress[groep.title as keyof typeof loProgress].assessed}/
                  {loProgress[groep.title as keyof typeof loProgress].total} onderdelen
                </span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groep.onderdelen.map((onderdeel) => {
                  const isSoftbal = onderdeel.slug === "softbal";
                  const isVolleybal = onderdeel.slug === "volleybal";
                  const isAcrogym = onderdeel.slug === "acrogym";
                  const isConditie = groep.title === "LO5 Conditie";
                  const score = isSoftbal
                    ? softbalScore
                    : isVolleybal
                      ? volleybalScore
                      : isAcrogym
                        ? acrogymScore
                      : isConditie
                        ? conditieScore
                      : null;
                  const average = isSoftbal
                    ? softbalAverage
                    : isVolleybal
                      ? volleybalAverage
                      : isAcrogym
                        ? lo2Average
                      : isConditie
                        ? lo5Average
                      : null;
                  const content = (
                    <>
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#362665]/10 text-2xl" aria-hidden="true">
                          {onderdeel.icon}
                        </span>
                        {(isSoftbal || isVolleybal || isAcrogym || isConditie) && (
                          <span className="text-xl text-[#362665]" aria-hidden="true">→</span>
                        )}
                      </div>
                      <h4 className="mt-5 text-lg font-bold text-[#362665]">{onderdeel.name}</h4>
                      <div className="mt-2">
                        <GradeBadge
                          grade={score ? getGrade(average!) : null}
                        />
                      </div>
                    </>
                  );

                  return isSoftbal || isVolleybal || isAcrogym || isConditie ? (
                    <Link
                      key={onderdeel.name}
                      href={
                        isConditie
                          ? `/leerlingen/${id}/conditie`
                          : `/leerlingen/${id}/${onderdeel.slug}`
                      }
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

      </div>
    </main>
  );
}
