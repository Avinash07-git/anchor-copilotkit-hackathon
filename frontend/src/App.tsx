import { useEffect, useState } from 'react';

/**
 * RentProof — App shell.
 * v0.1: shows a "hello" landing + backend health probe.
 * v1.0: routes to Landing → Investigating → EvidenceRoom screens.
 */
export default function App() {
  const [backend, setBackend] = useState<'unknown' | 'ok' | 'down'>('unknown');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => setBackend('ok'))
      .catch(() => setBackend('down'));
  }, []);

  return (
    <main className="min-h-screen bg-white text-walmart-gray-160">
      <header className="bg-walmart-blue-100 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">🏠 RentProof</h1>
        <span className="text-sm opacity-90">
          Backend:{' '}
          {backend === 'ok' && <span className="text-walmart-spark-100">●  online</span>}
          {backend === 'down' && <span className="text-walmart-red-100">●  offline</span>}
          {backend === 'unknown' && <span>●  checking…</span>}
        </span>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Your landlord kept your deposit?
        </h2>
        <p className="text-lg text-walmart-gray-100 mb-8">
          We'll show you which deductions are worth challenging — and draft the response letter for you to review.
        </p>

        <button
          className="bg-walmart-spark-100 hover:bg-walmart-spark-140 hover:text-white
                     text-walmart-gray-160 font-semibold px-6 py-3 rounded-lg
                     transition-colors focus:outline-none
                     focus:ring-4 focus:ring-walmart-blue-100"
          onClick={() => alert('Demo flow wired in build step 8.')}
        >
          ✨ Try the demo with Rita's case
        </button>

        <p className="mt-12 text-sm text-walmart-gray-100">
          Scaffold ready. Evidence Room components land in build steps 5–8.
        </p>
      </section>
    </main>
  );
}
