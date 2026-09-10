import Image from "next/image";
import Link from "next/link";

const sporten = [
	{ naam: "Softbal", icoon: "🥎", slug: "softbal" },
	{ naam: "Volleybal", icoon: "🏐", slug: "volleybal" },
	{ naam: "Basketbal", icoon: "🏀", slug: "basketbal" },
	{ naam: "Handbal", icoon: "🤾", slug: "handbal" },
	{ naam: "Hockey", icoon: "🏑", slug: "hockey" },
];

export default function SportenPage() {
	return (
		<main className="min-h-screen bg-[#f5f3f8] px-6 py-10 sm:px-10 sm:py-14">
			<div className="mx-auto max-w-6xl">
				<header className="mb-12 max-w-2xl">
					<Image
						src="/logo.svg"
						alt="RSG Ter Apel"
						width={180}
						height={78}
						className="mb-8 h-auto w-40 sm:w-48"
						priority
					/>
					<Link
						href="/"
						className="mb-8 inline-block rounded-lg font-semibold text-[#362665] transition-colors hover:text-[#EF8A00] focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
					>
						← Terug naar dashboard
					</Link>
					<p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#EF8A00]">
						RSG Ter Apel
					</p>
					<h1 className="text-4xl font-bold tracking-tight text-[#362665] sm:text-5xl">
						Sporten
					</h1>
					<div className="mt-5 h-1 w-20 rounded-full bg-[#EF8A00]" />
				</header>

				<section
					aria-label="Sporten"
					className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
				>
					{sporten.map((sport) => (
						<Link
							key={sport.slug}
							href={`/sporten/${sport.slug}`}
							className="group rounded-2xl bg-white p-6 shadow-lg shadow-[#362665]/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#362665]/20 focus:outline-none focus:ring-4 focus:ring-[#EF8A00]/40"
						>
							<div className="mb-8 flex items-start justify-between">
								<span
									className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#362665]/10 text-3xl"
									aria-hidden="true"
								>
									{sport.icoon}
								</span>
								<span
									className="text-2xl text-[#362665] transition-transform duration-200 group-hover:translate-x-1"
									aria-hidden="true"
								>
									→
								</span>
							</div>
							<h2 className="text-2xl font-bold text-[#362665]">{sport.naam}</h2>
						</Link>
					))}
				</section>
			</div>
		</main>
	);
}
