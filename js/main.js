/* 메인 페이지 전용 */

window.onload = function () {
  var bgm = new Audio('../assets/main-bgm.mp3');
  bgm.loop = true;
  bgm.play();
};

function playClickSound() {
  var clickSound = new Audio('../assets/click-sound.mp3');
  clickSound.play();
  setTimeout(function () {
    location.href = 'quiz.html';
  }, 100);
}
