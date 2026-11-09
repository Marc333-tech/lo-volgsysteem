"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import {
	calculateConditionResult,
	getConditionGrade,
	isCompleteConditionInput,
	type ConditionInputs,
} from "../../../../../lib/condition";

type Score = ConditionInputs;

type Student = {
	id: number;
	roepnaam: string;
	achternaam: string;
	stamnummer: string | number;
};

type Props = {
	klas: string;
	students: Student[];
	initialScores: Record<string, Partial<Score>>;
};

function emptyScore(): Score {
	return {
		inzet: null,
		shuttleRunTrap: null,
		rsgRunMinutes: null,
		rsgRunSeconds: null,
	};
}

function getInputNumber(value: string) {
	if (value === "") return null;
	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : null;
}

function gradeStyle(grade: string | null) {
	if (grade === "G") return "bg-emerald-100 text-emerald-800";
	if (grade === "V") return "bg-amber-100 text-amber-800";
	if (grade === "O") return "bg-rose-100 text-rose-800";
	return "bg-slate-100 text-slate-400";
}

export default function ConditieAssessment({ klas, students, initialScores }: Props) {
	const [scores, setScores] = useState<Record<number, Score>>(() =>
		Object.fromEntries(
			students.map((student) => [
				Number(student.id),
				{
					...emptyScore(),
					...initialScores[String(student.id)],
				},
			]),
		) as Record<number, Score>,
	);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const completedStudentList = students.filter((student) =>
		isCompleteConditionInput(scores[Number(student.id)] ?? emptyScore()),
	);
	const completedStudents = completedStudentList.length;

	function updateScore(studentId: number, changes: Partial<Score>) {
		setScores((currentScores) => ({
			...currentScores,
			[studentId]: { ...(currentScores[studentId] ?? emptyScore()), ...changes },
		}));
		setSaveMessage(null);
	}

	async function saveAll() {
		if (completedStudentList.length === 0) {
			setSaveMessage("Vul voor minimaal één leerling Inzet, Shuttle Run en de volledige RSG-tijd in.");
			return;
		}

		setIsSaving(true);
		setSaveMessage(null);

		try {
			const payload = completedStudentList.map((student) => {
				const score = scores[Number(student.id)];
				const { shuttleRunLevel, limietenNiveau, eindniveau } = calculateConditionResult(
					score.inzet!,
					score.shuttleRunTrap!,
					score.rsgRunMinutes!,
					score.rsgRunSeconds!,
				);

				return {
					student_id: Number(student.id),
					inzet: score.inzet,
					shuttle_run: String(score.shuttleRunTrap),
					shuttle_run_level: shuttleRunLevel,
					rsg_run: `${score.rsgRunMinutes}:${String(score.rsgRunSeconds).padStart(2, "0")}`,
					rsg_run_minutes: score.rsgRunMinutes,
					rsg_run_seconds: score.rsgRunSeconds,
					limieten_niveau: limietenNiveau,
					eindniveau,
				};
			});
			const { error } = await supabase.from("conditie_scores").insert(payload);

			if (error) {
				console.error("[ConditieAssessment] insert failed:", error);
				setSaveMessage(`Opslaan mislukt: ${error.message}`);
				return;
			}

			setSaveMessage(`${completedStudentList.length} beoordeling${completedStudentList.length === 1 ? "" : "en"} opgeslagen.`);
		} catch (error) {
			console.error("[ConditieAssessment] unexpected insert failure:", error);
			setSaveMessage("Opslaan mislukt door een onverwachte fout.");
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
					<div className="hidden rounded-xl bg-[#362665] px-5 py-4 text-sm font-bold text-white lg:grid lg:grid-cols-[minmax(12rem,1.2fr)_minmax(9rem,0.8fr)_minmax(10rem,1fr)_minmax(12rem,1fr)_5rem] lg:items-center lg:gap-4">
						<span>Leerling</span>
						<span>Inzet</span>
						<span>Shuttle Run</span>
						<span>RSG Run</span>
						<span>Resultaat</span>
					</div>

					{students.map((student) => {
						const studentScores = scores[Number(student.id)] ?? emptyScore();
						const isComplete = completedStudentList.includes(student);
						const result = isComplete
							? calculateConditionResult(
								studentScores.inzet!,
								studentScores.shuttleRunTrap!,
								studentScores.rsgRunMinutes!,
								studentScores.rsgRunSeconds!,
							)
							: null;
						const grade = getConditionGrade(result?.eindniveau ?? null);

						return (
							<article key={student.id} className="rounded-2xl bg-white p-5 shadow-lg shadow-[#362665]/10">
								<div className="grid gap-5 lg:grid-cols-[minmax(12rem,1.2fr)_minmax(9rem,0.8fr)_minmax(10rem,1fr)_minmax(12rem,1fr)_5rem] lg:items-center lg:gap-4">
									<div>
										<Link href={`/leerlingen/${student.id}`} className="font-bold text-[#362665] hover:text-[#EF8A00]">
											{student.roepnaam} {student.achternaam}
										</Link>
										<p className="mt-1 text-sm text-slate-500">Stamnummer {student.stamnummer}</p>
									</div>
									<div>
										<p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 lg:hidden">Inzet</p>
										<div className="flex gap-2" role="group" aria-label={`Inzet voor ${student.roepnaam} ${student.achternaam}`}>
											{[1, 2, 3, 4].map((value) => (
												<button
													key={value}
													type="button"
													aria-pressed={studentScores.inzet === value}
													onClick={() => updateScore(Number(student.id), { inzet: value })}
													className={`h-10 w-10 rounded-lg text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF8A00] focus:ring-offset-2 ${studentScores.inzet === value ? "bg-[#EF8A00] text-white" : "bg-slate-100 text-slate-700 hover:bg-[#EF8A00]/15"}`}
												>
													{value}
												</button>
											))}
										</div>
									</div>
									<label className="text-sm font-semibold text-slate-700">
										<span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 lg:hidden">Shuttle Run · trap</span>
										<input
											type="number"
											min="0"
											step="any"
											value={studentScores.shuttleRunTrap ?? ""}
											onChange={(event) => updateScore(Number(student.id), {
												shuttleRunTrap: getInputNumber(event.currentTarget.value),
											})}
											aria-label={`Shuttle Run trap voor ${student.roepnaam} ${student.achternaam}`}
											placeholder="Bijv. 8.5"
											className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800"
										/>
									</label>
									<div>
										<p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 lg:hidden">RSG Run · tijd</p>
										<div className="flex gap-2">
											<label className="min-w-0 flex-1 text-xs text-slate-600">
												Minuten
												<input
													type="number"
													min="0"
													step="1"
													value={studentScores.rsgRunMinutes ?? ""}
													onChange={(event) => updateScore(Number(student.id), {
														rsgRunMinutes: getInputNumber(event.currentTarget.value),
													})}
													aria-label={`RSG Run minuten voor ${student.roepnaam} ${student.achternaam}`}
													className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2.5 text-sm text-slate-800"
												/>
											</label>
											<label className="min-w-0 flex-1 text-xs text-slate-600">
												Seconden
												<input
													type="number"
													min="0"
													max="59"
													step="1"
													value={studentScores.rsgRunSeconds ?? ""}
													onChange={(event) => updateScore(Number(student.id), {
														rsgRunSeconds: getInputNumber(event.currentTarget.value),
													})}
													aria-label={`RSG Run seconden voor ${student.roepnaam} ${student.achternaam}`}
													className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2.5 text-sm text-slate-800"
												/>
											</label>
										</div>
									</div>
									<div className="text-center">
										<div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${gradeStyle(grade)}`} aria-label={grade ? `Resultaat ${grade}` : "Resultaat nog niet compleet"}>
											{grade ?? "-"}
										</div>
										{result && <p className="mt-1 text-xs text-slate-500">{result.eindniveau.toFixed(2)}</p>}
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
