import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ next?: string; error?: string }>;
}) {
	const { next, error } = await searchParams;
	const redirectPath = next?.startsWith("/") ? next : "/";

	async function signIn(formData: FormData) {
		"use server";

		const email = String(formData.get("email") ?? "");
		const password = String(formData.get("password") ?? "");
		const supabase = await createSupabaseServerClient();
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			redirect("/login?error=invalid");
		}

		redirect(redirectPath);
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-[#f5f3f8] px-6 py-10 sm:px-10">
			<div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-[#362665]/10 sm:p-10">
				<div className="mb-8 text-center">
					<Image
						src="/logo.svg"
						alt="RSG Ter Apel"
						width={180}
						height={78}
						className="mx-auto mb-8 h-auto w-40 sm:w-48"
						priority
					/>
					<p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#EF8A00]">
						RSG Ter Apel
					</p>
					<h1 className="text-3xl font-bold tracking-tight text-[#362665]">
						Inloggen
					</h1>
					<div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</div>

				<form className="space-y-5" action={signIn}>
					<div>
						<label
							htmlFor="email"
							className="mb-2 block text-sm font-semibold text-[#362665]"
						>
							E-mailadres
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-[#362665] focus:ring-4 focus:ring-[#EF8A00]/20"
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="mb-2 block text-sm font-semibold text-[#362665]"
						>
							Wachtwoord
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-[#362665] focus:ring-4 focus:ring-[#EF8A00]/20"
						/>
					</div>

					{error === "invalid" && (
						<p className="text-sm text-red-600" role="alert">
							Inloggen mislukt. Controleer je e-mailadres en wachtwoord.
						</p>
					)}

					<button
						type="submit"
						className="w-full rounded-lg bg-[#362665] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#2b1e51] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
					>
						Inloggen
					</button>
				</form>
			</div>
		</main>
	);
}
