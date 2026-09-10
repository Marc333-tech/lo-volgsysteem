"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

const categorieen = ["Inzet", "Techniek", "Tactiek"];
const beoordelingen = [1, 2, 3, 4];

type Leerling = {
	roepnaam: string;
	achternaam: string;
	klas: string;
};

type VolleybalScore = {
	inzet: number;
	techniek: number;
	tactiek: number;
};

export default function VolleybalPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [leerling, setLeerling] = useState<Leerling | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [scores, setScores] = useState<Record<string, number | null>>(() =>
		Object.fromEntries(categorieen.map((categorie) => [categorie, null])),
	);
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

		const { error } = await supabase.from("volleybal_scores").insert({
			student_id: Number(id),
			inzet: scores.Inzet,
			techniek: scores.Techniek,
			tactiek: scores.Tactiek,
		});

		setIsSaving(false);
		setSaveMessage(
			error
				? `Opslaan mislukt: ${error.message}`
				: "Beoordeling opgeslagen.",
		);
	}

	useEffect(() => {
		let isMounted = true;

		async function loadLeerling() {
			const [{ data: leerlingData }, { data: scoreData }] = await Promise.all([
				supabase
					.from("students")
					.select("roepnaam, achternaam, klas")
					.eq("id", id)
					.single(),
				supabase
					.from("volleybal_scores")
					.select("inzet, techniek, tactiek")
					.eq("student_id", Number(id))
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle(),
			]);

			if (isMounted) {
				setLeerling(leerlingData);

				if (scoreData) {
					const savedScores = scoreData as VolleybalScore;

					setScores({
						Inzet: savedScores.inzet,
						Techniek: savedScores.techniek,
						Tactiek: savedScores.tactiek,
					});
				}

				setIsLoading(false);
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
					<h1 className="text-4xl font-bold">Volleybal beoordeling</h1>
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
								{categorie}
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
