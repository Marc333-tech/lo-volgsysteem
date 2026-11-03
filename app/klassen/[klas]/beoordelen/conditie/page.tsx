import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import ConditieAssessment from "./ConditieAssessment";

export const dynamic = "force-dynamic";

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type ConditieScore = {
	student_id: number;
	inzet: number;
	technisch: number;
	tactisch: number;
};

export default async function ConditieAssessmentPage({
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
		console.error("[ConditieAssessmentPage] students query failed:", studentsError);
		throw new Error(`Leerlingen laden mislukt: ${studentsError.message}`);
	}

	const studentIds = (students ?? []).map((student) => Number(student.id));
	const scoresResult = studentIds.length
		? await supabase
			.from("conditie_scores")
			.select("student_id, inzet, technisch, tactisch")
			.in("student_id", studentIds)
			.order("created_at", { ascending: false })
		: { data: [], error: null };
	const { data: scores, error: scoresError } = scoresResult;

	if (scoresError) {
		console.error("[ConditieAssessmentPage] conditie_scores query failed:", scoresError);
		throw new Error(`Conditiebeoordelingen laden mislukt: ${scoresError.message}`);
	}

	const latestScores = new Map<number, ConditieScore>();
	(scores ?? []).forEach((score) => {
		const typedScore = score as ConditieScore;
		const studentId = Number(typedScore.student_id);

		if (!latestScores.has(studentId)) {
			latestScores.set(studentId, typedScore);
		}
	});

	const initialScores = Object.fromEntries(
		[...latestScores.entries()].map(([studentId, score]) => [String(studentId), {
			inzet: score.inzet,
			technisch: score.technisch,
			tactisch: score.tactisch,
		}]),
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
								Conditie · klas {klas}
							</h1>
						</div>
						<div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
							<p className="font-semibold text-[#362665]">3 beoordelingscriteria</p>
							<p>Geef per criterium een score van 1 t/m 4</p>
						</div>
					</div>
					<div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</header>

				<ConditieAssessment
					klas={klas}
					students={(students ?? []) as Student[]}
					initialScores={initialScores}
				/>
			</div>
		</main>
	);
}
