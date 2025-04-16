chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "ACTIVATE_MAGNIFIER") {
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (!tab.id || !tab.windowId) throw new Error("No active tab");

            const settings = await chrome.storage.sync.get({
                magnifierStrength: 2,
                magnifierSize: 150,
                magnifierShape: 100,
                magnifierAA: true,
                magnifierCM: false,
                osFactor: 100,
                escLimit: false,
            });

            const magnifierShapeValue =
                settings.magnifierShape >= 50 ? "circle" : "square";

            // CSS & JS 주입
            await chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ["styles/magnifier.css"],
            });
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["js/content.js"],
            });

            // 캡처
            const screenshotUrl = await new Promise<string>(
                (resolve, reject) => {
                    chrome.tabs.captureVisibleTab(
                        tab.windowId!,
                        { format: "png" },
                        (url) => {
                            if (chrome.runtime.lastError || !url) {
                                reject(
                                    chrome.runtime.lastError ||
                                        new Error("Capture failed"),
                                );
                            } else {
                                resolve(url);
                            }
                        },
                    );
                },
            );

            // 메시지 전송
            await chrome.tabs.sendMessage(tab.id, {
                type: "ACTIVATE_MAGNIFIER",
                settings: { ...settings, magnifierShape: magnifierShapeValue },
                screenshotUrl,
            });

            sendResponse({ success: true });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("ACTIVATE_MAGNIFIER 실패:", error.message);
                sendResponse({ success: false, error: error.message });
            } else {
                console.error("ACTIVATE_MAGNIFIER 알 수 없는 에러:", error);
                sendResponse({ success: false, error: "Unknown error" });
            }
        }
        return true; // 비동기 처리 유지
    }

    if (message.type === "DEACTIVATE_MAGNIFIER") {
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (!tab.id) throw new Error("No active tab");

            await chrome.tabs.sendMessage(tab.id, {
                type: "DEACTIVATE_MAGNIFIER",
            });

            sendResponse({ success: true });
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("DEACTIVATE_MAGNIFIER 실패:", error.message);
                sendResponse({ success: false, error: error.message });
            } else {
                console.error("DEACTIVATE_MAGNIFIER 알 수 없는 에러:", error);
                sendResponse({ success: false, error: "Unknown error" });
            }
        }
        return true; // 비동기 처리 유지
    }

    if (message.type === "sidePanelMounted") {
        console.log("사이드 패널이 마운트되었습니다.");
        sendResponse({ success: true });
        return true;
    }

    // 알 수 없는 메시지 처리
    console.warn("알 수 없는 메시지 타입:", message);
    sendResponse({ success: false, error: "Unknown message type" });
    return true;
});
