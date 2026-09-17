"use server";

import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function loadLatestSpringenScore(studentId: number) {
	const supabase = await createSupabaseServerClient();

	const { data } = await supabase
		.from("springen_scores")
		.select("inzet, techniek, sprongvormen, combineren")
		.eq("student_id", studentId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	return data;
}
