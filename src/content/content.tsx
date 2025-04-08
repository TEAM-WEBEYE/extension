import React from "react";
import { createRoot } from "react-dom/client";
import Magnifier from "@src/components/Magnifier";

let magnifierContainer: HTMLDivElement | null = null;
let magnifierRoot: ReturnType<typeof createRoot> | null = null;

interface Message {
    type: "ACTIVATE_MAGNIFIER" | "DEACTIVATE_MAGNIFIER";
    settings?: {
        magnifierStrength: number;
        magnifierSize: number;
        magnifierShape: "circle" | "square";
        magnifierAA: boolean;
        magnifierCM: boolean;
        osFactor: number;
        escLimit: boolean;
    };
    screenshotUrl?: string;
}

// 콘텐츠 스크립트가 로드되었음을 알리는 메시지 전송
console.log("Content script loaded");
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
        console.log("Message received in content script:", message);

        if (message.type === "ACTIVATE_MAGNIFIER" && message.settings) {
            console.log(
                "Activating magnifier with settings:",
                message.settings,
            );
            // 돋보기 활성화
            if (!magnifierContainer) {
                // 컨테이너가 없는 경우에만 새로 생성
                const container = document.createElement("div");
                container.id = "magnifier-container";
                document.body.appendChild(container);

                const root = createRoot(container);
                root.render(
                    <Magnifier
                        imageUrl={message.screenshotUrl || ""}
                        zoom={
                            message.settings.magnifierStrength *
                            (message.settings.osFactor / 100)
                        }
                        size={message.settings.magnifierSize}
                        shape={
                            message.settings.magnifierShape === "circle"
                                ? 100
                                : 0
                        }
                        aa={message.settings.magnifierAA}
                        escOnly={message.settings.escLimit}
                        onClose={() => {
                            if (magnifierRoot) {
                                magnifierRoot.unmount();
                                magnifierRoot = null;
                            }
                            if (magnifierContainer) {
                                magnifierContainer.remove();
                                magnifierContainer = null;
                            }
                        }}
                    />,
                );
                magnifierContainer = container;
                magnifierRoot = root;
            }
            sendResponse({ success: true });
        } else if (message.type === "DEACTIVATE_MAGNIFIER") {
            console.log("Deactivating magnifier");
            // 돋보기 비활성화
            if (magnifierRoot) {
                magnifierRoot.unmount();
                magnifierRoot = null;
            }
            if (magnifierContainer) {
                magnifierContainer.remove();
                magnifierContainer = null;
            }
            sendResponse({ success: true });
        }
        return true; // 비동기 응답을 위해 true 반환
    },
);
