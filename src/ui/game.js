import { loadStage } from "../core/questionBank.js";
import { spawnController } from "../core/spawnController.js";

// ステージの順番（M1用の例）
const stageIds = [
  "heart_01","heart_02","heart_03",
  "spade_01","spade_02","spade_03",
  "club_01","club_02","club_03",
  "diamond_01","diamond_02","diamond_03"
];

let stagePtr = 0;
let score = 0, life = 3, timeLeft = 60, timerId = null;

const $grid = document.getElementById("grid");
const $answer = document.getElementById("answer");
const $fire = document.getElementById("fire");
const $next = document.getElementById("next");
const $score = document.getElementById("score");
const $life = document.getElementById("life");
const $time = document.getElementById("time");
const $stage = document.getElementById("stage");
const $selected = document.getElementById("selected");

let ctrl = null;

async function startStage() {
  const id = stageIds[stagePtr];
  const json = await (await fetch(`/data/stages/${id}.json`)).json();
  $stage.textContent = json.deckLabel;
  timeLeft = json.rules.timeLimitSec ?? 60;
  $time.textContent = timeLeft;
  life = json.rules.lives ?? 3;
  $life.textContent = life;
  $selected.textContent = "SELECTED: なし";

  const questions = await loadStage(json);
  ctrl = spawnController({
    rootEl: $grid,
    questions,
    onCorrect() {
      score += (json.rules.scorePerHit ?? 100);
      $score.textContent = score;
      $selected.textContent = "SELECTED: なし";
      if ($grid.children.length === 0) {
        clearInterval(timerId);
        $selected.textContent = "CLEAR! 次の面へ →";
      }
    },
    onWrong() {
      life -= 1;
      $life.textContent = life;
      if (life <= 0) {
        clearInterval(timerId);
        $selected.textContent = "GAME OVER…";
      }
    }
  });

  // タイマー
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    $time.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      $selected.textContent = "TIME UP";
    }
  }, 1000);
}

// クリックでロック→入力フォーカス
$grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".enemy");
  if (!btn) return;
  const f = btn.textContent;
  $selected.textContent = "SELECTED: " + f;
  $answer.focus();
});

// Enter/ボタンで判定
function fire() {
  const ok = ctrl?.submit($answer.value);
  if (ok) $answer.value = "";
}
$answer.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fire();
});
$fire.addEventListener("click", fire);

// 次の面
$next.addEventListener("click", async () => {
  stagePtr = (stagePtr + 1) % stageIds.length;
  await startStage();
});

// 起動
startStage();
