import { checkIsCorrect, calculateProgress } from './utils.js';

let quizData = [];
let currentIndex = 0;
let selectedOptionIndex = null;
let correctCount = 0;
let userResults = []; // 결과 페이지로 넘길 데이터

const goodIngredients = [
  '카다이프',
  '피스타치오',
  '버터',
  '설탕',
  '초콜릿',
  '우유',
  '바닐라',
  '꿀',
  '시럽',
  '캔디',
];
const badIngredients = [
  '소면',
  '간장',
  '쌈장',
  '식초',
  '고추장',
  '겨자',
  '후추',
  '소금',
  '까나리',
  '고추',
];

// HTML 요소 선택
const questionText = document.querySelector('.question');
const codeBlock = document.querySelector('.code-box code');
const optionButtons = document.querySelectorAll('.option-item');
const confirmBtn = document.querySelector('#check-btn');
const progressBar = document.querySelector('.progress-fill');
const itemIcons = document.querySelector('.item-icons');
const ingredientText = document.querySelector('.info-box div'); // "재료 1 / 10" 부분
const characterImg = document.querySelector('.character-circle img');
const productImg = document.querySelector('.product-image img');

// 해설 관련 요소 (HTML에 추가된 클래스 사용)
const explanationSection = document.querySelector('.explanation-section');
const explanationText = document.querySelector('.explanation-text');

// 1. 초기화
async function init() {
  try {
    const response = await fetch('./data/questions.json');
    const data = await response.json();
    quizData = data.quizList;

    if (quizData && quizData.length > 0) {
      loadQuestion();
      updateIngredients(0);
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
}

// 2. 문제 로드
function loadQuestion() {
  const currentQuiz = quizData[currentIndex];
  selectedOptionIndex = null;
  confirmBtn.textContent = '정답 확인하기';

  // 해설창 초기화 (숨김)
  explanationSection.style.display = 'none';

  // 재료 수 텍스트 업데이트 (요구사항 1번)
  ingredientText.innerHTML = `재료<br />${currentIndex + 1} / ${quizData.length}`;

  questionText.textContent = currentQuiz.question;

  const codeBox = document.querySelector('.code-box');
  if (currentQuiz.code) {
    codeBox.style.display = 'block';
    codeBlock.textContent = currentQuiz.code;
  } else {
    codeBox.style.display = 'none';
  }

  // 이미지 경로 업데이트 (asset -> assets 확인 필요)
  if (characterImg)
    characterImg.src = currentQuiz.characterImg.replace('asset/', 'assets/');
  if (productImg)
    productImg.src = currentQuiz.productImg.replace('asset/', 'assets/');

  progressBar.style.width = `${calculateProgress(currentIndex, quizData.length)}%`;

  optionButtons.forEach((btn, idx) => {
    btn.querySelector('.option-text').textContent = currentQuiz.options[idx];
    btn.classList.remove('active');
    btn.style.backgroundColor = '';
    btn.disabled = false;

    btn.onclick = () => {
      optionButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedOptionIndex = idx;
    };
  });
}

// 3. 정답 확인 및 결과 처리
confirmBtn.onclick = () => {
  if (selectedOptionIndex === null) {
    alert('정답을 골라주세요!');
    return;
  }

  if (confirmBtn.textContent === '다음 문제로 이동') {
    currentIndex++;
    if (currentIndex < quizData.length) {
      loadQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 상단으로 이동
    } else {
      // 결과 저장 및 이동 (요구사항 2, 3번)
      localStorage.setItem('quizResults', JSON.stringify(userResults));
      location.href = 'result.html';
    }
    return;
  }

  const currentQuiz = quizData[currentIndex];
  const isCorrect = checkIsCorrect(selectedOptionIndex, currentQuiz.answer);

  // 결과 기록 (요구사항 3번)
  userResults.push({
    id: currentQuiz.id,
    isCorrect: isCorrect,
    question: currentQuiz.question,
  });

  // 토스트 및 재료 업데이트 (요구사항 4번)
  if (isCorrect) {
    correctCount++;
    updateIngredients(correctCount);
    showToast(`✨ ${goodIngredients[currentIndex % 10]} 추가!`, true);
  } else {
    showToast(`🤢 ${badIngredients[currentIndex % 10]} 투입...`, false);
  }

  // 해설 노출 (요구사항 5번)
  explanationText.textContent = currentQuiz.explanation;
  explanationSection.style.display = 'block';

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuiz.answer) {
      btn.style.backgroundColor = '#d4edda'; // 정답
    } else if (idx === selectedOptionIndex && !isCorrect) {
      btn.style.backgroundColor = '#f8d7da'; // 오답
    }
  });

  confirmBtn.textContent = '다음 문제로 이동';

  // 해설 영역으로 부드럽게 스크롤 (요구사항 5번)
  setTimeout(() => {
    explanationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

// 4. 토스트 메시지 함수
function showToast(message, isGood) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  // 스타일링 (CSS에 넣어도 되지만 JS로 직접 제어)
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '120px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: isGood ? '#28a745' : '#dc3545',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '30px',
    zIndex: '1000',
    transition: 'opacity 0.5s',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 1500);
}

// 1. 재료 아이콘 렌더링 함수
function updateIngredients(count) {
  itemIcons.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.src = 'assets/img_correct.png'; // 경로 확인
    img.style.width = '28px';
    img.style.marginRight = '4px';
    itemIcons.appendChild(img);
  }
}

init();
