// side panel 설정
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message);

    if (message.type === "CONTENT_SCRIPT_LOADED") {
        console.log("Content script loaded in tab:", sender.tab?.id);
        sendResponse({ success: true });
    } else if (message.type === "MAGNIFIER_CLOSED") {
        console.log("Magnifier closed");
        sendResponse({ success: true });
    } else if (message.type === "DEACTIVATE_MAGNIFIER") {
        // 현재 활성화된 탭에 메시지 전송
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab?.id) {
                chrome.tabs.sendMessage(currentTab.id, {
                    type: "DEACTIVATE_MAGNIFIER",
                });
            }
        });
        sendResponse({ success: true });
    }
    return true;
});

chrome.action.onClicked.addListener(async (tab) => {
    const defaultSettings = {
        magnifierStrength: 2,
        magnifierSize: 425,
        magnifierAA: true,
        magnifierCM: false,
        magnifierShape: 100,
        osFactor: 100,
        escLimit: false,
    };

    const settings = await new Promise<typeof defaultSettings>((resolve) => {
        chrome.storage.sync.get(defaultSettings, resolve);
    });

    const isMagnifierTab = tab?.title?.startsWith("_Magnifying_Glass");

    if (settings.magnifierCM) {
        if (isMagnifierTab && tab.id) {
            chrome.tabs.remove(tab.id);
            return;
        }

        chrome.tabs.captureVisibleTab(
            tab.windowId,
            { format: "png" },
            (screenshotUrl) => {
                if (!screenshotUrl) return;

                const viewTabUrl = chrome.runtime.getURL(
                    `snapshot.html?id=${Date.now()}`,
                );

                chrome.tabs.create(
                    { url: viewTabUrl, index: tab.index },
                    (createdTab) => {
                        if (!createdTab.id) return;

                        const listener = (
                            tabId: number,
                            changeInfo: chrome.tabs.TabChangeInfo,
                        ) => {
                            if (
                                tabId === createdTab.id &&
                                changeInfo.status === "complete"
                            ) {
                                chrome.tabs.onUpdated.removeListener(listener);

                                chrome.tabs.sendMessage(createdTab.id, {
                                    type: "INIT_MAGNIFIER_VIEW",
                                    screenshotUrl,
                                    settings,
                                });
                            }
                        };

                        chrome.tabs.onUpdated.addListener(listener);
                    },
                );
            },
        );
    } else {
        chrome.scripting.insertCSS({
            target: { tabId: tab.id! },
            files: ["styles/magnifier.css"],
        });

        chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ["scripts/inject.js"],
        });

        chrome.tabs.captureVisibleTab(
            tab.windowId,
            { format: "png" },
            (screenshotUrl) => {
                if (!screenshotUrl) return;

                chrome.tabs.sendMessage(tab.id!, {
                    type: "ACTIVATE_MAGNIFIER",
                    screenshotUrl,
                    settings,
                });
            },
        );
    }
});
