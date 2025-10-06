import { loadStage } from "./core/questionBank.js";
import { spawnController } from "./core/spawnController.js";
import { renderCardTower, markStageCleared } from "./ui/cardTower.js";
import { loadState, updateState, setLastStageId } from "./core/gameState.js";
import { prepareAnswer } from "./ui/inputHandler.js";

export async function start(stageId){
  const state = loadState();
  if (!stageId) {
    // 初期: カードタワー
    const root = document.getElementById('tower');
    renderCardTower({ rootEl: root, onSelectStage: (id) => start(id) });
    return;
  }

  setLastStageId(stageId);
  const grid = document.getElementById('grid');
  const answer = document.getElementById('answer');
  const fire = document.getElementById('fire');
  const scoreEl = document.getElementById('score');
  const lifeEl = document.getElementById('life');
  const selectedEl = document.getElementById('selected');

  let combo = 0;
  let lives = Number(lifeEl?.textContent || '3') || 3;
  let score = Number(scoreEl?.textContent || '0') || 0;

  // ステージJSONを取得
  const res = await fetch(`data/stages/${stageId}.json`);
  if (!res.ok) throw new Error(`stage not found: ${stageId}`);
  const json = await res.json();
  const questions = await loadStage(json);

  function addScore(base){
    const gained = base + Math.min(combo * 10, 100);
    score += gained;
    if (scoreEl) scoreEl.textContent = String(score);
  }

  function gameOver(){
    const msg = document.getElementById('message');
    if (msg) msg.textContent = 'GAME OVER';
    updateState({ lives: 0, score });
  }

  function onCorrect(){
    combo += 1;
    addScore(json.rules?.scorePerHit ?? 100);
    selectedEl && (selectedEl.textContent = "SELECTED: なし");
    if (grid.children.length === 0){
      // クリア
      markStageCleared(stageId);
      const msg = document.getElementById('message');
      if (msg) msg.textContent = 'CLEAR!';
      renderCardTower({ rootEl: document.getElementById('tower'), onSelectStage: (id) => start(id) });
    }
  }

  function onWrong(){
    combo = 0;
    lives -= 1;
    if (lifeEl) lifeEl.textContent = String(lives);
    if (lives <= 0) return gameOver();
  }

  const ctrl = spawnController({
    rootEl: grid,
    questions,
    cols: json.enemySet?.cols ?? 5,
    descendSpeed: json.enemySet?.descendSpeed ?? 1,
    spawnIntervalSec: json.enemySet?.spawnIntervalSec ?? 2.5,
    bottomY: 300,
    onBottomReached: () => gameOver(),
    onCorrect,
    onWrong
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.enemy');
    if (!btn) return;
    ctrl.lock(btn);
    selectedEl && (selectedEl.textContent = 'SELECTED: ' + btn.textContent);
    answer && answer.focus();
  });

  function submit(){
    const selected = ctrl.getSelected?.();
    if (!selected || !selected.isConnected) return;
    const needRem = selected.dataset.remainder != null;
    const normalized = prepareAnswer(answer.value, { needRemainder: needRem });
    if (normalized == null) return;
    const ok = ctrl.submit(normalized);
    if (ok) answer.value = '';
  }

  if (fire) fire.addEventListener('click', submit);
  if (answer) answer.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
}

if (typeof document !== 'undefined'){
  document.addEventListener('DOMContentLoaded', () => start());
}
