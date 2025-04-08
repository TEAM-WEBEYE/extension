/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import styled from "@emotion/styled";
import { Hello } from "@src/components/hello";
import browser, { Tabs } from "webextension-polyfill";
import { Scroller } from "@src/components/scroller";
import Options from "@src/components/Option";

// Scripts to execute in current tab
const scrollToTopPosition = 0;
const scrollToBottomPosition = 9999999;

function scrollWindow(position: number) {
    window.scroll(0, position);
}

function executeScript(position: number): void {
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: Tabs.Tab[]) => {
            const currentTab = tabs[0];
            if (!currentTab) return;

            const currentTabId = currentTab.id as number;
            browser.scripting
                .executeScript({
                    target: { tabId: currentTabId },
                    func: scrollWindow,
                    args: [position],
                })
                .then(() => {
                    console.log("Done Scrolling");
                });
        });
}

// ---------- Styled Components ----------
const SidePanelWrapper = styled.div`
    padding: 20px;
    width: 100%;
    height: 100vh;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #ffffff;
    box-sizing: border-box;
`;

const Title = styled.h1`
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Card = styled.div`
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

export const SidePanel: React.FC = () => {
    const [isMagnifierActive, setIsMagnifierActive] = useState(false);

    React.useEffect(() => {
        if (browser && browser.runtime) {
            browser.runtime
                .sendMessage({ type: "sidePanelMounted" })
                .catch((err) => {
                    console.error("Failed to send message to background:", err);
                });
        }
    }, []);

    const toggleMagnifier = async () => {
        try {
            console.log(
                "Toggling magnifier, current state:",
                isMagnifierActive,
            );

            // 현재 활성화된 탭 가져오기
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });
            const currentTab = tabs[0];

            if (!currentTab?.id) {
                console.error("No active tab found");
                return;
            }

            console.log("Active tab:", currentTab.id);

            // 설정 가져오기
            const settings = await chrome.storage.sync.get({
                magnifierStrength: 2,
                magnifierSize: 150,
                magnifierShape: 100,
                magnifierAA: true,
                magnifierCM: false,
                osFactor: 100,
                escLimit: false,
            });

            console.log("Current settings:", settings);

            // magnifierShape 값을 숫자에서 문자열로 변환
            const magnifierShapeValue =
                settings.magnifierShape >= 50 ? "circle" : "square";
            console.log("Converted magnifierShape:", magnifierShapeValue);

            // 탭의 상태 확인
            const tabInfo = await chrome.tabs.get(currentTab.id);
            console.log("Tab status:", tabInfo.status);

            if (tabInfo.status === "complete") {
                if (!isMagnifierActive) {
                    // 돋보기 활성화
                    console.log("Sending ACTIVATE_MAGNIFIER message");
                    try {
                        // 스크린샷 캡처
                        const screenshotUrl = await captureVisibleTab(
                            currentTab.windowId,
                        );

                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "ACTIVATE_MAGNIFIER",
                            settings: {
                                magnifierStrength: settings.magnifierStrength,
                                magnifierSize: settings.magnifierSize,
                                magnifierShape: magnifierShapeValue,
                                magnifierAA: settings.magnifierAA,
                                magnifierCM: settings.magnifierCM,
                                osFactor: settings.osFactor,
                                escLimit: settings.escLimit,
                            },
                            screenshotUrl: screenshotUrl,
                        });
                        console.log(
                            "ACTIVATE_MAGNIFIER message sent successfully",
                        );
                        setIsMagnifierActive(true);
                    } catch (error) {
                        console.error(
                            "Error sending ACTIVATE_MAGNIFIER message:",
                            error,
                        );
                        // 콘텐츠 스크립트가 로드되지 않았을 수 있으므로 다시 시도
                        await injectContentScript(currentTab.id);

                        // 스크린샷 캡처
                        const screenshotUrl = await captureVisibleTab(
                            currentTab.windowId,
                        );

                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "ACTIVATE_MAGNIFIER",
                            settings: {
                                magnifierStrength: settings.magnifierStrength,
                                magnifierSize: settings.magnifierSize,
                                magnifierShape: magnifierShapeValue,
                                magnifierAA: settings.magnifierAA,
                                magnifierCM: settings.magnifierCM,
                                osFactor: settings.osFactor,
                                escLimit: settings.escLimit,
                            },
                            screenshotUrl: screenshotUrl,
                        });
                        setIsMagnifierActive(true);
                    }
                } else {
                    // 돋보기 비활성화
                    console.log("Sending DEACTIVATE_MAGNIFIER message");
                    try {
                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "DEACTIVATE_MAGNIFIER",
                        });
                        console.log(
                            "DEACTIVATE_MAGNIFIER message sent successfully",
                        );
                        setIsMagnifierActive(false);
                    } catch (error) {
                        console.error(
                            "Error sending DEACTIVATE_MAGNIFIER message:",
                            error,
                        );
                        // 콘텐츠 스크립트가 로드되지 않았을 수 있으므로 다시 시도
                        await injectContentScript(currentTab.id);
                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "DEACTIVATE_MAGNIFIER",
                        });
                        setIsMagnifierActive(false);
                    }
                }
            } else {
                // 탭이 아직 로드되지 않은 경우, 로드될 때까지 대기
                console.log("Tab not complete, waiting for load");
                await new Promise<void>((resolve) => {
                    const listener = (
                        tabId: number,
                        changeInfo: chrome.tabs.TabChangeInfo,
                    ) => {
                        if (
                            tabId === currentTab.id &&
                            changeInfo.status === "complete"
                        ) {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }
                    };
                    chrome.tabs.onUpdated.addListener(listener);
                });

                console.log("Tab loaded, sending message");
                // 탭이 로드된 후 메시지 전송
                if (!isMagnifierActive) {
                    try {
                        // 스크린샷 캡처
                        const screenshotUrl = await captureVisibleTab(
                            currentTab.windowId,
                        );

                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "ACTIVATE_MAGNIFIER",
                            settings: {
                                magnifierStrength: settings.magnifierStrength,
                                magnifierSize: settings.magnifierSize,
                                magnifierShape: magnifierShapeValue,
                                magnifierAA: settings.magnifierAA,
                                magnifierCM: settings.magnifierCM,
                                osFactor: settings.osFactor,
                                escLimit: settings.escLimit,
                            },
                            screenshotUrl: screenshotUrl,
                        });
                        setIsMagnifierActive(true);
                    } catch (error) {
                        console.error(
                            "Error sending ACTIVATE_MAGNIFIER message after tab load:",
                            error,
                        );
                        await injectContentScript(currentTab.id);

                        // 스크린샷 캡처
                        const screenshotUrl = await captureVisibleTab(
                            currentTab.windowId,
                        );

                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "ACTIVATE_MAGNIFIER",
                            settings: {
                                magnifierStrength: settings.magnifierStrength,
                                magnifierSize: settings.magnifierSize,
                                magnifierShape: magnifierShapeValue,
                                magnifierAA: settings.magnifierAA,
                                magnifierCM: settings.magnifierCM,
                                osFactor: settings.osFactor,
                                escLimit: settings.escLimit,
                            },
                            screenshotUrl: screenshotUrl,
                        });
                        setIsMagnifierActive(true);
                    }
                } else {
                    try {
                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "DEACTIVATE_MAGNIFIER",
                        });
                        setIsMagnifierActive(false);
                    } catch (error) {
                        console.error(
                            "Error sending DEACTIVATE_MAGNIFIER message after tab load:",
                            error,
                        );
                        await injectContentScript(currentTab.id);
                        await chrome.tabs.sendMessage(currentTab.id, {
                            type: "DEACTIVATE_MAGNIFIER",
                        });
                        setIsMagnifierActive(false);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to toggle magnifier:", error);
        }
    };

    // 콘텐츠 스크립트 주입 함수
    const injectContentScript = async (tabId: number) => {
        console.log("Injecting content script into tab:", tabId);
        try {
            // CSS 주입
            await chrome.scripting.insertCSS({
                target: { tabId },
                files: ["styles/magnifier.css"],
            });

            // 콘텐츠 스크립트 주입
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ["js/content.js"],
            });

            console.log("Content script injected successfully");

            // 스크립트가 로드될 시간을 주기 위해 잠시 대기
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Error injecting content script:", error);
        }
    };

    // 스크린샷 캡처 함수
    const captureVisibleTab = async (windowId: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab(
                windowId,
                { format: "png" },
                (screenshotUrl) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Error capturing screenshot:",
                            chrome.runtime.lastError,
                        );
                        reject(chrome.runtime.lastError);
                    } else if (!screenshotUrl) {
                        console.error("Failed to capture screenshot");
                        reject(new Error("Failed to capture screenshot"));
                    } else {
                        console.log("Screenshot captured successfully");
                        resolve(screenshotUrl);
                    }
                },
            );
        });
    };

    return (
        <SidePanelWrapper>
            <Title>사이드 패널</Title>
            <Content>
                <Card>
                    <Hello />
                    <hr />
                    <Scroller
                        onClickScrollTop={() =>
                            executeScript(scrollToTopPosition)
                        }
                        onClickScrollBottom={() =>
                            executeScript(scrollToBottomPosition)
                        }
                    />
                    <Button onClick={toggleMagnifier}>
                        {isMagnifierActive
                            ? "돋보기 비활성화"
                            : "돋보기 활성화"}
                    </Button>
                </Card>
                <Options />
            </Content>
        </SidePanelWrapper>
    );
};
