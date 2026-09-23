"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../../../../lib/supabase";

const categories = [
	{ key: "tactiek_veldpartij", label: "Tactiek veldpartij" },
	{ key: "tactiek_slagpartij", label: "Tactiek slagpartij" },
	{ key: "werpen_vangen", label: "Werpen en vangen" },
	{ key: "slaan", label: "Slaan" },
] as const;

type CategoryKey = (typeof categories)[number]["key"];
type Score = Record<CategoryKey, number | null>;

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type Props = {
	klas: string;
	students: Student[];
	initialScores: Record<string, Partial<Record<CategoryKey, number>>>;
};

function getGrade(scores: number[]) {
	const average = scores.reduce((total, score) => total + score, 0) / scores.length;

	if (average < 1.5) return "O";
	if (average < 2.5) return "V";
	return "G";
}

function emptyScore(): Score {
	return {
		tactiek_veldpartij: null,
		tactiek_slagpartij: null,
		werpen_vangen: null,
		slaan: null,
	};
}

function gradeStyle(grade: string | null) {
	if (grade === "G") return "bg-emerald-100 text-emerald-800";
	if (grade === "V") return "bg-amber-100 text-amber-800";
	if (grade === "O") return "bg-rose-100 text-rose-800";
	return "bg-slate-100 text-slate-400";
}

export default function SoftbalAssessment({ klas, students, initialScores }: Props) {
	const [scores, setScores] = useState<Record<number, Score>>(() =>
		Object.fromEntries(
			students.map((student) => [
				student.id,
				{ ...emptyScore(), ...initialScores[String(student.id)] },
			]),
		),
	);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const completedStudentList = students.filter((student) =>
		Object.values(scores[student.id] ?? emptyScore()).every((score) => score !== null),
	);
	const completedStudents = completedStudentList.length;

	function selectScore(studentId: number, category: CategoryKey, value: number) {
		setScores((currentScores) => ({
			...currentScores,
			[studentId]: { ...(currentScores[studentId] ?? emptyScore()), [category]: value },
		}));
		setSaveMessage(null);
	}

	async function saveAll() {
		console.log("SAVEALL STARTED");

		if (completedStudentList.length === 0) {
			setSaveMessage("Vul eerst alle vier criteria voor minimaal één leerling in.");
			return;
		}

		setIsSaving(true);
		setSaveMessage(null);
		const payload = completedStudentList.map((student) => ({
				student_id: Number(student.id),
				...scores[student.id],
		}));

		console.log("[SoftbalAssessment] Insert payload:", payload);
		console.log("[SoftbalAssessment] Insert query:", {
			table: "softbal_scores",
			operation: "insert",
			payload,
		});
		console.log("PAYLOAD", payload);

		const { data, error } = await supabase
			.from("softbal_scores")
			.insert(payload);

		console.log("[SoftbalAssessment] Supabase response:", { data, error });
		console.log("INSERT RESPONSE", { data, error });
		if (error) {
			console.error("[SoftbalAssessment] Insert error:", error);
		}

		setIsSaving(false);
		setSaveMessage(
			error
				? `Opslaan mislukt: ${error.message}`
				: `${completedStudentList.length} beoordeling${completedStudentList.length === 1 ? "" : "en"} opgeslagen.`,
		);
	}

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-[#362665]/10">
				<div>
					<p className="text-lg font-bold text-[#362665]">Voortgang klas</p>
					<p className="text-sm text-slate-600">
						{completedStudents} van {students.length} leerlingen volledig beoordeeld
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
					<div className="hidden rounded-xl bg-[#362665] px-5 py-4 text-sm font-bold text-white lg:grid lg:grid-cols-[minmax(12rem,1.2fr)_repeat(4,minmax(8rem,1fr))_4rem] lg:items-center lg:gap-4">
						<span>Leerling</span>
						{categories.map((category) => <span key={category.key}>{category.label}</span>)}
						<span>Resultaat</span>
					</div>

					{students.map((student) => {
						const studentScores = scores[student.id] ?? emptyScore();
						const selectedScores = Object.values(studentScores);
						const grade = selectedScores.every((score) => score !== null)
							? getGrade(selectedScores as number[])
							: null;

						return (
							<article key={student.id} className="rounded-2xl bg-white p-5 shadow-lg shadow-[#362665]/10">
								<div className="grid gap-5 lg:grid-cols-[minmax(12rem,1.2fr)_repeat(4,minmax(8rem,1fr))_4rem] lg:items-center lg:gap-4">
									<div>
										<Link href={`/leerlingen/${student.id}`} className="font-bold text-[#362665] hover:text-[#EF8A00]">
											{student.roepnaam} {student.achternaam}
										</Link>
										<p className="mt-1 text-sm text-slate-500">Stamnummer {student.stamnummer}</p>
									</div>
									{categories.map((category) => (
										<div key={category.key}>
											<p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 lg:hidden">{category.label}</p>
											<div className="flex gap-2" role="group" aria-label={`${category.label} voor ${student.roepnaam} ${student.achternaam}`}>
												{[1, 2, 3, 4].map((value) => (
													<button
														key={value}
														type="button"
														aria-pressed={studentScores[category.key] === value}
														onClick={() => selectScore(student.id, category.key, value)}
														className={`h-10 w-10 rounded-lg text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF8A00] focus:ring-offset-2 ${studentScores[category.key] === value ? "bg-[#EF8A00] text-white" : "bg-slate-100 text-slate-700 hover:bg-[#EF8A00]/15"}`}
													>
														{value}
													</button>
												))}
											</div>
										</div>
									))}
									<div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${gradeStyle(grade)}`} aria-label={grade ? `Resultaat ${grade}` : "Resultaat nog niet compleet"}>
										{grade ?? "-"}
									</div>
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

			{saveMessage && <p className="mt-5 text-right text-sm font-semibold text-slate-700" role="status">{saveMessage}</p>}
		</div>
	);
}