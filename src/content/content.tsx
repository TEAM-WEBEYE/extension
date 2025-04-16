// content.js

console.log("content.js 실행됨");

// 새로운 버튼 생성
const button = document.createElement("button");
button.textContent = "내 버튼";
button.style.width = "200px"; // 버튼 크기
button.style.height = "50px";
button.style.padding = "10px";
button.style.backgroundColor = "#007bff";
button.style.color = "#fff";
button.style.border = "none";
button.style.borderRadius = "5px";
button.style.cursor = "pointer";
button.style.zIndex = "10000"; // 위에 표시

// 클릭 이벤트 추가: 기존 버튼 클릭 트리거
button.addEventListener("click", () => {
    // 기존 '구매하기' 버튼 찾기
    const existingButton = document.querySelector("#btnPay") as HTMLElement;
    if (existingButton) {
        existingButton.click(); // 기존 버튼 클릭 시 동작을 재현
    } else {
        console.log("기존 버튼을 찾을 수 없습니다.");
    }
});

// 특정 클래스명을 가진 요소를 찾음
const targetElement = document.querySelector(".cart-title-new-layout-wrapper");

if (targetElement) {
    // 해당 요소가 있으면 그 안에 버튼을 추가
    targetElement.appendChild(button);
    console.log("버튼이 cart-title-new-layout-wrapper 안에 추가되었습니다.");
} else {
    console.log(
        "cart-title-new-layout-wrapper 클래스를 가진 요소를 찾을 수 없습니다.",
    );
}
