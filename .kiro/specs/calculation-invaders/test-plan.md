# Test Plan(テスト)

## Overview

This test plan maps acceptance criteria from requirements.md to concrete test cases. Tests are organized by component and requirement, with emphasis on generator constraint validation, gameplay loop verification, and performance benchmarks.

## 1. Question Generator Tests

### 1.1 Addition Generator Tests

**Requirement:** Gen-Add-01, Gen-Add-02

**Test Cases:**

**Test 1.1.1: ♡1 - Single digit, no carry**
- Generate 100 questions for rank 1
- Verify all operands are in range [1, 9]
- Verify all sums ≤ 9
- Verify no carry occurs (using hasCarry utility)
- Expected: 100% pass rate

**Test 1.1.2: ♡2 - Single digit with carry**
- Generate 100 questions for rank 2
- Verify all operands are in range [1, 9]
- Verify all sums ≥ 10
- Verify carry occurs (using hasCarry utility)
- Expected: 100% pass rate

**Test 1.1.3: ♡3 - Two digit, no carry**
- Generate 100 questions for rank 3
- Verify all operands are in range [10, 99]
- Verify no carry in ones or tens place
- Expected: 100% pass rate

**Test 1.1.4: ♡4 - Two digit with carry in ones**
- Generate 100 questions for rank 4
- Verify carry occurs in ones place only
- Verify no carry in tens place
- Expected: 100% pass rate

**Test 1.1.5: ♡5 - Two digit with carry in tens**
- Generate 100 questions for rank 5
- Verify carry occurs in tens place only
- Verify no carry in ones place
- Expected: 100% pass rate

**Test 1.1.6: ♡6 - Two digit with double carry**
- Generate 100 questions for rank 6
- Verify carry occurs in both ones and tens places
- Expected: 100% pass rate

**Test 1.1.7: ♡7-11 - Three and four digit addition**
- Generate 100 questions for each rank 7-11
- Verify operand digit counts match Appendix A
- Verify carry patterns match rank specifications
- Expected: 100% pass rate for each rank

**Test 1.1.8: ♡12-13 - Multi-operand addition**
- Generate 100 questions for ranks 12-13
- Verify operand count (3 for rank 12, 4 for rank 13)
- Verify all operands are valid
- Verify sum is correct
- Expected: 100% pass rate


### 1.2 Subtraction Generator Tests

**Requirement:** Gen-Sub-01, Gen-Sub-03

**Test Cases:**

**Test 1.2.1: ♠1 - Single digit, no borrow**
- Generate 100 questions for rank 1
- Verify minuend in range [1, 9]
- Verify subtrahend ≤ minuend
- Verify result ≥ 0
- Verify no borrow occurs (using hasBorrow utility)
- Expected: 100% pass rate

**Test 1.2.2: ♠2 - Single digit requiring borrow**
- Generate 100 questions for rank 2
- Verify minuend in range [10, 18]
- Verify subtrahend in range [1, 9]
- Verify borrow is required
- Verify result ≥ 0
- Expected: 100% pass rate

**Test 1.2.3: ♠3 - Two digit, no borrow in ones**
- Generate 100 questions for rank 3
- Verify minuend in range [10, 99]
- Verify subtrahend ≤ minuend
- Verify no borrow in ones place
- Verify result ≥ 0
- Expected: 100% pass rate

**Test 1.2.4: ♠4 - Two digit with borrow in ones**
- Generate 100 questions for rank 4
- Verify borrow occurs in ones place only
- Verify no borrow in tens place
- Verify result ≥ 0
- Expected: 100% pass rate

**Test 1.2.5: ♠5 - Two digit with borrow in tens**
- Generate 100 questions for rank 5
- Verify borrow occurs in tens place only
- Verify result ≥ 0
- Expected: 100% pass rate

**Test 1.2.6: ♠6 - Two digit with double borrow**
- Generate 100 questions for rank 6
- Verify borrow occurs in both ones and tens places
- Verify result ≥ 0
- Expected: 100% pass rate

**Test 1.2.7: ♠7-11 - Three and four digit subtraction**
- Generate 100 questions for each rank 7-11
- Verify operand digit counts match Appendix A
- Verify borrow patterns match rank specifications
- Verify result ≥ 0 for all questions
- Expected: 100% pass rate for each rank

**Test 1.2.8: ♠12-13 - Subtraction chains**
- Generate 100 questions for ranks 12-13
- Verify operand count (3 for rank 12, 4 for rank 13)
- Verify result ≥ 0 after all subtractions
- Expected: 100% pass rate


### 1.3 Multiplication Generator Tests

**Requirement:** Gen-Mul-01, Gen-Mul-02

**Test Cases:**

**Test 1.3.1: ♣1 - Multiplication table (1-3)**
- Generate 100 questions for rank 1
- Verify multiplicand in range [1, 3]
- Verify multiplier in range [1, 9]
- Verify product is correct
- Expected: 100% pass rate

**Test 1.3.2: ♣2 - Multiplication table (4-6)**
- Generate 100 questions for rank 2
- Verify multiplicand in range [4, 6]
- Verify multiplier in range [1, 9]
- Verify product is correct
- Expected: 100% pass rate

**Test 1.3.3: ♣3 - Multiplication table (7-9)**
- Generate 100 questions for rank 3
- Verify multiplicand in range [7, 9]
- Verify multiplier in range [1, 9]
- Verify product is correct
- Expected: 100% pass rate

**Test 1.3.4: ♣4-6 - Two digit × single digit**
- Generate 100 questions for each rank 4-6
- Verify multiplicand ranges match Appendix A (10-19, 20-49, 50-99)
- Verify multiplier in range [1, 9]
- Verify product is correct
- Expected: 100% pass rate for each rank

**Test 1.3.5: ♣7-9 - Two digit × two digit**
- Generate 100 questions for each rank 7-9
- Verify multiplicand and multiplier ranges match Appendix A
- Verify product is correct
- Expected: 100% pass rate for each rank

**Test 1.3.6: ♣10-11 - Three digit × single/two digit**
- Generate 100 questions for each rank 10-11
- Verify multiplicand in range [100, 999]
- Verify multiplier ranges match Appendix A
- Verify product is correct
- Expected: 100% pass rate for each rank

**Test 1.3.7: ♣12-13 - Multiplication chains**
- Generate 100 questions for ranks 12-13
- Verify operand count (3 for rank 12, 4 for rank 13)
- Verify product < 10000
- Verify product is correct
- Expected: 100% pass rate


### 1.4 Division Generator Tests

**Requirement:** Gen-Div-01, Gen-Div-03, Div-UI-Rem

**Test Cases:**

**Test 1.4.1: ♦1 - Division table inverse (1-3)**
- Generate 100 questions for rank 1
- Verify divisor in range [1, 3]
- Verify quotient in range [1, 9]
- Verify remainder = 0
- Verify dividend = divisor × quotient
- Verify no fractions used
- Expected: 100% pass rate

**Test 1.4.2: ♦2 - Division table inverse (4-6)**
- Generate 100 questions for rank 2
- Verify divisor in range [4, 6]
- Verify quotient in range [1, 9]
- Verify remainder = 0
- Verify dividend = divisor × quotient
- Expected: 100% pass rate

**Test 1.4.3: ♦3 - Division table inverse (7-9)**
- Generate 100 questions for rank 3
- Verify divisor in range [7, 9]
- Verify quotient in range [1, 9]
- Verify remainder = 0
- Verify dividend = divisor × quotient
- Expected: 100% pass rate

**Test 1.4.4: ♦4 - Two digit ÷ single, no remainder**
- Generate 100 questions for rank 4
- Verify dividend in range [10, 99]
- Verify divisor in range [1, 9]
- Verify remainder = 0
- Verify dividend = divisor × quotient
- Expected: 100% pass rate

**Test 1.4.5: ♦5 - Two digit ÷ single, with remainder**
- Generate 100 questions for rank 5
- Verify dividend in range [10, 99]
- Verify divisor in range [1, 9]
- Verify remainder > 0
- Verify remainder < divisor
- Verify dividend = divisor × quotient + remainder
- Expected: 100% pass rate

**Test 1.4.6: ♦6-7 - Three digit ÷ single**
- Generate 100 questions for each rank 6-7
- Verify dividend in range [100, 999]
- Verify divisor in range [1, 9]
- Verify remainder = 0 for rank 6, remainder > 0 for rank 7
- Verify remainder < divisor when remainder > 0
- Verify dividend = divisor × quotient + remainder
- Expected: 100% pass rate for each rank

**Test 1.4.7: ♦8-9 - Two digit ÷ two digit**
- Generate 100 questions for each rank 8-9
- Verify dividend in range [10, 99]
- Verify divisor in range [10, 99]
- Verify divisor ≤ dividend
- Verify remainder = 0 for rank 8, remainder > 0 for rank 9
- Verify remainder < divisor when remainder > 0
- Verify dividend = divisor × quotient + remainder
- Expected: 100% pass rate for each rank

**Test 1.4.8: ♦10-11 - Three digit ÷ two digit**
- Generate 100 questions for each rank 10-11
- Verify dividend in range [100, 999]
- Verify divisor in range [10, 99]
- Verify divisor ≤ dividend
- Verify remainder = 0 for rank 10, remainder > 0 for rank 11
- Verify remainder < divisor when remainder > 0
- Verify dividend = divisor × quotient + remainder
- Expected: 100% pass rate for each rank

**Test 1.4.9: ♦12-13 - Four digit ÷ two digit**
- Generate 100 questions for each rank 12-13
- Verify dividend in range [1000, 9999]
- Verify divisor in range [10, 99]
- Verify divisor ≤ dividend
- Verify remainder = 0 for rank 12, remainder > 0 for rank 13
- Verify remainder < divisor when remainder > 0
- Verify dividend = divisor × quotient + remainder
- Expected: 100% pass rate for each rank

**Test 1.4.10: Division remainder validation**
- Test remainder < divisor constraint
- Test remainder ≥ 0 constraint
- Verify generator never produces invalid remainders
- Expected: 100% pass rate


## 2. Performance Tests

### 2.1 Question Generation Performance

**Requirement:** Perf-Gen, Perf-01

**Test Cases:**

**Test 2.1.1: Single question generation**
- Generate 1000 individual questions (mixed operations and ranks)
- Measure time for each generation
- Verify each generation < 1ms
- Expected: 100% of generations < 1ms

**Test 2.1.2: Batch question generation**
- Generate 500 mixed questions in a single batch
- Measure total time
- Verify total time < 500ms
- Expected: Total time < 500ms (average < 1ms per question)

**Test 2.1.3: Pre-generation performance**
- Pre-generate 100 questions for a stage
- Measure total time
- Verify time < 100ms
- Expected: Pre-generation completes in < 100ms

**Test 2.1.4: Question retrieval performance**
- Pre-generate 100 questions
- Retrieve questions one by one
- Measure retrieval time
- Verify each retrieval < 0.1ms
- Expected: Instant retrieval from pre-generated pool

### 2.2 Rendering Performance

**Requirement:** Perf-FPS, Perf-Render

**Test Cases:**

**Test 2.2.1: Frame rate with 25 enemies**
- Spawn 25 active enemies
- Run game loop for 60 seconds
- Measure average FPS
- Verify FPS ≥ 60
- Expected: Average FPS ≥ 60

**Test 2.2.2: Frame rate during enemy descent**
- Spawn 25 enemies
- Trigger descent animation
- Measure FPS during animation
- Verify FPS ≥ 60
- Expected: FPS remains ≥ 60 during animation

**Test 2.2.3: Frame rate with visual effects**
- Spawn 25 enemies
- Trigger multiple explosions and effects
- Measure FPS during effects
- Verify FPS ≥ 50 (acceptable degradation)
- Expected: FPS ≥ 50 with effects active

**Test 2.2.4: Memory usage over time**
- Play game for 30 minutes
- Monitor memory usage
- Verify no memory leaks (stable memory after initial allocation)
- Expected: Memory usage remains stable


## 3. Gameplay Loop Tests

### 3.1 Correct Answer Flow

**Requirement:** Loop-01

**Test Cases:**

**Test 3.1.1: Enemy destruction on correct answer**
- Select enemy with formula "3 + 5"
- Input correct answer "8"
- Submit answer
- Verify enemy is removed from game field
- Expected: Enemy is destroyed

**Test 3.1.2: Score increase on correct answer**
- Record initial score
- Answer question correctly with base score 10 and combo 1
- Verify score increases by 10 × 1 = 10
- Expected: Score = initial + 10

**Test 3.1.3: Combo increment on correct answer**
- Record initial combo (e.g., 0)
- Answer question correctly
- Verify combo increments to 1
- Answer another question correctly
- Verify combo increments to 2
- Expected: Combo increments on each correct answer

**Test 3.1.4: Combo multiplier effect**
- Set combo to 3
- Answer question correctly with base score 10
- Verify score increases by 10 × 3 = 30
- Expected: Score increase reflects combo multiplier

### 3.2 Incorrect Answer Flow

**Requirement:** Loop-02

**Test Cases:**

**Test 3.2.1: Life decrement on incorrect answer**
- Record initial lives (e.g., 3)
- Answer question incorrectly
- Verify lives decrements to 2
- Expected: Lives = initial - 1

**Test 3.2.2: Combo reset on incorrect answer**
- Build combo to 5
- Answer question incorrectly
- Verify combo resets to 0
- Expected: Combo = 0

**Test 3.2.3: Enemy descent on incorrect answer**
- Record initial enemy positions
- Answer question incorrectly
- Verify all enemies descend by specified amount
- Expected: All enemy Y positions increase

**Test 3.2.4: Incorrect formula logging**
- Answer question "7 + 8" incorrectly with answer "14"
- Verify formula is logged to incorrectFormulas array
- Verify log includes formula, correct answer (15), player answer (14), timestamp
- Expected: Formula is logged with all details


### 3.3 Game State Transitions

**Requirement:** Loop-06, Loop-07, Loop-08

**Test Cases:**

**Test 3.3.1: Stage completion on all enemies destroyed**
- Destroy all enemies in stage
- Verify stage completion screen appears
- Verify card is flipped in progression
- Expected: Stage completes successfully

**Test 3.3.2: Game over on lives = 0**
- Reduce lives to 1
- Answer question incorrectly
- Verify lives = 0
- Verify game over screen appears
- Expected: Game over triggered

**Test 3.3.3: Game over on enemies reach bottom**
- Allow enemies to descend to bottom boundary
- Verify game over screen appears
- Expected: Game over triggered

**Test 3.3.4: Timer countdown**
- Start stage with 120 second time limit
- Wait 10 seconds
- Verify timer shows 110 seconds remaining
- Expected: Timer counts down correctly

## 4. Input Handling Tests

### 4.1 Division Remainder Input

**Requirement:** Input-Remainder, Div-UI-Rem

**Test Cases:**

**Test 4.1.1: Valid remainder input with comma**
- Division question: 23 ÷ 5 (answer: 4, remainder: 3)
- Input "4,3"
- Submit answer
- Verify answer is accepted as correct
- Expected: Answer accepted

**Test 4.1.2: Valid remainder input with Japanese comma**
- Division question: 23 ÷ 5
- Input "4、3"
- Submit answer
- Verify answer is accepted as correct
- Expected: Answer accepted

**Test 4.1.3: Invalid remainder format (no comma)**
- Division question: 23 ÷ 5
- Input "43"
- Verify error message appears
- Verify answer is not submitted
- Expected: Format error displayed

**Test 4.1.4: Invalid remainder (remainder ≥ divisor)**
- Division question: 23 ÷ 5
- Input "3,8" (remainder 8 ≥ divisor 5)
- Verify error message appears
- Verify answer is not submitted
- Expected: Validation error displayed

**Test 4.1.5: Remainder validation (remainder < divisor)**
- Division question: 23 ÷ 5
- Input "4,3" (remainder 3 < divisor 5)
- Verify answer is accepted
- Expected: Answer accepted

**Test 4.1.6: Zero remainder input**
- Division question: 20 ÷ 5 (answer: 4, remainder: 0)
- Input "4,0"
- Verify answer is accepted as correct
- Expected: Answer accepted


### 4.2 Keyboard and Click Input

**Requirement:** Input-Click, Input-Keyboard, Input-Button

**Test Cases:**

**Test 4.2.1: Enemy selection by click**
- Click on enemy
- Verify enemy is selected (highlighted)
- Verify input field is focused
- Expected: Enemy selected and input ready

**Test 4.2.2: Answer submission with Enter key**
- Select enemy
- Type answer in input field
- Press Enter key
- Verify answer is submitted
- Expected: Answer submitted

**Test 4.2.3: Answer submission with fire button**
- Select enemy
- Type answer in input field
- Click fire button
- Verify answer is submitted
- Expected: Answer submitted

**Test 4.2.4: Input field cleared after submission**
- Submit answer
- Verify input field is empty
- Expected: Input field cleared

**Test 4.2.5: Tab navigation between enemies**
- Press Tab key
- Verify focus moves to next enemy
- Press Tab multiple times
- Verify focus cycles through all enemies
- Expected: Tab navigation works

**Test 4.2.6: Escape key clears selection**
- Select enemy
- Press Escape key
- Verify selection is cleared
- Expected: Selection cleared

## 5. Learning Features Tests

### 5.1 Incorrect Formula Logging

**Requirement:** Learn-Log

**Test Cases:**

**Test 5.1.1: Formula logged on incorrect answer**
- Answer "7 + 8" incorrectly with "14"
- Verify formula is added to incorrectFormulas array
- Verify log entry contains: formula, correctAnswer (15), playerAnswer (14), timestamp, suit, rank
- Expected: Formula logged with all details

**Test 5.1.2: Multiple incorrect formulas logged**
- Answer 3 different questions incorrectly
- Verify all 3 formulas are in incorrectFormulas array
- Verify each has unique timestamp
- Expected: All formulas logged

**Test 5.1.3: Same formula logged multiple times**
- Answer "5 + 3" incorrectly
- Answer "5 + 3" incorrectly again
- Verify formula appears twice in log
- Expected: Duplicate entries allowed


### 5.2 Review Mode

**Requirement:** Learn-Review, Learn-Clear

**Test Cases:**

**Test 5.2.1: Review mode uses incorrect formulas**
- Log 5 incorrect formulas
- Enter review mode
- Verify stage contains only those 5 formulas
- Expected: Review stage uses logged formulas

**Test 5.2.2: Correct answer clears formula from log**
- Log formula "6 + 7"
- Enter review mode
- Answer "6 + 7" correctly
- Verify formula is removed from incorrectFormulas array
- Expected: Formula cleared from log

**Test 5.2.3: Incorrect answer in review mode keeps formula**
- Log formula "8 + 9"
- Enter review mode
- Answer "8 + 9" incorrectly again
- Verify formula remains in incorrectFormulas array
- Expected: Formula not cleared

**Test 5.2.4: Review mode with empty log**
- Clear all incorrect formulas
- Attempt to enter review mode
- Verify appropriate message (no formulas to review)
- Expected: Cannot enter review mode with empty log

## 6. Progression Tests

### 6.1 Card Tower Progression

**Requirement:** Progress-Card, Progress-Suit

**Test Cases:**

**Test 6.1.1: Card flipped on stage completion**
- Complete hearts-01 stage
- Verify hearts card 1 is flipped in card tower
- Expected: Card 1 of hearts is flipped

**Test 6.1.2: Multiple cards flipped**
- Complete hearts-01, hearts-02, hearts-03
- Verify hearts cards 1, 2, 3 are all flipped
- Expected: All 3 cards flipped

**Test 6.1.3: Suit unlock on 13 cards flipped**
- Complete all 13 hearts stages
- Verify all 13 hearts cards are flipped
- Verify suit unlock animation plays
- Expected: Hearts suit unlocked

**Test 6.1.4: Progression persists across sessions**
- Complete hearts-01
- Save game state
- Reload page
- Load game state
- Verify hearts card 1 is still flipped
- Expected: Progression persists


### 6.2 Persistence

**Requirement:** Progress-Save

**Test Cases:**

**Test 6.2.1: Game state saved to localStorage**
- Complete stage and update score
- Verify localStorage contains game state
- Verify state includes score, lives, progression, incorrectFormulas
- Expected: State saved to localStorage

**Test 6.2.2: Game state loaded from localStorage**
- Save game state with score 500, lives 2, hearts-03 completed
- Reload page
- Load game state
- Verify score = 500, lives = 2, hearts cards 1-3 flipped
- Expected: State restored correctly

**Test 6.2.3: Incorrect formulas persisted**
- Log 3 incorrect formulas
- Save game state
- Reload page
- Load game state
- Verify incorrectFormulas array contains 3 entries
- Expected: Incorrect formulas persisted

## 7. Accessibility Tests

### 7.1 ARIA Labels

**Requirement:** A11y-Label

**Test Cases:**

**Test 7.1.1: Formula has aria-label**
- Render enemy with formula "3 + 5"
- Verify element has aria-label="3 plus 5 equals"
- Expected: ARIA label present

**Test 7.1.2: All operations have correct aria-labels**
- Test addition: "3 + 5" → "3 plus 5 equals"
- Test subtraction: "8 - 3" → "8 minus 3 equals"
- Test multiplication: "4 × 6" → "4 times 6 equals"
- Test division: "12 ÷ 3" → "12 divided by 3 equals"
- Expected: All operations have correct labels

**Test 7.1.3: Screen reader announces formulas**
- Use screen reader (NVDA or JAWS)
- Navigate to enemy
- Verify formula is announced correctly
- Expected: Screen reader reads formula

### 7.2 Color-Weak Safe Design

**Requirement:** A11y-Color

**Test Cases:**

**Test 7.2.1: States distinguishable without color**
- View game with color-blind simulation (protanopia, deuteranopia, tritanopia)
- Verify selected enemy is distinguishable (pattern/border)
- Verify correct/incorrect feedback is distinguishable (icons)
- Expected: All states distinguishable

**Test 7.2.2: Sufficient contrast ratios**
- Measure contrast ratios for all text
- Verify all ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Expected: All contrast ratios pass WCAG AA


### 7.3 Keyboard Navigation

**Requirement:** A11y-Focus, Input-Keyboard

**Test Cases:**

**Test 7.3.1: Full keyboard navigation**
- Use only keyboard (no mouse)
- Navigate through all enemies with Tab
- Select enemy with Enter
- Input answer with keyboard
- Submit with Enter
- Verify game is fully playable
- Expected: Complete gameplay possible with keyboard only

**Test 7.3.2: Visible focus indicators**
- Tab through enemies
- Verify focused enemy has visible indicator (outline/border)
- Verify indicator meets WCAG contrast requirements
- Expected: Focus indicators visible and accessible

**Test 7.3.3: Focus management**
- Select enemy
- Verify input field receives focus automatically
- Submit answer
- Verify focus returns to appropriate element
- Expected: Focus managed correctly

### 7.4 Audio Controls

**Requirement:** A11y-Audio

**Test Cases:**

**Test 7.4.1: SFX toggle**
- Enable SFX
- Trigger sound effect (correct answer)
- Verify sound plays
- Disable SFX
- Trigger sound effect
- Verify sound does not play
- Expected: SFX toggle works

**Test 7.4.2: BGM toggle**
- Enable BGM
- Verify background music plays
- Disable BGM
- Verify background music stops
- Expected: BGM toggle works

**Test 7.4.3: Independent audio controls**
- Enable SFX, disable BGM
- Verify SFX plays but BGM does not
- Disable SFX, enable BGM
- Verify BGM plays but SFX does not
- Expected: Audio controls work independently

**Test 7.4.4: Audio settings persisted**
- Disable SFX and BGM
- Save game state
- Reload page
- Load game state
- Verify SFX and BGM remain disabled
- Expected: Audio settings persisted


## 8. Stage Configuration Tests

### 8.1 Stage JSON Validation

**Requirement:** Stage-Schema, Stage-Load

**Test Cases:**

**Test 8.1.1: Valid stage JSON loads successfully**
- Load hearts-01.json
- Verify stage loads without errors
- Verify all fields are parsed correctly
- Expected: Stage loads successfully

**Test 8.1.2: Invalid stage JSON rejected**
- Attempt to load stage with missing required field (e.g., no "rank")
- Verify error is thrown
- Verify error message indicates missing field
- Expected: Invalid stage rejected with clear error

**Test 8.1.3: Constraint validation**
- Load stage with addition operation
- Verify constraints include addition-specific fields (noCarry, forceCarry)
- Load stage with division operation
- Verify constraints include division-specific fields (divisibleOnly, allowRemainder)
- Expected: Constraints match operation type

**Test 8.1.4: Pre-generated questions loaded**
- Load stage with preGenerated array
- Verify QuestionBank uses pre-generated questions
- Verify questions match preGenerated data
- Expected: Pre-generated questions used

### 8.2 Stage Progression

**Requirement:** Stage-Progression

**Test Cases:**

**Test 8.2.1: Stages ordered correctly**
- Verify stage order: ♡1-13, ♠1-13, ♣1-13, ♦1-13
- Verify total of 52 stages
- Expected: Correct stage order

**Test 8.2.2: Difficulty scales with rank**
- Load hearts-01 and hearts-13
- Compare enemySet parameters (rows, spawnInterval, descendSpeed)
- Verify hearts-13 is more difficult (more rows, faster spawn, faster descent)
- Expected: Difficulty increases with rank

## 9. Integration Tests

### 9.1 End-to-End Gameplay

**Requirement:** All gameplay requirements

**Test Cases:**

**Test 9.1.1: Complete stage playthrough**
- Load hearts-01
- Answer all questions correctly
- Verify stage completes
- Verify card flips
- Verify progress saved
- Expected: Full stage playthrough works

**Test 9.1.2: Mixed correct/incorrect answers**
- Load stage
- Answer some questions correctly, some incorrectly
- Verify score increases on correct answers
- Verify lives decrease on incorrect answers
- Verify combo resets on incorrect answers
- Verify incorrect formulas logged
- Expected: Mixed gameplay works correctly

**Test 9.1.3: Game over and retry**
- Load stage
- Lose all lives
- Verify game over screen
- Retry stage
- Verify stage reloads with fresh state
- Expected: Game over and retry works


### 9.2 Cross-Browser Compatibility

**Requirement:** Tech-Local

**Test Cases:**

**Test 9.2.1: Chrome compatibility**
- Run game in Chrome
- Test all core features
- Verify 60fps performance
- Expected: Full functionality in Chrome

**Test 9.2.2: Firefox compatibility**
- Run game in Firefox
- Test all core features
- Verify 60fps performance
- Expected: Full functionality in Firefox

**Test 9.2.3: Safari compatibility**
- Run game in Safari
- Test all core features
- Verify 60fps performance
- Expected: Full functionality in Safari

**Test 9.2.4: Edge compatibility**
- Run game in Edge
- Test all core features
- Verify 60fps performance
- Expected: Full functionality in Edge

## 10. Smoke Tests (Quick Validation)

### 10.1 MVP Smoke Tests

**Test Cases:**

**Test 10.1.1: Generator smoke test**
- Generate 10 questions for each operation (♡1, ♠1, ♣1, ♦1)
- Verify all questions are valid
- Verify generation time < 10ms total
- Expected: All generators work

**Test 10.1.2: Spawn loop smoke test**
- Load hearts-01
- Spawn 5 enemies
- Select enemy
- Answer correctly
- Verify enemy destroyed
- Expected: Basic spawn loop works

**Test 10.1.3: Wrong answer smoke test**
- Load hearts-01
- Answer incorrectly
- Verify life decreases
- Verify enemies descend
- Verify formula logged
- Expected: Wrong answer flow works

**Test 10.1.4: Division remainder smoke test**
- Load diamonds-05 (with remainder)
- Answer question with format "4,3"
- Verify answer accepted
- Expected: Remainder input works

**Test 10.1.5: Performance smoke test**
- Generate 500 mixed questions
- Measure time
- Verify time < 500ms
- Expected: Performance target met

## Test Execution Summary

### Test Coverage by Requirement

| Requirement ID | Test Cases | Priority |
|----------------|------------|----------|
| Gen-Add-01 | 1.1.1, 1.1.2, 10.5 | High |
| Gen-Sub-03 | 1.2.3, 10.5 | High |
| Gen-Mul-02 | 1.3.2, 10.5 | High |
| Gen-Div-03 | 1.4.3, 10.5 | High |
| Div-UI-Rem | 1.4.10, 4.1.1-4.1.6, 10.1.4 | High |
| Loop-01 | 3.1.1-3.1.4, 8.5, 10.1.2 | High |
| Loop-02 | 3.2.1-3.2.4, 8.5, 10.1.3 | High |
| Perf-01 | 2.1.1, 2.1.2, 10.5, 10.1.5 | High |
| Learn-Log | 3.2.4, 5.1.1-5.1.3, 10.1.3 | Medium |
| Learn-Review | 5.2.1-5.2.4 | Medium |
| A11y-Label | 7.1.1-7.1.3 | Medium |
| A11y-Color | 7.2.1-7.2.2 | Medium |
| A11y-Audio | 7.4.1-7.4.4 | Medium |
| Progress-Card | 6.1.1-6.1.4 | Medium |
| Stage-Load | 8.1.1-8.1.4 | Medium |

### Test Execution Order

1. **Unit Tests** (Run first, fast feedback)
   - Generator tests (1.1-1.4)
   - Utility tests (validation, random)
   - Performance tests (2.1)

2. **Integration Tests** (Run after unit tests pass)
   - Gameplay loop tests (3.1-3.3)
   - Input handling tests (4.1-4.2)
   - Learning features tests (5.1-5.2)

3. **System Tests** (Run after integration tests pass)
   - End-to-end gameplay (9.1)
   - Accessibility tests (7.1-7.4)
   - Cross-browser tests (9.2)

4. **Smoke Tests** (Run for quick validation)
   - MVP smoke tests (10.1)

### Success Criteria

- All High priority tests pass (100%)
- All Medium priority tests pass (≥ 95%)
- Performance benchmarks met (< 1ms generation, 60fps, < 500ms for 500 questions)
- Accessibility tests pass (WCAG AA compliance)
- Cross-browser compatibility verified (Chrome, Firefox, Safari, Edge)
