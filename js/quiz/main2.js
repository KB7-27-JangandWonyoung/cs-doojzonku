import { checkIsCorrect, calculateProgress } from './utils.js';

let quizData = [];
let currentIndex = 0;
let selectedOptionIndex = null;
let correctCount = 0;
let userResults = [];
let timerId = null;

// 🎵 오디오 객체 설정
const bgm = new Audio('assets/main-bgm.mp3'); // 배경음악
bgm.loop = true;
const clickSound = new Audio('assets/click-sound.mp3'); // 클릭 효과음

const goodIngredients = [
  '카다이프',
  '피스타치오',
  '올리브오일',
  '화이트초콜릿',
  '마시멜로우',
  '버터',
  '약불',
  '코코아 파우더',
  '금손',
  '금손',
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
  '똥손',
  '똥손',
];

// HTML 요소 선택
const questionText = document.querySelector('.question');
const questionCategory = document.querySelector('.badge');
const codeBlock = document.querySelector('.code-box code');
const optionButtons = document.querySelectorAll('.option-item');
const confirmBtn = document.querySelector('#check-btn');
const progressBar = document.querySelector('.progress-fill');
const itemIcons = document.querySelector('.item-icons');
const ingredientCountText = document.querySelector('.info-box div');
const characterImg = document.querySelector('.character-circle img');
const productImg = document.querySelector('.product-image img');
const explanationSection = document.querySelector('.explanation-section');
const explanationText = document.querySelector('.explanation-text');

// 🔊 효과음 재생 함수 (연속 클릭 시 소리가 겹치도록 초기화 포함)
function playEffect() {
  clickSound.currentTime = 0;
  clickSound.play();
}

// [타이머 함수]
function timeAttack() {
  let timeLeft = 10;
  const timeDisplay = document.querySelectorAll('.info-box div')[1];

  if (timeDisplay) timeDisplay.innerHTML = `남은 시간<br />${timeLeft} 초`;
  if (timerId) clearInterval(timerId);

  timerId = setInterval(() => {
    timeLeft--;
    if (timeDisplay) timeDisplay.innerHTML = `남은 시간<br />${timeLeft} 초`;

    if (timeLeft <= 0) {
      stopTimer();
      handleResult();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

// 1. 초기화 (BGM 자동 재생 로직 포함)
async function init() {
  // 이전 페이지에서 음악이 켜져 있었다면 재생 (기본값 on)
  const bgmStatus = localStorage.getItem('bgmStatus') || 'on';
  if (bgmStatus === 'on') {
    bgm.play().catch(() => {
      // 브라우저 정책상 자동재생 차단 시, 첫 클릭 때 재생 시작
      window.addEventListener('click', () => bgm.play(), { once: true });
    });
  }

  try {
    const response = await fetch('./data/questions.json');
    const data = await response.json();
    quizData = data.quizList;

    if (quizData.length > 0) {
      explanationSection.style.display = 'none';
      loadQuestion();
    }
  } catch (error) {
    console.error('로드 실패:', error);
  }
}

// 2. 문제 로드
function loadQuestion() {
  const currentQuiz = quizData[currentIndex];
  selectedOptionIndex = null;
  confirmBtn.textContent = '정답 확인하기';
  explanationSection.style.display = 'none';

  timeAttack();

  ingredientCountText.innerHTML = `재료<br />${currentIndex + 1} / ${quizData.length}`;
  questionText.textContent = currentQuiz.question;
  questionCategory.textContent = `</> ${currentQuiz.category}`;

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
    btn.classList.remove('active', 'correct', 'wrong', 'disabled');
    btn.disabled = false;
    btn.style.color = 'black';

    btn.onclick = () => {
      playEffect(); // ✅ 선지 클릭 효과음
      optionButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedOptionIndex = idx;
      confirmBtn.disabled = false;
      confirmBtn.style.backgroundColor = 'var(--dark-brown)';
    };
  });
}

// 3. 버튼 클릭 이벤트
confirmBtn.onclick = () => {
  playEffect(); // ✅ 버튼 클릭 효과음

  if (confirmBtn.textContent === '다음 문제로 이동') {
    currentIndex++;
    if (currentIndex < quizData.length) {
      loadQuestion();
      window.scrollTo(0, 0);
      confirmBtn.disabled = true;
      confirmBtn.style.backgroundColor = '#d1d1d1';
    } else {
      localStorage.setItem('quizResults', JSON.stringify(userResults));
      location.href = 'result.html';
    }
    return;
  }

  stopTimer();
  handleResult();
};

// [핵심] 결과 처리 로직
function handleResult() {
  const currentQuiz = quizData[currentIndex];
  const isCorrect =
    selectedOptionIndex !== null &&
    checkIsCorrect(selectedOptionIndex, currentQuiz.answer);

  userResults.push({ id: currentQuiz.id, isCorrect: isCorrect });
  addIngredientIcon(isCorrect);

  if (isCorrect) {
    correctCount++;
    showToast(`✨ ${goodIngredients[currentIndex % 10]} 추가!`, true);
  } else {
    const msg =
      selectedOptionIndex === null
        ? `⏰ 시간 초과! 🤢 ${badIngredients[currentIndex % 10]} 투입...`
        : `🤢 ${badIngredients[currentIndex % 10]} 투입...`;
    showToast(msg, false);
  }

  explanationText.textContent = currentQuiz.explanation;
  explanationSection.style.display = 'block';
  confirmBtn.disabled = false;
  confirmBtn.style.backgroundColor = 'var(--dark-brown)';

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    btn.style.color = 'black';
    if (idx === currentQuiz.answer) {
      btn.classList.add('correct');
    } else if (idx === selectedOptionIndex && !isCorrect) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('disabled');
    }
  });

  confirmBtn.textContent = '다음 문제로 이동';
}

// 4. 기타 지원 함수
function showToast(message, isGood) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '150px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: isGood ? '#28a745' : '#dc3545',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '30px',
    zIndex: '1000',
    transition: 'all 0.5s',
  });
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function addIngredientIcon(isCorrect) {
  const img = document.createElement('img');
  img.src = isCorrect ? 'asset/img_correct.png' : 'asset/img_wrong.png';
  img.style.width = '30px';
  img.style.marginRight = '5px';
  itemIcons.appendChild(img);
}

init();
