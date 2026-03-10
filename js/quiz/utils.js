// 정답 확인 로직
export function checkIsCorrect(selectedIndex, correctIndex) {
    return selectedIndex === correctIndex;
}

// 진행률 계산 로직
export function calculateProgress(currentIndex, total) {
    return ((currentIndex + 1) / total) * 100;
}

