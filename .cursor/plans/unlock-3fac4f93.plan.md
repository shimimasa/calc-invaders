<!-- 3fac4f93-57bd-41f0-bd01-c5160cbe4b22 1ab61f94-c6c0-4cc5-8e70-41ac9766582d -->
# 誤クリア（♡2・5問）根治計画

## 目的
- クリア判定を「正解数が目標数に到達」のみに限定し、スポーン状態・盤面状態に依存しない。
- 多重発火や初期化漏れ、UIと内部カウントの乖離を解消する。

## 変更点
1) 正解ベースのステージ状態を一元管理
- `src/main.js`
  - ステージ開始時に `const session = { target: totalCount, cleared: 0, ended: false }` を作成。
  - 進捗UI（残り数/バー）は `session` から計算（DOMから再計算しない）。

2) クリア判定の一本化と多重ガード
- `onCorrect` 内：
  - `session.cleared += 1` 後、`if (!endless && !session.ended && session.cleared >= session.target) { session.ended = true; stageClear() }`。
  - 既存の `ctrl.isSpawningDone && grid.children.length===0` などは削除。

3) 進捗UIの更新を移管
- `submit().then(...ok)` ブロックの残数計算を `left = session.target - session.cleared` に置換。
- `remainBar` は `left/session.target` 比率で更新。

4) 初期化の厳密化
- `start(stageId)` 冒頭で `cleared`/`session` を毎回0から再初期化。
- `score`/`combo`/`lives` もここでリセット（既存挙動を踏襲）。

5) 追加ログ（暫定）
- `console.debug('[stage]', { cleared:session.cleared, target:session.target, active:ctrl.getActiveCount?.(), spawned:ctrl.getSpawnedCount?.() })` を `onCorrect` と `submit().then` 末尾に出力（必要なら削除可）。

## 参考変更（抜粋）
- 変数定義直後:
```js
const session = { target: totalCount, cleared: 0, ended: false };
```
- onCorrect 差し替え:
```js
function onCorrect(){
  combo += 1;
  addScore(json.rules?.scorePerHit ?? 100);
  selectedEl && (selectedEl.textContent = 'SELECTED: なし');
  setLiveStatus('Correct ✓');
  session.cleared += 1;
  if (!endless && !session.ended && session.cleared >= session.target){
    session.ended = true;
    stageClear();
  }
}
```
- stageClear ヘルパをローカル関数で抽出（現行のCLEARブロックを移動）
- 残数UI:
```js
if (ok && countMode !== 'endless'){
  const left = Math.max(0, session.target - session.cleared);
  remainEl && (remainEl.textContent = String(left));
  if (remainBar){
    const ratio = session.target > 0 ? (left / session.target) : 0;
    remainBar.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  }
}
```

## 検証観点
- ♡2・5問: 5回正解するまでCLEARが出ない
- 一時停止/タブ復帰でも早期CLEARが発生しない
- CLEARは一度だけ（`session.ended`）
- 進捗UIが内部カウントと常に一致


### To-dos

- [ ] mainでsession(target/cleared/ended)導入し初期化
- [ ] onCorrectを正解数ベースに切替、旧判定を削除
- [ ] 残数UIをsessionから計算、DOM依存を排除
- [ ] stageClearヘルパー化し多重発火ガード
- [ ] 暫定デバッグログをonCorrectとsubmit末尾に追加