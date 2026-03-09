
//1. 점수 계산 로직
export function calculateScore(selectedIndex, correctIndex) {
    return selectedIndex === correctIndex;
}

//2. 진행률(%) 계산 로직
export function getProgress(currentIndex, totalQuestions) {
    return ((currentIndex + 1) / totalQuestions) * 100;
}

//3. 타이머 로직
export class QuizTimer {
    constructor(initialTime, onTick, onTimeUp) {
        this.timeLeft = initialTime;
        this.onTick = onTick; // 매초 실행할 함수
        this.onTimeUp = onTimeUp; // 시간 종료 시 실행할 함수
        this.timerId = null;
    }

    start() {
        this.timerId = senInterval(() => {
            this.timeLeft--;
            this.onTick(this.timeLeft);
            if (this.timeLeft <= 0) {
                this.stop();
                this.onTimeUp();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.timerId);
    }
}