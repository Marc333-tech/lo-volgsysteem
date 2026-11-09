"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
	calculateConditionResult,
	getConditionGrade,
	isCompleteConditionInput,
	parseRsgRunTime,
	parseShuttleRunTrap,
	type ConditionInputs,
} from "../../../../lib/condition";
import { supabase } from "../../../../lib/supabase";

type Leerling = {
	roepnaam: string;
	achternaam: string;
	klas: string;
};

type ScoreInput = ConditionInputs;

type ConditieRecord = {
	inzet: number | null;
	rsg_run: string | null;
	shuttle_run: string | number | null;
	rsg_run_minutes: number | null;
	rsg_run_seconds: number | null;
};

const emptyScore: ScoreInput = {
	inzet: null,
	shuttleRunTrap: null,
	rsgRunMinutes: null,
	rsgRunSeconds: null,
};

function getInputNumber(value: string) {
	if (value === "") return null;
	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : null;
}

export default function ConditiePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [leerling, setLeerling] = useState<Leerling | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [score, setScore] = useState<ScoreInput>(emptyScore);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function loadData() {
			const [studentResult, scoreResult] = await Promise.all([
				supabase
					.from("students")
					.select("roepnaam, achternaam, klas")
					.eq("id", id)
					.single(),
				supabase
					.from("conditie_scores")
					.select("inzet, rsg_run, shuttle_run, rsg_run_minutes, rsg_run_seconds")
					.eq("student_id", Number(id))
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle(),
			]);

			if (!isMounted) return;

			if (studentResult.error) {
				console.error("[ConditiePage] student query failed:", studentResult.error);
				setLoadError(`Leerling laden mislukt: ${studentResult.error.message}`);
			} else {
				setLeerling(studentResult.data);
			}

			if (scoreResult.error) {
				console.error("[ConditiePage] conditie_scores query failed:", scoreResult.error);
				setLoadError(`Conditiebeoordeling laden mislukt: ${scoreResult.error.message}`);
			} else if (scoreResult.data) {
				const savedScore = scoreResult.data as ConditieRecord;
				const legacyRunTime = parseRsgRunTime(savedScore.rsg_run);
				setScore({
					inzet: savedScore.inzet === null ? null : Number(savedScore.inzet),
					shuttleRunTrap: parseShuttleRunTrap(savedScore.shuttle_run),
					rsgRunMinutes: savedScore.rsg_run_minutes === null
						? legacyRunTime?.minutes ?? null
						: Number(savedScore.rsg_run_minutes),
					rsgRunSeconds: savedScore.rsg_run_seconds === null
						? legacyRunTime?.seconds ?? null
						: Number(savedScore.rsg_run_seconds),
				});
			}

			setIsLoading(false);
		}

		void loadData();

		return () => {
			isMounted = false;
		};
	}, [id]);

	function updateScore(changes: Partial<ScoreInput>) {
		setScore((currentScore) => ({ ...currentScore, ...changes }));
		setSaveMessage(null);
	}

	async function handleSave() {
		if (!isCompleteConditionInput(score)) {
			setSaveMessage("Vul Inzet, Shuttle Run en beide RSG-tijdvelden volledig in.");
			return;
		}

		setIsSaving(true);
		setSaveMessage(null);

		try {
			const { shuttleRunLevel, limietenNiveau, eindniveau } = calculateConditionResult(
				score.inzet!,
				score.shuttleRunTrap!,
				score.rsgRunMinutes!,
				score.rsgRunSeconds!,
			);
			const { error } = await supabase.from("conditie_scores").insert({
				student_id: Number(id),
				inzet: score.inzet,
				shuttle_run: String(score.shuttleRunTrap),
				shuttle_run_level: shuttleRunLevel,
				rsg_run: `${score.rsgRunMinutes}:${String(score.rsgRunSeconds).padStart(2, "0")}`,
				rsg_run_minutes: score.rsgRunMinutes,
				rsg_run_seconds: score.rsgRunSeconds,
				limieten_niveau: limietenNiveau,
				eindniveau,
			});

			if (error) {
				console.error("[ConditiePage] insert failed:", error);
				setSaveMessage(`Opslaan mislukt: ${error.message}`);
				return;
			}

			setSaveMessage(`Beoordeling opgeslagen · resultaat ${getConditionGrade(eindniveau)} (${eindniveau.toFixed(2)}).`);
		} catch (error) {
			console.error("[ConditiePage] unexpected insert failure:", error);
			setSaveMessage("Opslaan mislukt door een onverwachte fout.");
		} finally {
			setIsSaving(false);
		}
	}

	const result = isCompleteConditionInput(score)
		? calculateConditionResult(
			score.inzet!,
			score.shuttleRunTrap!,
			score.rsgRunMinutes!,
			score.rsgRunSeconds!,
		)
		: null;

	return (
		<main className="min-h-screen bg-slate-100 p-6 sm:p-10">
			<div className="mx-auto max-w-4xl">
				<Link
					href={`/leerlingen/${id}`}
					className="mb-6 inline-block rounded-lg text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
				>
					&larr; Terug naar leerling
				</Link>

				<div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
					<h1 className="text-4xl font-bold">Conditie beoordeling</h1>
					{isLoading ? (
						<p className="text-sm text-slate-600">Leerling laden...</p>
					) : leerling ? (
						<div className="text-right text-slate-600">
							<p className="font-semibold text-slate-800">
								{leerling.roepnaam} {leerling.achternaam}
							</p>
							<p className="text-sm">Klas {leerling.klas}</p>
						</div>
					) : (
						<p className="text-sm text-slate-600">Leerling niet gevonden</p>
					)}
				</div>

				<div className="space-y-6 rounded-xl bg-white p-6 shadow">
					<section>
						<h2 className="mb-3 text-lg font-semibold text-slate-800">Inzet · telt voor 50%</h2>
						<div className="flex gap-3" role="group" aria-label="Beoordeling voor Inzet">
							{[1, 2, 3, 4].map((value) => (
								<button
									key={value}
									type="button"
									aria-pressed={score.inzet === value}
									onClick={() => updateScore({ inzet: value })}
									className={`h-12 w-12 rounded-full text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 sm:h-14 sm:w-14 ${
										score.inzet === value
											? "bg-slate-900 text-white ring-2 ring-slate-500 ring-offset-2"
											: "bg-slate-200 text-slate-800 hover:bg-slate-300"
									}`}
								>
									{value}
								</button>
							))}
						</div>
					</section>

					<div className="grid gap-5 border-t border-slate-200 pt-5 sm:grid-cols-2">
						<label className="text-sm font-semibold text-slate-800">
							Shuttle Run · trap
							<input
								type="number"
								min="0"
								step="any"
								value={score.shuttleRunTrap ?? ""}
								onChange={(event) => updateScore({ shuttleRunTrap: getInputNumber(event.currentTarget.value) })}
								placeholder="Bijv. 8.5"
								className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-slate-800"
							/>
						</label>
					</div>

					<div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
						<label className="text-sm font-semibold text-slate-800">
							RSG Run · minuten
							<input
								type="number"
								min="0"
								step="1"
								value={score.rsgRunMinutes ?? ""}
								onChange={(event) => updateScore({ rsgRunMinutes: getInputNumber(event.currentTarget.value) })}
								placeholder="Bijv. 34"
								className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-slate-800"
							/>
						</label>
						<label className="text-sm font-semibold text-slate-800">
							RSG Run · seconden
							<input
								type="number"
								min="0"
								max="59"
								step="1"
								value={score.rsgRunSeconds ?? ""}
								onChange={(event) => updateScore({ rsgRunSeconds: getInputNumber(event.currentTarget.value) })}
								placeholder="Bijv. 12"
								className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-slate-800"
							/>
						</label>
					</div>

					{result && (
						<div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700" aria-live="polite">
							<p>Shuttle Niveau {result.shuttleRunLevel} · RSG Niveau {result.rsgRunLevel}</p>
							<p>LimietenNiveau {result.limietenNiveau.toFixed(2)} · EindNiveau {result.eindniveau.toFixed(2)}</p>
							<p className="font-bold">Resultaat {getConditionGrade(result.eindniveau)}</p>
						</div>
					)}

					<div className="flex justify-end border-t border-slate-200 pt-5">
						<button
							type="button"
							onClick={handleSave}
							disabled={isSaving || isLoading || Boolean(loadError)}
							className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSaving ? "Opslaan..." : "Opslaan"}
						</button>
					</div>

					{loadError && <p className="text-right text-sm font-semibold text-rose-700" role="alert">{loadError}</p>}
					{saveMessage && (
						<p className="text-right text-sm text-slate-600" role="status">
							{saveMessage}
						</p>
					)}
				</div>
			</div>
		</main>
	);
}
