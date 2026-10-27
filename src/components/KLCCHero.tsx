import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BookOpen } from "lucide-react";
import { buildKLCCScene } from "../three/klcc";
import { evalCamera, type CamState } from "../three/scrollCamera";

const THRESHOLDS = [0.09, 0.27, 0.45, 0.63, 0.81];

interface Spec {
  index: string;
  num: string;
  unit: string;
  label: string;
  title: string;
  desc: string;
}

const SPECS: Spec[] = [
  {
    index: "01",
    num: "451.9",
    unit: "M",
    label: "HEIGHT",
    title: "The tallest twin towers on Earth",
    desc: "Rising 451.9 metres above street level, the towers held the world's-tallest title from 1998 to 2004, and remain the tallest twin structure ever built.",
  },
  {
    index: "02",
    num: "88",
    unit: "FLOORS",
    label: "STOREYS",
    title: "88 storeys above the city",
    desc: "Each tower climbs 88 floors, plus five basement levels, served by 29 double-decker high-speed lifts sweeping through a stainless-steel skeleton.",
  },
  {
    index: "03",
    num: "L41–42",
    unit: "LEVELS",
    label: "SKYBRIDGE",
    title: "The double-decker skybridge",
    desc: "A 58-metre two-storey bridge links the towers 170 metres above the ground: the highest double-deck skybridge in the world, resting on sweeping arch supports.",
  },
  {
    index: "04",
    num: "73.5",
    unit: "M",
    label: "SPIRE",
    title: "Crowning stainless masts",
    desc: "Each tower is crowned by a 73.5-metre spire, a tapered mast and aviation beacon that draws the silhouette to its full pinnacle height.",
  },
  {
    index: "05",
    num: "8",
    unit: "POINTS",
    label: "GEOMETRY",
    title: "The eight-pointed star",
    desc: "The floor plan is a Rub el Hizb: two interlocking squares forming an eight-pointed star, Islamic geometry poured into a modern icon of steel and glass.",
  },
];

export default function KLCCHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef(0);
  const [phase, setPhase] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1400);
    const { scene, klcc, update, dispose } = buildKLCCScene();

    const cam: CamState = {
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      fov: 40,
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    /* mouse parallax */
    let mx = 0,
      my = 0,
      smx = 0,
      smy = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    /* scroll progress */
    let pTarget = 0;
    let p = 0;
    const onScroll = () => {
      const el = wrapRef.current!;
      const max = Math.max(el.offsetHeight - window.innerHeight, 1);
      pTarget = Math.min(Math.max(window.scrollY / max, 0), 1);
    };
    onScroll();
    p = pTarget;
    window.addEventListener("scroll", onScroll, { passive: true });

    const right = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    let elapsed = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;
      const t = clock.elapsedTime;

      p += (pTarget - p) * Math.min(1, dt * 4.5);
      smx += (mx - smx) * Math.min(1, dt * 3);
      smy += (my - smy) * Math.min(1, dt * 3);

      /* camera choreography */
      evalCamera(p, cam);
      const intro = Math.min(1, elapsed / 1.9);
      const ease = 1 - Math.pow(1 - intro, 3);

      camera.position.copy(cam.pos);
      camera.position.z += (1 - ease) * 24;
      camera.lookAt(cam.look);
      right.setFromMatrixColumn(camera.matrix, 0);
      camera.position.addScaledVector(right, smx * 6);
      camera.position.y += -smy * 3.5;
      camera.lookAt(cam.look);
      camera.fov = cam.fov + (1 - ease) * 6;
      camera.updateProjectionMatrix();

      /* idle + scroll-driven rotation of the towers */
      klcc.rotation.y = p * 2.4 + t * 0.02;

      update(t);
      renderer.render(scene, camera);

      /* HUD DOM updates */
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current)
        pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;

      let idx = 0;
      for (const th of THRESHOLDS) if (p >= th) idx++;
      if (idx !== phaseRef.current) {
        phaseRef.current = idx;
        setPhase(idx);
      }
    };
    tick();
    const readyTimer = window.setTimeout(() => setReady(true), 80);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(readyTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      dispose();
      renderer.dispose();
    };
  }, []);

  const scrollToSpec = (i: number) => {
    const el = wrapRef.current!;
    const max = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: THRESHOLDS[i] * max + 60, behavior: "smooth" });
  };

  const spec = phase > 0 ? SPECS[phase - 1] : null;

  return (
    <div ref={wrapRef} className="relative h-[540vh]">
      <div className="sticky top-0 h-screen overflow-hidden grain">
        {/* deep space backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 8%, #0a1122 0%, #060a16 42%, #04060c 100%)",
          }}
        />

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-[1800ms] ease-out ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="vignette absolute inset-0 pointer-events-none" />

        {/* ---------------- INTRO ---------------- */}
        <div
          className={`absolute inset-0 flex flex-col justify-center px-6 md:px-14 transition-all duration-700 ${
            phase === 0 ? "opacity-100" : "opacity-0 -translate-y-10 pointer-events-none"
          }`}
        >
          <p
            className="animate-fade-up font-mono text-[10px] md:text-xs tracking-[0.5em] text-gold flex items-center gap-4"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="h-px w-8 md:w-14 bg-gold/60" />
            KUALA LUMPUR CITY CENTRE · MALAYSIA
          </p>

          <h1
            className="animate-fade-up mt-5 font-display font-bold leading-[0.92] tracking-tight text-[12.5vw] md:text-[8.6vw] drop-shadow-[0_0_50px_rgba(227,184,115,0.12)]"
            style={{ animationDelay: "0.3s" }}
          >
            PETRONAS
            <span className="text-outline block">TWIN TOWERS</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-sm md:text-[15px] leading-relaxed text-mist"
            style={{ animationDelay: "0.45s" }}
          >
            Rising{" "}
            <span className="text-gold-soft font-medium">451.9 metres</span> over
            Kuala Lumpur, the Petronas Towers are the tallest twin towers ever
            built: a gleaming eight-pointed star of stainless steel, glass and
            Islamic geometry. Scroll to orbit the icon.
          </p>

          <div
            className="animate-fade-up mt-7 flex flex-wrap gap-2 md:gap-3"
            style={{ animationDelay: "0.6s" }}
          >
            {["451.9 M · HEIGHT", "88 FLOORS", "SKYBRIDGE · L41–42", "8-POINT STAR PLAN"].map(
              (c) => (
                <span
                  key={c}
                  className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] border border-white/15 bg-white/[0.03] backdrop-blur-sm px-3.5 py-2 text-white/80"
                >
                  {c}
                </span>
              )
            )}
          </div>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.75s" }}
          >
            <button
              onClick={() => scrollToSpec(0)}
              className="group relative overflow-hidden bg-gold text-ink font-mono text-[11px] tracking-[0.25em] px-8 py-4 hover:bg-gold-soft transition-colors duration-300"
            >
              BEGIN ORBIT
            </button>
            <button
              onClick={() => scrollToSpec(4)}
              className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.25em] border border-white/20 px-8 py-4 hover:border-gold/60 hover:text-gold transition-colors duration-300"
            >
              <BookOpen className="w-3.5 h-3.5" />
              SPECIFICATIONS
            </button>
          </div>
        </div>

        {/* ---------------- SPEC HUD (bottom-left) ---------------- */}
        <div className="absolute left-6 md:left-14 bottom-24 md:bottom-20 max-w-[290px] md:max-w-sm pointer-events-none">
          {spec && (
            <div key={phase} className="animate-fade-up">
              <div className="flex items-baseline gap-3 font-mono text-[10px] tracking-[0.35em]">
                <span className="text-gold">{spec.index}</span>
                <span className="text-mist/70">/ 05</span>
                <span className="text-mist/70 ml-1">{spec.label}</span>
              </div>
              <div className="mt-3 font-display font-bold leading-none text-6xl md:text-7xl tracking-tight">
                {spec.num}
                <span className="ml-3 align-middle font-mono text-xs md:text-sm tracking-[0.3em] text-gold">
                  {spec.unit}
                </span>
              </div>
              <div className="mt-5 h-px w-16 bg-gold/50" />
              <p className="mt-4 font-display text-sm md:text-base font-medium text-white/90">
                {spec.title}
              </p>
              <p className="mt-2 text-xs md:text-sm leading-relaxed text-mist">
                {spec.desc}
              </p>
            </div>
          )}
        </div>

        {/* ---------------- RIGHT RAIL ---------------- */}
        <nav className="absolute right-5 md:right-14 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-end">
          {SPECS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => scrollToSpec(i)}
              aria-label={`Go to ${s.label}`}
              className="group flex items-center gap-3"
            >
              <span
                className={`hidden md:block font-mono text-[9px] tracking-[0.3em] transition-all duration-300 ${
                  phase === i + 1
                    ? "text-gold opacity-100"
                    : "text-mist opacity-40 group-hover:opacity-100"
                }`}
              >
                {s.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  phase === i + 1
                    ? "w-2 h-2 bg-gold shadow-[0_0_14px_rgba(227,184,115,0.9)]"
                    : "w-1.5 h-1.5 bg-white/25 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </nav>

        {/* ---------------- COORDINATES + PROGRESS % ---------------- */}
        <div className="absolute right-5 md:right-14 top-24 md:top-28 text-right hidden sm:block pointer-events-none">
          <p className="font-mono text-[9px] tracking-[0.3em] text-mist/80">
            3.1578° N
          </p>
          <p className="font-mono text-[9px] tracking-[0.3em] text-mist/80">
            101.7118° E
          </p>
          <p className="mt-2.5 font-mono text-[9px] tracking-[0.3em] text-gold">
            ORBIT <span ref={pctRef}>000%</span>
          </p>
        </div>

        {/* ---------------- SCROLL CUE ---------------- */}
        <div
          className={`absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-500 ${
            phase === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="font-mono text-[9px] tracking-[0.45em] text-mist">
            SCROLL TO ORBIT
          </span>
          <span className="w-px h-10 bg-gradient-to-b from-gold to-transparent animate-scroll-line" />
        </div>

        {/* ---------------- PROGRESS BAR ---------------- */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/10">
          <div
            ref={barRef}
            className="h-full origin-left bg-gradient-to-r from-gold/60 via-gold to-gold-soft"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
