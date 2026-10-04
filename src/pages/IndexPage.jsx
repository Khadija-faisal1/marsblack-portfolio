import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects } from "../data/projects.js";

/* ------------------------------------------------------------------ */
/*  MEDIA MAP                                                          */
/*  Add real assets here. Key = any word found in the project title.   */
/*  Files live in /public/media. Videos always need a poster image.    */
/*  Order matters: the preview cycles through these items.             */
/* ------------------------------------------------------------------ */
const MEDIA = {
  persepolis: [
    { type: "video", src: "/media/persepolis-preview.mp4", poster: "/media/persepolis-poster.jpg" },
    { type: "image", src: "/media/getty-1.jpg" },
    { type: "image", src: "/media/getty-2.jpg" },
  ],
  // Example for the other rows:
  // "adidas": [{ type: "image", src: "/media/adidas-1.jpg" }],
  // "ruinart": [{ type: "video", src: "/media/ruinart.mp4", poster: "/media/ruinart.jpg" }],
};

const CYCLE_MS = 4500;

/* Builds the ordered media list for a project. Order of preference:
   1. entries from MEDIA above  2. p.video / p.images / p.image from data
   3. an automatic site screenshot if p.url exists
   4. a generated scene, which can never fail, so no project is ever empty */
function getMedia(p) {
  const title = p.title.toLowerCase();
  const key = Object.keys(MEDIA).find((k) => title.includes(k));
  const list = [...(key ? MEDIA[key] : [])];
  if (p.video) list.push({ type: "video", src: p.video, poster: p.poster });
  (p.images || []).forEach((src) => list.push({ type: "image", src }));
  if (p.image) list.push({ type: "image", src: p.image });
  if (p.url) {
    list.push({
      type: "image",
      src: `https://image.thum.io/get/width/1280/crop/720/${p.url}`,
    });
  }
  list.push({ type: "scene" });
  return list;
}

const rnd = (seed, n) => {
  const x = Math.sin(seed * 999 + n * 77) * 10000;
  return x - Math.floor(x);
};

/* ------------------------------------------------------------------ */
/*  Generated scene (final fallback)                                   */
/* ------------------------------------------------------------------ */
function FallbackScene({ p }) {
  const h = p.hue ?? 30, s = p.seed ?? 1;
  const sunX = 120 + rnd(s, 1) * 560;
  const sunY = 90 + rnd(s, 2) * 80;

  const hill = (y, l, k) => {
    const a = 40 + rnd(s, k) * 80;
    const b = 40 + rnd(s, k + 9) * 80;
    return (
      <path
        key={"h" + k}
        d={`M0 ${y}Q200 ${y - a} 400 ${y}T800 ${y - b / 2}V450H0Z`}
        fill={`hsl(${h + k * 8} 38% ${l}%)`}
      />
    );
  };

  const tents = [0, 1, 2, 3].map((i) => {
    const x = 130 + i * 150 + rnd(s, i + 20) * 30;
    const y = 300 + rnd(s, i + 30) * 40;
    const c = (h + 40 + i * 25) % 360;
    return (
      <g key={"t" + i}>
        <path d={`M${x} ${y}l45 -42l45 42z`} fill={`hsl(${c} 85% 55%)`} />
        <path d={`M${x + 45} ${y - 42}l0 42l45 0z`} fill={`hsl(${c} 85% 42%)`} />
      </g>
    );
  });

  return (
    <svg
      className="block h-full w-full object-cover"
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${p.title} preview`}
    >
      <defs>
        <linearGradient id={`g${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${h} 55% 28%)`} />
          <stop offset="1" stopColor={`hsl(${h + 30} 60% 62%)`} />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#g${s})`} />
      <circle cx={sunX} cy={sunY} r="38" fill={`hsl(${h + 50} 90% 85%)`} opacity=".85" />
      {hill(250, 26, 3)}
      {hill(310, 20, 5)}
      {tents}
      {hill(400, 12, 7)}
      <text
        x="400" y="62" textAnchor="middle" fill="#fff"
        fontFamily="Inter, Helvetica, Arial, sans-serif"
        fontSize="15" fontWeight="700" letterSpacing="2"
      >
        {p.title.toUpperCase()}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  One preview frame: handles video, landscape + non-landscape images */
/* ------------------------------------------------------------------ */
function Frame({ p, item, onFail, reduced }) {
  const [ratio, setRatio] = useState(null);

  if (item.type === "scene") return <FallbackScene p={p} />;

  if (item.type === "video") {
    return (
      <video
        className="block h-full w-full object-cover"
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="metadata"
        autoPlay={!reduced}
        onError={onFail}
        aria-label={`${p.title} video preview`}
      />
    );
  }

  /* Landscape (about 16:9 to 2:1) fills the frame. Anything else
     (portrait, square, ultra-wide) is shown whole over a blurred copy of itself. */
  const isLandscape = ratio !== null && ratio >= 1.55 && ratio <= 2.1;
  return (
    <>
      {!isLandscape && (
        <img
          src={item.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
        />
      )}
      <img
        src={item.src}
        alt={p.title}
        className={`relative block h-full w-full ${isLandscape ? "object-cover" : "object-contain"}`}
        onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
        onError={onFail}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout tokens (unchanged from your version)                        */
/* ------------------------------------------------------------------ */
const GRID =
  "grid h-7 grid-cols-[22%_44%_34%] items-center text-left text-[9px] uppercase leading-none md:text-[10px] " +
  "lg:h-[22px] lg:w-[132%] lg:grid-cols-[157px_239px_250px]";
const CELL = "min-w-0 overflow-hidden text-ellipsis";

const CSS = `
@keyframes ix-row   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
@keyframes ix-head  { from { opacity:0; letter-spacing:.18em } to { opacity:1; letter-spacing:0 } }
@keyframes ix-reveal{ from { clip-path:inset(0 0 100% 0); transform:scale(1.07) } to { clip-path:inset(0); transform:none } }
@keyframes ix-cap   { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
@keyframes ix-bar   { from { transform:scaleX(0) } to { transform:scaleX(1) } }
.ix-row   { animation: ix-row .5s cubic-bezier(.2,.7,.2,1) both }
.ix-head  { animation: ix-head .7s cubic-bezier(.2,.7,.2,1) both }
.ix-reveal{ animation: ix-reveal .75s cubic-bezier(.77,0,.18,1) both }
.ix-cap   { animation: ix-cap .45s .25s ease-out both }
.ix-bar   { transform-origin:left; animation: ix-bar linear both }
.ix-fill  { transform-origin:left; transition: transform .35s cubic-bezier(.77,0,.18,1) }
@media (prefers-reduced-motion: reduce) {
  .ix-row,.ix-head,.ix-reveal,.ix-cap,.ix-bar { animation:none !important }
  .ix-fill { transition:none }
}
`;

export default function IndexPage() {
  const [active, setActive] = useState(0);
  const [mIdx, setMIdx] = useState(0);
  const [failed, setFailed] = useState({});
  const [reduced, setReduced] = useState(false);
  const rows = useRef([]);
  const hoverT = useRef();
  const p = projects[active];

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* Media for the active project, minus anything that failed to load.
     The generated scene is always last, so this list is never empty. */
  const media = useMemo(
    () => getMedia(p).filter((m) => m.type === "scene" || !failed[m.src]),
    [p, failed]
  );
  const item = media[Math.min(mIdx, media.length - 1)];

  const select = useCallback((i) => {
    setActive(i);
    setMIdx(0);
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      setActive((a) => {
        const n = Math.min(projects.length - 1, Math.max(0, a + (e.key === "ArrowDown" ? 1 : -1)));
        rows.current[n]?.focus();
        return n;
      });
      setMIdx(0);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* Cycle through a project's media when it has more than one item */
  useEffect(() => {
    if (media.length < 2 || reduced) return;
    const t = setTimeout(() => setMIdx((i) => (i + 1) % media.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [media.length, mIdx, active, reduced]);

  /* Warm the cache for neighbouring rows so switching feels instant */
  useEffect(() => {
    [active - 1, active + 1].forEach((i) => {
      projects[i] &&
        getMedia(projects[i])
          .filter((m) => m.type === "image")
          .slice(0, 1)
          .forEach((m) => { const im = new Image(); im.src = m.src; });
    });
  }, [active]);

  const onFail = () => item.src && setFailed((f) => ({ ...f, [item.src]: true }));

  /* Hover selects after a short pause (desktop only) so sweeping the
     cursor down the list doesn't flash every preview. */
  const onEnter = (i) => {
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    clearTimeout(hoverT.current);
    hoverT.current = setTimeout(() => select(i), 90);
  };

  return (
    <section
      id="index-section"
      className="relative flex min-h-[calc(100vh-max(56px,4vw))] flex-col items-start gap-5 bg-white px-4 pb-12 pt-5 text-black
                 lg:flex-row lg:gap-0 lg:pb-[60px] lg:pl-8 lg:pr-0 lg:pt-11"
    >
      <style>{CSS}</style>

      {/* TABLE */}
      <div className="w-full flex-none lg:w-[496px]">
        <div className={`${GRID} ix-head mb-[15px] font-semibold text-black`}>
          <span className={CELL}>Year</span>
          <span className={CELL}>Title</span>
          <span className={CELL}>Service</span>
        </div>

        <div role="listbox" aria-label="Projects" onMouseLeave={() => clearTimeout(hoverT.current)}>
          {projects.map((pr, i) => {
            const on = i === active;
            return (
              <button
                key={pr.slug}
                ref={(el) => (rows.current[i] = el)}
                type="button"
                role="option"
                aria-selected={on}
                title={`${pr.title} — ${pr.category}`}
                onClick={() => select(i)}
                onMouseEnter={() => onEnter(i)}
                onFocus={() => i !== active && select(i)}
                style={{ animationDelay: `${160 + i * 22}ms` }}
                className={`${GRID} ix-row group relative isolate w-full cursor-pointer whitespace-nowrap p-1.5 font-sans font-normal
                            transition-colors duration-300
                            focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-black
                            ${on ? "text-white" : "text-[#8d8d8d] hover:text-black"}`}
              >
                {/* sliding black highlight */}
                <span
                  aria-hidden="true"
                  className={`ix-fill absolute inset-0 -z-10 bg-black ${on ? "scale-x-100" : "scale-x-0"}`}
                />
                {/* soft hover wash for inactive rows */}
                {!on && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 bg-[#f1f1f1] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  />
                )}
                <span className={CELL}>{pr.year}</span>
                <span className={`${CELL} transition-transform duration-300 ${on ? "translate-x-0.5" : ""}`}>
                  {pr.title}
                </span>
                <span className={`${CELL} font-medium transition-colors duration-300 ${on ? "text-white" : "text-black"}`}>
                  {pr.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PREVIEW */}
      <aside
        aria-live="polite"
        className="sticky top-0 z-[2] order-first w-full bg-white pb-2
                   lg:absolute lg:right-2 lg:top-36 lg:order-none lg:w-[41.7vw] lg:bg-transparent lg:pb-0"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-[#1c1c1c]">
          <div key={`${active}-${mIdx}-${item.src || "scene"}`} className="ix-reveal absolute inset-0">
            <Frame p={p} item={item} onFail={onFail} reduced={reduced} />
          </div>

          {/* progress segments, only when a project has several items */}
          {media.length > 1 && (
            <div className="absolute inset-x-2 bottom-2 z-10 flex gap-1" aria-hidden="true">
              {media.map((_, i) => (
                <span key={i} className="h-px flex-1 overflow-hidden bg-white/30">
                  {i < mIdx && <span className="block h-full w-full bg-white" />}
                  {i === mIdx && !reduced && (
                    <span
                      key={`${active}-${mIdx}`}
                      className="ix-bar block h-full w-full bg-white"
                      style={{ animationDuration: `${CYCLE_MS}ms` }}
                    />
                  )}
                  {i === mIdx && reduced && <span className="block h-full w-full bg-white" />}
                </span>
              ))}
            </div>
          )}
        </div>

        <p
          key={active}
          className="ix-cap mt-2 flex flex-col gap-0.5 text-[9px] uppercase leading-snug text-[#8d8d8d]
                     sm:flex-row sm:justify-between sm:gap-4 md:text-[10px] sm:[&>span:last-child]:text-right"
        >
          <span>{p.category}</span>
          <span>{p.team}</span>
          <span className="tabular-nums text-black sm:order-last">
            {String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </p>
      </aside>
    </section>
  );
}