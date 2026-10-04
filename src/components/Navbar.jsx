import { useCallback, useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { linkBase, linkIdle, linkOn } from "../lib/linkStyles.js";
import { useSound } from "../context/SoundContext.jsx";

// Needs once in your entry file: import "remixicon/fonts/remixicon.css";

const nav = ({ isActive }) => `${linkBase} ${isActive ? linkOn : linkIdle}`;
const plain = `${linkBase} ${linkIdle}`;

const PAGES = [
  { to: "/", label: "Slider" },
  { to: "/index", label: "Index" },
  { to: "/cases", label: "Cases" },
];
const SECTIONS = [
  { id: "about-section", label: "About" },
  { id: "services-section", label: "Services" },
  { id: "talk-section", label: "Contact" },
];

function SoundButton({ on, toggle, showLabel }) {
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={`Sound ${on ? "on" : "off"}`}
      className="flex cursor-pointer flex-col items-center justify-center gap-1"
    >
      <span className="flex h-[22px] items-end gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-full w-[3px] origin-bottom rounded-[1px] bg-black transition-transform duration-300 ${
              on ? "animate-eq" : "scale-y-[.12]"
            }`}
            style={{
              animationDelay: `${i * 0.13}s`,
              animationDuration: `${0.7 + (i % 3) * 0.18}s`,
            }}
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-xs font-medium uppercase">
          Sound {on ? "On" : "Off"}
        </span>
      )}
    </button>
  );
}

export default function Navbar() {
  const { on, toggle } = useSound();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // close the drawer on route change and on Escape
  useEffect(() => close(), [location.pathname, location.hash, close]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const handleSectionClick = (e, sectionId) => {
    e.preventDefault();
    close();
    const hash = `#${sectionId}`;

    if (location.pathname === "/") {
      window.history.pushState(null, "", `/${hash}`);
      requestAnimationFrame(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    navigate({ pathname: "/", hash });
  };

  return (
    <div
      className="relative z-[99] flex h-14 w-full items-center justify-between px-4
                 md:h-[max(56px,4vw)] md:px-6 lg:pr-8"
    >
      {/* LOGO (always visible) */}
      <Link to="/" aria-label="marsblack home" onClick={close}>
        <img
          src="/assets/MB LOGO/mb final logo mark.svg"
          alt="marsblack"
          className="w-12 md:w-[60px] lg:w-[70px]"
        />
      </Link>

      {/* DESKTOP LINKS (lg and up) */}
      <nav className="hidden flex-wrap justify-center gap-x-1 lg:flex">
        {PAGES.map((p) => (
          <NavLink key={p.to} to={p.to} end className={nav}>
            {p.label}
          </NavLink>
        ))}
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`/#${s.id}`}
            onClick={(e) => handleSectionClick(e, s.id)}
            className={plain}
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {/* desktop sound with label */}
        <div className="hidden lg:block">
          <SoundButton on={on} toggle={toggle} showLabel />
        </div>
        {/* mobile / tablet: sound icon only + menu icon */}
        <div className="lg:hidden">
          <SoundButton on={on} toggle={toggle} showLabel={false} />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          className="grid size-10 cursor-pointer place-items-center text-[28px] lg:hidden"
        >
          <i className="ri-menu-line" aria-hidden="true" />
        </button>
      </div>

      {/* BACKDROP */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* LEFT DRAWER */}
      <aside
        id="mobile-drawer"
        data-lenis-prevent
        aria-hidden={!open}
        inert={!open ? "" : undefined}
        className={`fixed left-0 top-0 z-[101] flex h-[100dvh] w-[78vw] max-w-[340px] flex-col
                    bg-white px-6 pb-8 pt-4 text-black shadow-2xl
                    transition-transform duration-300 ease-[cubic-bezier(.77,0,.18,1)] lg:hidden
                    motion-reduce:transition-none ${
                      open ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" onClick={close} aria-label="marsblack home">
            <img
              src="/assets/MB LOGO/mb final logo mark.svg"
              alt="marsblack"
              className="w-12"
            />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="grid size-10 cursor-pointer place-items-center text-[28px]"
          >
            <i className="ri-close-line" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-2 overflow-y-auto">
          {PAGES.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end
              onClick={close}
              className={({ isActive }) =>
                `${nav({ isActive })} !w-full !justify-start !py-3 !text-base`
              }
            >
              {p.label}
            </NavLink>
          ))}
          <hr className="my-2 border-black/15" />
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              onClick={(e) => handleSectionClick(e, s.id)}
              className={`${plain} !w-full !justify-start !py-3 !text-base`}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}