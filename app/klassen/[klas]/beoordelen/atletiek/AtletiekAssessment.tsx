"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../../../../lib/supabase";

const criteria = [
	{ key: "lay_out_kijkwijzer", label: "Lay-out kijkwijzer", maximum: 10 },
	{ key: "instructie_onderdeel", label: "Instructie onderdeel", maximum: 20 },
	{ key: "voorbeeld_uitvoering", label: "Voorbeeld uitvoering", maximum: 20 },
	{ key: "differentiatie_naar_niveau", label: "Differentiatie naar niveau", maximum: 10 },
	{ key: "benoemen_van_fouten", label: "Benoemen van fouten", maximum: 10 },
	{ key: "ondersteunende_graphics", label: "Ondersteunende graphics", maximum: 10 },
	{ key: "slow_motion_beelden", label: "Slow motion beelden", maximum: 10 },
	{ key: "filmen_meerdere_hoeken", label: "Filmen vanuit meerdere hoeken", maximum: 10 },
] as const;

type CriterionKey = (typeof criteria)[number]["key"];
type Score = Record<CriterionKey, number | null>;

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
		lay_out_kijkwijzer: null,
		instructie_onderdeel: null,
		voorbeeld_uitvoering: null,
		differentiatie_naar_niveau: null,
		benoemen_van_fouten: null,
		ondersteunende_graphics: null,
		slow_motion_beelden: null,
		filmen_meerdere_hoeken: null,
	};
}

function getGrade(total: number) {
	if (total < 60) return "O";
	if (total < 80) return "V";
	return "G";
}

function gradeStyle(grade: string | null) {
	if (grade === "G") return "bg-emerald-100 text-emerald-800";
	if (grade === "V") return "bg-amber-100 text-amber-800";
	if (grade === "O") return "bg-rose-100 text-rose-800";
	return "bg-slate-100 text-slate-400";
}

export default function AtletiekAssessment({ klas, students, initialScores }: Props) {
	const [scores, setScores] = useState<Record<number, Score>>(() =>
		Object.fromEntries(
			students.map((student) => [
				Number(student.id),
				{ ...emptyScore(), ...initialScores[String(student.id)] },
			]),
		),
	);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const completedStudents = students.filter((student) =>
		criteria.every((criterion) => scores[Number(student.id)]?.[criterion.key] !== null),
	);
	const assessedStudents = students.filter((student) =>
		criteria.some((criterion) => scores[Number(student.id)]?.[criterion.key] !== null),
	);

	function selectScore(studentId: number, criterion: CriterionKey, value: number | null) {
		setScores((currentScores) => ({
			...currentScores,
			[studentId]: { ...(currentScores[studentId] ?? emptyScore()), [criterion]: value },
		}));
		setSaveMessage(null);
	}

	async function saveAll() {
		if (assessedStudents.length === 0) {
			setSaveMessage("Vul eerst een beoordeling in voor minimaal één leerling.");
			return;
		}

		setIsSaving(true);
		setSaveMessage(null);
		const payload = assessedStudents.map((student) => ({
			student_id: Number(student.id),
			...scores[Number(student.id)],
		}));

		try {
			const { error } = await supabase.from("atletiek_scores").insert(payload);

			if (error) {
				console.error("[AtletiekAssessment] insert failed:", error);
				setSaveMessage(`Opslaan mislukt: ${error.message}`);
				return;
			}

			setSaveMessage(
				`Beoordelingen voor ${assessedStudents.length} leerling${assessedStudents.length === 1 ? "" : "en"} opgeslagen.`,
			);
		} catch (error) {
			console.error("[AtletiekAssessment] insert request failed:", error);
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
						{completedStudents.length} van {students.length} leerlingen volledig beoordeeld
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
						const total = criteria.reduce(
							(sum, criterion) => sum + (studentScores[criterion.key] ?? 0),
							0,
						);
						const isComplete = criteria.every(
							(criterion) => studentScores[criterion.key] !== null,
						);
						const grade = isComplete ? getGrade(total) : null;

						return (
							<article key={student.id} className="rounded-2xl bg-white p-5 shadow-lg shadow-[#362665]/10">
								<div className="mb-5 flex flex-wrap items-start justify-between gap-3">
									<div>
										<Link href={`/leerlingen/${student.id}`} className="font-bold text-[#362665] hover:text-[#EF8A00]">
											{student.roepnaam} {student.achternaam}
										</Link>
										<p className="mt-1 text-sm text-slate-500">Stamnummer {student.stamnummer}</p>
									</div>
									<div className="flex items-center gap-3">
										<p className="font-bold text-[#362665]" aria-label={`Totaal ${total} van 100 punten`}>
											{total}/100 punten
										</p>
										<span
											className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-black ${gradeStyle(grade)}`}
											aria-label={grade ? `Resultaat ${grade}` : "Resultaat nog niet compleet"}
										>
											{grade ?? "-"}
										</span>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
									{criteria.map((criterion) => (
										<label
											key={criterion.key}
											className="rounded-xl border border-slate-200 p-4 text-sm font-semibold text-[#362665]"
										>
											<span className="block min-h-10">{criterion.label}</span>
											<span className="mt-2 flex items-center gap-2">
												<input
													type="number"
													min={0}
													max={criterion.maximum}
													step={1}
													value={studentScores[criterion.key] ?? ""}
													onChange={(event) => {
														const rawValue = event.target.value;
														if (rawValue === "") {
															selectScore(Number(student.id), criterion.key, null);
															return;
														}

														const value = Number(rawValue);
														if (
															Number.isInteger(value) &&
															value >= 0 &&
															value <= criterion.maximum
														) {
															selectScore(Number(student.id), criterion.key, value);
														}
													}}
													className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 focus:border-[#EF8A00] focus:outline-none focus:ring-2 focus:ring-[#EF8A00]/40"
													aria-label={`${criterion.label}, maximaal ${criterion.maximum} punten, voor ${student.roepnaam} ${student.achternaam}`}
												/>
												<span className="text-slate-500">/ {criterion.maximum} punten</span>
											</span>
										</label>
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

			{saveMessage && <p className="mt-5 text-right text-sm font-semibold text-slate-700" role="status">{saveMessage}</p>}
		</div>
	);
}
