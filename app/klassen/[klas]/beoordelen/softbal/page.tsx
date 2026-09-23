import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase";
import SoftbalAssessment from "./SoftbalAssessment";

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type SoftbalScore = {
	student_id: number;
	tactiek_veldpartij: number;
	tactiek_slagpartij: number;
	werpen_vangen: number;
	slaan: number;
};

export default async function SoftbalAssessmentPage({
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
	const { data: scores } = studentIds.length
		? await supabase
				.from("softbal_scores")
				.select(
					"student_id, tactiek_veldpartij, tactiek_slagpartij, werpen_vangen, slaan",
				)
				.in("student_id", studentIds)
				.order("created_at", { ascending: false })
		: { data: [] };

	const latestScores = new Map<number, SoftbalScore>();
	(scores ?? []).forEach((score) => {
		const typedScore = score as SoftbalScore;
		const studentId = Number(typedScore.student_id);

		if (!latestScores.has(studentId)) {
			latestScores.set(studentId, typedScore);
		}
	});

	const initialScores = Object.fromEntries(
		latestScores.entries().map(([studentId, score]) => [studentId, {
			tactiek_veldpartij: score.tactiek_veldpartij,
			tactiek_slagpartij: score.tactiek_slagpartij,
			werpen_vangen: score.werpen_vangen,
			slaan: score.slaan,
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
								Softbal · klas {klas}
							</h1>
						</div>
						<div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
							<p className="font-semibold text-[#362665]">4 beoordelingscriteria</p>
							<p>Geef per criterium een score van 1 t/m 4</p>
						</div>
					</div>
					<div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</header>

				<SoftbalAssessment
					klas={klas}
					students={(students ?? []) as Student[]}
					initialScores={initialScores}
				/>
			</div>
		</main>
	);
}