import { loadStage } from "./core/questionBank.js";
import { spawnController } from "./core/spawnController.js";
import { renderCardTower, markStageCleared } from "./ui/cardTower.js";
import { loadState, updateState, setLastStageId, clearIncorrectFormula, getIncorrectFormulas, setDifficulty, setSelectedSuits, setSelectedRanks, flipCard } from "./core/gameState.js";
import { buildReviewStage } from "./core/reviewStage.js";
import { mountMenu } from "./ui/menu.js";
import { mountSettings } from "./ui/settings.js";
import { prepareAnswer, attachKeyboardSubmission, setLiveStatus, setNumericInputAttributes } from "./ui/inputHandler.js";
import { unlockAudio, playSfx, startBgm, stopBgm } from "./audio/index.js";
import { ensureLiveRegion } from "./utils/accessibility.js";
import { mountTitle } from "./ui/title.js";
import { shootProjectile, showHitEffect, showMissEffect } from "./ui/effects.js";
import { showStageClear, showGameOver } from "./ui/result.js";
import { showCollection } from "./ui/collection.js";

export async function start(stageId){
  const state = loadState();
  if (!stageId) {
    // 初期: タイトル
    const root = document.getElementById('title');
    mountTitle({
      rootEl: root,
      onStart: ({ suit, rank, difficulty, countMode }) => {
        setDifficulty(difficulty);
        setSelectedSuits({ ...loadState().selectedSuits, [suit]: true });
        if (!loadState().selectedRanks?.[rank]) {
          const r = { ...(loadState().selectedRanks||{}) }; for (let i=1;i<=13;i++) r[i] = !!r[i]; r[rank] = true; setSelectedRanks(r);
        }
        start(`${suit}_${String(rank).padStart(2,'0')}?q=${String(countMode)}`);
      },
      onOpenStageSelect: () => {
        const towerRoot = document.getElementById('tower');
        if (towerRoot){
          renderCardTower({ rootEl: towerRoot, onSelectStage: (id) => start(`${id}?q=${(loadState().questionCountMode||'10')}`) });
        }
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
  const [baseId, query] = String(stageId).split('?');
  const qsParams = new URLSearchParams(query || '');
  const countMode = qsParams.get('q') || (loadState().questionCountMode || '10');

  const res = await fetch(`data/stages/${baseId}.json`);
  if (!res.ok) throw new Error(`stage not found: ${baseId}`);
  const json = await res.json();
  const questionsAll = await loadStage(json);

  // 問題数モード
  const endless = (countMode === 'endless');
  const targetCount = endless ? questionsAll.length : Math.min(questionsAll.length, Number(countMode) || 10);
  const questions = endless ? questionsAll : questionsAll.slice(0, targetCount);

  // 難易度（スピードのみ）適用
  const diff = (loadState().difficulty || 'normal');
  const speedMap = {
    easy:  { descendSpeed: 0.7, spawnIntervalSec: 3.0 },
    normal:{ descendSpeed: 1.0, spawnIntervalSec: 2.5 },
    hard:  { descendSpeed: 1.5, spawnIntervalSec: 2.0 }
  };
  const tuned = speedMap[diff] || speedMap.normal;

  // ステージ表示（パターンも）
  const stageEl = document.getElementById('stage');
  const patternEl = document.getElementById('pattern');
  if (stageEl) {
    const [suit, rank] = baseId.split('_');
    const sym = suit === 'heart' ? '♡' : suit === 'spade' ? '♠' : suit === 'club' ? '♣' : '♦';
    stageEl.textContent = `${sym}${Number(rank)}`;
  }
  if (patternEl) patternEl.textContent = String(json?.generator?.pattern || '');
  
    function addScore(base){
      const gained = base + Math.min(combo * 10, 100);
      score += gained;
      if (scoreEl) scoreEl.textContent = String(score);
    }
  
  function gameOver(){
    const msg = document.getElementById('message');
    if (msg) msg.textContent = 'GAME OVER';
    playSfx('gameover');
    stopBgm('bgm_stage');
    updateState({ lives: 0, score });
    const totalScore = Number(scoreEl?.textContent || '0') || score;
    const curId = baseId;
    const goRetry = () => start(`${curId}?q=${countMode}`);
    const goSelect = () => {
      // タイトルへ戻る→塔へ遷移するパターン（必要なら直接塔を表示）
      start();
    };
    const goTitle = () => start();
    showGameOver({ stageId: curId, score: totalScore, onRetry: goRetry, onStageSelect: goSelect, onTitle: goTitle });
  }
  
    function onCorrect(){
      combo += 1;
      addScore(json.rules?.scorePerHit ?? 100);
      selectedEl && (selectedEl.textContent = "SELECTED: なし");
      setLiveStatus('Correct ✓');
      if (!endless && grid.children.length === 0){
        // STAGE CLEAR
        const totalScore = Number(scoreEl?.textContent || '0') || score;
        const curId = baseId;
        try { flipCard(curId); } catch {}
        stopBgm('bgm_stage');
        playSfx('clear');
  
        const goRetry = () => start(`${curId}?q=${countMode}`);
        const goNext = () => {
          const [suit, rstr] = curId.split('_');
          const r = Number(rstr);
          const ranks = loadState().selectedRanks || {};
          const sequence = Array.from({length:13},(_,k)=>k+1);
          const after = sequence.slice(r).concat(sequence.slice(0, r));
          const nextRank = (after.find(n => !!ranks[n])) || ((r % 13) + 1);
          start(`${suit}_${String(nextRank).padStart(2,'0')}?q=${countMode}`);
        };
        const goTitle = () => start();
        const goCollection = () => showCollection({ onClose: () => {} });
        showStageClear({ stageId: curId, score: totalScore, onRetry: goRetry, onNext: goNext, onTitle: goTitle, onCollection: goCollection });
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
      onWrong,
      endless
    });
    startBgm('bgm_stage');

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

    const willHit = ctrl.previewCheck?.(normalized) === true;
    const fromEl = document.getElementById('fire') || answer;
    const toEl = selected;
    // 画面下パネル中央から狙った敵の中心へ
    const panel = document.getElementById('panel');
    const pr = panel?.getBoundingClientRect?.();
    const fromPos = pr ? { x: pr.left + pr.width/2, y: pr.top + pr.height/2 } : undefined;

    playSfx('shot');
    shootProjectile({ fromEl, toEl, from: fromPos, color: willHit ? '#3BE3FF' : '#ff5252', hit: willHit })
      .then(() => {
        if (willHit) {
          playSfx('hit');
          showHitEffect({ rootEl: document.body, anchorEl: toEl, text: '+100' });
        } else {
          playSfx('miss');
          // showMissEffect({ rootEl: document.body });
        }
        const ok = ctrl.submit(normalized);
        if (ok) {
          answer.value = '';
          const remainEl = document.getElementById('remain');
          if (remainEl && countMode !== 'endless') remainEl.textContent = String(Math.max(0, Number(remainEl.textContent||questions.length) - 1));
        }
      });
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
