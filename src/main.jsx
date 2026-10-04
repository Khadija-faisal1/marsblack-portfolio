import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "lenis/dist/lenis.css";
import "./index.css";
import App from "./App.jsx";
import { SoundProvider } from "./context/SoundContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SoundProvider>
        <App />
      </SoundProvider>
    </BrowserRouter>
  </StrictMode>
);