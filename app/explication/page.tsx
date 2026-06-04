/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

export default function Explication() {
  return (
    <main className="min-h-screen w-full bg-[#041336] text-[#f8fafc] font-sans selection:bg-sky-500 selection:text-slate-900 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-[#001e15]/60 border border-[#fbbf24]/20 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#fbbf24] mb-4 font-serif">Explication du format de match</h1>

        <p className="mb-3 text-emerald-200">
          Un match se déroule en plusieurs manches. Chaque manche rapporte des points au classement général selon le résultat.
        </p>

        <h2 className="text-lg font-semibold text-[#fde68a] mt-4">Condition de fin</h2>
        <p className="mb-3 text-emerald-200">Le match se termine lorsque l'une des équipes atteint 150 points au total.</p>

        <h2 className="text-lg font-semibold text-[#fde68a] mt-4">Valeur des manches</h2>
        <ul className="list-disc ml-5 mb-4 text-emerald-200">
          <li>Victoire simple : <strong className="text-[#fbbf24]">+3 pts</strong></li>
          <li>Défaite : <strong className="text-[#fbbf24]">0 pts</strong></li>
          <li>Victoire Capot : <strong className="text-[#fbbf24]">+6 pts</strong></li>
          <li>Défaite Capot : <strong className="text-[#fbbf24]">-6 pts</strong></li>
        </ul>

        <h2 className="text-lg font-semibold text-[#fde68a] mt-4">Calcul du niveau des joueurs</h2>
        <p className="mb-3 text-emerald-200">Le niveau d'un joueur est calculé à partir de son total de points selon les intervalles suivants :</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-sm text-emerald-100/80">
                <th className="px-3 py-2">Niveau</th>
                <th className="px-3 py-2">Intervalle de points</th>
                <th className="px-3 py-2">Explication</th>
              </tr>
            </thead>
            <tbody className="text-sm text-emerald-200">
              <tr className="border-t border-[#fbbf24]/10">
                <td className="px-3 py-2 font-semibold">Très fort</td>
                <td className="px-3 py-2">≥ 120</td>
                <td className="px-3 py-2">Élites constantes ; ~85% victoires.</td>
              </tr>
              <tr className="border-t border-[#fbbf24]/10">
                <td className="px-3 py-2 font-semibold">Fort</td>
                <td className="px-3 py-2">70 - 119</td>
                <td className="px-3 py-2">Très bons ; ~70% victoires.</td>
              </tr>
              <tr className="border-t border-[#fbbf24]/10">
                <td className="px-3 py-2 font-semibold">Moyen</td>
                <td className="px-3 py-2">25 - 69</td>
                <td className="px-3 py-2">Équilibrés ; ~50% victoires.</td>
              </tr>
              <tr className="border-t border-[#fbbf24]/10">
                <td className="px-3 py-2 font-semibold">Faible</td>
                <td className="px-3 py-2">5 - 24</td>
                <td className="px-3 py-2">Occasionnels ; ~30% victoires.</td>
              </tr>
              <tr className="border-t border-[#fbbf24]/10">
                <td className="px-3 py-2 font-semibold">Médiocre</td>
                <td className="px-3 py-2">0 - 4</td>
                <td className="px-3 py-2">Peu de succès ; &lt;20% victoires stables.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <Link href="/home" className="px-4 py-2 bg-[#fbbf24] text-[#064e3b] rounded-lg font-bold">Retour</Link>
        </div>
      </div>
    </main>
  );
}
