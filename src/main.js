import { loadStage } from "./core/questionBank.js";
import { spawnController } from "./core/spawnController.js";
import { renderCardTower, markStageCleared } from "./ui/cardTower.js";
import { loadState, updateState, setLastStageId, clearIncorrectFormula, getIncorrectFormulas, setDifficulty, setSelectedSuits } from "./core/gameState.js";
import { buildReviewStage } from "./core/reviewStage.js";
import { mountMenu } from "./ui/menu.js";
import { mountSettings } from "./ui/settings.js";
import { prepareAnswer, attachKeyboardSubmission, setLiveStatus, setNumericInputAttributes } from "./ui/inputHandler.js";
import { unlockAudio } from "./audio/index.js";
import { ensureLiveRegion } from "./utils/accessibility.js";
import { mountTitle } from "./ui/title.js";
import { shootProjectile, showHitEffect, showMissEffect } from "./ui/effects.js";

export async function start(stageId){
  const state = loadState();
  if (!stageId) {
    // 初期: タイトル
    const root = document.getElementById('title');
    mountTitle({
      rootEl: root,
      onStart: ({ suit, difficulty }) => {
        setDifficulty(difficulty);
        setSelectedSuits({ ...loadState().selectedSuits, [suit]: true });
        start(`${suit}_01`);
      }
    });
    return;
  }

  setLastStageId(stageId);
  const grid = document.getElementById('grid');
  const answer = document.getElementById('answer');
  const fire = document.getElementById('fire');
  // モバイル: 数値キーボード誘導
  setNumericInputAttributes(answer);
  // 初回タップでオーディオポリシー解除
  const onceUnlock = () => { unlockAudio(); document.removeEventListener('pointerup', onceUnlock); };
  document.addEventListener('pointerup', onceUnlock, { once: true });
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
  
    // 難易度（スピードのみ）適用
    const diff = (loadState().difficulty || 'normal');
    const speedMap = {
      easy:  { descendSpeed: 0.7, spawnIntervalSec: 3.0 },
      normal:{ descendSpeed: 1.0, spawnIntervalSec: 2.5 },
      hard:  { descendSpeed: 1.5, spawnIntervalSec: 2.0 }
    };
    const tuned = speedMap[diff] || speedMap.normal;
  
    // ステージ表示
    const stageEl = document.getElementById('stage');
    if (stageEl) {
      const [suit, rank] = stageId.split('_');
      const sym = suit === 'heart' ? '♡' : suit === 'spade' ? '♠' : suit === 'club' ? '♣' : '♦';
      stageEl.textContent = `${sym}${Number(rank)}`;
    }
  
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
      setLiveStatus('Correct ✓');
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
      setLiveStatus('Wrong ✗');
      if (lives <= 0) return gameOver();
    }
  
    const ctrl = spawnController({
      rootEl: grid,
      questions,
      cols: json.enemySet?.cols ?? 5,
      descendSpeed: tuned.descendSpeed,
      spawnIntervalSec: tuned.spawnIntervalSec,
      bottomY: 300,
      onBottomReached: () => gameOver(),
      onCorrect,
      onWrong
    });

  const selectHandler = (e) => {
    const btn = e.target.closest('.enemy');
    if (!btn) return;
    ctrl.lock(btn);
    selectedEl && (selectedEl.textContent = 'SELECTED: ' + btn.textContent);
    answer && answer.focus();
  };
  grid.addEventListener('click', selectHandler);
  grid.addEventListener('pointerup', selectHandler);
  function submit(){
    const selected = ctrl.getSelected?.();
    if (!selected || !selected.isConnected) return;
    const needRem = selected.dataset.remainder != null;
    const normalized = prepareAnswer(answer.value, { needRemainder: needRem });
    if (normalized == null) return;
    const fromEl = document.getElementById('fire') || answer;
    const toEl = selected;
    const ok = ctrl.submit(normalized);
    // 弾演出（正解は青、誤答は赤）
    shootProjectile({ fromEl, toEl, color: ok ? '#3BE3FF' : '#ff5252', hit: ok })
      .then(() => {
        if (ok) {
          // 追加のヒット演出（任意）
          // showHitEffect({ rootEl: document.body, anchorEl: toEl, text: '+100' });
        } else {
          // showMissEffect({ rootEl: document.body });
        }
      });
    if (ok) answer.value = '';
  }

  if (fire) { fire.addEventListener('click', submit); fire.addEventListener('pointerup', submit); }
  if (answer) answer.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  ensureLiveRegion(document.body);
  attachKeyboardSubmission({ inputEl: answer, onSubmit: submit, onClear: () => { /* selection clear is in game.js usually */ } });
}

export async function startReview(stage){
  const payload = stage || buildReviewStage({ rows: 1, cols: Math.min(10, getIncorrectFormulas().length) });
  const grid = document.getElementById('grid');
  const answer = document.getElementById('answer');
  const selectedEl = document.getElementById('selected');
  const scoreEl = document.getElementById('score');
  let score = Number(scoreEl?.textContent || '0') || 0;
  if (typeof document !== 'undefined'){
    document.addEventListener('DOMContentLoaded', () => start());
  }
  const questions = payload.preGenerated;
  const indexMap = new Map(); // formula -> first index in log
  getIncorrectFormulas().forEach((f, idx) => { if (!indexMap.has(f)) indexMap.set(f, idx); });

  function onCorrect(){
    const el = grid.querySelector('.enemy');
    const formula = el ? String(el.textContent).replace(' = ?', '').trim() : null;
    if (formula != null && indexMap.has(formula)) clearIncorrectFormula(indexMap.get(formula));
    score += 50; if (scoreEl) scoreEl.textContent = String(score);
    if (grid.children.length === 0){
      const msg = document.getElementById('message');
      if (msg) msg.textContent = 'REVIEW CLEAR!';
      renderCardTower({ rootEl: document.getElementById('tower'), onSelectStage: (id) => start(id) });
    }
  }
  function onWrong(){}

  const ctrl = spawnController({ rootEl: grid, questions, cols: questions.length, descendSpeed: 0, spawnIntervalSec: 10, onCorrect, onWrong });

  function submit(){
    const selected = ctrl.getSelected?.();
    if (!selected || !selected.isConnected) return;
    const needRem = selected.dataset.remainder != null;
    const normalized = prepareAnswer(answer.value, { needRemainder: needRem });
    if (normalized == null) return;
    const ok = ctrl.submit(normalized);
    if (ok) answer.value = '';
  }
  const fire = document.getElementById('fire');
  if (fire) fire.addEventListener('click', submit, { once: true });
}

if (typeof document !== 'undefined'){
  document.addEventListener('DOMContentLoaded', () => start());
}
