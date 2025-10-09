// main.js（事前確定対応版：preload + count 指定 load）

import { loadStage, preloadStageById } from "./core/questionBank.js";
import { spawnController } from "./core/spawnController.js";
import { renderCardTower } from "./ui/cardTower.js";
import {
  loadState, updateState, setLastStageId, clearIncorrectFormula, getIncorrectFormulas,
  setDifficulty, setSelectedSuits, setSelectedRanks, flipCard, recordCardAcquired,
  getUnlockedCounts, unlockNextCount, unlockNextRank
} from "./core/gameState.js";
import { buildReviewStage } from "./core/reviewStage.js";
import { mountTitle } from "./ui/title.js";
import { prepareAnswer, setLiveStatus, setNumericInputAttributes } from "./ui/inputHandler.js";
import { unlockAudio, playSfx, startBgm, stopBgm } from "./audio/index.js";
import { ensureLiveRegion } from "./utils/accessibility.js";
import { shootProjectile, showHitEffect } from "./ui/effects.js";
import { showStageClear, showGameOver } from "./ui/result.js";
import { showCollection } from "./ui/collection.js";
import { StageSession } from "./core/stageSession.js";
import { Hud } from "./ui/hud.js";
import './styles/theme-pop.css';
import './ui/patch-pop.js';

// -----------------------
// stage-scoped resources
// -----------------------
let ctrl = null;
let selectHandlerBound = null;
let submitClickBound = null;
let enterKeyBound = null;
let escKeyBound = null;
let submitBusy = false;

function cleanupStage() {
  try { document.body.classList.remove('paused'); } catch(_) {}
  try { ctrl?.stop(); } catch(_) {}
  ctrl = null;

  const grid = document.getElementById('grid');
  const fire = document.getElementById('fire');
  const answer = document.getElementById('answer');

  if (grid && selectHandlerBound)  grid.removeEventListener('click', selectHandlerBound);
  if (fire && submitClickBound)    fire.removeEventListener('click', submitClickBound);
  if (answer && enterKeyBound)     answer.removeEventListener('keydown', enterKeyBound);
  if (answer && escKeyBound)       answer.removeEventListener('keydown', escKeyBound);

  selectHandlerBound = null;
  submitClickBound = null;
  enterKeyBound = null;
  escKeyBound = null;
  submitBusy = false;
}

// ------------------------------------
// entry
// ------------------------------------
export async function start(stageId) {
  const state = loadState();

  // タイトル画面
  if (!stageId) {
    cleanupStage();
    try { startBgm('bgm_title'); } catch(_) {}
    const onceUnlockTitle = () => { try { unlockAudio(); startBgm('bgm_title'); } catch(_) {} document.removeEventListener('pointerup', onceUnlockTitle); };
    document.addEventListener('pointerup', onceUnlockTitle, { once: true });

    const onPlay = (e) => {
      const id = e?.detail?.stageId;
      if (id) { window.removeEventListener('ci:playStage', onPlay); start(`${id}?q=${(loadState().questionCountMode||'10')}`); }
    };
    window.addEventListener('ci:playStage', onPlay, { once: true });

    const topEl = document.getElementById('top');   if (topEl) topEl.style.display = 'none';
    const gridEl = document.getElementById('grid'); if (gridEl) gridEl.style.display = 'none';
    const panelEl = document.getElementById('panel'); if (panelEl) panelEl.style.display = 'none';
    const towerRoot0 = document.getElementById('tower'); if (towerRoot0) towerRoot0.innerHTML = '';
    const titleRoot0 = document.getElementById('title'); if (titleRoot0) titleRoot0.innerHTML = '';

    const root = document.getElementById('title');
    mountTitle({
      rootEl: root,
      onStart: async ({ suit, rank, difficulty, countMode }) => {
        try { stopBgm('bgm_title'); } catch(_) {}
        setDifficulty(difficulty);
        setSelectedSuits({ ...loadState().selectedSuits, [suit]: true });
        if (!loadState().selectedRanks?.[rank]) {
          const r = { ...(loadState().selectedRanks||{}) };
          for (let i=1; i<=13; i++) r[i] = !!r[i];
          r[rank] = true; setSelectedRanks(r);
        }
        // ここで事前確定（固定本数モードのみ）
        const id = `${suit}_${String(rank).padStart(2,'0')}`;
        const finite = String(countMode) !== 'endless';
        if (finite) {
          const c = Number(countMode) || 10;
          await preloadStageById(id, c);
        }
        start(`${id}?q=${String(countMode)}`);
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

  // --------------------
  // Stage Screen Setup
  // --------------------
  cleanupStage();
  setLastStageId(stageId);

  const topEl2 = document.getElementById('top');   if (topEl2) topEl2.style.display = '';
  const gridShow = document.getElementById('grid'); if (gridShow) gridShow.style.display = '';
  const panelShow = document.getElementById('panel'); if (panelShow) panelShow.style.display = '';
  const towerRoot1 = document.getElementById('tower'); if (towerRoot1) towerRoot1.innerHTML = '';
  const titleRoot1 = document.getElementById('title'); if (titleRoot1) titleRoot1.innerHTML = '';

  const grid = document.getElementById('grid');
  const answer = document.getElementById('answer');
  const fire = document.getElementById('fire');
  const scoreEl = document.getElementById('score');
  const lifeEl = document.getElementById('life');
  const selectedEl = document.getElementById('selected');
  const remainEl = document.getElementById('remain');
  const remainBar = document.getElementById('remain-bar');
  const timeBar = document.getElementById('time-bar');
  const stageEl = document.getElementById('stage');
  const patternEl = document.getElementById('pattern');
  const modeEl = document.getElementById('mode');

  setNumericInputAttributes(answer);
  const onceUnlock = () => { unlockAudio(); document.removeEventListener('pointerup', onceUnlock); };
  document.addEventListener('pointerup', onceUnlock, { once: true });

  let combo = 0;
  let lives = Number(lifeEl?.textContent || '3') || 3;
  let score = Number(scoreEl?.textContent || '0') || 0;

  // --------------------
  // Stage Params
  // --------------------
  const [baseId, query] = String(stageId).split('?');
  const qsParams = new URLSearchParams(query || '');
  const rawQ = qsParams.get('q') || (loadState().questionCountMode || '10');
  const unlocked = getUnlockedCounts();
  const countMode = unlocked.includes(String(rawQ)) ? String(rawQ) : (unlocked[unlocked.length-1] || '5');

  try { setQuestionCountMode(countMode); } catch(_) {}

  const res = await fetch(`data/stages/${baseId}.json`);
  if (!res.ok) throw new Error(`stage not found: ${baseId}`);
  const json = await res.json();

  // count を渡してキャッシュ即ヒットさせる（endless は undefined で従来どおり）
  const endless = (countMode === 'endless');
  const targetCountPreset = endless ? undefined : (Number(countMode) || 10);
  let questionsAll = await loadStage({ ...json, stageId: baseId }, targetCountPreset);

  const targetCount = endless ? questionsAll.length : Math.min(questionsAll.length, Number(countMode) || 10);

  if (!endless && targetCount === 0) {
    console.warn('[guard] questions empty, fallback to preGenerated/all');
    if (Array.isArray(json?.preGenerated) && json.preGenerated.length > 0) {
      questionsAll = json.preGenerated.slice();
    } else {
      questionsAll = [{ formula: '1 + 1', answer: 2 }];
    }
  }

  const questions = endless ? questionsAll : questionsAll.slice(0, Math.max(1, targetCount));
  const totalCount = questions.length;

  if (modeEl) {
    const label = countMode === '5'  ? '5問（ウォームアップ）'
                : countMode === '10' ? '10問（標準）'
                : countMode === '20' ? '20問（集中ドリル）'
                : countMode === '30' ? '30問（やり込み/小テスト）'
                : '∞（エンドレス）';
    modeEl.textContent = label;
  }

  const diff = (loadState().difficulty || 'normal');
  const speedMap = {
    easy:   { descendSpeed: 0.7, spawnIntervalSec: 3.0 },
    normal: { descendSpeed: 1.0, spawnIntervalSec: 2.5 },
    hard:   { descendSpeed: 1.5, spawnIntervalSec: 2.0 }
  };
  const tuned = speedMap[diff] || speedMap.normal;
  const stageDesc = Number.isFinite(json?.enemySet?.descendSpeed) ? json.enemySet.descendSpeed : 1.0;
  const stageSpawn = Number.isFinite(json?.enemySet?.spawnIntervalSec) ? json.enemySet.spawnIntervalSec : 2.5;
  const descend = Math.max(0.4, Math.min(3.0, stageDesc * tuned.descendSpeed));
  const spawnInt = Math.max(0.6, Math.min(5.0, stageSpawn / (tuned.descendSpeed)));

  if (stageEl) {
    const [suit, rank] = baseId.split('_');
    const sym = suit === 'heart' ? '♡' : suit === 'spade' ? '♠' : suit === 'club' ? '♣' : '♦';
    stageEl.textContent = `${sym}${Number(rank)}`;
  }
  if (patternEl) patternEl.textContent = String(json?.generator?.pattern || '');

  Hud.setRemain(remainEl, endless ? Infinity : totalCount, endless ? Infinity : totalCount, remainBar);
  if (timeBar) timeBar.style.width = '100%';

  const session = new StageSession({ target: totalCount, endless });

  // --------------------
  // helpers
  // --------------------
  function addScore(base) {
    const gained = base + Math.min(combo * 10, 100);
    score += gained;
    Hud.setScore(scoreEl, score);
  }

  function gameOver() {
    cleanupStage();
    const msg = document.getElementById('message');
    if (msg) msg.textContent = 'GAME OVER';
    playSfx('gameover');
    stopBgm('bgm_stage');
    updateState({ lives: 0, score });
    const totalScore = Number(scoreEl?.textContent || '0') || score;
    const curId = baseId;
    const goRetry = () => start(`${curId}?q=${countMode}`);
    const goSelect = () => { try { window.__ciIntentOpenTower = true; } catch(_) {} start(); };
    const goTitle = () => start();
    showGameOver({ stageId: curId, score: totalScore, onRetry: goRetry, onStageSelect: goSelect, onTitle: goTitle });
  }

  function stageClear() {
    if (session.ended) return;
    session.end();

    cleanupStage();
    const totalScore = Number(scoreEl?.textContent || '0') || score;
    const curId = baseId;

    let earned = false;
    try {
      const before = new Set((loadState().flippedCards)||[]);
      flipCard(curId);
      const after = new Set((loadState().flippedCards)||[]);
      earned = (!before.has(curId) && after.has(curId));
    } catch {}
    try { recordCardAcquired(curId, { score: totalScore }); } catch {}

    stopBgm('bgm_stage');
    playSfx('clear');

    const goRetry = () => start(`${curId}?q=${countMode}`);
    const goNext  = () => {
      const [suit, rstr] = curId.split('_');
      const r = Number(rstr);
      const ranks = loadState().selectedRanks || {};
      const sequence = Array.from({length:13}, (_,k)=>k+1);
      const after = sequence.slice(r).concat(sequence.slice(0, r));
      const nextRank = (after.find(n => !!ranks[n])) || ((r % 13) + 1);
      start(`${suit}_${String(nextRank).padStart(2,'0')}?q=${countMode}`);
    };
    const goTitle = () => start();
    const goCollection = () => showCollection({ onClose: () => {} });

    showStageClear({ stageId: curId, score: totalScore, onRetry: goRetry, onNext: goNext, onTitle: goTitle, onCollection: goCollection, earned });

    try {
      const [suit, rstr] = curId.split('_');
      const rankNum = Number(rstr);
      unlockNextRank(suit, rankNum);
      unlockNextCount(countMode);
    } catch(_) {}
  }

  function onCorrect() {
    combo += 1;
    addScore(json.rules?.scorePerHit ?? 100);
    if (selectedEl) selectedEl.textContent = "SELECTED: なし";
    setLiveStatus('Correct ✓');
    session.onCorrect();
    if (!session.ended && session.isClear) stageClear();
  }

  function onWrong() {
    combo = 0;
    lives -= 1;
    Hud.setLives(lifeEl, lives);
    setLiveStatus('Wrong ✗');
    if (lives <= 0) return gameOver();
  }

  // --------------------
  // Controller start
  // --------------------
  ctrl = spawnController({
    rootEl: grid,
    questions,
    cols: json.enemySet?.cols ?? 5,
    descendSpeed: descend,
    spawnIntervalSec: spawnInt,
    bottomY: 9999,
    onBottomReached: () => { try { console.debug('[stage] bottom reached - triggering gameOver'); } catch(_) {} gameOver(); },
    onCorrect,
    onWrong,
    endless
  });
  startBgm('bgm_stage');

  // --------------------
  // UI interactions
  // --------------------
  selectHandlerBound = (e) => {
    const btn = e.target.closest('.enemy');
    if (!btn) return;
    ctrl.lock(btn);
    ctrl.pause();
    try { document.body.classList.add('paused'); } catch(_) {}
    if (selectedEl) selectedEl.textContent = 'SELECTED: ' + btn.textContent;
    if (answer) answer.focus();
  };
  grid.addEventListener('click', selectHandlerBound);

  function submit() {
    if (submitBusy) return;
    submitBusy = true;
    try { if (fire) fire.disabled = true; } catch(_) {}

    const selected = ctrl.getSelected?.();
    if (!selected || !selected.isConnected) {
      submitBusy = false; try { if (fire) fire.disabled = false; } catch(_) {}
      return;
    }

    const needRem = selected.dataset.remainder != null;
    const normalized = prepareAnswer(answer.value, { needRemainder: needRem });
    if (normalized == null) {
      submitBusy = false; try { if (fire) fire.disabled = false; } catch(_) {}
      return;
    }

    const willHit = ctrl.previewCheck?.(normalized) === true;
    const fromEl = document.getElementById('fire') || answer;
    const panel = document.getElementById('panel');
    const pr = panel?.getBoundingClientRect?.();
    const fromPos = pr ? { x: pr.left + pr.width/2, y: pr.top + pr.height/2 } : undefined;

    playSfx('shot');
    shootProjectile({ fromEl, toEl: selected, from: fromPos, color: willHit ? '#3BE3FF' : '#ff5252', hit: willHit })
      .then(() => {
        if (willHit) { playSfx('hit'); showHitEffect({ rootEl: document.body, anchorEl: selected, text: '+100' }); }
        const ok = ctrl.submit(normalized);
        answer.value = '';
        if (ok) Hud.setRemain(remainEl, session.remain, session.target, remainBar);
        ctrl.resume();
        try { document.body.classList.remove('paused'); } catch(_) {}
      })
      .finally(() => { submitBusy = false; try { if (fire) fire.disabled = false; } catch(_) {} });
  }

  submitClickBound = () => submit();
  if (fire) fire.addEventListener('click', submitClickBound);

  enterKeyBound = (e) => { if (e.key === 'Enter') submit(); };
  escKeyBound   = (e) => { if (e.key === 'Escape') { try { ctrl.clear(); ctrl.resume(); document.body.classList.remove('paused'); } catch(_) {} } };
  if (answer) {
    answer.addEventListener('keydown', enterKeyBound);
    answer.addEventListener('keydown', escKeyBound);
  }

  ensureLiveRegion(document.body);
}

// ------------------------------------
// Review mode
// ------------------------------------
export async function startReview(stage) {
  const payload = stage || buildReviewStage({ rows: 1, cols: Math.min(10, getIncorrectFormulas().length) });

  cleanupStage();

  const grid = document.getElementById('grid');
  const answer = document.getElementById('answer');
  const scoreEl = document.getElementById('score');
  let score = Number(scoreEl?.textContent || '0') || 0;

  const questions = payload.preGenerated;
  const indexMap = new Map();
  getIncorrectFormulas().forEach((f, idx) => { if (!indexMap.has(f)) indexMap.set(f, idx); });

  function onCorrect() {
    const el = grid.querySelector('.enemy');
    const formula = el ? String(el.textContent).replace(' = ?', '').trim() : null;
    if (formula != null && indexMap.has(formula)) clearIncorrectFormula(indexMap.get(formula));
    score += 50; if (scoreEl) scoreEl.textContent = String(score);
    if (grid.children.length === 0) {
      const msg = document.getElementById('message');
      if (msg) msg.textContent = 'REVIEW CLEAR!';
      renderCardTower({ rootEl: document.getElementById('tower'), onSelectStage: (id) => start(id) });
    }
  }
  function onWrong() {}

  ctrl = spawnController({
    rootEl: grid, questions, cols: questions.length,
    descendSpeed: 0, spawnIntervalSec: 10, onCorrect, onWrong
  });

  function submit() {
    const selected = ctrl.getSelected?.();
    if (!selected || !selected.isConnected) return;
    const needRem = selected.dataset.remainder != null;
    const normalized = prepareAnswer(answer.value, { needRemainder: needRem });
    if (normalized == null) return;
    const ok = ctrl.submit(normalized);
    if (ok) answer.value = '';
  }

  const fire = document.getElementById('fire');
  submitClickBound = () => submit();
  if (fire) fire.addEventListener('click', submitClickBound, { once: true });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => start());
}
