"use server";

import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function loadLatestKlimmenScore(studentId: number) {
	const supabase = await createSupabaseServerClient();

	const { data } = await supabase
		.from("klimmen_scores")
		.select("klimmen, zekeren")
		.eq("student_id", studentId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	return data;
}
