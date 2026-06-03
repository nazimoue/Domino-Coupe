"use client";

import { useState } from 'react';

export default function MigratePhotosPage() {
  const [secret, setSecret] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/players/migrate-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-[#041336] text-[#f8fafc] font-sans">
      <div className="max-w-xl mx-auto bg-[#001e15]/60 p-6 rounded-lg">
        <h1 className="text-xl font-bold text-amber-300 mb-4">Migration Photos</h1>
        <p className="text-sm text-emerald-200 mb-4">Entrez le secret de migration et cliquez sur "Lancer". Le processus migrera les data URLs vers Supabase Storage.</p>

        <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Secret" className="w-full p-3 rounded mb-3 bg-[#002a20]" />
        <div className="flex gap-2">
          <button onClick={runMigration} disabled={loading || !secret} className="px-4 py-2 bg-amber-400 text-[#002a20] rounded font-bold">{loading ? 'En cours...' : 'Lancer la migration'}</button>
        </div>

        {result && (
          <pre className="mt-4 p-3 bg-[#001a12] text-xs overflow-auto max-h-96 rounded">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    </main>
  );
}
