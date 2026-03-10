/* 결과 페이지 전용 
    점수 표시, 다시 하기 로직
*/

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  // 1. 정답 정오표 가져오기
  const result = [
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
  ];

  const explanations = [
    '1번: 두쫀쿠는 빵을 정말 좋아해서 이름이 그렇게 붙었답니다.',
    '2번: 이 문제는 함정이었어요! 사실 정답은...2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione quod velit voluptatum praesentium optio commodi illo quae libero eaque eligendi corporis exercitationem aperiam eius et quam minus tempora corrupti omnis ab, quaerat sunt earum. Tempore repellendus, exercitationem incidunt culpa at doloribus omnis hic molestias facere quasi ipsa deserunt tempora corporis',
    '3번: 이 문제는 함정이었어요!\n 해설: color는 글자색을 바꿀 때 사용하며, 배경색을 바꿀 때는 background-color 속성을 사용해야 합니다.',
    '4번: 이 문제는 함정이었어요!\n 해설: 시각적인 차이는 없을지 몰라도, **웹 접근성(Accessibility)**과 SEO(검색 엔진 최적화) 측면에서 매우 중요합니다. 스크린 리더가 웹 페이지 구조를 파악하거나 검색 엔진이 핵심 내용을 수집할 때 <div>만 가득한 코드보다 <main>, <article>, <section> 등이 잘 짜인 코드를 훨씬 높게 평가합니다.',
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
  let sound;

  // 1. 점수별 사운드 선택
  if (score >= 7) {
    sound = document.getElementById('bgm_success');
  } else {
    sound = document.getElementById('bgm_fail');
  }

  if (sound) {
    sound.volume = 0.5; // 볼륨 조절 (0.0 ~ 1.0)
    sound.currentTime = 0; // 혹시 모르니 처음부터 재생되도록 초기화

    // 2. 재생 시도
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log('사운드 재생 대기 중...');
        document.body.addEventListener(
          'click',
          () => {
            sound.play();
          },
          { once: true },
        );
      });
    }
  }
}
