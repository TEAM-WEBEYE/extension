import React, { useState } from "react";
import "../css/app.css";

const Component = () => {
    const [pageText, setPageText] = useState("");

    const getTextAndSpeak = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;

            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "GET_PAGE_TEXT" },
                (response) => {
                    if (response?.text) {
                        setPageText(response.text);

                        const utterance = new SpeechSynthesisUtterance(
                            response.text,
                        );
                        utterance.lang = "ko-KR";
                        speechSynthesis.speak(utterance);
                    } else {
                        alert("페이지의 텍스트를 가져오지 못했어요.");
                    }
                },
            );
        });
    };

    return (
        <div className="w-64 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-semibold mb-2 text-gray-800">
                VOIM tts test
            </h1>
            <button
                onClick={getTextAndSpeak}
                className="w-full mt-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
                읽어줘!
            </button>
        </div>
    );
};

export default Component;
