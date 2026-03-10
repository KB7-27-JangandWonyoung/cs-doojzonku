import { checkIsCorrect, calculateProgress } from './utils.js';

let quizData = [];
let currentIndex = 0;
let selectedOptionIndex = null;
let correctCount = 0;
let userResults = []; 
let timerId = null;

const goodIngredients = ['카다이프', '피스타치오', '올리브오일', '화이트초콜릿', '마시멜로우', '버터', '약불', '코코아 파우더', '코코아 가루 묻히기', '마시멜로우 잘 감싸기'];
const badIngredients = ['소면', '고추냉이', '참기름', '두부', '엿', '바나나', '강불', '흑임자가루', '코코아 가루 폭발', '반죽 분해'];

// HTML 요소 선택
const questionText = document.querySelector('.question');
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

// [타이머 함수] 시간 초과 시 handleResult를 직접 실행
function timeAttack() {
    let timeLeft = 10;
    const timeDisplay = document.querySelector('.quiz-header .info-box:last-child div'); 
    
    if (timeDisplay) timeDisplay.innerHTML = `남은 시간<br />${timeLeft} 초`;
    
    if (timerId) clearInterval(timerId);

    timerId = setInterval(() => {
        timeLeft--;
        if (timeDisplay) timeDisplay.innerHTML = `남은 시간<br />${timeLeft} 초`;
        
        if (timeLeft <= 0) {
            stopTimer();
            // 선지를 고르지 않았더라도 결과 처리 함수로 바로 진입
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

// 1. 초기화
async function init() {
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

    // 타이머 시작
    timeAttack();

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
        btn.classList.remove('active', 'correct', 'wrong', 'disabled');
        btn.disabled = false;
        btn.style.color = 'black'; // 글자색 초기화
        btn.onclick = () => {
            optionButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            selectedOptionIndex = idx;
        };
    });
}

// 3. 버튼 클릭 이벤트
confirmBtn.onclick = () => {
    // 이미 결과 확인 후 '다음' 버튼인 경우
    if (confirmBtn.textContent === '다음 문제로 이동') {
        currentIndex++;
        if (currentIndex < quizData.length) {
            loadQuestion();
            window.scrollTo(0, 0);
        } else {
            localStorage.setItem('quizResults', JSON.stringify(userResults));
            location.href = 'result.html';
        }
        return;
    }

    // 아직 문제를 풀지 않았는데 버튼을 누른 경우
    if (selectedOptionIndex === null) {
        alert('정답을 골라주세요!');
        return;
    }

    // 정상 클릭 시 타이머 중지 후 결과 처리
    stopTimer();
    handleResult();
};

// [핵심] 결과 처리 로직 (버튼 클릭 & 시간 초과 공용)
function handleResult() {
    const currentQuiz = quizData[currentIndex];
    
    // selectedOptionIndex가 null이면 checkIsCorrect는 false를 반환함
    const isCorrect = selectedOptionIndex !== null && checkIsCorrect(selectedOptionIndex, currentQuiz.answer);

    userResults.push({
        id: currentQuiz.id,
        isCorrect: isCorrect,
    });

    addIngredientIcon(isCorrect);

    if (isCorrect) {
        correctCount++;
        showToast(`✨ ${goodIngredients[currentIndex % 10]} 추가!`, true);
    } else {
        const msg = selectedOptionIndex === null ? `⏰시간 초과! 🤢${badIngredients[currentIndex % 10]} 투입...` : `🤢 ${badIngredients[currentIndex % 10]} 투입...`;
        showToast(msg, false);
    }

    explanationText.textContent = currentQuiz.explanation;
    explanationSection.style.display = 'block';

    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        btn.style.color = 'black'; 
        
        if (idx === currentQuiz.answer) {
            btn.classList.add('correct'); // 정답 표시
        } else if (idx === selectedOptionIndex && !isCorrect) {
            btn.classList.add('wrong'); // 선택한 오답 표시
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
        position: 'fixed', bottom: '150px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: isGood ? '#28a745' : '#dc3545', color: 'white',
        padding: '10px 20px', borderRadius: '20px', zIndex: '1000'
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