import React, { useState } from "react";
import "../css/app.css";

const Component = () => {
    const [text, setText] = useState("");

    const handleSpeak = () => {
        if (!text.trim()) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ko-KR";
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="w-64 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-semibold mb-2 text-gray-800">
                VOIM TTS
            </h1>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="텍스트를 입력하세요"
                className="w-full h-24 p-2 border border-gray-300 rounded resize-none text-sm"
            />
            <button
                onClick={handleSpeak}
                className="w-full mt-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
                읽어줘!
            </button>
        </div>
    );
};

export default Component;
