import React from "react";

const ControlFont = () => {
    const sendMessage = (
        type: "ENLARGE_CONTENT_FONT" | "RESET_CONTENT_FONT",
    ) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) return;
            chrome.tabs.sendMessage(tabs[0].id, { type }, (response) => {
                console.log("메시지 전송됨:", response);
            });
        });
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <button
                onClick={() => sendMessage("ENLARGE_CONTENT_FONT")}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            >
                글씨 크게
            </button>
            <button
                onClick={() => sendMessage("RESET_CONTENT_FONT")}
                className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
            >
                원래대로
            </button>
        </div>
    );
};

export default ControlFont;
