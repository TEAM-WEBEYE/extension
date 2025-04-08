import React from "react";
import { createRoot } from "react-dom/client";
import { SidePanel } from "./component";
import "../css/app.css";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("side-panel");
    if (!container) {
        throw new Error("No root element found");
    }

    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <SidePanel />
        </React.StrictMode>,
    );
});
