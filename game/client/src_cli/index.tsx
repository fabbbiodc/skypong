import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import StartPage from "./components/pages/StartPage";
import CanvasPage from "./components/pages/CanvasPage";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// FRONT these are the React Router patterns that will render either the menu or the game
root.render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/canvas" element={<CanvasPage />} />
    </Routes>
  </HashRouter>,
);
