import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import BasketbalAssessment from "./BasketbalAssessment";

export const dynamic = "force-dynamic";

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type BasketbalScore = {
	student_id: number;
	inzet: number;
	techniek: number;
	tactiek: number;
};

export default async function BasketbalAssessmentPage({
	params,
}: {
	params: Promise<{ klas: string }>;
}) {
	const { klas } = await params;
	const { data: students } = await supabase
		.from("students")
		.select("id, roepnaam, achternaam, stamnummer")
		.eq("klas", klas)
		.order("achternaam");

	const studentIds = (students ?? []).map((student) => Number(student.id));
	const query = {
		table: "basketbal_scores",
		select: "student_id, inzet, techniek, tactiek",
		filters: [{ column: "student_id", operator: "in", values: studentIds }],
		order: { column: "created_at", ascending: false },
	} as const;
	const supabaseProjectHost = process.env.NEXT_PUBLIC_SUPABASE_URL
		? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
		: "missing NEXT_PUBLIC_SUPABASE_URL";
	const scoresResult = studentIds.length
		? await supabase
			.from(query.table)
			.select(query.select)
			.in("student_id", studentIds)
			.order(query.order.column, { ascending: query.order.ascending })
		: { data: [], error: null, status: null, statusText: "Skipped: no students" };
	const { data: scores, error: scoresError, status, statusText } = scoresResult;

	console.log(
		"[BasketbalAssessmentPage] exact Supabase query and project:",
		JSON.stringify({
			projectHost: supabaseProjectHost,
			client: "lib/supabase.ts (shared anon-key client)",
			query,
		}, null, 2),
	);
	console.log(
		"[BasketbalAssessmentPage] complete basketbal_scores Supabase response:",
		JSON.stringify({
			data: scores,
			error: scoresError
				? {
					...scoresError,
					message: scoresError.message,
					details: scoresError.details,
					hint: scoresError.hint,
					code: scoresError.code,
				}
				: null,
			status,
			statusText,
			recordCount: scores?.length ?? 0,
			foundStudentIds: (scores ?? []).map((score) => score.student_id),
		}, null, 2),
	);
	if (scoresError) {
		console.error("[BasketbalAssessmentPage] basketbal_scores query failed:", scoresError);
	}

	const latestScores = new Map<number, BasketbalScore>();
	(scores ?? []).forEach((score) => {
		const typedScore = score as BasketbalScore;
		const studentId = Number(typedScore.student_id);

		if (!latestScores.has(studentId)) {
			latestScores.set(studentId, typedScore);
		}
	});

	console.log(
		"[BasketbalAssessmentPage] complete latestScores:",
		JSON.stringify(
			[...latestScores.entries()].map(([studentId, score]) => ({
				mapStudentId: studentId,
				mapStudentIdType: typeof studentId,
				score,
				scoreStudentId: score.student_id,
				scoreStudentIdType: typeof score.student_id,
			})),
			null,
			2,
		),
	);

	const initialScores = Object.fromEntries(
		[...latestScores.entries()].map(([studentId, score]) => [studentId, {
			inzet: score.inzet,
			techniek: score.techniek,
			tactiek: score.tactiek,
		}]),
	);
	console.log(
		"[BasketbalAssessmentPage] complete initialScores:",
		JSON.stringify({
			values: initialScores,
			keys: Object.keys(initialScores).map((key) => ({
				key,
				keyType: typeof key,
			})),
		}, null, 2),
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
								Basketbal · klas {klas}
							</h1>
						</div>
						<div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
							<p className="font-semibold text-[#362665]">3 beoordelingscriteria</p>
							<p>Geef per criterium een score van 1 t/m 4</p>
						</div>
					</div>
					<div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</header>

				<BasketbalAssessment
					klas={klas}
					students={(students ?? []) as Student[]}
					initialScores={initialScores}
				/>
			</div>
		</main>
	);
}
