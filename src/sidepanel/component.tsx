/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Hello } from "@src/components/hello";
import { Scroller } from "@src/components/scroller";

const scrollToTopPosition = 0;
const scrollToBottomPosition = 9999999;

function scrollWindow(position: number) {
    window.scroll(0, position);
}

function executeScript(position: number): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab?.id) return;

        chrome.scripting.executeScript(
            {
                target: { tabId: currentTab.id },
                func: scrollWindow,
                args: [position],
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Script execution failed:",
                        chrome.runtime.lastError.message,
                    );
                } else {
                    console.log("Done Scrolling");
                }
            },
        );
    });
}

function executeFontWeightScript(weight: number): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab?.id) return;

        chrome.scripting.executeScript(
            {
                target: { tabId: currentTab.id },
                func: (fontWeight: number) => {
                    const allElements = document.querySelectorAll("*");
                    allElements.forEach((el) => {
                        // 텍스트 노드가 있는 엘리먼트에만 적용
                        if (el.childNodes.length > 0) {
                            el.childNodes.forEach((node) => {
                                if (
                                    node.nodeType === Node.TEXT_NODE &&
                                    node.textContent?.trim()
                                ) {
                                    (el as HTMLElement).style.setProperty(
                                        "font-weight",
                                        fontWeight.toString(),
                                        "important",
                                    );
                                }
                            });
                        }
                    });

                    // input, textarea, select 요소에 font-weight 적용
                    const formElements = document.querySelectorAll(
                        "input, textarea, select, h1",
                    );
                    formElements.forEach((el) => {
                        (el as HTMLElement).style.setProperty(
                            "font-weight",
                            fontWeight.toString(),
                            "important",
                        );
                    });
                },
                args: [weight],
            },

            () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Script execution failed:",
                        chrome.runtime.lastError.message,
                    );
                } else {
                    console.log("Font weight changed to", weight);
                }
            },
        );
    });
}

function executeFontScript(fontUrl: string, fontName: string): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (!currentTab?.id) return;

        chrome.scripting.executeScript(
            {
                target: { tabId: currentTab.id },
                func: (url: string, name: string) => {
                    // @font-face로 글씨체 로드
                    const style = document.createElement("style");
                    style.innerHTML = `
                        @font-face {
                            font-family: '${name}';
                            src: url('${url}') format('woff2');
                            font-weight: normal;
                            font-style: normal;
                        }
                    `;
                    document.head.appendChild(style);

                    // 모든 텍스트 노드에 글씨체 적용
                    const allElements = document.querySelectorAll("*");
                    allElements.forEach((el) => {
                        // 텍스트 노드가 있는 엘리먼트에만 적용
                        if (el.childNodes.length > 0) {
                            el.childNodes.forEach((node) => {
                                if (
                                    node.nodeType === Node.TEXT_NODE &&
                                    node.textContent?.trim()
                                ) {
                                    (el as HTMLElement).style.setProperty(
                                        "font-family",
                                        name,
                                        "important",
                                    );
                                }
                            });
                        }
                    });

                    // input, textarea, select 요소에도 글씨체 적용
                    const formElements = document.querySelectorAll(
                        "input, textarea, select",
                    );
                    formElements.forEach((el) => {
                        (el as HTMLElement).style.setProperty(
                            "font-family",
                            name,
                            "important",
                        );
                    });
                },
                args: [fontUrl, fontName],
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error(
                        "Script execution failed:",
                        chrome.runtime.lastError.message,
                    );
                } else {
                    console.log(`Font changed to ${fontName}`);
                }
            },
        );
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

const RangeLabel = styled.label`
    display: block;
    font-size: 14px;
    margin-top: 12px;
    margin-bottom: 4px;
    color: #333;
`;

const RangeInput = styled.input`
    width: 100%;
`;

export const SidePanel: React.FC = () => {
    const [fontWeight, setFontWeight] = useState<number>(400);
    const [fontFamily, setFontFamily] = useState<string>("Arial");

    useEffect(() => {
        chrome.runtime.sendMessage({ type: "sidePanelMounted" }, () => {
            if (chrome.runtime.lastError) {
                console.error(
                    "Failed to send message to background:",
                    chrome.runtime.lastError.message,
                );
            }
        });
    }, []);

    const handleFontWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setFontWeight(value);
        executeFontWeightScript(value);
    };

    const handleFontFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFontFamily(value);
        // 여기서 실행할 글씨체 URL과 이름을 변경
        executeFontScript(
            `chrome-extension://jeppkpjgeheckphiogogbffdenhlkclh/assets/fonts/${value}.woff2`,
            value,
        );
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
                    <RangeLabel htmlFor="font-weight-range">
                        글씨 두께: {fontWeight}
                    </RangeLabel>
                    <RangeInput
                        id="font-weight-range"
                        type="range"
                        min={100}
                        max={900}
                        step={100}
                        value={fontWeight}
                        onChange={handleFontWeightChange}
                    />

                    <RangeLabel htmlFor="font-family">
                        글씨체: {fontFamily}
                    </RangeLabel>
                    <RangeInput
                        id="font-family"
                        type="text"
                        value={fontFamily}
                        onChange={handleFontFamilyChange}
                    />
                </Card>
            </Content>
        </SidePanelWrapper>
    );
};
