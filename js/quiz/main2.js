import { checkIsCorrect, calculateProgress } from './utils.js';

let quizData = [];
let currentIndex = 0;
let selectedOptionIndex = null;
let correctCount = 0;
let userResults = []; // 3번 요구사항: 맞혔는지 여부 저장
let timerId;
const goodIngredients = [
  '카다이프',
  '피스타치오',
  '올리브오일',
  '화이트초콜릿',
  '마시멜로우',
  '버터',
  '약불',
  '코코아 파우더',
  '코코아 가루 묻히기',
  '마시멜로우 잘 감싸기',
];
const badIngredients = [
  '소면',
  '고추냉이',
  '참기름',
  '두부',
  '엿',
  '바나나',
  '강불',
  '흑임자가루',
  '코코아 가루 폭발',
  '반죽 분해',
];

// HTML 요소 선택
const questionText = document.querySelector('.question');
const codeBlock = document.querySelector('.code-box code');
const optionButtons = document.querySelectorAll('.option-item');
const confirmBtn = document.querySelector('#check-btn');
const progressBar = document.querySelector('.progress-fill');
const itemIcons = document.querySelector('.item-icons');
const ingredientCountText = document.querySelector('.info-box div'); // 1번: 재료 수 표시 영역
const characterImg = document.querySelector('.character-circle img');
const productImg = document.querySelector('.product-image img');
const explanationSection = document.querySelector('.explanation-section');
const explanationText = document.querySelector('.explanation-text');
function timeAttack() {
  let timeLeft = 10;
  const timeDisplay = document.querySelector('.time-attack a');
  timeDisplay.textContent = timeLeft;
  timerId = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      stopTimer(timerId);
      confirmBtn.click();
    }
  }, 1000);
}

function stopTimer(timerId) {
  if (timerId !== null) {
    clearInterval(timerId);
  }
}
// 1. 초기화
async function init() {
  try {
    const response = await fetch('./data/questions.json');
    const data = await response.json();
    quizData = data.quizList;

    if (quizData.length > 0) {
      explanationSection.style.display = 'none';
      loadQuestion();
      updateIngredients(0);
    }
  } catch (error) {
    console.error('로드 실패:', error);
  }
}

// 2. 문제 로드
function loadQuestion() {
  timeAttack(); // 타이머 시작
  const currentQuiz = quizData[currentIndex];
  selectedOptionIndex = null;
  confirmBtn.textContent = '정답 확인하기';
  // 새 문제 로드 시 해설창 다시 숨김
  explanationSection.style.display = 'none';

  // 상단 재료 텍스트 업데이트 (1번 요구사항)
  ingredientCountText.innerHTML = `재료<br />${currentIndex + 1} / ${quizData.length}`;

  questionText.textContent = currentQuiz.question;

  const codeBox = document.querySelector('.code-box');
  if (currentQuiz.code) {
    codeBox.style.display = 'block';
    codeBlock.textContent = currentQuiz.code;
  } else {
    codeBox.style.display = 'none';
  }

  if (characterImg) characterImg.src = currentQuiz.characterImg;
  if (productImg) productImg.src = currentQuiz.productImg;

  progressBar.style.width = `${calculateProgress(currentIndex, quizData.length)}%`;

  optionButtons.forEach((btn, idx) => {
    btn.querySelector('.option-text').textContent = currentQuiz.options[idx];
    btn.classList.remove('active', 'correct', 'wrong', 'disabled'); // 클래스 모두 제거
    btn.disabled = false;
    btn.onclick = () => {
      optionButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedOptionIndex = idx;
    };
  });
}

// 3. 결과 확인
confirmBtn.onclick = () => {
  stopTimer(timerId); // 타이머 중지
  if (selectedOptionIndex === null) {
    alert('정답을 골라주세요!');
    return;
  }

  if (confirmBtn.textContent === '다음 문제로 이동') {
    currentIndex++;
    if (currentIndex < quizData.length) {
      loadQuestion();
      window.scrollTo(0, 0); // 상단으로 스크롤 복구
    } else {
      // 2, 3번 요구사항: 데이터 저장 후 이동
      localStorage.setItem('quizResults', JSON.stringify(userResults));
      location.href = 'result.html';
    }
    return;
  }

  const currentQuiz = quizData[currentIndex];
  const isCorrect = checkIsCorrect(selectedOptionIndex, currentQuiz.answer);

  // 3번: 결과 데이터 기록
  userResults.push({
    id: currentQuiz.id,
    isCorrect: isCorrect,
  });

  addIngredientIcon(isCorrect);

  // 4번: 토스트 메시지 출력
  if (isCorrect) {
    correctCount++;
    showToast(`✨ ${goodIngredients[currentIndex % 10]} 추가!`, true);
  } else {
    showToast(`🤢 ${badIngredients[currentIndex % 10]} 투입...`, false);
  }

  // 5번: 정답 확인 시 해설 노출 및 스크롤
  explanationText.textContent = currentQuiz.explanation;
  explanationSection.style.display = 'block';

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuiz.answer) {
      // 정답인 버튼에 .correct 클래스 추가 (안내 문구 자동 노출)
      btn.classList.add('correct');
    } else if (idx === selectedOptionIndex && !isCorrect) {
      // 내가 선택한게 오답일 때 .wrong 클래스 추가
      btn.classList.add('wrong');
    } else {
      btn.classList.add('disabled');
    }
  });

  confirmBtn.textContent = '다음 문제로 이동';
};

// 4번: 토스트 메시지 함수
function showToast(message, isGood) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '150px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = isGood ? '#28a745' : '#dc3545';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '20px';
  toast.style.zIndex = '1000';
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function addIngredientIcon(isCorrect) {
  const img = document.createElement('img');

  // 맞으면 성공 이미지, 틀리면 실패 이미지
  img.src = isCorrect ? 'asset/img_correct.png' : 'asset/img_wrong.png';

  img.style.width = '30px';
  img.style.marginRight = '5px';

  itemIcons.appendChild(img);
}

init();
