/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import React = require("react");

interface MagnifyingGlassProps {
    snapshotUrl: string;
    magnifierStrength: number;
    magnifierSize: number;
    magnifierAA: boolean;
    magnifierShape: number;
    pageZoom: number;
    osCompensation: number;
    escOnly: boolean;
}

const MagnifyingGlass: React.FC<MagnifyingGlassProps> = ({
    snapshotUrl,
    magnifierStrength,
    magnifierSize,
    magnifierAA,
    magnifierShape,
    pageZoom,
    osCompensation,
    escOnly,
}) => {
    const magnifierRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [visible, setVisible] = useState(false);

    const zoom = pageZoom * (osCompensation / 100);
    const scaledSize = magnifierSize / zoom;
    const sizeStyle = `${scaledSize / magnifierStrength}px`;
    const boxShadow = `
    0 0 0 ${7 / magnifierStrength}px rgba(255, 255, 255, 0.85),
    0 0 ${7 / magnifierStrength}px ${
        7 / magnifierStrength
    }px rgba(0, 0, 0, 0.25),
    inset 0 0 ${40 / magnifierStrength}px ${
        2 / magnifierStrength
    }px rgba(0, 0, 0, 0.25)
  `;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const container = containerRef.current;
            const magnifier = magnifierRef.current;
            if (!container || !magnifier) return;

            const { clientX, clientY } = e;
            const { offsetWidth, offsetHeight } = container;

            if (
                clientX > 0 &&
                clientY > 0 &&
                clientX < offsetWidth - 1 &&
                clientY < offsetHeight - 4
            ) {
                setVisible(true);
                magnifier.focus();
            } else {
                setVisible(false);
            }

            if (magnifier.style.display !== "none") {
                const xOffset =
                    -1 * (clientX - magnifier.offsetWidth / 2) * zoom;
                const yOffset =
                    -1 * (clientY - magnifier.offsetHeight / 2) * zoom;
                const bgPosition = `${xOffset}px ${yOffset}px`;

                magnifier.style.left = `${
                    clientX - magnifier.offsetWidth / 2
                }px`;
                magnifier.style.top = `${
                    clientY - magnifier.offsetHeight / 2
                }px`;
                magnifier.style.backgroundPosition = bgPosition;
            }
        };

        const handleClose = (e: MouseEvent | KeyboardEvent) => {
            if (
                !escOnly ||
                ("key" in e && (e as KeyboardEvent).key === "Escape")
            ) {
                containerRef.current?.remove();
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("click", handleClose);
        document.addEventListener("wheel", handleClose);
        document.addEventListener("keydown", handleClose);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("click", handleClose);
            document.removeEventListener("wheel", handleClose);
            document.removeEventListener("keydown", handleClose);
        };
    }, [zoom, escOnly]);

    return (
        <div
            ref={containerRef}
            className="fixed top-0 left-0 w-screen h-screen z-[9999]"
        >
            <div
                ref={magnifierRef}
                tabIndex={0}
                className="absolute pointer-events-none bg-no-repeat bg-cover"
                style={{
                    display: visible ? "block" : "none",
                    backgroundImage: `url(${snapshotUrl})`,
                    width: sizeStyle,
                    height: sizeStyle,
                    transform: `scale(${magnifierStrength})`,
                    borderRadius: `${magnifierShape}%`,
                    imageRendering: magnifierAA ? "auto" : "pixelated",
                    boxShadow,
                }}
            />
        </div>
    );
};

export default MagnifyingGlass;
