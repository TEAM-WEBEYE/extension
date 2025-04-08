// src/components/Magnifier.tsx
import React, { useEffect, useRef, useState } from "react";

interface MagnifierProps {
    imageUrl: string;
    zoom: number;
    size: number;
    aa: boolean;
    shape: number; // percentage (e.g., 50 for circle, 0 for square)
    escOnly: boolean;
    onClose: () => void;
}

const Magnifier: React.FC<MagnifierProps> = ({
    imageUrl,
    zoom,
    size,
    aa,
    shape,
    escOnly,
    onClose,
}) => {
    const magnifierRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    const handleMouseMove = (e: MouseEvent) => {
        const magnifier = magnifierRef.current;
        if (!magnifier) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        if (
            e.clientX > 0 &&
            e.clientX < width - 1 &&
            e.clientY > 0 &&
            e.clientY < height - 4
        ) {
            setVisible(true);
            magnifier.focus();

            // 돋보기 위치 계산
            const magnifierWidth = size;
            const magnifierHeight = size;

            // 돋보기 위치 설정
            const left = e.clientX - magnifierWidth / 2;
            const top = e.clientY - magnifierHeight / 2;

            // 배경 위치 계산 (마우스 위치에 따라 배경 이미지 위치 조정)
            const xOffset = -e.clientX * zoom + magnifierWidth / 2;
            const yOffset = -e.clientY * zoom + magnifierHeight / 2;

            if (imageUrl) {
                magnifier.style.backgroundPosition = `${xOffset}px ${yOffset}px`;
            }
            magnifier.style.left = `${left}px`;
            magnifier.style.top = `${top}px`;
        } else {
            setVisible(false);
        }
    };

    const handleClose = (e: MouseEvent | KeyboardEvent) => {
        if (!escOnly || (e instanceof KeyboardEvent && e.key === "Escape")) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("wheel", handleClose);
        document.addEventListener("click", handleClose);
        document.addEventListener("keydown", handleClose);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("wheel", handleClose);
            document.removeEventListener("click", handleClose);
            document.removeEventListener("keydown", handleClose);
        };
    }, [zoom, escOnly]);

    useEffect(() => {
        // 스크린샷이 로드되었는지 확인
        if (imageUrl) {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                console.log("Screenshot loaded successfully");
                // 스크린샷이 로드되면 돋보기 표시
                setVisible(true);
            };
            img.onerror = (error) => {
                console.error("Error loading screenshot:", error);
            };
        }
    }, [imageUrl]);

    return (
        <div
            ref={magnifierRef}
            className={`fixed z-[9999] bg-no-repeat pointer-events-none transition-opacity duration-100 overflow-hidden ${
                visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
                backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                backgroundSize: `${window.innerWidth * zoom}px ${
                    window.innerHeight * zoom
                }px`,
                imageRendering: aa ? "auto" : "pixelated",
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: `${shape}%`,
                boxShadow: `0 0 0 7px rgba(255,255,255,0.85),
                    0 0 7px 7px rgba(0,0,0,0.25),
                    inset 0 0 40px 2px rgba(0,0,0,0.25)`,
            }}
            tabIndex={0}
        />
    );
};

export default Magnifier;
