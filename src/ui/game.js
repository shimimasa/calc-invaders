 // Enter/ボタンで判定
 function fire() {
    const ok = ctrl?.submit($answer.value);
     if (ok) $answer.value = "";
   }
   $answer.addEventListener("keydown", (e) => {
     if (e.key === "Enter") fire();
   });
   $fire.addEventListener("click", fire);
  
  function disableControls(msg){
    $answer.disabled = true;
    $fire.disabled = true;
    if (msg) $selected.textContent = msg;
  }
  
   // 次の面
   $next.addEventListener("click", async () => {
     stagePtr = (stagePtr + 1) % stageIds.length;
     await startStage();
   });
  
   // 起動
   async function startStage() {
     try {
       const id = stageIds[stagePtr];
       const base = (import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/';
       const url  = `${base}data/stages/${id}.json`;
       const res = await fetch(url);
       if (!res.ok) throw new Error(`Stage JSON not found: ${id} (${res.status})`);
       const json = await res.json();
       $stage.textContent = json.deckLabel;
       timeLeft = json.rules.timeLimitSec ?? 60;
       $time.textContent = timeLeft;
       life = json.rules.lives ?? 3;
       $life.textContent = life;
       $selected.textContent = "SELECTED: なし";
      $answer.disabled = false;
      $fire.disabled = false;
  
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
       $selected.textContent =
         "ステージデータの読み込みに失敗しました。`npm run build:stages` を実行し、/data/stages/ にJSONがあるか確認してください。";
     }
   }
  startStage();
  