import { loadStage } from "./core/questionBank.js";
import { spawnController } from "./core/spawnController.js";
import { renderCardTower, markStageCleared } from "./ui/cardTower.js";
import { loadState, updateState, setLastStageId, clearIncorrectFormula, getIncorrectFormulas, setDifficulty, setSelectedSuits, setSelectedRanks, flipCard, recordCardAcquired, getUnlockedCounts, unlockNextCount, getRankProgress, unlockNextRank } from "./core/gameState.js";
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
    // 初期: タイトル（タイトルBGM起動 + 初回解錠）
    try { startBgm('bgm_title'); } catch(_e){}
    const onceUnlockTitle = () => { try { unlockAudio(); startBgm('bgm_title'); } catch(_e){} document.removeEventListener('pointerup', onceUnlockTitle); };
    document.addEventListener('pointerup', onceUnlockTitle, { once: true });
    // コレクション「このステージで遊ぶ」対応
    const onPlay = (e) => { const id = e?.detail?.stageId; if (id) { window.removeEventListener('ci:playStage', onPlay); start(`${id}?q=${(loadState().questionCountMode||'10')}`); } };
    window.addEventListener('ci:playStage', onPlay, { once: true });
    // HUD/GRID/PANEL を隠す & 前オーバーレイの掃除
    const topEl = document.getElementById('top'); if (topEl) topEl.style.display = 'none';
    const gridEl = document.getElementById('grid'); if (gridEl) gridEl.style.display = 'none';
    const panelEl = document.getElementById('panel'); if (panelEl) panelEl.style.display = 'none';
    const towerRoot0 = document.getElementById('tower'); if (towerRoot0) towerRoot0.innerHTML = '';
    const titleRoot0 = document.getElementById('title'); if (titleRoot0) titleRoot0.innerHTML = '';
    // タイトルUI
    const root = document.getElementById('title');
    mountTitle({
      rootEl: root,
      onStart: ({ suit, rank, difficulty, countMode }) => {
        try { stopBgm('bgm_title'); } catch(_e){}
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
  // HUD/GRID/PANEL を表示し、タイトル/タワーを掃除
  const topEl2 = document.getElementById('top'); if (topEl2) topEl2.style.display = '';
  const gridShow = document.getElementById('grid'); if (gridShow) gridShow.style.display = '';
  const panelShow = document.getElementById('panel'); if (panelShow) panelShow.style.display = '';
  const towerRoot1 = document.getElementById('tower'); if (towerRoot1) towerRoot1.innerHTML = '';
  const titleRoot1 = document.getElementById('title'); if (titleRoot1) titleRoot1.innerHTML = '';
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
  const remainBar = document.getElementById('remain-bar');
  const timeBar = document.getElementById('time-bar');

 // 既存
let combo = 0;
let lives = Number(lifeEl?.textContent || '3') || 3;
let score = Number(scoreEl?.textContent || '0') || 0;

let submitBusy = false; // 追加: 送信多重防止
  
      
      // ステージJSONを取得
  const [baseId, query] = String(stageId).split('?');
  const qsParams = new URLSearchParams(query || '');
  // qパラメータ検証（解放済みの問題数にクランプ）
  const rawQ = qsParams.get('q') || (loadState().questionCountMode || '10');
  const unlocked = getUnlockedCounts();
  const countMode = unlocked.includes(String(rawQ)) ? String(rawQ) : (unlocked[unlocked.length-1] || '5');

  const res = await fetch(`data/stages/${baseId}.json`);
  if (!res.ok) throw new Error(`stage not found: ${baseId}`);
  const json = await res.json();
  const questionsAll = await loadStage(json);

  // 問題数モード
  const endless = (countMode === 'endless');
  const targetCount = endless ? questionsAll.length : Math.min(questionsAll.length, Number(countMode) || 10);
  const questions = endless ? questionsAll : questionsAll.slice(0, targetCount);
  // 既存
const totalCount = questions.length;

// 追加
const session = { target: totalCount, cleared: 0, ended: false };
const remainElInit = document.getElementById('remain');
if (remainElInit && !endless) {
  remainElInit.textContent = String(session.target);
  if (remainBar) remainBar.style.width = '100%';
}

// countMode を決めた直後に追加
const modeEl = document.getElementById('mode');
if (modeEl) {
  const label = countMode === '5' ? '5問（ウォームアップ）'
    : countMode === '10' ? '10問（標準）'
    : countMode === '20' ? '20問（集中ドリル）'
    : countMode === '30' ? '30問（やり込み/小テスト）'
    : '∞（エンドレス）';
  modeEl.textContent = label;
}

// 状態へも反映（URLから来たqを正として保存）
try { setQuestionCountMode(countMode); } catch(_e){}

  // 難易度（スピードのみ）適用
  const diff = (loadState().difficulty || 'normal');
  const speedMap = {
    easy:  { descendSpeed: 0.7, spawnIntervalSec: 3.0 },
    normal:{ descendSpeed: 1.0, spawnIntervalSec: 2.5 },
    hard:  { descendSpeed: 1.5, spawnIntervalSec: 2.0 }
  };
  const tuned = speedMap[diff] || speedMap.normal;
  // ステージ個別値との合成（stage値 × 難易度係数）をクランプ
  const stageDesc = Number.isFinite(json?.enemySet?.descendSpeed) ? json.enemySet.descendSpeed : 1.0;
  const stageSpawn = Number.isFinite(json?.enemySet?.spawnIntervalSec) ? json.enemySet.spawnIntervalSec : 2.5;
  const descend = Math.max(0.4, Math.min(3.0, stageDesc * tuned.descendSpeed));
  const spawnInt = Math.max(0.6, Math.min(5.0, stageSpawn / (tuned.descendSpeed))); // 速い難易度では間隔を短めに

  // ステージ表示（パターンも）
  const stageEl = document.getElementById('stage');
  const patternEl = document.getElementById('pattern');
  if (stageEl) {
    const [suit, rank] = baseId.split('_');
    const sym = suit === 'heart' ? '♡' : suit === 'spade' ? '♠' : suit === 'club' ? '♣' : '♦';
    stageEl.textContent = `${sym}${Number(rank)}`;
  }
  if (patternEl) patternEl.textContent = String(json?.generator?.pattern || '');
  if (remainBar && !endless) remainBar.style.width = '100%';
  if (timeBar) timeBar.style.width = '100%';
  

    function addScore(base){
      const gained = base + Math.min(combo * 10, 100);
      score += gained;
      if (scoreEl) scoreEl.textContent = String(score);
    }
  
  function gameOver(){
    document.body.classList.remove('paused');
    const msg = document.getElementById('message');
    if (msg) msg.textContent = 'GAME OVER';
    playSfx('gameover');
    stopBgm('bgm_stage');
    updateState({ lives: 0, score });
    const totalScore = Number(scoreEl?.textContent || '0') || score;
    const curId = baseId;
    const goRetry = () => start(`${curId}?q=${countMode}`);
    const goSelect = () => {
      try { window.__ciIntentOpenTower = true; } catch(_e){}
      start();
    };
    const goTitle = () => start();
    showGameOver({ stageId: curId, score: totalScore, onRetry: goRetry, onStageSelect: goSelect, onTitle: goTitle });
  }
  
  function stageClear(){
    if (session.ended) return;
    session.ended = true;
    document.body.classList.remove('paused');
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
  
    showStageClear({ stageId: curId, score: totalScore, onRetry: goRetry, onNext: goNext, onTitle: goTitle, onCollection: goCollection, earned });
  
    try {
      const [suit, rstr] = curId.split('_');
      const rankNum = Number(rstr);
      unlockNextRank(suit, rankNum);
      unlockNextCount(countMode);
    } catch(_e){}
  }

  function onCorrect(){
    combo += 1;
    addScore(json.rules?.scorePerHit ?? 100);
    selectedEl && (selectedEl.textContent = "SELECTED: なし");
    setLiveStatus('Correct ✓');
  
    // 正解数でのみ判定
    session.cleared += 1;
    try { console.debug('[stage] correct', { cleared: session.cleared, target: session.target }); } catch(_e){}
  
    if (!endless && !session.ended && session.cleared >= session.target){
      stageClear();
    }
  }
  
    function onWrong(){
      combo = 0;
      lives -= 1;
      if (lifeEl) lifeEl.textContent = String(lives);
      setLiveStatus('Wrong ✗');
      if (lives <= 0) return gameOver();
    }
  
    let ctrl = spawnController({
      rootEl: grid,
      questions,
      cols: json.enemySet?.cols ?? 5,
      descendSpeed: descend,
      spawnIntervalSec: spawnInt,
      bottomY: Math.max(120, (grid?.getBoundingClientRect?.().height || 480) - 64),
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
    ctrl.pause();
    try { document.body.classList.add('paused'); } catch(_e){}
    selectedEl && (selectedEl.textContent = 'SELECTED: ' + btn.textContent);
    answer && answer.focus();
  };
  grid.addEventListener('click', selectHandler);
  grid.addEventListener('pointerup', selectHandler);
  
  function submit(){
    // 多重送信ガード
    if (submitBusy) return;
    submitBusy = true;
    try { if (fire) fire.disabled = true; } catch(_e){}
  
    const selected = ctrl.getSelected?.();
    if (!selected || !selected.isConnected) {
      submitBusy = false; try { if (fire) fire.disabled = false; } catch(_e){}
      return;
    }
    const needRem = selected.dataset.remainder != null;
    const normalized = prepareAnswer(answer.value, { needRemainder: needRem });
    if (normalized == null) {
      submitBusy = false; try { if (fire) fire.disabled = false; } catch(_e){}
      return;
    }
  
    const willHit = ctrl.previewCheck?.(normalized) === true;
    const fromEl = document.getElementById('fire') || answer;
    const toEl = selected;
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
        }
  
        const ok = ctrl.submit(normalized);
        // 入力は正誤に関わらずクリア
        answer.value = '';
  
        if (ok) {
          const remainEl = document.getElementById('remain');
          if (remainEl && countMode !== 'endless'){
            const left = Math.max(0, session.target - session.cleared);
            remainEl.textContent = String(left);
            if (remainBar){
              const ratio = session.target > 0 ? (left / session.target) : 0;
              remainBar.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
            }
          }
        }
  
        ctrl.resume();
        try { document.body.classList.remove('paused'); } catch(_e){}
      })
      .finally(() => {
        submitBusy = false;
        try { if (fire) fire.disabled = false; } catch(_e){}
      });
  }

  if (fire) { fire.addEventListener('click', submit); }
  if (answer) answer.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  ensureLiveRegion(document.body);
  attachKeyboardSubmission({ inputEl: answer, onSubmit: submit, onClear: () => { try { ctrl.clear(); ctrl.resume(); document.body.classList.remove('paused'); } catch(_e){} } });
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
