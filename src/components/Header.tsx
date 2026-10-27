import { useEffect, useState } from "react";

function StarMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-8 h-8 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <rect x="6.5" y="6.5" width="11" height="11" />
      <rect
        x="6.5"
        y="6.5"
        width="11"
        height="11"
        transform="rotate(45 12 12)"
      />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kuala_Lumpur",
      }).format(new Date());
    setTime(fmt());
    const id = window.setInterval(() => setTime(fmt()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/45 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-between px-6 md:px-14 py-5">
        <a href="#top" className="flex items-center gap-3.5">
          <StarMark />
          <div>
            <p className="font-display font-bold tracking-[0.2em] text-sm leading-none">
              KLCC
            </p>
            <p className="font-mono text-[8px] tracking-[0.32em] text-mist mt-1.5">
              PETRONAS TWIN TOWERS
            </p>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-10 font-mono text-[10px] tracking-[0.3em] text-white/70">
          {["THE TOWERS", "SKYBRIDGE", "OBSERVATION", "STATISTICS"].map(
            (item) => (
              <a
                key={item}
                href="#top"
                className="relative hover:text-gold transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-6">
          <p className="hidden md:block font-mono text-[10px] tracking-[0.25em] text-mist">
            KUL <span className="text-gold-soft">{time}</span> +08
          </p>
          <button className="font-mono text-[10px] tracking-[0.25em] border border-gold/50 text-gold px-5 py-2.5 hover:bg-gold hover:text-ink transition-colors duration-300">
            BOOK A TOUR
          </button>
        </div>
      </div>
    </header>
  );
}
