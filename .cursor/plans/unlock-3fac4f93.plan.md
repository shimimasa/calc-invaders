<!-- 3fac4f93-57bd-41f0-bd01-c5160cbe4b22 ce7f3d60-2be0-4c42-b788-4eac563b3163 -->
# 多重送信とGameOver誤発火の根治計画

## 問題の根本原因

1. **多重送信（Remain 5→0の原因）**

- Enter送信が2箇所で登録（333行・335行）
- Space送信も335行で登録
- 1回の入力で`submit()`が複数回実行され、`onCorrect()`が連続発火
- `session.cleared`が一気に増え、残数UIが0に飛ぶ

2. **GameOver誤発火（5問正解後にGAME OVER）**

- `onBottomReached`の閾値が低すぎる/ディレイ不足
- 最後の敵を倒した直後、次のスポーンや残骸がボトムライン通過
- stageClearよりgameOverが先に発火

3. **grid選択の二重登録**

- click と pointerup 両方で selectHandler 登録（269-270行）
- タッチ/マウス環境で二重発火の可能性

## 修正方針

1. **送信トリガの一本化**

- `attachKeyboardSubmission`を削除（Enter/Space重複の元凶）
- Enter送信は`answer.addEventListener`のみ残す（busyガード付き）
- click送信も残す（busyガード付き）

2. **grid選択の一本化**

- pointerup を削除し、click のみ残す

3. **bottomY判定の無効化または大幅緩和**

- 5問モードではCLEARが先に来るべき
- bottomYを画面外（9999）にするか、ディレイを3秒に延長

4. **デバッグログの強化（一時的）**

- `onCorrect`で毎回ログ出力し、多重呼び出しを可視化
- `onBottomReached`でもログを出し、発火タイミングを確認

## 変更箇所

- `src/main.js`
- 333行: Enter送信は残す（busyガード済み）
- 335行: `attachKeyboardSubmission`呼び出しを削除
- 270行: `grid.addEventListener('pointerup', selectHandler)` を削除
- 253行: `onBottomReached`にログ追加、または`bottomY: 9999`に変更
- 232行: `onCorrect`内のログ出力を残す

## 期待される結果

- 1発射で`onCorrect`が1回だけ呼ばれる
- Remainが 5→4→3→2→1→0 と正しく減る
- 5問正解時に`stageClear`が発火し、GAME OVERは出ない
- コンソールに `[stage] correct` が1発射につき1回だけ出る

### To-dos

- [ ] attachKeyboardSubmission呼び出しを削除し、送信トリガを一本化
- [ ] grid.addEventListener('pointerup')を削除
- [ ] bottomYを9999に変更またはonBottomReachedにログ追加
- [ ] onCorrect/onBottomReachedのログで多重発火を確認