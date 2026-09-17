import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

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

type BasketbalScore = {
	student_id: number;
	inzet: number;
	techniek: number;
	tactiek: number;
};

type HandbalScore = BasketbalScore;

type HockeyScore = {
	student_id: number;
	spelregels: number;
	techniek: number;
	tactiek: number;
	spel: number;
};

type AcrogymScore = {
	student_id: number;
	inzet: number;
	techniek: number;
	ontwerpen: number;
};

type KlimmenScore = {
	student_id: number;
	klimmen: number;
	zekeren: number;
};

type ConditieScore = {
	student_id: number;
	inzet: number;
	technisch: number;
	tactisch: number;
	limieten: number;
	rsg_run: number | null;
	shuttle_run: number | null;
};

const leerjaarPerKlas: Record<string, number> = {
	B1B: 1,
	B2B: 2,
	B2D: 2,
	H3A: 3,
	H3B: 3,
	BZ4A: 4,
	H4A: 4,
	H4B: 4,
	H5A: 5,
};

function getGrade(scores: number[]) {
	const average = scores.reduce((total, score) => total + score, 0) / scores.length;

	if (average < 1.5) {
		return "O";
	}

	if (average < 2.5) {
		return "V";
	}

	return "G";
}

function gradeToValue(grade: string) {
	return grade === "G" ? 3 : grade === "V" ? 2 : 1;
}

function getLoGrade(grades: string[]) {
	if (grades.length === 0) {
		return null;
	}

	return getGrade([grades.reduce((total, grade) => total + gradeToValue(grade), 0) / grades.length]);
}

export default async function KlasPage({
	params,
}: {
	params: Promise<{ klas: string }>;
}) {
	const { klas } = await params;
	const leerjaar = leerjaarPerKlas[klas.toUpperCase()];

	const { data: students } = await supabase
		.from("students")
		.select("id, roepnaam, achternaam, stamnummer")
		.eq("klas", klas)
		.order("achternaam");

	const softbalScoresByStudent = new Map<number, SoftbalScore>();
	const volleybalScoresByStudent = new Map<number, VolleybalScore>();
	const basketbalScoresByStudent = new Map<number, BasketbalScore>();
	const handbalScoresByStudent = new Map<number, HandbalScore>();
	const hockeyScoresByStudent = new Map<number, HockeyScore>();
	const acrogymScoresByStudent = new Map<number, AcrogymScore>();
	const klimmenScoresByStudent = new Map<number, KlimmenScore>();
	const conditieScoresByStudent = new Map<number, ConditieScore>();

	if (students && students.length > 0) {
		const studentIds = students.map((student) => Number(student.id));
		const serverSupabase = await createSupabaseServerClient();
		const [
			{ data: softbalScores },
			{ data: volleybalScores },
			{ data: basketbalScores },
			{ data: handbalScores },
			{ data: hockeyScores },
			{ data: acrogymScores },
			{ data: klimmenScores },
			{ data: conditieScores },
		] =
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
				supabase
					.from("basketbal_scores")
					.select("student_id, inzet, techniek, tactiek")
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
				supabase
					.from("handbal_scores")
					.select("student_id, inzet, techniek, tactiek")
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
				supabase
					.from("hockey_scores")
					.select("student_id, spelregels, techniek, tactiek, spel")
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
				supabase
					.from("acrogym_scores")
					.select("student_id, inzet, techniek, ontwerpen")
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
				serverSupabase
					.from("klimmen_scores")
					.select("student_id, klimmen, zekeren")
					.in("student_id", studentIds)
					.order("created_at", { ascending: false }),
				supabase
					.from("conditie_scores")
					.select(
						"student_id, inzet, technisch, tactisch, limieten, rsg_run, shuttle_run",
					)
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

		basketbalScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!basketbalScoresByStudent.has(studentId)) {
				basketbalScoresByStudent.set(studentId, score as BasketbalScore);
			}
		});

		handbalScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!handbalScoresByStudent.has(studentId)) {
				handbalScoresByStudent.set(studentId, score as HandbalScore);
			}
		});

		hockeyScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!hockeyScoresByStudent.has(studentId)) {
				hockeyScoresByStudent.set(studentId, score as HockeyScore);
			}
		});

		acrogymScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!acrogymScoresByStudent.has(studentId)) {
				acrogymScoresByStudent.set(studentId, score as AcrogymScore);
			}
		});

		klimmenScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!klimmenScoresByStudent.has(studentId)) {
				klimmenScoresByStudent.set(studentId, score as KlimmenScore);
			}
		});

		conditieScores?.forEach((score) => {
			const studentId = Number(score.student_id);

			if (!conditieScoresByStudent.has(studentId)) {
				conditieScoresByStudent.set(studentId, score as ConditieScore);
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
						href={leerjaar ? `/leerjaren/${leerjaar}` : "/klassen"}
						className="mb-8 inline-block rounded-lg font-semibold text-[#362665] transition-colors hover:text-[#EF8A00] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
					>
						← Terug naar leerjaar
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
							const basketbalScore = basketbalScoresByStudent.get(studentId);
							const handbalScore = handbalScoresByStudent.get(studentId);
							const hockeyScore = hockeyScoresByStudent.get(studentId);
							const acrogymScore = acrogymScoresByStudent.get(studentId);
							const klimmenScore = klimmenScoresByStudent.get(studentId);
							const conditieScore = conditieScoresByStudent.get(studentId);
							const softbalGrade = softbalScore
								? getGrade([
										softbalScore.tactiek_veldpartij,
										softbalScore.tactiek_slagpartij,
										softbalScore.werpen_vangen,
										softbalScore.slaan,
									])
								: null;
							const volleybalGrade = volleybalScore
								? getGrade([
										volleybalScore.inzet,
										volleybalScore.techniek,
										volleybalScore.tactiek,
									])
								: null;
						const basketbalGrade = basketbalScore
							? getGrade([
									basketbalScore.inzet,
									basketbalScore.techniek,
									basketbalScore.tactiek,
								])
							: null;
					const handbalGrade = handbalScore
						? getGrade([handbalScore.inzet, handbalScore.techniek, handbalScore.tactiek])
						: null;
					const hockeyGrade = hockeyScore
						? getGrade([
								hockeyScore.spelregels,
								hockeyScore.techniek,
								hockeyScore.tactiek,
								hockeyScore.spel,
							])
						: null;
					const isH3 = ["H3A", "H3B"].includes(klas.toUpperCase());
							const loGrades = [
							getLoGrade([
								...(softbalGrade ? [softbalGrade] : []),
								...(volleybalGrade ? [volleybalGrade] : []),
								...(basketbalGrade ? [basketbalGrade] : []),
						...(isH3 ? [] : handbalGrade ? [handbalGrade] : []),
						...(isH3 ? [] : hockeyGrade ? [hockeyGrade] : []),
							]),
								acrogymScore
									? getLoGrade([
											getGrade([acrogymScore.inzet]),
											getGrade([acrogymScore.techniek]),
											getGrade([acrogymScore.ontwerpen]),
										])
									: null,
								null,
								klimmenScore
									? getLoGrade([
											getGrade([klimmenScore.klimmen]),
											getGrade([klimmenScore.zekeren]),
										])
									: null,
								conditieScore
									? getLoGrade([
											getGrade([conditieScore.inzet]),
											getGrade([conditieScore.technisch]),
											getGrade([conditieScore.tactisch]),
											getGrade([conditieScore.limieten]),
										])
									: null,
							];
								const loRows = isH3
									? [
											{ name: "LO1 Spel", grade: loGrades[0] },
											{ name: "LO2 Turnen", grade: loGrades[1] },
											{ name: "LO3 Atletiek", grade: loGrades[2] },
											{ name: "LO4 Conditie", grade: loGrades[4] },
										]
									: [
											{ name: "LO1 Spel", grade: loGrades[0] },
											{ name: "LO2 Turnen", grade: loGrades[1] },
											{ name: "LO3 Atletiek", grade: loGrades[2] },
											{ name: "LO4 Klimmen", grade: loGrades[3] },
											{ name: "LO5 Conditie", grade: loGrades[4] },
										];
								const completedLos = loRows.filter(({ grade }) => grade !== null).length;

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
								<div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
									<p className="text-[#362665]">
										{completedLos}/{loRows.length} onderdelen afgerond
									</p>
									{loRows.map(({ name, grade }) => (
										<div key={name} className="flex justify-between gap-4">
											<span>{name}</span>
											<span className="text-[#362665]">{grade ?? "-"}</span>
										</div>
									))}
								</div>
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
