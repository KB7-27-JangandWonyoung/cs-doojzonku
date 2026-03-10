/* 결과 페이지 전용 
    점수 표시, 다시 하기 로직
*/

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  // 1. 정답 정오표 가져오기
  const result = [true, true, true, true, true, true, false, true, true, false];

  const explanations = [
    '1번: 두쫀쿠는 빵을 정말 좋아해서 이름이 그렇게 붙었답니다.',
    '2번: 이 문제는 함정이었어요! 사실 정답은...2',
    '3번: 이 문제는 함정이었어요! 사실 정답은...3',
    '4번: 이 문제는 함정이었어요! 사실 정답은...4',
    '5번: 이 문제는 함정이었어요! 사실 정답은...5',
    '6번: 이 문제는 함정이었어요! 사실 정답은...6',
    '7번: 이 문제는 함정이었어요! 사실 정답은...7',
    '8번: 이 문제는 함정이었어요! 사실 정답은...8',
    '9번: 이 문제는 함정이었어요! 사실 정답은...9',
    '10번: 이 문제는 함정이었어요! 사실 정답은...10',
  ];

  const quizItems = document.querySelectorAll('.quiz-item');

  quizItems.forEach((item, index) => {
    const isCorrect = result[index];
    item.classList.add(isCorrect ? 'correct' : 'incorrect');
  });

  // 2. 점수 데이터 가져오기
  // (나중에 localStorage에서 가져오게 변경 가능)
  const score = result.filter((isCorrect) => isCorrect === true).length;
  const total = 10;

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
  const expText = document.getElementById('explanation_text');
  const modalTitle = document.getElementById('modal_title');
  const closeBtn = document.getElementById('close_modal');

  quizItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      // 내용 채우기
      modalTitle.innerText = `${index + 1}번 문제 해설`;
      expText.innerText = explanations[index] || '해설 준비 중입니다!';

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

/**
 * 점수에 따라 UI를 업데이트하는 함수
 */

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
    dzkImage.src = '/assets/gif/happy_boy_cookie.gif';
  } else if (score >= 5) {
    title.innerText = '음, 나쁘지 않네요.';
    sub.innerText = '조금 더 연습하면 훌륭한 팡쫀쿠가 될 거예요.';
    dzkImage.src = '/assets/gif/boy_cookie_subtle.gif';
  } else {
    title.innerText = '이건 팡쫀쿠가 아닌데..';
    sub.innerText = '너무 맛이 없어서 먹지 못하겠어요...';
    dzkImage.src = '/assets/gif/boy_cookie_animation.gif';
  }
}
