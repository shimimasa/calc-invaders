# Requirements Document

## Introduction

Calculation Invaders (計算インベーダー) is an educational arcade shooter game designed for elementary school students. The game combines learning mathematics with arcade-style gameplay, where players solve arithmetic problems to defeat enemies. The game features a progressive difficulty system with 52 stages across four mathematical operations (suits): addition (♡), subtraction (♠), multiplication (♣), and division (♦), each with 13 difficulty ranks.

The core gameplay loop involves enemies displaying mathematical formulas, players selecting and answering them, and receiving immediate feedback through game mechanics. Correct answers destroy enemies and increase score/combo, while incorrect answers reduce life and allow enemies to advance. The game includes learning features such as incorrect answer logging and review mode, card-tower progression visualization, and comprehensive accessibility support.

The implementation will use JavaScript (ESM) without TypeScript, targeting local browser execution with strict performance requirements (< 1ms per question generation, 60fps gameplay).

## Requirements

### Requirement 1: Question Generation System

**User Story:** As a student, I want the game to generate appropriate math problems for my current difficulty level, so that I can practice arithmetic at the right challenge level.

#### Acceptance Criteria

1. **[Gen-Add-01]** WHEN generating 100 questions for ♡1 THEN the system SHALL ensure all sums are ≤ 9 AND no carry operation occurs
2. **[Gen-Add-02]** WHEN generating questions for any addition rank (♡1-13) THEN the system SHALL strictly follow the constraints defined in Appendix A for that rank
3. **[Gen-Sub-01]** WHEN generating questions for any subtraction rank (♠1-13) THEN the system SHALL ensure minuend ≥ subtrahend AND result ≥ 0
4. **[Gen-Sub-03]** WHEN generating 100 questions for ♠3 THEN the system SHALL ensure minuend ≥ subtrahend AND no borrowing occurs in the ones place
5. **[Gen-Mul-01]** WHEN generating questions for any multiplication rank (♣1-13) THEN the system SHALL strictly follow the constraints defined in Appendix A for that rank
6. **[Gen-Mul-02]** WHEN generating 100 questions for ♣2 THEN the system SHALL use multiplicand in range {4..6} AND multiplier in range {1..9}
7. **[Gen-Div-01]** WHEN generating questions for any division rank (♦1-13) THEN the system SHALL use integers only with no fractions
8. **[Gen-Div-03]** WHEN generating 100 questions for ♦3 THEN the system SHALL ensure dividend is divisible by divisor with remainder = 0
9. **[Div-UI-Rem]** WHEN a division rank allows remainders THEN the generator SHALL return {answer, remainder} AND the UI SHALL accept input in "商,余り" format
10. **[Gen-Validate]** WHEN generating any question THEN the system SHALL validate it against the rank-specific constraints before returning it
11. **[Perf-01]** WHEN generating 500 mixed questions locally THEN the total time SHALL be < 500ms
12. **[Gen-Unique]** WHEN generating questions for a stage THEN the system SHOULD avoid duplicate formulas within the same stage

### Requirement 2: Core Gameplay Loop

**User Story:** As a player, I want to select enemies, input answers, and see immediate feedback, so that I can learn from my mistakes and feel rewarded for correct answers.

#### Acceptance Criteria

1. **[Loop-01]** WHEN a player answers correctly THEN the system SHALL remove the enemy, increase score by (base × combo), AND increment combo counter
2. **[Loop-02]** WHEN a player answers incorrectly THEN the system SHALL decrease life by 1, cause enemies to descend slightly, AND reset combo to 0
3. **[Loop-03]** WHEN an enemy is displayed THEN the system SHALL show a mathematical formula above it in the format "式 = ?"
4. **[Loop-04]** WHEN a player clicks an enemy THEN the system SHALL select that enemy AND highlight it visually
5. **[Loop-05]** WHEN a player inputs an answer and presses Enter or clicks the fire button THEN the system SHALL evaluate the answer against the selected enemy's formula
6. **[Loop-06]** WHEN all enemies are destroyed THEN the system SHALL complete the stage AND trigger the card-tower progression
7. **[Loop-07]** WHEN player life reaches 0 THEN the system SHALL end the game AND display game over screen
8. **[Loop-08]** WHEN enemies descend to the bottom boundary THEN the system SHALL end the game

### Requirement 3: Stage Configuration and Data Model

**User Story:** As a developer, I want a clear stage configuration schema, so that I can define and load different stage patterns and difficulty settings.

#### Acceptance Criteria

1. **[Stage-Schema]** WHEN defining a stage THEN the system SHALL support a JSON schema with fields: suit, rank, pattern, rows, cols, spawnIntervalSec, descendSpeed, timeLimit, enemyHealth, baseScore
2. **[Stage-Load]** WHEN loading a stage THEN the system SHALL validate the JSON against the schema AND reject invalid configurations
3. **[Stage-Pattern]** WHEN a stage specifies a pattern THEN the system SHALL support patterns: "grid", "vformation", "wave", "random"
4. **[Stage-Constraints]** WHEN a stage is loaded THEN the system SHALL apply the difficulty constraints from Appendix A based on suit and rank
5. **[Stage-Progression]** WHEN stages are sequenced THEN the system SHALL follow the order: ♡1-13, ♠1-13, ♣1-13, ♦1-13 (52 stages total)

### Requirement 4: Learning Features

**User Story:** As a student, I want to review problems I got wrong and track my progress, so that I can improve my weak areas and see my advancement.

#### Acceptance Criteria

1. **[Learn-Log]** WHEN a player answers incorrectly THEN the system SHALL log the formula, correct answer, player's answer, and timestamp to incorrectFormulas array
2. **[Learn-Review]** WHEN a player enters review mode THEN the system SHALL generate a stage using only formulas from the incorrectFormulas log
3. **[Learn-Clear]** WHEN a player answers a review question correctly THEN the system SHALL remove that formula from the incorrectFormulas log
4. **[Progress-Card]** WHEN a player completes a stage THEN the system SHALL flip one card in the card-tower visualization
5. **[Progress-Suit]** WHEN a player completes all 13 ranks of a suit THEN the system SHALL unlock that suit's "kingdom" AND display a completion animation
6. **[Progress-Save]** WHEN game state changes THEN the system SHALL persist progress (current rank, unlocked stages, incorrectFormulas) to localStorage

### Requirement 5: User Interface and Display

**User Story:** As a player, I want a clear, responsive interface that shows my status and the game field, so that I can focus on solving problems quickly.

#### Acceptance Criteria

1. **[UI-Header]** WHEN the game is running THEN the system SHALL display score, life, current stage (suit + rank), and timer in the header area
2. **[UI-Field]** WHEN enemies are active THEN the system SHALL display them in a formation (3-5 rows × 5 columns) with formulas above each
3. **[UI-Input]** WHEN the game is running THEN the system SHALL display an input area at the bottom with: selected enemy indicator, answer input field, and fire button
4. **[UI-Select]** WHEN an enemy is selected THEN the system SHALL highlight it with a distinct visual indicator
5. **[UI-Feedback]** WHEN an answer is evaluated THEN the system SHALL display visual feedback (correct: explosion/particles, incorrect: damage flash)
6. **[UI-Cards]** WHEN displaying progression THEN the system SHALL show the card-tower with 13 cards per suit, flipping cards as stages complete
7. **[UI-Responsive]** WHEN the window is resized THEN the system SHALL maintain playable layout and readable text

### Requirement 6: Accessibility

**User Story:** As a student with accessibility needs, I want the game to support screen readers and accommodate visual impairments, so that I can play and learn effectively.

#### Acceptance Criteria

1. **[A11y-Label]** WHEN a formula is displayed THEN the system SHALL provide an aria-label with the formula read as text (e.g., "3 plus 5 equals")
2. **[A11y-Color]** WHEN displaying game states THEN the system SHALL use color-weak safe palettes that don't rely solely on color to convey information
3. **[A11y-Audio]** WHEN the game is running THEN the system SHALL provide ON/OFF toggles for sound effects AND background music independently
4. **[A11y-Focus]** WHEN navigating with keyboard THEN the system SHALL provide visible focus indicators on interactive elements
5. **[A11y-Text]** WHEN displaying text THEN the system SHALL use sufficient contrast ratios (WCAG AA minimum)

### Requirement 7: Performance and Technical Requirements

**User Story:** As a player, I want the game to run smoothly without lag, so that I can enjoy responsive gameplay.

#### Acceptance Criteria

1. **[Perf-Gen]** WHEN generating a single question THEN the system SHALL complete in < 1ms locally
2. **[Perf-FPS]** WHEN the game is running THEN the system SHALL maintain 60fps during normal gameplay
3. **[Perf-Render]** WHEN rendering the game field THEN the system SHALL use efficient rendering (Canvas, Phaser, or optimized DOM)
4. **[Tech-ESM]** WHEN implementing the game THEN the system SHALL use JavaScript with ES modules (ESM)
5. **[Tech-NoTS]** WHEN implementing the game THEN the system SHALL NOT use TypeScript
6. **[Tech-Build]** WHEN building the project THEN the system SHALL support Vite or Webpack as the build tool
7. **[Tech-Local]** WHEN running the game THEN the system SHALL execute entirely in the browser without requiring a backend server

### Requirement 8: Input and Controls

**User Story:** As a player, I want intuitive controls for selecting enemies and submitting answers, so that I can play efficiently.

#### Acceptance Criteria

1. **[Input-Click]** WHEN a player clicks an enemy THEN the system SHALL select that enemy for answering
2. **[Input-Keyboard]** WHEN a player presses Enter in the answer field THEN the system SHALL submit the answer
3. **[Input-Button]** WHEN a player clicks the fire button THEN the system SHALL submit the answer
4. **[Input-Number]** WHEN answering a question THEN the system SHALL accept numeric input in the answer field
5. **[Input-Remainder]** WHEN answering a division question with remainder THEN the system SHALL accept input in format "商,余り" or "商, 余り"
6. **[Input-Clear]** WHEN an answer is submitted THEN the system SHALL clear the input field for the next answer
7. **[Input-Validation]** WHEN invalid input is entered THEN the system SHALL provide visual feedback without submitting

## Appendix A: 52-Rank Difficulty Mapping

### ♡ Addition (Hearts) - Ranks 1-13

| Rank | Description | Constraints |
|------|-------------|-------------|
| ♡1 | Single digit, no carry | Both operands 1-9, sum ≤ 9 |
| ♡2 | Single digit with carry | Both operands 1-9, sum ≥ 10 |
| ♡3 | Two digit, no carry | Both operands 10-99, no carry in ones or tens |
| ♡4 | Two digit with carry in ones | Both operands 10-99, carry in ones only |
| ♡5 | Two digit with carry in tens | Both operands 10-99, carry in tens only |
| ♡6 | Two digit with double carry | Both operands 10-99, carry in both positions |
| ♡7 | Three digit, no carry | Both operands 100-999, no carry |
| ♡8 | Three digit with single carry | Both operands 100-999, carry in one position |
| ♡9 | Three digit with multiple carries | Both operands 100-999, carry in 2+ positions |
| ♡10 | Four digit, no carry | Both operands 1000-9999, no carry |
| ♡11 | Four digit with carries | Both operands 1000-9999, with carries |
| ♡12 | Three operands addition | Three operands, mixed difficulty |
| ♡13 | Four operands addition | Four operands, mixed difficulty |

### ♠ Subtraction (Spades) - Ranks 1-13

| Rank | Description | Constraints |
|------|-------------|-------------|
| ♠1 | Single digit, no borrow | Minuend 1-9, subtrahend ≤ minuend, no borrow |
| ♠2 | Single digit requiring borrow | Minuend 10-18, subtrahend 1-9, requires borrow |
| ♠3 | Two digit, no borrow | Minuend 10-99, subtrahend ≤ minuend, no borrow in ones |
| ♠4 | Two digit with borrow in ones | Minuend 10-99, borrow in ones only |
| ♠5 | Two digit with borrow in tens | Minuend 10-99, borrow in tens only |
| ♠6 | Two digit with double borrow | Minuend 10-99, borrow in both positions |
| ♠7 | Three digit, no borrow | Minuend 100-999, no borrow |
| ♠8 | Three digit with single borrow | Minuend 100-999, borrow in one position |
| ♠9 | Three digit with multiple borrows | Minuend 100-999, borrow in 2+ positions |
| ♠10 | Four digit, no borrow | Minuend 1000-9999, no borrow |
| ♠11 | Four digit with borrows | Minuend 1000-9999, with borrows |
| ♠12 | Subtraction chains (a - b - c) | Three operands, result ≥ 0 |
| ♠13 | Complex subtraction chains | Four operands, result ≥ 0 |

### ♣ Multiplication (Clubs) - Ranks 1-13

| Rank | Description | Constraints |
|------|-------------|-------------|
| ♣1 | Multiplication table (1-3) | Multiplicand 1-3, multiplier 1-9 |
| ♣2 | Multiplication table (4-6) | Multiplicand 4-6, multiplier 1-9 |
| ♣3 | Multiplication table (7-9) | Multiplicand 7-9, multiplier 1-9 |
| ♣4 | Two digit × single (10-19) | Multiplicand 10-19, multiplier 1-9 |
| ♣5 | Two digit × single (20-49) | Multiplicand 20-49, multiplier 1-9 |
| ♣6 | Two digit × single (50-99) | Multiplicand 50-99, multiplier 1-9 |
| ♣7 | Two digit × two digit (small) | Multiplicand 10-19, multiplier 10-19 |
| ♣8 | Two digit × two digit (medium) | Multiplicand 10-49, multiplier 10-49 |
| ♣9 | Two digit × two digit (large) | Multiplicand 10-99, multiplier 10-99 |
| ♣10 | Three digit × single | Multiplicand 100-999, multiplier 1-9 |
| ♣11 | Three digit × two digit | Multiplicand 100-999, multiplier 10-99 |
| ♣12 | Multiplication chains (a × b × c) | Three operands, result < 10000 |
| ♣13 | Complex multiplication | Four operands or mixed operations |

### ♦ Division (Diamonds) - Ranks 1-13

| Rank | Description | Constraints |
|------|-------------|-------------|
| ♦1 | Division table inverse (1-3) | Dividend = divisor × quotient, divisor 1-3, quotient 1-9, remainder 0 |
| ♦2 | Division table inverse (4-6) | Dividend = divisor × quotient, divisor 4-6, quotient 1-9, remainder 0 |
| ♦3 | Division table inverse (7-9) | Dividend = divisor × quotient, divisor 7-9, quotient 1-9, remainder 0 |
| ♦4 | Two digit ÷ single, no remainder | Dividend 10-99, divisor 1-9, remainder 0 |
| ♦5 | Two digit ÷ single, with remainder | Dividend 10-99, divisor 1-9, remainder > 0 |
| ♦6 | Three digit ÷ single, no remainder | Dividend 100-999, divisor 1-9, remainder 0 |
| ♦7 | Three digit ÷ single, with remainder | Dividend 100-999, divisor 1-9, remainder > 0 |
| ♦8 | Two digit ÷ two digit, no remainder | Dividend 10-99, divisor 10-99, remainder 0 |
| ♦9 | Two digit ÷ two digit, with remainder | Dividend 10-99, divisor 10-99, remainder > 0 |
| ♦10 | Three digit ÷ two digit, no remainder | Dividend 100-999, divisor 10-99, remainder 0 |
| ♦11 | Three digit ÷ two digit, with remainder | Dividend 100-999, divisor 10-99, remainder > 0 |
| ♦12 | Four digit ÷ two digit, no remainder | Dividend 1000-9999, divisor 10-99, remainder 0 |
| ♦13 | Four digit ÷ two digit, with remainder | Dividend 1000-9999, divisor 10-99, remainder > 0 |

**Note:** All division operations use integer division only. No fractions are used. When remainder is allowed, the answer format is "商,余り" (quotient, remainder).
