import { useEffect, useRef, useState } from "react";
import { useSound } from "../context/SoundContext.jsx";
import usePreload from "../hooks/usePreload.js";

const LOG = [
  [0, "INITIALIZING MARSBLACK//OS"],
  [0.12, "LOADING TYPEFACES"],
  [0.3, "MOUNTING VISUAL ASSETS"],
  [0.5, "CALIBRATING AUDIO ENGINE"],
  [0.72, "SCANNING BEOSOUND 9000"],
  [0.95, "SYSTEM READY"],
];
const MIN_SECONDS = 2.4; // the loader never finishes faster than this
const SEGMENTS =
  "repeating-linear-gradient(90deg,#000 0 6px,transparent 6px 10px)";
const WIPE =
  "transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.77,0,.18,1)]";

const Corner = ({ pos }) => (
  <span
    className={`pointer-events-none absolute size-4 border-white/60 ${pos}`}
  />
);

export default function Loader() {
  const { enter } = useSound();
  const assets = usePreload();
  const [modelDone, setModelDone] = useState(false);
  const [phase, setPhase] = useState("loading"); // loading | ready | exiting | done
  const [logN, setLogN] = useState(1);

  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const counterRef = useRef(null);
  const fillRef = useRef(null);
  const wordRef = useRef(null);
  const targetRef = useRef(0);

  targetRef.current = assets * 0.8 + (modelDone ? 0.2 : 0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  /* 3D scene (three.js is dynamically imported, so it's not in the first bundle) */
  useEffect(() => {
    let cancelled = false;
    let inst;
    import("../lib/loaderScene.js")
      .then(({ createLoaderScene }) => {
        if (cancelled) return;
        inst = createLoaderScene(stageRef.current, {
          onReady: () => !cancelled && setModelDone(true),
        });
        sceneRef.current = inst;
      })
      .catch(() => setModelDone(true));
    const t = setTimeout(() => setModelDone(true), 9000);
    return () => {
      cancelled = true;
      clearTimeout(t);
      inst?.dispose();
      sceneRef.current = null;
    };
  }, []);

  /* smooth progress loop (writes straight to the DOM, no re-render per frame) */
  useEffect(() => {
    let raf;
    let last = performance.now();
    let p = 0;
    let shown = 1;
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const target = targetRef.current;
      if (target > p)
        p = Math.min(target, p + Math.min(dt / MIN_SECONDS, target - p));

      const pct = p * 100;
      if (counterRef.current)
        counterRef.current.textContent = String(Math.round(pct)).padStart(
          3,
          "0",
        );
      if (fillRef.current) fillRef.current.style.width = pct + "%";
      wordRef.current?.style.setProperty("--p", pct + "%");
      sceneRef.current?.setProgress(p);

      const n = LOG.filter(([t]) => p >= t).length;
      if (n !== shown) {
        shown = n;
        setLogN(n);
      }
      if (p >= 1) return setPhase("ready");
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* lock page scroll while the loader is up */
  useEffect(() => {
    if (phase === "exiting" || phase === "done") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => (el.style.overflow = prev);
  }, [phase]);

  const go = (withSound) => {
    if (phase !== "ready") return;
    enter(withSound);
    window.scrollTo(0, 0);
    setPhase("exiting");
    setTimeout(() => {
      window.scrollTo(0, 0);
      setPhase("done");
    }, 1500);
  };

  useEffect(() => {
    if (phase !== "ready") return;
    const onKey = (e) => e.key === "Enter" && go(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "done") return null;
  const exiting = phase === "exiting";
  const ready = phase === "ready";
  const clipStyle = {
    clipPath: exiting ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
  };
  const dots = "radial-gradient(ellipse at center,#000 20%,transparent 75%)";
  const visible = LOG.slice(0, logN).slice(-5);

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[200]"
      aria-hidden={exiting}
    >
      {/* red trailing edge of the wipe */}
      <div
        className={`absolute inset-0 bg-accent delay-100 ${WIPE}`}
        style={clipStyle}
      />

      <div
        className={`absolute inset-0 overflow-hidden bg-black text-white ${WIPE}`}
        style={clipStyle}
      >
        {/* ---- atmosphere ---- */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.16) 1px,transparent 1.6px)",
            backgroundSize: "7px 7px",
            maskImage: dots,
            WebkitMaskImage: dots,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0 1px,transparent 1px 3px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%,rgba(217,42,0,.35),transparent 65%)",
          }}
        />
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full animate-beam bg-white/30 motion-reduce:hidden" />

        {/* ---- rotating rings ---- */}
        <svg
          className="pointer-events-none absolute left-1/2 top-1/2 size-[min(88vw,78vh)] -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle cx="200" cy="200" r="198" stroke="rgba(255,255,255,.15)" />
          <g
            className="animate-[spin_40s_linear_infinite]"
            style={{ transformOrigin: "200px 200px" }}
          >
            <circle
              cx="200"
              cy="200"
              r="180"
              stroke="#d92a00"
              strokeWidth="1.5"
              strokeDasharray="2 10"
            />
            <path
              d="M200 20A180 180 0 0 1 380 200"
              stroke="#d92a00"
              strokeWidth="2.5"
            />
          </g>
          <g
            className="animate-[spin_60s_linear_infinite] [animation-direction:reverse]"
            style={{ transformOrigin: "200px 200px" }}
          >
            <circle
              cx="200"
              cy="200"
              r="160"
              stroke="rgba(255,255,255,.35)"
              strokeDasharray="40 14 4 14"
            />
          </g>
        </svg>

        {/* ---- 3D model ---- */}
        <div ref={stageRef} className="absolute inset-0" />

        {/* ---- HUD ---- */}
        <div className="relative z-10 flex h-full flex-col justify-between p-5 pb-6 md:p-9">
          <Corner pos="left-3 top-3 border-l border-t md:left-6 md:top-6" />
          <Corner pos="right-3 top-3 border-r border-t md:right-6 md:top-6" />
          <Corner pos="bottom-3 left-3 border-b border-l md:bottom-6 md:left-6" />
          <Corner pos="bottom-3 right-3 border-b border-r md:bottom-6 md:right-6" />

          <div className="flex items-start justify-between font-sans text-[10px] font-medium uppercase tracking-[0.2em] md:text-xs">
            <span>Marsblack © 2025</span>
            <span className="flex items-center gap-2">
              <i className="size-1.5 animate-pulse rounded-full bg-accent" />
              {ready || exiting ? "Standby" : "System boot"}
            </span>
            <span className="hidden sm:block">Creative Agency</span>
          </div>

          <div className="flex flex-1 items-end justify-between md:items-center">
            <ul className="hidden font-pixel text-lg leading-tight tracking-[0.1em] text-white/60 md:block">
              {visible.map(([, text], i) => {
                const lastLine = i === visible.length - 1;
                return (
                  <li key={text} className={lastLine ? "text-white" : ""}>
                    {`> ${text}`}
                    {lastLine && <span className="animate-blink">_</span>}
                  </li>
                );
              })}
            </ul>
            <div className="ml-auto font-pixel text-[clamp(72px,14vw,200px)] leading-none">
              <span ref={counterRef}>000</span>
              <span className="text-accent">%</span>
            </div>
          </div>

          <div>
            <h1
              ref={wordRef}
              className="select-none whitespace-nowrap text-center font-orbitron text-[14vw] font-thin lowercase leading-[0.85] tracking-[0.01em]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#fff var(--p,0%),transparent var(--p,0%))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,.4)",
              }}
            >
              marsblack
            </h1>

            <div className="relative mt-4 h-12">
              {/* segmented progress bar */}
              <div
                className={`absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-white/10 transition-opacity duration-500 ${
                  ready ? "opacity-0" : ""
                }`}
                style={{ maskImage: SEGMENTS, WebkitMaskImage: SEGMENTS }}
              >
                <div ref={fillRef} className="h-full w-0 bg-accent" />
              </div>

              {/* enter gate */}
              <div
                className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-500 ${
                  ready ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <button
                  type="button"
                  onClick={() => go(true)}
                  className="cursor-pointer bg-white px-5 py-2 font-pixel text-xl uppercase tracking-[0.12em] text-black transition-colors duration-300 hover:bg-accent hover:text-white md:px-7 md:text-3xl"
                >
                  Enter with sound
                </button>
                <button
                  type="button"
                  onClick={() => go(false)}
                  className="cursor-pointer border border-white/40 px-5 py-2 font-pixel text-xl uppercase tracking-[0.12em] text-white/80 transition-colors duration-300 hover:border-white hover:text-white md:px-7 md:text-3xl"
                >
                  Silent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
