/* 메인 페이지 전용 */
const bgm = new Audio('assets/bgm.mp3'); // 배경음악
bgm.loop = true;

window.onload = function () {
  bgm.play().catch(() => {
    // 브라우저 정책상 자동재생 차단 시, 첫 클릭 때 재생 시작
    window.addEventListener('click', () => bgm.play(), { once: true });
  });
};

function playClickSound() {
  var clickSound = new Audio('../assets/click-sound.mp3');
  clickSound.play();
  setTimeout(function () {
    location.href = 'quiz.html';
  }, 100);
}
