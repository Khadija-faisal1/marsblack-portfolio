import { useEffect } from "react";
import Lenis from "lenis";

export default function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1,
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.5,
    });
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, [enabled]);
}