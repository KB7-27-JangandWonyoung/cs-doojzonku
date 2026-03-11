import { quizData } from './data.js';
import { calculateScore, getProgress, QuizTimer } from './logic.js';

// 현재 상태 관리 변수
let currentIndex = 0;
let totalScore = 0;

// 게임 시작 함수
function initGame() {
  console.log('🎮 퀴즈 게임을 시작합니다!');
  loadQuestion();
}

// 문제 로드 함수
function loadQuestion() {
  const currentQuiz = quizData[currentIndex];
  console.log(`--- 문제 ${currentIndex + 1} ---`);
  console.log('질문:', currentQuiz.question);
  console.log('진행도:', getProgress(currentIndex, quizData.length), '%');

  // 타이머 시작 (10초)
  const timer = new QuizTimer(
    10,
    (time) => console.log(`남은 시간: ${time}초`),
    () => {
      console.log('시간 초과!');
      const confirmBtn = document.querySelector('#check-btn');
      confirmBtn.disabled = false;
      nextStep();
    },
  );
  timer.start();
}

// 정답 선택 시 실행될 함수 (나중에 버튼 클릭과 연결)
function handleSelect(index) {
  const isCorrect = calculateScore(index, quizData[currentIndex].answer);
  if (isCorrect) {
    totalScore += 10;
    console.log('정답입니다! 현재 점수:', totalScore);
  } else {
    console.log('오답입니다.');
  }
  nextStep();
}

function nextStep() {
  currentIndex++;
  if (currentIndex < quizData.length) {
    loadQuestion();
  } else {
    console.log('모든 문제를 풀었습니다! 최종 점수:', totalScore);
  }
}

// 실행
initGame();
