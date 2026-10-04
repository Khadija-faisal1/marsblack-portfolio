import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Loader from "./components/Loader.jsx";
import Home from "./pages/Home.jsx";
import IndexPage from "./pages/IndexPage.jsx";

const Cases = lazy(() => import("./pages/Cases.jsx"));

export default function App() {
  return (
    <>
      <Loader />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/index" element={<IndexPage />} />
          <Route path="/cases" element={<Cases />} />
        </Route>
      </Routes>
    </>
  );
}