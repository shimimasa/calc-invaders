# Implementation Plan

## Milestone 1: MVP - Core Gameplay (♡1-3 & ♦1-3)

**Done Criteria:** All M1 generator tests pass (100 samples/rank for ♡1-3, ♠1-3, ♣1-3, ♦1-3), Perf-01 passes (500 mixed questions < 500ms), end-to-end gameplay works for MVP stages.

- [ ] 1. Set up project structure and utilities
  - Create project directory structure (src/core, src/utils, data/stages, scripts)
  - Initialize package.json with Vite and ESM configuration
  - Create index.html entry point
  - _Requirements: Tech-ESM, Tech-Build_
  - _Done: Project builds and runs with Vite dev server_

- [ ] 1.1 Implement random utilities
  - Create src/utils/random.js with randomInt, randomChoice, shuffle functions
  - _Requirements: Gen-Validate_
  - _Done: Functions return values within specified ranges and shuffle arrays correctly_

- [ ] 1.2 Implement validation utilities
  - Create src/utils/validation.js with hasCarry, hasBorrow, isDivisible, countDigits functions
  - _Requirements: Gen-Add-01, Gen-Sub-03, Gen-Div-03_
  - _Done: Utilities correctly identify carry, borrow, and divisibility conditions_

- [ ]* 1.3 Write unit tests for utilities
  - Test random.js functions with edge cases
  - Test validation.js with known carry/borrow/divisible cases
  - _Requirements: Perf-01_
  - _Done: All utility tests pass_

- [ ] 2. Implement question generators (MVP scope: ranks 1-3)
  - Create src/core/generators/ directory
  - _Requirements: Gen-Add-01, Gen-Add-02, Gen-Sub-01, Gen-Sub-03, Gen-Mul-01, Gen-Mul-02, Gen-Div-01, Gen-Div-03, Perf-Gen_
  - _Done: All four generators produce valid questions for ranks 1-3_

- [ ] 2.1 Implement addition generator
  - Create src/core/generators/addition.js
  - Implement generateAddition(rank, constraints) for ranks 1-3
  - Support noCarry, forceCarry, aRange, bRange constraints
  - Return {formula, answer, operands}
  - _Requirements: Gen-Add-01, Gen-Add-02_
  - _Done: Generates valid addition questions for ♡1 (no carry), ♡2 (with carry), ♡3 (two-digit no carry)_

- [ ] 2.2 Implement subtraction generator
  - Create src/core/generators/subtraction.js
  - Implement generateSubtraction(rank, constraints) for ranks 1-3
  - Support noBorrow, forceBorrow, aRange, bRange constraints
  - Ensure minuend ≥ subtrahend and result ≥ 0
  - _Requirements: Gen-Sub-01, Gen-Sub-03_
  - _Done: Generates valid subtraction questions for ♠1-3 with correct borrow behavior_

- [ ] 2.3 Implement multiplication generator
  - Create src/core/generators/multiplication.js
  - Implement generateMultiplication(rank, constraints) for ranks 1-3
  - Support aRange, bRange constraints
  - _Requirements: Gen-Mul-01, Gen-Mul-02_
  - _Done: Generates valid multiplication questions for ♣1-3 (multiplication tables 1-9)_

- [ ] 2.4 Implement division generator
  - Create src/core/generators/division.js
  - Implement generateDivision(rank, constraints) for ranks 1-3
  - Support divisibleOnly, allowRemainder, aRange, bRange constraints
  - Return {formula, answer, remainder, operands}
  - Ensure integer-only division (no fractions)
  - _Requirements: Gen-Div-01, Gen-Div-03, Div-UI-Rem_
  - _Done: Generates valid division questions for ♦1-3 with remainder = 0_

- [ ] 2.5 Write generator constraint tests
  - Test 100 samples per rank (1-3) for each generator
  - Verify constraints are respected (carry, borrow, remainder)
  - Test performance: generation < 1ms per question
  - _Requirements: Gen-Add-01, Gen-Sub-03, Gen-Mul-02, Gen-Div-03, Perf-Gen_
  - _Done: All constraint tests pass for ranks 1-3_


- [ ] 3. Implement QuestionBank
  - Create src/core/questionBank.js
  - _Requirements: Perf-01, Gen-Unique_
  - _Done: QuestionBank pre-generates questions and provides instant retrieval_

- [ ] 3.1 Create QuestionBank class with pre-generation
  - Implement constructor(stageConfig)
  - Implement preGenerate(count) method
  - Implement getNext() and hasMore() methods
  - Support shuffle functionality
  - Assign unique IDs to questions
  - _Requirements: Perf-01_
  - _Done: QuestionBank can pre-generate 100 questions in < 100ms_

- [ ] 3.2 Add support for pre-generated questions from stage JSON
  - Load questions from stageConfig.preGenerated array if present
  - Fall back to generator if preGenerated is empty
  - _Requirements: Stage-Load_
  - _Done: QuestionBank uses preGenerated questions when available_

- [ ] 3.3 Write QuestionBank tests
  - Test pre-generation with various stage configs
  - Test shuffle functionality
  - Test question uniqueness within a stage
  - Test performance: 500 questions < 500ms
  - _Requirements: Perf-01, Gen-Unique_
  - _Done: QuestionBank tests pass_

- [ ] 4. Implement GameState
  - Create src/core/gameState.js
  - _Requirements: Loop-01, Loop-02, Learn-Log, Progress-Card, Progress-Save_
  - _Done: GameState manages all game state and persists to localStorage_

- [ ] 4.1 Create GameState class with core state
  - Implement state model (score, combo, lives, time, selectedEnemyId, etc.)
  - Implement addScore, incrementCombo, resetCombo methods
  - Implement decrementLife, updateTime methods
  - Implement selectEnemy, clearSelection methods
  - _Requirements: Loop-01, Loop-02_
  - _Done: GameState correctly tracks score, combo, and lives_

- [ ] 4.2 Add learning features to GameState
  - Implement logIncorrectAnswer method
  - Implement getIncorrectFormulas method
  - Implement clearIncorrectFormula method
  - Store incorrectFormulas array with formula, correctAnswer, playerAnswer, timestamp
  - _Requirements: Learn-Log, Learn-Review, Learn-Clear_
  - _Done: GameState logs incorrect answers and provides review data_

- [ ] 4.3 Add progression tracking to GameState
  - Implement completeStage, flipCard, unlockSuit methods
  - Track stageProgress (cards flipped per suit)
  - Track unlockedStages array
  - _Requirements: Progress-Card, Progress-Suit_
  - _Done: GameState tracks progression through 52 stages_

- [ ] 4.4 Add persistence to GameState
  - Implement save() method to write to localStorage
  - Implement load() method to read from localStorage
  - Implement reset() method
  - _Requirements: Progress-Save_
  - _Done: GameState persists and restores from localStorage_

- [ ]* 4.5 Write GameState tests
  - Test score calculation with combo multiplier
  - Test life decrement and game over detection
  - Test incorrect answer logging
  - Test progression tracking
  - Test localStorage persistence
  - _Requirements: Loop-01, Loop-02, Learn-Log, Progress-Card_
  - _Done: GameState tests pass_


- [ ] 5. Implement SpawnController
  - Create src/core/spawnController.js
  - _Requirements: Loop-03, Loop-06, Loop-08, Stage-Pattern_
  - _Done: SpawnController manages enemy spawning, movement, and lifecycle_

- [ ] 5.1 Create SpawnController class with basic spawning
  - Implement constructor(questionBank, enemySetConfig)
  - Implement start() and stop() methods
  - Implement spawn loop with spawnIntervalSec timing
  - Create Enemy objects with position, formula, answer
  - Support grid pattern positioning
  - _Requirements: Loop-03, Stage-Pattern_
  - _Done: SpawnController spawns enemies in grid formation at specified intervals_

- [ ] 5.2 Add enemy movement and boundary detection
  - Implement update(deltaTime) method
  - Update enemy positions based on descendSpeed
  - Detect when enemies reach bottom boundary
  - Implement descendAll(amount) for wrong answer penalty
  - _Requirements: Loop-02, Loop-08_
  - _Done: Enemies descend smoothly and trigger game over at bottom_

- [ ] 5.3 Add enemy removal and lifecycle management
  - Implement removeEnemy(enemyId) method
  - Implement getActiveEnemies() method
  - Track enemy state (alive/destroyed)
  - _Requirements: Loop-01, Loop-06_
  - _Done: Enemies can be removed and lifecycle is tracked correctly_

- [ ]* 5.4 Write SpawnController tests
  - Test enemy spawning at correct intervals
  - Test grid positioning
  - Test enemy movement and descent
  - Test boundary detection
  - Test enemy removal
  - _Requirements: Loop-03, Loop-06, Loop-08_
  - _Done: SpawnController tests pass_

- [ ] 6. Build stage JSON files (MVP: ♡1-3, ♦1-3)
  - Create scripts/buildStages.js
  - _Requirements: Stage-Schema, Stage-Load, Stage-Constraints_
  - _Done: Script generates valid stage JSON files for MVP scope_

- [ ] 6.1 Create buildStages.js script
  - Implement stage JSON generation logic
  - Read difficulty mapping from requirements.md Appendix A
  - Generate stage JSON for hearts-01, hearts-02, hearts-03
  - Generate stage JSON for diamonds-01, diamonds-02, diamonds-03
  - Apply appropriate constraints based on rank
  - Write to data/stages/ directory
  - _Requirements: Stage-Schema, Stage-Constraints_
  - _Done: Script generates 6 valid stage JSON files_

- [ ] 6.2 Implement stage JSON validation
  - Validate required fields (stageId, mark, operation, rank, enemySet, rules, generator)
  - Validate constraint alignment with operation type
  - Validate ranges and numeric values
  - _Requirements: Stage-Load_
  - _Done: Script validates all generated JSON against schema_

- [ ]* 6.3 Test stage generation
  - Run buildStages.js and verify output
  - Manually inspect generated JSON files
  - Test loading stages in game
  - _Requirements: Stage-Load_
  - _Done: All 6 MVP stage files are valid and loadable_


- [ ] 7. Implement basic UI and input handling
  - Create src/ui/ directory
  - _Requirements: UI-Header, UI-Field, UI-Input, Input-Click, Input-Keyboard, Div-UI-Rem_
  - _Done: Basic UI allows selecting enemies, inputting answers, and displaying feedback_

- [ ] 7.1 Create basic HTML structure
  - Create index.html with game container
  - Add header area (score, lives, stage, timer)
  - Add game field area (enemy container)
  - Add input area (answer input, fire button)
  - _Requirements: UI-Header, UI-Field, UI-Input_
  - _Done: HTML structure is complete and styled_

- [ ] 7.2 Implement enemy rendering
  - Create src/ui/renderer.js
  - Implement renderEnemies(enemies) function
  - Display formula above each enemy
  - Position enemies in grid layout
  - _Requirements: UI-Field, Loop-03_
  - _Done: Enemies are rendered with formulas visible_

- [ ] 7.3 Implement input handler
  - Create src/ui/inputHandler.js
  - Handle enemy click events (select enemy)
  - Handle answer input (keyboard)
  - Handle Enter key and fire button (submit answer)
  - Support division remainder format "商,余り"
  - _Requirements: Input-Click, Input-Keyboard, Input-Button, Input-Remainder, Div-UI-Rem_
  - _Done: Input handler processes clicks, keyboard input, and division remainder format_

- [ ] 7.4 Implement answer validation and feedback
  - Parse division answers with remainder
  - Validate remainder < divisor
  - Display visual feedback (correct: green flash, incorrect: red flash)
  - Clear input field after submission
  - _Requirements: Input-Validation, Input-Clear, Loop-01, Loop-02_
  - _Done: Answer validation works correctly and provides visual feedback_

- [ ] 7.5 Implement UI updates
  - Update score, combo, lives display
  - Update timer display
  - Highlight selected enemy
  - Remove destroyed enemies from display
  - _Requirements: UI-Header, UI-Select, UI-Feedback_
  - _Done: UI updates reflect game state changes in real-time_

- [ ]* 7.6 Write UI and input tests
  - Test enemy click selection
  - Test keyboard input handling
  - Test division remainder parsing
  - Test visual feedback rendering
  - _Requirements: Input-Click, Input-Keyboard, Div-UI-Rem_
  - _Done: UI and input tests pass_


- [ ] 8. Integrate components and implement game loop
  - Create src/main.js
  - _Requirements: Loop-01, Loop-02, Loop-06, Loop-07, Loop-08_
  - _Done: Complete game loop works end-to-end for MVP stages_

- [ ] 8.1 Create main game initialization
  - Implement loadStage(stageId) function
  - Initialize QuestionBank with stage config
  - Initialize SpawnController with QuestionBank
  - Initialize GameState
  - Connect UI to game state
  - _Requirements: Stage-Load_
  - _Done: Game initializes and loads MVP stages_

- [ ] 8.2 Implement answer submission flow
  - Connect input handler to GameState.submitAnswer
  - On correct answer: remove enemy, add score, increment combo
  - On incorrect answer: decrement life, reset combo, descend enemies, log formula
  - Update UI after each answer
  - _Requirements: Loop-01, Loop-02, Learn-Log_
  - _Done: Answer submission flow works correctly with all effects_

- [ ] 8.3 Implement game loop and timing
  - Create requestAnimationFrame loop
  - Update SpawnController with deltaTime
  - Update timer in GameState
  - Check win condition (all enemies destroyed)
  - Check lose conditions (lives = 0 or enemies at bottom)
  - _Requirements: Loop-06, Loop-07, Loop-08_
  - _Done: Game loop runs at 60fps and handles win/lose conditions_

- [ ] 8.4 Implement stage completion
  - Display stage complete screen
  - Flip card in progression
  - Save game state to localStorage
  - Provide option to continue to next stage or return to menu
  - _Requirements: Loop-06, Progress-Card, Progress-Save_
  - _Done: Stage completion works and saves progress_

- [ ]* 8.5 Test end-to-end gameplay
  - Play through hearts-01 to completion
  - Play through diamonds-01 with remainder input
  - Test correct answer flow (score, combo, enemy removal)
  - Test incorrect answer flow (life loss, combo reset, descent)
  - Test game over conditions
  - _Requirements: Loop-01, Loop-02, Loop-06, Loop-07, Loop-08_
  - _Done: End-to-end gameplay works for all MVP stages_

- [ ] 9. Implement review mode
  - Create review mode stage loader
  - _Requirements: Learn-Review, Learn-Clear_
  - _Done: Review mode allows practicing incorrect formulas_

- [ ] 9.1 Create review mode stage generator
  - Load incorrectFormulas from GameState
  - Generate stage config using incorrect formulas
  - Use QuestionBank with preGenerated questions from log
  - _Requirements: Learn-Review_
  - _Done: Review mode generates stage from incorrect formulas_

- [ ] 9.2 Implement review mode completion
  - On correct answer in review mode, clear formula from log
  - Track review mode progress
  - Return to normal mode after review complete
  - _Requirements: Learn-Clear_
  - _Done: Review mode clears formulas on correct answers_

- [ ]* 9.3 Test review mode
  - Generate incorrect answers in normal mode
  - Enter review mode and verify formulas appear
  - Answer correctly and verify formulas are cleared
  - _Requirements: Learn-Review, Learn-Clear_
  - _Done: Review mode works correctly_


## Milestone 2: Full 52 Stages and Complete Generator Coverage

- [ ] 10. Extend generators to all 13 ranks
  - Update all four generators to support ranks 1-13
  - _Requirements: Gen-Add-02, Gen-Sub-01, Gen-Mul-01, Gen-Div-01_
  - _Done: All generators support full rank range 1-13_

- [ ] 10.1 Extend addition generator (ranks 4-13)
  - Implement ranks 4-6 (two-digit with various carry patterns)
  - Implement ranks 7-9 (three-digit with carries)
  - Implement ranks 10-11 (four-digit)
  - Implement ranks 12-13 (multi-operand addition)
  - _Requirements: Gen-Add-02_
  - _Done: Addition generator supports all 13 ranks per Appendix A_

- [ ] 10.2 Extend subtraction generator (ranks 4-13)
  - Implement ranks 4-6 (two-digit with various borrow patterns)
  - Implement ranks 7-9 (three-digit with borrows)
  - Implement ranks 10-11 (four-digit)
  - Implement ranks 12-13 (subtraction chains)
  - _Requirements: Gen-Sub-01_
  - _Done: Subtraction generator supports all 13 ranks per Appendix A_

- [ ] 10.3 Extend multiplication generator (ranks 4-13)
  - Implement ranks 4-6 (two-digit × single-digit)
  - Implement ranks 7-9 (two-digit × two-digit)
  - Implement ranks 10-11 (three-digit × single/two-digit)
  - Implement ranks 12-13 (multiplication chains)
  - _Requirements: Gen-Mul-01_
  - _Done: Multiplication generator supports all 13 ranks per Appendix A_

- [ ] 10.4 Extend division generator (ranks 4-13)
  - Implement ranks 4-5 (two-digit ÷ single-digit, with/without remainder)
  - Implement ranks 6-7 (three-digit ÷ single-digit, with/without remainder)
  - Implement ranks 8-9 (two-digit ÷ two-digit, with/without remainder)
  - Implement ranks 10-11 (three-digit ÷ two-digit, with/without remainder)
  - Implement ranks 12-13 (four-digit ÷ two-digit, with/without remainder)
  - _Requirements: Gen-Div-01, Div-UI-Rem_
  - _Done: Division generator supports all 13 ranks per Appendix A_

- [ ]* 10.5 Write comprehensive generator tests
  - Test 100 samples per rank (1-13) for each generator
  - Verify all constraints per Appendix A
  - Test performance: 500 mixed questions < 500ms
  - _Requirements: Perf-01, Gen-Add-01, Gen-Sub-03, Gen-Mul-02, Gen-Div-03_
  - _Done: All generator tests pass for ranks 1-13_

- [ ] 11. Generate all 52 stage JSON files
  - Update scripts/buildStages.js to generate all stages
  - _Requirements: Stage-Schema, Stage-Constraints, Stage-Progression_
  - _Done: All 52 stage JSON files are generated and valid_

- [ ] 11.1 Extend buildStages.js for all suits and ranks
  - Generate all 13 hearts stages (♡1-13)
  - Generate all 13 spades stages (♠1-13)
  - Generate all 13 clubs stages (♣1-13)
  - Generate all 13 diamonds stages (♦1-13)
  - Apply rank-specific constraints from Appendix A
  - _Requirements: Stage-Schema, Stage-Constraints_
  - _Done: Script generates all 52 stage JSON files_

- [ ] 11.2 Implement progressive difficulty scaling
  - Scale enemySet parameters (rows, spawnInterval, descendSpeed) by rank
  - Scale rules parameters (timeLimit, scorePerHit) by rank
  - Adjust patterns (grid for early ranks, random for later ranks)
  - _Requirements: Stage-Progression_
  - _Done: Stage difficulty scales appropriately across 52 stages_

- [ ]* 11.3 Validate all 52 stage files
  - Run validation on all generated JSON files
  - Test loading each stage in game
  - Verify constraints match Appendix A
  - _Requirements: Stage-Load, Stage-Constraints_
  - _Done: All 52 stages are valid and loadable_


- [ ] 12. Implement card tower progression UI
  - Create src/ui/cardTower.js
  - _Requirements: UI-Cards, Progress-Card, Progress-Suit_
  - _Done: Card tower displays progression and flips cards on stage completion_

- [ ] 12.1 Create card tower component
  - Display 4 suits × 13 cards (52 total)
  - Show card state (locked, unlocked, flipped)
  - Implement card flip animation
  - _Requirements: UI-Cards, Progress-Card_
  - _Done: Card tower renders all 52 cards with correct states_

- [ ] 12.2 Implement suit unlock animation
  - Trigger animation when all 13 cards of a suit are flipped
  - Display "Kingdom Unlocked" message
  - _Requirements: Progress-Suit_
  - _Done: Suit unlock animation plays on completion_

- [ ]* 12.3 Test card tower progression
  - Complete stages and verify cards flip
  - Complete all 13 ranks of a suit and verify unlock animation
  - Test persistence (cards remain flipped after reload)
  - _Requirements: Progress-Card, Progress-Suit, Progress-Save_
  - _Done: Card tower progression works correctly_

## Milestone 3: Polish and Accessibility

- [ ] 13. Implement accessibility features
  - Create src/utils/accessibility.js
  - _Requirements: A11y-Label, A11y-Color, A11y-Audio, A11y-Focus, A11y-Text_
  - _Done: Game meets accessibility requirements_

- [ ] 13.1 Add ARIA labels for formulas
  - Implement formulaToAriaLabel function
  - Add aria-label to all formula elements
  - Add role="button" and tabindex to enemies
  - _Requirements: A11y-Label_
  - _Done: All formulas have proper ARIA labels_

- [ ] 13.2 Implement color-weak safe design
  - Define accessible color palette
  - Use patterns/icons in addition to color for states
  - Test with color-blind simulation tools
  - _Requirements: A11y-Color_
  - _Done: Game is playable with color-weak vision_

- [ ] 13.3 Add keyboard navigation
  - Implement Tab navigation between enemies
  - Implement Enter/Space for selection
  - Implement Escape to clear selection
  - Add visible focus indicators
  - _Requirements: A11y-Focus, Input-Keyboard_
  - _Done: Game is fully playable with keyboard only_

- [ ] 13.4 Implement audio toggles
  - Add SFX ON/OFF toggle
  - Add BGM ON/OFF toggle
  - Persist audio settings to localStorage
  - _Requirements: A11y-Audio_
  - _Done: Audio can be toggled independently_

- [ ]* 13.5 Test accessibility compliance
  - Test with screen reader (NVDA or JAWS)
  - Test keyboard-only navigation
  - Verify WCAG AA contrast ratios
  - Test with color-blind simulation
  - _Requirements: A11y-Label, A11y-Color, A11y-Focus, A11y-Text_
  - _Done: Game meets WCAG AA accessibility standards_


- [ ] 14. Implement performance optimizations
  - _Requirements: Perf-Gen, Perf-FPS, Perf-Render_
  - _Done: Game meets performance targets (< 1ms generation, 60fps)_

- [ ] 14.1 Implement object pooling for enemies
  - Create EnemyPool class
  - Reuse enemy objects instead of creating new ones
  - Release enemies back to pool on destruction
  - _Requirements: Perf-Render_
  - _Done: Object pooling reduces garbage collection overhead_

- [ ] 14.2 Optimize rendering
  - Batch DOM updates
  - Use CSS transforms for positioning (GPU-accelerated)
  - Implement dirty rectangle optimization if using Canvas
  - Add will-change CSS property for animated elements
  - _Requirements: Perf-FPS, Perf-Render_
  - _Done: Rendering maintains 60fps with 25 active enemies_

- [ ] 14.3 Add performance monitoring
  - Implement FPS counter
  - Add performance metrics logging
  - Display performance warning if FPS drops below 30
  - _Requirements: Perf-FPS_
  - _Done: Performance monitoring is active and visible_

- [ ]* 14.4 Test performance benchmarks
  - Verify question generation < 1ms per question
  - Verify 500 questions generated < 500ms
  - Verify 60fps maintained during gameplay
  - Test with 25 active enemies
  - _Requirements: Perf-Gen, Perf-FPS, Perf-01_
  - _Done: All performance benchmarks pass_

- [ ] 15. Add visual polish and effects
  - _Requirements: UI-Feedback_
  - _Done: Game has polished visual feedback_

- [ ] 15.1 Implement visual feedback effects
  - Add explosion animation for correct answers
  - Add damage flash for incorrect answers
  - Add combo counter animation
  - Add score popup on enemy destruction
  - _Requirements: UI-Feedback_
  - _Done: Visual feedback enhances gameplay experience_

- [ ] 15.2 Add smooth transitions
  - Implement smooth enemy descent animation
  - Add fade-in/fade-out for stage transitions
  - Add card flip animation
  - _Requirements: UI-Cards_
  - _Done: Transitions are smooth and polished_

- [ ]* 15.3 Test visual polish
  - Verify all animations play correctly
  - Test performance impact of effects
  - Verify effects don't interfere with gameplay
  - _Requirements: UI-Feedback, Perf-FPS_
  - _Done: Visual effects work correctly without performance impact_

- [ ] 16. Final integration and testing
  - _Requirements: All requirements_
  - _Done: Complete game is playable and meets all requirements_

- [ ] 16.1 Perform end-to-end testing
  - Play through all 52 stages
  - Test all four operations at all ranks
  - Test review mode with various incorrect formulas
  - Test progression and card tower
  - Test persistence across browser sessions
  - _Requirements: All gameplay requirements_
  - _Done: All 52 stages are playable and functional_

- [ ]* 16.2 Perform comprehensive testing
  - Run all unit tests
  - Run all integration tests
  - Test accessibility features
  - Test performance benchmarks
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - _Requirements: All requirements_
  - _Done: All tests pass and game works across browsers_

- [ ] 16.3 Create documentation
  - Write README.md with setup instructions
  - Document stage JSON schema
  - Document generator constraints
  - Add code comments and JSDoc
  - _Requirements: Tech-ESM_
  - _Done: Documentation is complete and clear_
