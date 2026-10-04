import { useEffect, useState } from "react";

const IMAGES = [
  "/assets/images/hero-image.jpg",
  "/assets/MB LOGO/mb final logo mark.svg",
  "/assets/MB LOGO/halftone-bg removed logo.svg",
  "/assets/images/MarsBlack_Bars_1__1-removebg-preview.png",
  "/assets/images/mb-halftone-logo.png",
];
const FONTS = ['16px "pixel"', '16px "orbitron"'];

export default function usePreload() {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    let done = 0;
    let dead = false;
    const total = IMAGES.length + FONTS.length;
    const tick = () => {
      done++;
      if (!dead) setRatio(done / total);
    };

    IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = tick; // a missing image never blocks the loader
      img.src = encodeURI(src);
    });
    FONTS.forEach((f) => document.fonts.load(f).then(tick, tick));

    const safety = setTimeout(() => !dead && setRatio(1), 8000);
    return () => {
      dead = true;
      clearTimeout(safety);
    };
  }, []);

  return ratio;
}