import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import PTAAssessment from "./PTAAssessment";

export const dynamic = "force-dynamic";

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type PTAScore = {
	student_id: number;
	se1: "O" | "V" | "G" | null;
	se2: "O" | "V" | "G" | null;
	se3: "O" | "V" | "G" | null;
	se4: "O" | "V" | "G" | null;
	se5: "O" | "V" | "G" | null;
	se6: "O" | "V" | "G" | null;
	se7: "O" | "V" | "G" | null;
};

export default async function PTAAssessmentPage({
	params,
}: {
	params: Promise<{ klas: string }>;
}) {
	const { klas } = await params;
	const { data: students, error: studentsError } = await supabase
		.from("students")
		.select("id, roepnaam, achternaam, stamnummer")
		.eq("klas", klas)
		.order("achternaam");

	if (studentsError) {
		console.error("[PTAAssessmentPage] students query failed:", studentsError);
		throw new Error(`Leerlingen laden mislukt: ${studentsError.message}`);
	}

	const studentIds = (students ?? []).map((student) => Number(student.id));
	const scoresResult = studentIds.length
		? await supabase
			.from("pta_scores")
			.select("student_id, se1, se2, se3, se4, se5, se6, se7")
			.in("student_id", studentIds)
			.order("created_at", { ascending: false })
		: { data: [], error: null };
	const { data: scores, error: scoresError } = scoresResult;

	if (scoresError) {
		console.error("[PTAAssessmentPage] pta_scores query failed:", scoresError);
		throw new Error(`PTA-beoordelingen laden mislukt: ${scoresError.message}`);
	}

	const latestScores = new Map<number, PTAScore>();
	(scores ?? []).forEach((score) => {
		const typedScore = score as PTAScore;
		const studentId = Number(typedScore.student_id);

		if (!latestScores.has(studentId)) {
			latestScores.set(studentId, typedScore);
		}
	});

	const initialScores = Object.fromEntries(
		[...latestScores.entries()].map(([studentId, score]) => [
			String(studentId),
			{
				se1: score.se1,
				se2: score.se2,
				se3: score.se3,
				se4: score.se4,
				se5: score.se5,
				se6: score.se6,
				se7: score.se7,
			},
		]),
	);

	return (
		<main className="min-h-screen bg-[#f5f3f8] px-4 py-8 sm:px-8 sm:py-12">
			<div className="mx-auto max-w-7xl">
				<header className="mb-8">
					<Image
						src="/logo.svg"
						alt="RSG Ter Apel"
						width={180}
						height={78}
						className="mb-8 h-auto w-40 sm:w-48"
						priority
					/>
					<Link
						href={`/klassen/${klas}`}
						className="mb-8 inline-block rounded-lg font-semibold text-[#362665] transition-colors hover:text-[#EF8A00] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
					>
						← Terug naar klas {klas}
					</Link>
					<div className="flex flex-wrap items-end justify-between gap-5">
						<div>
							<p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#EF8A00]">
								Beoordelingsmodus
							</p>
							<h1 className="text-4xl font-bold tracking-tight text-[#362665] sm:text-5xl">
								PTA H4/H5 · klas {klas}
							</h1>
						</div>
						<div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
							<p className="font-semibold text-[#362665]">7 schoolexamens</p>
							<p>Kies per SE Onvoldoende, Voldoende of Goed</p>
						</div>
					</div>
					<div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</header>

				<PTAAssessment
					klas={klas}
					students={(students ?? []) as Student[]}
					initialScores={initialScores}
				/>
			</div>
		</main>
	);
}
