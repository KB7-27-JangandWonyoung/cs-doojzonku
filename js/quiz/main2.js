import { checkIsCorrect, calculateProgress} from './utils.js'

let quizData = [];
let currentIndex = 0;
let selectedOptionIndex = null;

let correctCount = 0;
let selectedIngredients = [];
const goodIngredients = ["카다이프", "2", "3", "4", "5", "6", "7", "8", "9", "10" ]
const badIngredients = ["소면", "2-2", "3-2", "4-2", "5-2", "6-2", "7-2", "8-2", "9-2", "10-2"]

//HTML 요소 선택
const questionText = document.querySelector('.question-text');
const codeBlock = document.querySelector('.code-block');
const optionButtons = document.querySelectorAll('.option-button');
const confirmBtn = document.querySelector('.bottom-confirm-btn');
const explanationArea = document.querySelector('.explanation-area');
const explanationText = document.querySelector('.explanation-text');
const vsImage = document.querySelector('.vs-image');
const progressBar = document.querySelector('.progress-fill');

// 토스트 메시지 함수(오디오 상태관리 추후 추가!!)
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);

    }, 2000)
}
//1. 데이터 로드
async function init() {
    try {
        const response = await fetch('../../data/questions.json'); // 상대 경로 확인 필요
        quizData = await response.json();
        loadQuestion();
    } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
    }
}

//2. 문제 출력
function loadQuestion() {
    const currentQuiz = quizData[currentIndex];

    //UI 초기화
    selectedOptionIndex = null;
    explanationArea.style.display = 'none';
    confirmBtn.textContent = "정답 확인하기";

    // 스크롤 초기화 (다음 문제로 넘어갈 때 상단으로)
    document.querySelector('.quiz-scroll-container').style.overflowY = 'hidden';

    //데이터 바인딩
    questionText.textContent = currentQuiz.question;
    codeBlock.textContent = currentQuiz.code;
    progressBar.style.width = '&{calculateProgress(cureentIndex, quizData.length)}%'

    optionButtons.forEach((btn, idx) => {
        btn.textContent = currentQuiz.option[idx];
        btn.classList.remove('correct', 'wrong', 'active');
        btn.disabled = false;

        btn.onclick = () => {
            optionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedOptionIndex = idx;
        }
    })
}

//3. 결과 확인
confirmBtn.onclick = () => {
    if (selectedOptionIndex === null) {
        alert("정답을 골라주세요!");
        return;
    }

    // '다음 문제' 버튼으로 변했을 때의 동작
    if (confirmBtn.textContent === "다음 문제로 이동") {
        currentIndex++;
        if (currentIndex < quizData.length) {
            loadQuestion();
        } else {
            //최종 데이터 저장 후 이동
            const finalData = {
                totalCorrect: correctCount,
                ingredients: selectedIngredients,
                totalQuestions: quizData.length
            }
            localStorage.setItem('cookieResult', JSON.stringify(finalData));
            location.href = 'result.html';
        }
        return;
    }

    //정답 판별 및 UI 업데이트
    const currentQuiz = quizData[currentIndex];
    const isCorrect = checkIsCorrect(selectedOptionIndex, currentQuiz.answer);

    // --- 재료 및 토스트 로직 추가 ---
    let ingredient = "";
    if (isCorrect) {
        correctCount++;
        ingredient = goodIngredients[currentIndex % goodIngredients.length];
        showToast(`${ingredient}(이)가 들어갔습니다! ✨`);
    } else {
        ingredient = badIngredients[currentIndex % badIngredients.length];
        showToast(`이상한 재료(${ingredient})가 들어갔습니다... 🤢`);
    }
    selectedIngredients.push(ingredient);

    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === currentQuiz.answer) {
            btn.classList.add('correct'); // 정답
        } else if (idx === selectedOptionIndex && !isCorrect) {
            btn.classList.add('wrong'); // 내가 고른 오답
        }
    });

    //해설 노출 및 이미지 변경
    explanationText.textContent = currentQuiz.explanation;
    explanationArea.style.display = 'block';
    vsImage.src = isCorrect ? 'win.jpg' : 'lose.jpg'; // 경로 확인 필요

    //스크롤 허용(해설이 길 경우)
    document.querySelector('.quiz-scroll-container').style.overflowY = 'auto';

    confirmBtn.textContent = "다음 문제로 이동";
};

init();