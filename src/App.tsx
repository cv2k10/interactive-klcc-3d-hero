import Header from "./components/Header";
import KLCCHero from "./components/KLCCHero";

export default function App() {
  return (
    <main id="top" className="bg-ink text-white font-body antialiased">
      <Header />
      <KLCCHero />

      {/* outro band */}
      <section className="relative border-t border-white/5 bg-ink-2">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <p className="font-mono text-[10px] tracking-[0.5em] text-gold">
            451.9 M — 88 FLOORS — ONE ICON
          </p>
          <h2 className="mt-6 font-display font-bold leading-[1.02] tracking-tight text-4xl md:text-6xl">
            Steel, glass <span className="text-outline">&amp; starlight.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-mist">
            An architectural landmark of Kuala Lumpur City Centre — where
            Islamic geometry meets the modern skyline, above the 50-acre KLCC
            Park.
          </p>

          <div className="mt-14 w-full border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[9px] tracking-[0.3em] text-mist/70">
              PETRONAS TWIN TOWERS — KUALA LUMPUR CITY CENTRE
            </p>
            <p className="font-mono text-[9px] tracking-[0.3em] text-mist/70">
              REAL-TIME 3D · THREE.JS · KLCC DEVELOPMENT
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
