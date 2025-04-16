import React, { useState } from "react";
import "../css/app.css";

const getProduct = () => {
    const [productInfo, setProductInfo] = useState<{
        productId: string;
        productTitle: string;
    } | null>(null);

    const [error, setError] = useState("");

    const getProductInfo = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log("탭 목록:", tabs);
            if (!tabs[0]?.id) return;

            chrome.tabs.sendMessage(
                tabs[0].id,
                { type: "GET_PRODUCT_INFO" },
                (response) => {
                    if (response?.matched) {
                        const { productId, productTitle } = response;
                        setProductInfo({ productId, productTitle });
                        setError("");
                        const utterance = new SpeechSynthesisUtterance(
                            `상품명은 ${productTitle}이고, 상품 아이디는 ${productId}입니다.`,
                        );
                        utterance.lang = "ko-KR";
                        speechSynthesis.speak(utterance);
                    } else {
                        setProductInfo(null);
                        setError(
                            "❗ 현재 페이지는 '식품' 카테고리가 아닙니다.",
                        );
                    }
                },
            );
        });
    };
    return (
        <div className="w-72 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-semibold mb-3 text-gray-800">
                VOIM 상품 리더기
            </h1>

            <button
                onClick={getProductInfo}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm mb-2"
            >
                상품 정보 읽어줘!
            </button>
            {productInfo && (
                <div className="mt-4 text-sm text-gray-700">
                    <p>
                        <strong>상품명:</strong> {productInfo.productTitle}
                    </p>
                    <p>
                        <strong>상품 ID:</strong> {productInfo.productId}
                    </p>
                </div>
            )}

            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default getProduct;
