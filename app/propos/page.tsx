import Link from 'next/link';
import Image from 'next/image';


export default function ProposPage() {
	return (
		<main className="relative min-h-screen w-full bg-[#041336] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-sky-500 selection:text-slate-900">
			<div className="absolute inset-0 z-0">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
			</div>

			<div className="relative z-10 w-full max-w-2xl px-6 py-20 text-center">
				<h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-b from-[#fde68a] via-[#fbbf24] to-[#b45309] font-serif mb-6">
					À propos
				</h1>

				<div className="mb-6">
					{/* Image replaced with Next.js Image component */}
					<Image
						src="/images/propos.jpeg"
						alt="Riyad Fekar"
						className="mx-auto rounded-2xl shadow-lg w-full max-w-xl h-auto"
						width={800}
						height={600}
						unoptimized
					/>

					{/* Bouton retour */}
					<div className="relative z-40 w-full flex flex-col items-center justify-end flex-shrink-0 py-3 sm:py-4 md:py-5 px-3 sm:px-4 pointer-events-auto">
						<Link
							href="/home"
							className="px-8 py-3 font-bold text-base rounded-lg shadow-lg transition-all duration-300 tracking-wider bg-linear-to-r from-[#fbbf24] to-[#fcd34d] text-[#064e3b] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]"
						>
							← Retour à l&apos;accueil
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
