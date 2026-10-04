import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { unlock, setEnabled, sfx } from "../lib/audio.js";

const SoundCtx = createContext(null);
export const useSound = () => useContext(SoundCtx);

const INTERACTIVE = "a, button, [role='option'], li.cursor-pointer";

export function SoundProvider({ children }) {
  const [on, setOn] = useState(false);

  // called by the loader's Enter buttons (a real user gesture, which unlocks audio)
  const enter = useCallback((withSound) => {
    unlock();
    setEnabled(withSound);
    setOn(withSound);
    if (withSound) sfx.enter();
  }, []);

  const toggle = useCallback(() => {
    const next = !on;
    if (next) {
      unlock();
      setEnabled(true);
      sfx.toggle(true);
    } else {
      sfx.toggle(false); // play the "off" blip first
      setEnabled(false);
    }
    setOn(next);
  }, [on]);

  // global hover + click sounds
  useEffect(() => {
    let last = null;
    const over = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const el = e.target.closest?.(INTERACTIVE);
      if (el && el !== last) sfx.hover();
      last = el || null;
    };
    const click = (e) => {
      if (e.target.closest?.(INTERACTIVE)) sfx.click();
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("click", click);
    };
  }, []);

  const value = useMemo(() => ({ on, enter, toggle }), [on, enter, toggle]);
  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}