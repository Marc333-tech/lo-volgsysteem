import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type SoftbalScore = {
	student_id: number;
	tactiek_veldpartij: number;
	tactiek_slagpartij: number;
	werpen_vangen: number;
	slaan: number;
};

type VolleybalScore = {
	student_id: number;
	inzet: number;
	techniek: number;
	tactiek: number;
};

function getGrade(scores: number[]) {
	const average = scores.reduce((total, score) => total + score, 0) / scores.length;

	if (average < 2) {
		return "O";
	}

	if (average < 3) {
		return "V";
	}

	return "G";
}

export default async function KlasPage({
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

	const softbalScoresByStudent = new Map<number, SoftbalScore>();
	const volleybalScoresByStudent = new Map<number, VolleybalScore>();

	if (students && students.length > 0) {
		const studentIds = students.map((student) => Number(student.id));
		const [{ data: softbalScores }, { data: volleybalScores }] =
			await Promise.all([
				supabase
					.from("softbal_scores")
					.select(
						"student_id, tactiek_veldpartij, tactiek_slagpartij, werpen_vangen, slaan",
					)
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
				supabase
					.from("volleybal_scores")
					.select("student_id, inzet, techniek, tactiek")
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
			]);

		softbalScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!softbalScoresByStudent.has(studentId)) {
				softbalScoresByStudent.set(studentId, score as SoftbalScore);
			}
		});

		volleybalScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!volleybalScoresByStudent.has(studentId)) {
				volleybalScoresByStudent.set(studentId, score as VolleybalScore);
			}
		});
	}

	return (
		<main className="min-h-screen bg-[#f5f3f8] px-6 py-10 sm:px-10 sm:py-14">
			<div className="mx-auto max-w-6xl">
				<header className="mb-10">
					<Image
						src="/logo.svg"
						alt="RSG Ter Apel"
						width={180}
						height={78}
						className="mb-8 h-auto w-40 sm:w-48"
						priority
					/>
					<Link
						href="/klassen"
						className="mb-8 inline-block rounded-lg font-semibold text-[#362665] transition-colors hover:text-[#EF8A00] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
					>
						← Terug naar klassen
					</Link>
					<p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#EF8A00]">
						RSG Ter Apel
					</p>
					<h1 className="text-4xl font-bold tracking-tight text-[#362665] sm:text-5xl">
						Klas {klas}
					</h1>
					<div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</header>

				{students && students.length > 0 ? (
					<section
						aria-label={`Leerlingen uit klas ${klas}`}
						className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
					>
						{students.map((student) => {
							const studentId = Number(student.id);
							const softbalScore = softbalScoresByStudent.get(studentId);
							const volleybalScore = volleybalScoresByStudent.get(studentId);

							return (
							<Link
								key={student.id}
								href={`/leerlingen/${student.id}`}
								className="group rounded-2xl bg-white p-6 shadow-lg shadow-[#362665]/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#362665]/20 focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
							>
								<div className="mb-8 flex items-start justify-between">
									<span
										className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EF8A00]/15 text-3xl"
										aria-hidden="true"
									>
										👨‍🎓
									</span>
									<span
										className="text-2xl text-[#362665] transition-transform duration-200 group-hover:translate-x-1"
										aria-hidden="true"
									>
										→
									</span>
								</div>
								<h2 className="text-xl font-bold text-[#362665]">
									{student.roepnaam} {student.achternaam}
								</h2>
								<p className="mt-3 text-slate-600">
									<span className="font-semibold text-slate-800">Stamnummer:</span>{" "}
									{student.stamnummer}
								</p>
								<p className="mt-4 text-sm font-semibold text-[#362665]">
									{Number(softbalScore !== undefined) + Number(volleybalScore !== undefined)}
									/2 onderdelen beoordeeld
								</p>
								<p className="mt-4 text-sm font-semibold text-slate-600">
									{softbalScore
										? `✅ Softbal ${getGrade([
												softbalScore.tactiek_veldpartij,
												softbalScore.tactiek_slagpartij,
												softbalScore.werpen_vangen,
												softbalScore.slaan,
											])}`
										: "❌ Softbal niet beoordeeld"}
								</p>
								<p className="mt-2 text-sm font-semibold text-slate-600">
									{volleybalScore
										? `✅ Volleybal ${getGrade([
												volleybalScore.inzet,
												volleybalScore.techniek,
												volleybalScore.tactiek,
											])}`
										: "❌ Volleybal niet beoordeeld"}
								</p>
							</Link>
							);
						})}
					</section>
				) : (
					<div className="rounded-2xl bg-white p-6 text-slate-600 shadow-lg shadow-[#362665]/10">
						Geen leerlingen gevonden voor klas {klas}.
					</div>
				)}
			</div>
		</main>
	);
}
