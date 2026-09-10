"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoggingIn, setIsLoggingIn] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoggingIn(true);
		setErrorMessage(null);

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setErrorMessage("Inloggen mislukt. Controleer je e-mailadres en wachtwoord.");
			setIsLoggingIn(false);
			return;
		}

		router.replace("/");
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

				<form className="space-y-5" onSubmit={handleSubmit}>
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
							value={email}
							onChange={(event) => setEmail(event.target.value)}
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
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-[#362665] focus:ring-4 focus:ring-[#EF8A00]/20"
						/>
					</div>

					{errorMessage && (
						<p className="text-sm text-red-600" role="alert">
							{errorMessage}
						</p>
					)}

					<button
						type="submit"
						disabled={isLoggingIn}
						className="w-full rounded-lg bg-[#362665] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#2b1e51] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoggingIn ? "Inloggen..." : "Inloggen"}
					</button>
				</form>
			</div>
		</main>
	);
}
