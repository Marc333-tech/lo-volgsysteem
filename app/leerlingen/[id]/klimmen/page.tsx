"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { loadLatestKlimmenScore } from "./load-score";

const categorieen = ["Klimmen", "Zekeren"] as const;
const beoordelingen = [1, 2, 3, 4];
type Categorie = (typeof categorieen)[number];

type Leerling = {
	roepnaam: string;
	achternaam: string;
	klas: string;
};

type KlimmenScore = {
	klimmen: number;
	zekeren: number;
};

export default function KlimmenPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [leerling, setLeerling] = useState<Leerling | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [scores, setScores] = useState<Record<Categorie, number | null>>({
		Klimmen: null,
		Zekeren: null,
	});
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	async function handleSave() {
		const selectedScores = Object.values(scores);

		if (selectedScores.some((score) => score === null)) {
			setSaveMessage("Kies eerst een beoordeling voor elke categorie.");
			return;
		}

		setIsSaving(true);
		setSaveMessage(null);

		try {
			const { error } = await supabase.from("klimmen_scores").insert({
				student_id: Number(id),
				klimmen: scores.Klimmen,
				zekeren: scores.Zekeren,
			});

			if (error) {
				console.error("[KlimmenPage] insert failed:", error);
				setSaveMessage(`Opslaan mislukt: ${error.message}`);
				return;
			}

			setSaveMessage("Beoordeling opgeslagen.");
		} catch (error) {
			console.error("[KlimmenPage] insert request failed:", error);
			setSaveMessage("Opslaan mislukt door een verbindingsfout.");
		} finally {
			setIsSaving(false);
		}
	}

	useEffect(() => {
		let isMounted = true;

		async function loadLeerling() {
			try {
				const [{ data: leerlingData, error: leerlingError }, scoreData] =
					await Promise.all([
						supabase
							.from("students")
							.select("roepnaam, achternaam, klas")
							.eq("id", id)
							.single(),
						loadLatestKlimmenScore(Number(id)),
					]);

				if (leerlingError) {
					console.error("[KlimmenPage] student query failed:", leerlingError);
					throw new Error(`Leerling laden mislukt: ${leerlingError.message}`);
				}

				if (isMounted) {
					setLeerling(leerlingData);

					if (scoreData) {
						const savedScores = scoreData as KlimmenScore;

						setScores({
							Klimmen: savedScores.klimmen,
							Zekeren: savedScores.zekeren,
						});
					}
				}
			} catch (error) {
				console.error("[KlimmenPage] load request failed:", error);
				if (isMounted) {
					setSaveMessage(
						error instanceof Error
							? error.message
							: "Beoordeling laden mislukt door een verbindingsfout.",
					);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		loadLeerling();

		return () => {
			isMounted = false;
		};
	}, [id]);

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
					<h1 className="text-4xl font-bold">Klimmen beoordeling</h1>
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

				<div className="space-y-4 rounded-xl bg-white p-6 shadow">
					{categorieen.map((categorie) => (
						<section
							key={categorie}
							className="flex flex-col gap-3 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
						>
							<h2 className="text-lg font-semibold text-slate-800">
								{categorie === "Zekeren" ? "🪢" : "🧗"} {categorie}
							</h2>

							<div
								className="flex gap-3"
								role="group"
								aria-label={`Beoordeling voor ${categorie}`}
							>
								{beoordelingen.map((beoordeling) => (
									<button
										key={beoordeling}
										type="button"
										aria-pressed={scores[categorie] === beoordeling}
										onClick={() =>
											setScores((currentScores) => ({
												...currentScores,
												[categorie]: beoordeling,
											}))
										}
										className={`h-12 w-12 shrink-0 rounded-full text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 sm:h-14 sm:w-14 ${
											scores[categorie] === beoordeling
												? "bg-slate-900 text-white ring-2 ring-slate-500 ring-offset-2"
												: "bg-slate-200 text-slate-800 hover:bg-slate-300"
										}`}
									>
										{beoordeling}
									</button>
								))}
							</div>
						</section>
					))}

					<div className="flex justify-end border-t border-slate-200 pt-6">
						<button
							type="button"
							onClick={handleSave}
							disabled={isSaving}
							className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
						>
							{isSaving ? "Opslaan..." : "Opslaan"}
						</button>
					</div>

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
