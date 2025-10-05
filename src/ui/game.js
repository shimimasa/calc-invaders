import { loadStage } from "../core/questionBank.js";
import { spawnController } from "../core/spawnController.js";

document.addEventListener("DOMContentLoaded", init);

function init() {
  // ---- DOM refs (このスコープ内でのみ使う) ----
  const $grid   = document.getElementById("grid");
  const $answer = document.getElementById("answer");
  const $fire   = document.getElementById("fire");
  const $next   = document.getElementById("next");
  const $score  = document.getElementById("score");
  const $life   = document.getElementById("life");
  const $time   = document.getElementById("time");
  const $stage  = document.getElementById("stage");
  const $selected = document.getElementById("selected");

  if (!$grid || !$answer || !$fire || !$next || !$score || !$life || !$time || !$stage || !$selected) {
    console.error("必須DOMが見つかりません。index.html のIDを確認してください。");
    return;
  }

  // ---- ゲーム状態 ----
  const stageIds = [
    "heart_01","heart_02","heart_03",
    "spade_01","spade_02","spade_03",
    "club_01","club_02","club_03",
    "diamond_01","diamond_02","diamond_03"
  ];
  let stagePtr = 0;
  let score = 0, life = 3, timeLeft = 60, timerId = null;
  let ctrl = null;

  // ---- ユーティリティ ----
  function disableControls(msg){
    $answer.disabled = true;
    $fire.disabled = true;
    if (msg) $selected.textContent = msg;
  }
  function enableControls(){
    $answer.disabled = false;
    $fire.disabled = false;
  }

  // ---- イベント結線 ----
  $grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".enemy");
    if (!btn) return;
    const f = btn.textContent;
    $selected.textContent = "SELECTED: " + f;
    $answer.focus();
  });

  function fire() {
    const ok = ctrl?.submit($answer.value);
    if (ok) $answer.value = "";
  }
  $answer.addEventListener("keydown", (e) => { if (e.key === "Enter") fire(); });
  $fire.addEventListener("click", fire);

  $next.addEventListener("click", async () => {
    stagePtr = (stagePtr + 1) % stageIds.length;
    await startStage();
  });

  // ---- ステージ開始 ----
  async function startStage() {
    try {
      const id = stageIds[stagePtr];
      const base = (import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/';
      const url  = `${base}data/stages/${id}.json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Stage JSON not found: ${id} (${res.status})`);
      const json = await res.json();

      $stage.textContent = json.deckLabel ?? id.toUpperCase();
      timeLeft = json.rules?.timeLimitSec ?? 60;
      $time.textContent = timeLeft;
      life = json.rules?.lives ?? 3;
      $life.textContent = life;
      $selected.textContent = "SELECTED: なし";
      enableControls();

      const questions = await loadStage(json);
      ctrl = spawnController({
        rootEl: $grid,
        questions,
        onCorrect() {
          score += (json.rules?.scorePerHit ?? 100);
          $score.textContent = score;
          $selected.textContent = "SELECTED: なし";
          if ($grid.children.length === 0) {
            clearInterval(timerId);
            disableControls("CLEAR! 次の面へ →");
          }
        },
        onWrong() {
          life -= 1;
          $life.textContent = life;
          if (life <= 0) {
            clearInterval(timerId);
            disableControls("GAME OVER…");
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
          disableControls("TIME UP");
        }
      }, 1000);
    } catch (e) {
      console.error(e);
      disableControls("ステージ読み込みに失敗。`npm run build:stages` / URL を確認してください。");
    }
  }

  // 起動
  startStage();
}
