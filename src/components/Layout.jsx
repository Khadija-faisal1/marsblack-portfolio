import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import useLenis from "../hooks/useLenis.js";

export default function Layout() {
  const { pathname, hash } = useLocation();
  const isCases = pathname === "/cases";

  useLenis(!isCases);

  useEffect(() => {
    const els = [document.documentElement, document.body];
    els.forEach((el) => el.classList.toggle("overflow-hidden", isCases));
    return () => els.forEach((el) => el.classList.remove("overflow-hidden"));
  }, [isCases]);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  );
}