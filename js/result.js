/* 결과 페이지 전용 
    점수 표시, 다시 하기 로직
*/

document.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();
  // 1. 정답 정오표 가져오기
  const rawData = localStorage.getItem('quizResults');
  const quizResult = JSON.parse(rawData);
  const result = [];
  const ingredients = [
    ['고소한 카다이프', '잔치국수 소면'],
    ['고급st 피스타치오', '코가 뻥 고추냉이'],
    ['이태리 오일', '엄마표 참기름'],
    ['달콤한 화이트 초콜릿', '다이어트 두부'],
    ['퐁신 마시멜로우', '딱딱한 엿가락'],
    ['5만원 버터', '5천원 바나나'],
    ['마시멜로우를 녹여요', '마시멜로우를 태워요'],
    ['달고 쓴 코코아파우더', '텁텁한 흑임자 가루'],
    ['코코아 파우더 묻히기', '재채기로 파우더 날려버리기'],
    ['예쁘고 둥글게 피 감싸기', '피가 다 터져버린 두쫀쿠'],
  ];

  let explanations = [];
  let questionsData = [];

  try {
    const response = await fetch('./data/questions.json');
    questionsData = await response.json();
  } catch (error) {
    console.error('데이터를 불러오는 도중 오류 발생: ', error);
  }

  const quizList = questionsData.quizList;

  for (let question of quizResult) {
    result.push(question.isCorrect);
    const matchedQuestion = quizList.find((q) => q.id === question.id);

    if (matchedQuestion) {
      explanations.push({
        answerNumber: matchedQuestion.answer,
        id: matchedQuestion.id,
        category: matchedQuestion.category,
        difficulty: matchedQuestion.difficulty,
        question: matchedQuestion.question,
        answer: matchedQuestion.options[matchedQuestion.answer], // 인덱스를 사용해 실제 정답 텍스트 추출
        explanation: matchedQuestion.explanation,
      });
    }
  }

  const quizItems = document.querySelectorAll('.quiz-item');

  quizItems.forEach((item, index) => {
    const isCorrect = result[index];
    item.classList.add(isCorrect ? 'correct' : 'incorrect');
    // 여기 고치면 될 듯.
    item.innerText = `${isCorrect ? ingredients[index][0] : ingredients[index][1]}`;
  });

  // 2. 점수 데이터 가져오기
  const score = result.filter((isCorrect) => isCorrect === true).length;
  const total = 10;

  // 2.1. 점수에 따른 bgm
  playResultSound(score);

  const scoreElement = document.getElementById('score-text');

  // [3] 그릇의 내용물(innerText)을 변수값으로 교체하기
  if (scoreElement) {
    scoreElement.innerText = `${score}/${total}`;
  }

  // 3. 화면 요소 선택
  const scoreDisplay = document.getElementById('score-text');
  const stars = document.querySelectorAll('#stars [data-lucide="star"]');
  const titleText = document.querySelector('#description h3');
  const subText = document.querySelector('#description h4');
  const retryBtn = document.getElementById('retry_button');
  const dzkImage = document.querySelector('#dzk-image');

  // 4. 점수 반영 실행
  updateResultUI(
    score,
    total,
    scoreDisplay,
    stars,
    titleText,
    subText,
    dzkImage,
  );

  // 5. 메인화면으로 복귀
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // 6. 각 문제 해설 보기
  const modal = document.getElementById('modal_overlay');
  const modalTitle = document.getElementById('modal_title');
  const closeBtn = document.getElementById('close_modal');

  const answerNumber = document.querySelector('.ans-label');
  const answerCode = document.getElementById('modal_answer_code');
  const explanationText = document.getElementById('modal_explanation_text');

  quizItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      const data = explanations[index];

      // 1. 제목 및 배너 설정
      modalTitle.innerText = `${data.id}번 문제 해설`;

      // 3. 문제 및 정답 (innerText를 써야 HTML 태그가 글자로 나옵니다!)
      answerNumber.innerText = data.answerNumber;
      answerCode.innerText = data.answer;

      // 4. 해설
      explanationText.innerText = data.explanation;
      // 모달 보이기
      modal.classList.remove('hidden');
    });
  });

  // 2. 닫기 버튼 클릭 이벤트
  closeBtn.onclick = () => {
    modal.classList.add('hidden');
  };

  // 3. 배경 클릭해도 닫히게
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.classList.add('hidden');
    }
  };
});

/* 점수에 따라 UI를 업데이트하는 함수 */

function updateResultUI(score, total, display, stars, title, sub, dzkImage) {
  if (display) display.innerText = `${score}/${total}`;

  // 별점 채우기 (2점당 1개)
  const filledCount = Math.floor(score / 2);
  stars.forEach((star, index) => {
    if (index < filledCount) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });

  // 멘트 분기
  if (score >= 7) {
    title.innerText = '✨ 환상의 팡쫀쿠! ✨';
    sub.innerText = '두쫀쿠가 요리 실력을 인정받아 행복해합니다!';
    dzkImage.src = 'assets/happy_boy_cookie.gif';
  } else if (score >= 5) {
    title.innerText = '음, 나쁘지 않네요.';
    sub.innerText = '조금 더 연습하면 훌륭한 팡쫀쿠가 될 거예요.';
    dzkImage.src = 'assets/subtle_boy_cookie.gif';
  } else {
    title.innerText = '이건 팡쫀쿠가 아닌데..';
    sub.innerText = '너무 맛이 없어서 먹지 못하겠어요...';
    dzkImage.src = 'assets/angry_boy_cookie.gif';
  }
}

/**
 * 결과 점수에 따라 BGM을 1회 재생하는 함수
 */
function playResultSound(score) {
  const soundId = score >= 7 ? 'bgm_success' : 'bgm_fail';
  const sound = document.getElementById(soundId);

  if (!sound) return;

  sound.volume = 0.5;

  sound.play().catch(() => {
    console.log('자동 재생 차단됨 -> 클릭 대기 중');
    window.addEventListener('click', () => sound.play(), { once: true });
  });
}

window.onload = () => playResultSound(score);
