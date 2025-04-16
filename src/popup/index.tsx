import * as React from "react";
import { createRoot } from "react-dom/client";
import browser from "webextension-polyfill";
import GetProduct from "./getProduct";
import "../css/app.css";
import ControlFont from "./controlFont";

browser.tabs
    .query({ active: true, currentWindow: true })
    .then(() => {
        return new Promise<void>((resolve) => {
            if (document.readyState === "complete") {
                resolve();
            } else {
                document.addEventListener("DOMContentLoaded", () => resolve());
            }
        });
    })
    .then(() => {
        const container = document.getElementById("popup");
        if (container) {
            const root = createRoot(container);
            root.render(
                <div className="p-4 w-80">
                    <h1 className="text-lg font-bold mb-4">VOIM</h1>
                    <GetProduct />
                    <ControlFont />
                </div>,
            );
        } else {
            console.error("popup이라는 id를 가진 요소가 존재하지 않아요!");
        }
    });
