import { useEffect, useRef, useState } from "react";
import { createShelfScene } from "../lib/shelfScene";

// ---------------------------------------------------------
// CASE DATA
// Keep this data in the same order as your Three.js CASES.
// ---------------------------------------------------------

const CASES = [
  {
    col: 2,
    row: 0,
    img: "/assets/WORK/RURURU ONSEN.png",
    title: "RURURU ONSEN",
    number: "01",
    service: "WEB DESIGN & DEVELOPMENT",
    release: "2025",
    description:
      "A digital experience designed around the atmosphere, identity and visual language of RURURU ONSEN.",
  },

  {
    col: 0,
    row: 1,
    img: "/assets/WORK/ADIDAS CHILE20.png",
    title: "ADIDAS CHILE20",
    number: "02",
    service: "CREATIVE DEVELOPMENT",
    release: "2025",
    description:
      "A digital project combining visual direction, interaction and development.",
  },

  {
    col: 2,
    row: 1,
    img: "/assets/WORK/PERSEPOLIS.png",
    title: "PERSEPOLIS",
    number: "03",
    service: "DIGITAL EXPERIENCE",
    release: "2025",
    description:
      "An immersive digital experience exploring the visual world of Persepolis.",
  },

  {
    col: 1,
    row: 2,
    img: "/assets/WORK/OLIGALKU.jpg",
    title: "OLIGALUKU",
    number: "04",
    service: "WEB DESIGN & DEVELOPMENT",
    release: "2025",
    description:
      "A visual-first digital experience focused on atmosphere, interaction and visual storytelling.",
  },

  {
    col: 3,
    row: 3,
    img: "/assets/WORK/Divine Eau de Milano 2.jpg",
    title: "DIVINE EAU DE MILANO",
    number: "05",
    service: "DIGITAL EXPERIENCE",
    release: "2025",
    description:
      "A refined digital presentation created around product, identity and storytelling.",
  },
];

// ---------------------------------------------------------
// CASE DETAIL
// ---------------------------------------------------------

function CaseDetail({ caseData, onClose, onSelect }) {
  const touchStartX = useRef(0);

  const currentIndex = CASES.findIndex((item) => item.title === caseData.title);

  const nextIndex = (currentIndex + 1) % CASES.length;

  const previousIndex = (currentIndex - 1 + CASES.length) % CASES.length;

  const nextCase = CASES[nextIndex];
  const previousCase = CASES[previousIndex];

  // -------------------------------------------------------
  // TOUCH / SWIPE
  // -------------------------------------------------------

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const distance = endX - touchStartX.current;

    // Ignore tiny movements
    if (Math.abs(distance) < 60) return;

    // Swipe LEFT = NEXT
    if (distance < 0) {
      onSelect(nextCase);
    }

    // Swipe RIGHT = PREVIOUS
    else {
      onSelect(previousCase);
    }
  };

  // -------------------------------------------------------
  // KEYBOARD
  // -------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        onSelect(previousCase);
      }

      if (e.key === "ArrowRight") {
        onSelect(nextCase);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextCase, previousCase, onClose, onSelect]);

  return (
    <section
      className="
        fixed
        inset-0
        z-[80]
        overflow-hidden
        bg-white
        text-black
      "
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* -------------------------------------------------
          TOP NAV
      ------------------------------------------------- */}

      <div
        className="
          absolute
          left-0
          right-0
          top-14
          z-30
          flex
          items-center
          justify-between
          px-4
          py-4
          md:px-7
          md:py-5
        "
      >
        <button
          type="button"
          onClick={() => {
            onClose();
            requestAnimationFrame(() => {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
              });
            });
          }}
          className="
            text-[14px]
            font-bold
            uppercase
            tracking-[0.02em]
            transition-opacity
            duration-300
            hover:opacity-40
            cursor-pointer
          "
        >
          ← Back
        </button>

        <div className="text-[10px] font-medium uppercase">
          {caseData.number} / {String(CASES.length).padStart(2, "0")}
        </div>
      </div>

      {/* -------------------------------------------------
          MAIN CONTENT
      ------------------------------------------------- */}

      <div
        className="
          relative
          flex
          h-full
          w-full
          items-center
          justify-center
          px-5
          pb-16
          pt-20
          md:px-12
          lg:px-20
        "
      >
        {/* ------------------------------------------------
            LARGE IMAGE
        ------------------------------------------------ */}

        <div
          key={caseData.title}
          className="
            absolute
            left-[8%]
            right-[8%]
            top-[13%]
            bottom-[26%]
            overflow-hidden
            md:left-[15%]
            md:right-[15%]
            md:top-[14%]
            md:bottom-[24%]
            lg:left-[19%]
            lg:right-[19%]
          "
        >
          <img
            src={caseData.img}
            alt={caseData.title}
            className="
              h-full
              w-full
              object-contain
              object-center
              cursor-normal
            "
            draggable="false"
          />
        </div>

        {/* ------------------------------------------------
            LEFT / NEXT CASE PREVIEW
        ------------------------------------------------ */}

        <button
          type="button"
          onClick={() => onSelect(nextCase)}
          className="
            group
            absolute
            left-3
            top-1/2
            z-20
            flex
            -translate-y-1/2
            items-center
            gap-2
            text-left
            md:left-5
            lg:left-8
            cursor-pointer
          "
          aria-label={`Next case: ${nextCase.title}`}
        >
          <div
            className="
              h-20
              w-14
              overflow-hidden
              bg-[#f4f4f2]
              md:h-28
              md:w-20
              lg:h-32
              lg:w-24
            "
          >
            <img
              src={nextCase.img}
              alt=""
              className="
                h-full
                w-full
                object-cover
                opacity-60
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:opacity-100
                cursor-pointer
              "
              draggable="false"
            />
          </div>

          <div className="hidden md:block">
            <p className="text-[8px] uppercase opacity-40">Next</p>

            <p className="mt-1 max-w-[100px] text-[9px] uppercase">
              {nextCase.title}
            </p>
          </div>
        </button>

        {/* ------------------------------------------------
            RIGHT / PREVIOUS CASE PREVIEW
        ------------------------------------------------ */}

        <button
          type="button"
          onClick={() => onSelect(previousCase)}
          className="
            group
            absolute
            right-3
            top-1/2
            z-20
            flex
            -translate-y-1/2
            items-center
            gap-2
            text-right
            md:right-5
            lg:right-8
            cursor-pointer
          "
          aria-label={`Previous case: ${previousCase.title}`}
        >
          <div className="hidden md:block">
            <p className="text-[8px] uppercase opacity-40">Previous</p>

            <p className="mt-1 max-w-[100px] text-[9px] uppercase">
              {previousCase.title}
            </p>
          </div>

          <div
            className="
              h-20
              w-14
              overflow-hidden
              bg-[#f4f4f2]
              md:h-28
              md:w-20
              lg:h-32
              lg:w-24
            "
          >
            <img
              src={previousCase.img}
              alt=""
              className="
                h-full
                w-full
                object-cover
                opacity-60
                transition-all
                duration-500
                group-hover:scale-105
                group-hover:opacity-100
                cursor-pointer
              "
              draggable="false"
            />
          </div>
        </button>

        {/* ------------------------------------------------
            CASE INFORMATION
        ------------------------------------------------ */}

        <div
          className="
            absolute
            bottom-4
            left-5
            right-5
            z-20
            flex
            items-end
            justify-between
            gap-6
            md:bottom-6
            md:left-8
            md:right-8
            lg:left-12
            lg:right-12
          "
        >
          {/* LEFT INFO */}

          <div className="max-w-[45%]">
            <p className="mb-1 text-[8px] uppercase opacity-50">
              {caseData.number} Project
            </p>

            <h1
              className="
                text-[18px]
                font-medium
                uppercase
                leading-[0.95]
                tracking-[-0.04em]
                md:text-[26px]
                lg:text-[34px]
              "
            >
              {caseData.title}
            </h1>
          </div>

          {/* RIGHT INFO */}

          <div
            className="
              flex
              max-w-[42%]
              flex-col
              gap-1
              text-right
              text-[8px]
              uppercase
              leading-[1.35]
              md:text-[9px]
            "
          >
            <div>
              <span className="opacity-40">Service:</span> {caseData.service}
            </div>

            <div>
              <span className="opacity-40">Release:</span> {caseData.release}
            </div>

            <p className="mt-2 normal-case opacity-60">
              {caseData.description}
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          SWIPE HINT
      ------------------------------------------------- */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-3
          left-1/2
          z-30
          -translate-x-1/2
          text-[7px]
          uppercase
          tracking-[0.08em]
          opacity-30
          md:hidden
        "
      >
        Swipe ← → to explore
      </div>
    </section>
  );
}

// ---------------------------------------------------------
// MAIN CASES PAGE
// ---------------------------------------------------------

export default function Cases() {
  const stageRef = useRef(null);
  const labelRef = useRef(null);

  const [selectedCase, setSelectedCase] = useState(null);

  // -------------------------------------------------------
  // CREATE THREE.JS SHELF
  // -------------------------------------------------------

  useEffect(() => {
    if (!stageRef.current) return;

    const cleanup = createShelfScene(
      stageRef.current,
      labelRef.current,
      (clickedCase) => {
        /*
         * The Three.js scene sends the clicked case here.
         *
         * We match it with our React case data so the
         * detail screen has all information.
         */

        const found = CASES.find((item) => item.title === clickedCase.title);

        if (found) {
          setSelectedCase(found);
        }
      },
    );

    return () => {
      cleanup?.();
    };
  }, []);

  // -------------------------------------------------------
  // LOCK BODY SCROLL WHILE DETAIL IS OPEN
  // -------------------------------------------------------

  useEffect(() => {
    if (!selectedCase) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedCase]);

  // -------------------------------------------------------
  // SCROLL TO TOP WHEN CASES PAGE OPENS
  // -------------------------------------------------------

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-white text-black">
      {/* =================================================
          3D SHELF
      ================================================= */}

      {/* h-[72vh]
min-h-[560px] */}
      <section
        className={`
          relative
          h-[calc(100svh-64px)] min-h-[460px] md:h-[72vh] md:min-h-[560px]
          w-full
          overflow-hidden
          bg-white
          transition-opacity
          duration-500
          ${selectedCase ? "pointer-events-none opacity-0" : "opacity-100"}
        `}
      >
        {/* ---------------------------------------------
            SOFT TOP BLEND
        --------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-10
            h-[20vh]
            bg-gradient-to-b
            from-white
            via-white/80
            to-transparent
          "
        />

        {/* ---------------------------------------------
            THREE.JS STAGE
        --------------------------------------------- */}

        <div
          ref={stageRef}
          className="
            absolute
            inset-0
            h-full
            w-full
          "
        />

        {/* ---------------------------------------------
            HOVER TITLE
        --------------------------------------------- */}

        <div
          ref={labelRef}
          className="
    pointer-events-none
    absolute
    left-0
    top-0
    z-30
    flex
    items-center
    gap-2
    whitespace-nowrap
    text-[11px]
    font-medium
    uppercase
    tracking-[-0.01em]
    text-white
    mix-blend-difference
    opacity-0
    transition-opacity
    duration-300
    will-change-transform
    data-[on=1]:opacity-100
  "
        />

        {/* ---------------------------------------------
            BOTTOM PROJECT INFO
        --------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-5
            left-5
            z-20
            text-[9px]
            uppercase
            leading-[1.35]
            md:bottom-7
            md:left-7
          "
        >
          <div>05 Projects</div>
          <div>Selected Works</div>
          <div>Web Design & Development</div>
        </div>

        {/* ---------------------------------------------
            SCROLL INDICATOR
        --------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-5
            right-5
            z-20
            text-[8px]
            uppercase
            opacity-50
            md:bottom-7
            md:right-7
          "
        >
          Scroll ↓
        </div>
      </section>

      {/* =================================================
          CASE DETAIL
      ================================================= */}

      {selectedCase && (
        <CaseDetail
          caseData={selectedCase}
          onClose={() => {
            setSelectedCase(null);
          }}
          onSelect={(nextCase) => {
            setSelectedCase(nextCase);
          }}
        />
      )}
    </main>
  );
}
