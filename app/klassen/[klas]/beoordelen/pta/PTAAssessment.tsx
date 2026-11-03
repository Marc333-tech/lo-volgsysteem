"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../../../../lib/supabase";

const schoolexamens = [
	{
		key: "se1",
		label: "SE1",
		description: "Sportvaardigheid keuzemodules, atletiek en turnen",
	},
	{
		key: "se2",
		label: "SE2",
		description: "Sportvaardigheid keuzemodules, zelfverdediging, bewegen op muziek en spel",
	},
	{
		key: "se3",
		label: "SE3",
		description: "Conditieopdracht met gerichte voorbereiding / triatlon",
	},
	{
		key: "se4",
		label: "SE4",
		description: "Activiteit begeleiden, bijvoorbeeld sportdag",
	},
	{
		key: "se5",
		label: "SE5",
		description: "Instructieopdracht, lesgeven of filmpje",
	},
	{
		key: "se6",
		label: "SE6",
		description: "Conditieopdracht 2 met gerichte voorbereiding",
	},
	{
		key: "se7",
		label: "SE7",
		description: "Sportvaardigheid keuzemodules, spel",
	},
] as const;

type SEKey = (typeof schoolexamens)[number]["key"];
type PTAGrade = "O" | "V" | "G";
type StudentScores = Record<SEKey, PTAGrade | null>;

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type Props = {
	klas: string;
	students: Student[];
	initialScores: Record<string, Partial<StudentScores>>;
};

function emptyScore(): StudentScores {
	return {
		se1: null,
		se2: null,
		se3: null,
		se4: null,
		se5: null,
		se6: null,
		se7: null,
	};
}

function gradeStyle(grade: PTAGrade | null) {
	if (grade === "G") return "bg-emerald-100 text-emerald-800";
	if (grade === "V") return "bg-amber-100 text-amber-800";
	if (grade === "O") return "bg-rose-100 text-rose-800";
	return "bg-slate-100 text-slate-700 hover:bg-[#EF8A00]/15";
}

export default function PTAAssessment({ klas, students, initialScores }: Props) {
	const [scores, setScores] = useState<Record<number, StudentScores>>(() =>
		students.reduce<Record<number, StudentScores>>((currentScores, student) => {
			currentScores[Number(student.id)] = {
				...emptyScore(),
				...initialScores[String(student.id)],
			};
			return currentScores;
		}, {}),
	);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const assessedSections = students.reduce((total, student) => {
		const studentScores = scores[Number(student.id)] ?? emptyScore();
		return total + Object.values(studentScores).filter((score) => score !== null).length;
	}, 0);
	const completedStudents = students.filter((student) =>
		Object.values(scores[Number(student.id)] ?? emptyScore()).every((score) => score !== null),
	).length;
	const studentsWithScores = students.filter((student) =>
		Object.values(scores[Number(student.id)] ?? emptyScore()).some((score) => score !== null),
	);

	function selectScore(studentId: number, section: SEKey, grade: PTAGrade) {
		setScores((currentScores) => ({
			...currentScores,
			[studentId]: {
				...(currentScores[studentId] ?? emptyScore()),
				[section]: grade,
			},
		}));
		setSaveMessage(null);
	}

	async function saveAll() {
		if (studentsWithScores.length === 0) {
			setSaveMessage("Kies eerst een beoordeling voor minimaal één schoolexamen.");
			return;
		}

		setIsSaving(true);
		setSaveMessage(null);
		const payload = studentsWithScores.map((student) => ({
			student_id: Number(student.id),
			...scores[Number(student.id)],
		}));

		try {
			const { error } = await supabase.from("pta_scores").insert(payload);

			if (error) {
				console.error("[PTAAssessment] insert failed:", error);
				setSaveMessage(`Opslaan mislukt: ${error.message}`);
				return;
			}

			setSaveMessage(
				`Beoordelingen voor ${studentsWithScores.length} leerling${studentsWithScores.length === 1 ? "" : "en"} opgeslagen.`,
			);
		} catch (error) {
			console.error("[PTAAssessment] insert request failed:", error);
			setSaveMessage("Opslaan mislukt door een verbindingsfout.");
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-[#362665]/10">
				<div>
					<p className="text-lg font-bold text-[#362665]">Voortgang klas</p>
					<p className="text-sm text-slate-600">
						{completedStudents} van {students.length} leerlingen volledig beoordeeld
					</p>
					<p className="text-sm text-slate-600">
						{assessedSections} van {students.length * schoolexamens.length} SE-beoordelingen ingevuld
					</p>
				</div>
				<button
					type="button"
					onClick={saveAll}
					disabled={isSaving}
					className="rounded-lg bg-[#EF8A00] px-5 py-3 font-bold text-white shadow-md shadow-[#EF8A00]/20 transition-colors hover:bg-[#d97800] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
				>
					{isSaving ? "Opslaan..." : "Alle beoordelingen opslaan"}
				</button>
			</div>

			{students.length > 0 ? (
				<div className="space-y-4">
					{students.map((student) => {
						const studentScores = scores[Number(student.id)] ?? emptyScore();
						const completedSections = Object.values(studentScores).filter(
							(score) => score !== null,
						).length;

						return (
							<article
								key={student.id}
								className="rounded-2xl bg-white p-5 shadow-lg shadow-[#362665]/10"
							>
								<div className="mb-5 flex flex-wrap items-start justify-between gap-3">
									<div>
										<Link
											href={`/leerlingen/${student.id}`}
											className="font-bold text-[#362665] hover:text-[#EF8A00]"
										>
											{student.roepnaam} {student.achternaam}
										</Link>
										<p className="mt-1 text-sm text-slate-500">
											Stamnummer {student.stamnummer}
										</p>
									</div>
									<p className="text-sm font-semibold text-slate-600">
										{completedSections}/{schoolexamens.length} SE ingevuld
									</p>
								</div>

								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
									{schoolexamens.map((schoolexamen) => (
										<section
											key={schoolexamen.key}
											className="rounded-xl border border-slate-200 p-4"
										>
											<h2 className="font-bold text-[#362665]">
												{schoolexamen.label}
											</h2>
											<p className="mt-1 min-h-10 text-sm leading-relaxed text-slate-600">
												{schoolexamen.description}
											</p>
											<div
												className="mt-3 flex gap-2"
												role="group"
												aria-label={`${schoolexamen.label} voor ${student.roepnaam} ${student.achternaam}`}
											>
												{(["O", "V", "G"] as const).map((grade) => (
													<button
														key={grade}
														type="button"
														aria-pressed={studentScores[schoolexamen.key] === grade}
														onClick={() =>
															selectScore(
																Number(student.id),
																schoolexamen.key,
																grade,
															)
														}
														className={`h-10 w-10 rounded-lg text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF8A00] focus:ring-offset-2 ${studentScores[schoolexamen.key] === grade ? "bg-[#EF8A00] text-white" : gradeStyle(null)}`}
													>
														{grade}
													</button>
												))}
											</div>
										</section>
									))}
								</div>
							</article>
						);
					})}
				</div>
			) : (
				<div className="rounded-2xl bg-white p-8 text-slate-600 shadow-lg shadow-[#362665]/10">
					Geen leerlingen gevonden voor klas {klas}.
				</div>
			)}

			{saveMessage && (
				<p className="mt-5 text-right text-sm font-semibold text-slate-700" role="status">
					{saveMessage}
				</p>
			)}
		</div>
	);
}
