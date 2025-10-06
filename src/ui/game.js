import { loadStage } from "../core/questionBank.js";
import { spawnController } from "../core/spawnController.js";
import { prepareAnswer } from "./inputHandler.js";

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
  const $rank   = document.getElementById("rank");
  const $pattern = document.getElementById("pattern");

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
  function setSelectionTextFrom(el){
    if (!el) { $selected.textContent = "SELECTED: なし"; return; }
    const f = el.textContent;
    $selected.textContent = "SELECTED: " + f;
  }

  // ---- クリック選択 ----
  $grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".enemy");
    if (!btn) return;
    ctrl?.lock(btn);
    setSelectionTextFrom(btn);
    $answer.focus();
  });

  // ---- キーボード選択 (矢印/Enter/Esc) ----
  document.addEventListener("keydown", (e) => {
    const children = [...$grid.children];
    if (children.length === 0) return;
    const cols = 5; // index.html のグリッド列数に一致
    const current = ctrl?.getSelected?.();
    let idx = current ? children.indexOf(current) : -1;

    if (e.key === "ArrowRight") { idx = Math.min(children.length - 1, (idx < 0 ? 0 : idx + 1)); }
    else if (e.key === "ArrowLeft") { idx = Math.max(0, (idx < 0 ? 0 : idx - 1)); }
    else if (e.key === "ArrowDown") { idx = Math.min(children.length - 1, (idx < 0 ? 0 : idx + cols)); }
    else if (e.key === "ArrowUp") { idx = Math.max(0, (idx < 0 ? 0 : idx - cols)); }
    else if (e.key === "Enter") { e.preventDefault(); return $fire.click(); }
    else if (e.key === "Escape") { ctrl?.clear?.(); setSelectionTextFrom(null); return; }
    else if (e.key === "[") { e.preventDefault(); stagePtr = (stagePtr - 1 + stageIds.length) % stageIds.length; return startStage(); }
    else if (e.key === "]") { e.preventDefault(); stagePtr = (stagePtr + 1) % stageIds.length; return startStage(); }
    else if (e.key?.toLowerCase() === "p") { e.preventDefault(); togglePause(); return; }
    else { return; }

    e.preventDefault();
    const el = children[idx];
    if (el) { ctrl?.lock(el); setSelectionTextFrom(el); el.focus(); }
  });

  // ---- 判定 ----
  function fire() {
    const selected = ctrl?.getSelected?.();
    if (!selected || !selected.isConnected) return; // 未選択ガード
    const needRem = selected?.dataset?.remainder != null;
    const normalized = prepareAnswer($answer.value, {
      needRemainder: needRem,
      onInputError(msg){
        // 簡易エラー表示フック: 下部テキストに表示
        const prev = $selected.textContent;
        $selected.textContent = `ERROR: ${msg}`;
        setTimeout(() => { if ($selected.textContent.startsWith('ERROR:')) $selected.textContent = prev; }, 1200);
      }
    });
    if (normalized == null) return;
    const ok = ctrl?.submit(normalized);
    if (ok) $answer.value = "";
  }
  let isPaused = false;
  function togglePause(){
    isPaused = !isPaused;
    if (isPaused) { ctrl?.pause?.(); disableControls("PAUSED"); }
    else { ctrl?.resume?.(); enableControls(); }
  }
  $answer.addEventListener("keydown", (e) => { if (e.key === "Enter") fire(); });
  $fire.addEventListener("click", fire);

  // ---- ステージ切替 ----
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
      // rank表示とパターンツールチップ
      const suitName = (json.mark === 'heart' ? 'HEART' : json.mark === 'spade' ? 'SPADE' : json.mark === 'club' ? 'CLUB' : json.mark === 'diamond' ? 'DIAMOND' : '').trim();
      if ($rank) $rank.textContent = suitName && json.rank ? `${suitName} ${json.rank}` : '';
      if ($pattern) $pattern.textContent = json.generator?.pattern ? String(json.generator.pattern) : '';
      enableControls();

      const questions = await loadStage(json);
      ctrl = spawnController({
        rootEl: $grid,
        questions,
        cols: json.enemySet?.cols ?? 5,
        descendSpeed: json.enemySet?.descendSpeed ?? 1,
        spawnIntervalSec: json.enemySet?.spawnIntervalSec ?? 2.5,
        onCorrect() {
          score += (json.rules?.scorePerHit ?? 100);
          $score.textContent = score;
          $selected.textContent = "SELECTED: なし";
          if ($grid.children.length === 0) {
            clearInterval(timerId);
            timerId = null;
            disableControls("CLEAR! 次の面へ →");
          }
        },
        onWrong() {
          life -= 1;
          $life.textContent = life;
          if (life <= 0) {
            clearInterval(timerId);
            timerId = null;
            disableControls("GAME OVER…");
          }
        }
      });

      // タイマー
      clearInterval(timerId);
      timerId = setInterval(() => {
        timeLeft = Math.max(0, timeLeft - 1);
        $time.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timerId);
          timerId = null;
          disableControls("TIME UP");
          ctrl?.stop?.();
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
