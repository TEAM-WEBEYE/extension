import React from "react";
import { useEffect, useState } from "react";

export default function Options() {
    const [magnifierStrength, setMagnifierStrength] = useState(2);
    const [magnifierSize, setMagnifierSize] = useState(425);
    const [magnifierAA, setMagnifierAA] = useState(true);
    const [magnifierCM, setMagnifierCM] = useState(false);
    const [magnifierShape, setMagnifierShape] = useState(100);
    const [osFactor, setOsFactor] = useState(100);
    const [escLimit, setEscLimit] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        chrome.storage.sync.get(
            {
                magnifierStrength: 2,
                magnifierSize: 425,
                magnifierAA: true,
                magnifierCM: false,
                magnifierShape: 100,
                osFactor: 100,
                escLimit: false,
            },
            (items) => {
                setMagnifierStrength(items.magnifierStrength);
                setMagnifierSize(items.magnifierSize);
                setMagnifierAA(items.magnifierAA);
                setMagnifierCM(items.magnifierCM);
                setMagnifierShape(items.magnifierShape);
                setOsFactor(items.osFactor);
                setEscLimit(items.escLimit);
            },
        );
    }, []);

    const saveOptions = () => {
        chrome.storage.sync.set(
            {
                magnifierStrength,
                magnifierSize,
                magnifierAA,
                magnifierCM,
                magnifierShape,
                osFactor,
                escLimit,
            },
            () => {
                if (magnifierStrength <= 0 || magnifierSize <= 0) {
                    setStatus(
                        "Non-positive number detected, the magnifier might not behave as expected.",
                    );
                } else {
                    setStatus("Options saved.");
                }
                setTimeout(() => setStatus(""), 1500);
            },
        );
    };

    const resetOptions = () => {
        chrome.storage.sync.clear(() => {
            chrome.storage.sync.set(
                {
                    magnifierStrength: 2,
                    magnifierSize: 425,
                    magnifierAA: true,
                    magnifierCM: false,
                    magnifierShape: 100,
                    osFactor: 100,
                    escLimit: false,
                },
                () => {
                    setMagnifierStrength(2);
                    setMagnifierSize(425);
                    setMagnifierAA(true);
                    setMagnifierCM(false);
                    setMagnifierShape(100);
                    setOsFactor(100);
                    setEscLimit(false);
                    setStatus("Options reset.");
                    setTimeout(() => setStatus(""), 1200);
                },
            );
        });
    };

    return (
        <div className="p-4 max-w-xl mx-auto text-sm space-y-4">
            <div className="font-bold text-lg">Magnifier Options</div>

            <div>
                <label>Strength:</label>
                <input
                    type="number"
                    value={magnifierStrength}
                    onChange={(e) =>
                        setMagnifierStrength(parseFloat(e.target.value))
                    }
                    className="border rounded px-2 py-1 ml-2 w-20"
                />
            </div>

            <div>
                <label>Size:</label>
                <input
                    type="number"
                    value={magnifierSize}
                    onChange={(e) => setMagnifierSize(parseInt(e.target.value))}
                    className="border rounded px-2 py-1 ml-2 w-24"
                />
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={magnifierAA}
                    onChange={(e) => setMagnifierAA(e.target.checked)}
                />
                <label>Anti-aliasing</label>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={magnifierCM}
                    onChange={(e) => setMagnifierCM(e.target.checked)}
                />
                <label>Compatibility Mode</label>
            </div>

            <div>
                <label>Shape (% circle):</label>
                <input
                    type="number"
                    value={magnifierShape}
                    onChange={(e) =>
                        setMagnifierShape(parseInt(e.target.value))
                    }
                    className="border rounded px-2 py-1 ml-2 w-20"
                />
            </div>

            <div>
                <label>OS Zoom Compensation (%):</label>
                <input
                    type="number"
                    value={osFactor}
                    onChange={(e) => setOsFactor(parseInt(e.target.value))}
                    className="border rounded px-2 py-1 ml-2 w-24"
                />
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={escLimit}
                    onChange={(e) => setEscLimit(e.target.checked)}
                />
                <label>ESC Key Only to Exit</label>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={saveOptions}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                    Save
                </button>
                <button
                    onClick={resetOptions}
                    className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                >
                    Reset
                </button>
            </div>

            {status && (
                <div className="text-green-600 font-medium">{status}</div>
            )}
        </div>
    );
}
