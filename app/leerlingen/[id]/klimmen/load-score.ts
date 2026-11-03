"use server";

import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function loadLatestKlimmenScore(studentId: number) {
	const supabase = await createSupabaseServerClient();

	const { data, error } = await supabase
		.from("klimmen_scores")
		.select("klimmen, zekeren")
		.eq("student_id", studentId)
		.not("klimmen", "is", null)
		.not("zekeren", "is", null)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) {
		console.error("[loadLatestKlimmenScore] query failed:", error);
		throw new Error(`Klimbeoordeling laden mislukt: ${error.message}`);
	}

	return data;
}
