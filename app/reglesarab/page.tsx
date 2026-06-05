'use client';
import Link from 'next/link';

export default function Rules() {

  const rules = [
    "كي ماتڤولش حجرة",
    "كي تلعب حجرة ماتلتعبش ( خص الفريق المنافس يڤولك واسم هي)",
    "كي تڤول جيه جيه",
    "كي تشكي بلعة بلا ما تكون كاينة ولا تكون بحجرة",
    "كي تشكي و انت عندك غي حجرة",
    "كي تشكي علا الدوبلي",
    "كي تڤول تطريقة",
    "كي يجي لي مايكونش ضارب",
    "كي تخبي حجرة فالبلعة و يفيقولك",
    "كي تباصي و انت عندك اللعب",
    "كي تلعب ب 6 او 7 من نيميرو واحد و يفيقولك",
    "كي تشر لصاحبك",
    "كي تجي مجية فورصي 6:6 و تلعب دوبلي وحداخر و عندك 6 وحداخر ولا تجي مجية عوجة",
    "كي صاحبك يباصي و تڤوله طرق",
    "كي تكون مجية فورصي و تڤول دور عليه ولا صاحبك يڤو لك طرق",
    "كي تلعب و لي موراك يلعب عادا باش تشكيله (الا ادا لي مراك لعب ديراكت)",
    "كي تجي مجية عوجة و صاحبك يڤولك طرق",
    "كي تبين حجرك"
  ];

  return (
    <main className="relative min-h-screen w-full bg-[#041336] overflow-hidden flex flex-col items-center font-sans selection:bg-sky-500 selection:text-slate-900">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0b1730] via-[#0c2b5d] to-[#041336]"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-10 w-full max-w-2xl px-6 pt-12 pb-6 text-center">
        <Link href="/home" className="absolute left-6 top-12 text-[#fbbf24] hover:scale-110 transition-transform">
          ←
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#fde68a] via-[#fbbf24] to-[#b45309] font-serif mb-2">
          قوانين 50
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent mx-auto"></div>
      </div>

      {/* RULES CONTAINER */}
      <div className="relative z-10 w-full max-w-2xl px-4 pb-20">
        <div className="bg-emerald-900/40 backdrop-blur-md border border-[#fbbf24]/30 rounded-3xl p-6 shadow-2xl">
          <ul className="space-y-4 text-right" dir="rtl">
            {rules.map((rule, index) => (
              <li key={index} className="flex items-start gap-4 text-emerald-50 group">
                <span className="flex-shrink-0 w-8 h-8 rounded-full border border-[#fbbf24]/50 flex items-center justify-center text-[#fbbf24] text-xs font-serif group-hover:bg-[#fbbf24] group-hover:text-emerald-900 transition-colors">
                  {index + 1}
                </span>
                <p className="text-lg leading-relaxed pt-0.5 border-b border-white/5 pb-2 w-full">
                  {rule}
                </p>
              </li>
            ))}
          </ul>

          {/* FOOTER TEXT */}
          <div className="mt-12 text-center space-y-4">
            <div className="py-3 px-6 bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-2xl">
              <p className="text-[#fbbf24] font-medium italic text-sm">
                هذه القوانين لن تتغير الا باتفاق الجميع
              </p>
            </div>

            <p className="text-emerald-400/60 text-xs font-bold tracking-widest uppercase py-4">
              <a href="https://share.google/AAmoAijaTJuQGf8Kt" target="_blank" rel="noopener noreferrer" className="underline">
                Café MONTECARLO • Tlemcen
              </a>
            </p>

            <div className="text-2xl font-serif text-[#fbbf24]/40 select-none opacity-50">
              ن م
            </div>
          </div>
        </div>
      </div>

      {/* DECORATIVE CORNER (Bottom Right) */}
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none opacity-40">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-transparent stroke-[#fbbf24] stroke-1">
          <path d="M100,100 L60,100 Q0,100 0,40 L0,0" />
        </svg>
      </div>
    </main>
  );
}
