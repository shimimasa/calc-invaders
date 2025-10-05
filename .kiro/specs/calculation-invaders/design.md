# Design Document

## Overview

Calculation Invaders is an educational arcade shooter implemented as a browser-based JavaScript (ESM) application. The architecture follows a modular design with clear separation between question generation, game state management, enemy spawning, and UI rendering. The system uses a data-driven approach where Stage JSON configurations define all gameplay parameters, which are then processed through a pipeline: Stage JSON → QuestionBank → Generators → SpawnController → UI.

The implementation emphasizes performance (< 1ms question generation, 60fps rendering), accessibility (aria-labels, color-weak safe design, audio toggles), and educational effectiveness (52-rank progression, incorrect answer logging, review mode).

**Technology Stack:**
- JavaScript (ES Modules) - No TypeScript
- Build Tool: Vite or Webpack
- Rendering: Canvas, Phaser, or optimized DOM (to be determined during implementation)
- Storage: localStorage for persistence

## Architecture

### High-Level Module Structure

```
calculation-invaders/
├── src/
│   ├── core/
│   │   ├── generators/
│   │   │   ├── addition.js
│   │   │   ├── subtraction.js
│   │   │   ├── multiplication.js
│   │   │   └── division.js
│   │   ├── questionBank.js
│   │   ├── spawnController.js
│   │   ├── gameState.js
│   │   └── stageLoader.js
│   ├── ui/
│   │   ├── renderer.js
│   │   ├── inputHandler.js
│   │   └── cardTower.js
│   ├── utils/
│   │   ├── random.js
│   │   ├── validation.js
│   │   └── accessibility.js
│   └── main.js
├── scripts/
│   └── buildStages.js
├── data/
│   └── stages/
│       ├── hearts-01.json
│       ├── hearts-02.json
│       └── ... (52 stage files)
└── assets/
    ├── audio/
    └── sprites/
```

### Data Flow


```
Stage JSON File
      ↓
  StageLoader (validates schema)
      ↓
  QuestionBank (pre-generates questions)
      ↓
  Generators (addition/subtraction/multiplication/division)
      ↓
  SpawnController (manages enemy lifecycle)
      ↓
  GameState (tracks score, combo, lives, etc.)
      ↓
  UI Renderer (displays enemies, formulas, feedback)
      ↓
  InputHandler (processes clicks, keyboard)
      ↓
  [Loop back to GameState]
```

**Key Flow Sequences:**

1. **Initialization:** Load stage JSON → Validate → Pre-generate questions → Initialize game state → Render initial UI
2. **Spawn Loop:** SpawnController requests question from QuestionBank → Create enemy with formula → Add to active enemies → Render
3. **Answer Loop:** Player selects enemy → Input answer → Validate → Update game state (score/combo/lives) → Remove enemy or apply penalty → Render feedback

## Components and Interfaces

### 1. Question Generators

**Location:** `src/core/generators/{addition,subtraction,multiplication,division}.js`

Each generator module exports a single function that creates questions based on rank and constraints.


**Interface:**

```javascript
/**
 * Generate an addition question
 * @param {number} rank - Difficulty rank (1-13)
 * @param {Object} constraints - Generation constraints
 * @param {boolean} [constraints.noCarry] - Prevent carry operations
 * @param {boolean} [constraints.forceCarry] - Require carry operations
 * @param {Object} [constraints.aRange] - {min, max} for first operand
 * @param {Object} [constraints.bRange] - {min, max} for second operand
 * @param {number} [constraints.operandCount] - Number of operands (for ranks 12-13)
 * @returns {Object} {formula: string, answer: number, operands: number[]}
 */
export function generateAddition(rank, constraints = {}) { ... }

/**
 * Generate a subtraction question
 * @param {number} rank - Difficulty rank (1-13)
 * @param {Object} constraints - Generation constraints
 * @param {boolean} [constraints.noBorrow] - Prevent borrow operations
 * @param {boolean} [constraints.forceBorrow] - Require borrow operations
 * @param {Object} [constraints.aRange] - {min, max} for minuend
 * @param {Object} [constraints.bRange] - {min, max} for subtrahend
 * @returns {Object} {formula: string, answer: number, operands: number[]}
 */
export function generateSubtraction(rank, constraints = {}) { ... }

/**
 * Generate a multiplication question
 * @param {number} rank - Difficulty rank (1-13)
 * @param {Object} constraints - Generation constraints
 * @param {Object} [constraints.aRange] - {min, max} for multiplicand
 * @param {Object} [constraints.bRange] - {min, max} for multiplier
 * @param {number} [constraints.operandCount] - Number of operands (for ranks 12-13)
 * @returns {Object} {formula: string, answer: number, operands: number[]}
 */
export function generateMultiplication(rank, constraints = {}) { ... }

/**
 * Generate a division question
 * @param {number} rank - Difficulty rank (1-13)
 * @param {Object} constraints - Generation constraints
 * @param {boolean} [constraints.divisibleOnly] - Ensure remainder = 0
 * @param {boolean} [constraints.allowRemainder] - Allow remainder > 0
 * @param {Object} [constraints.aRange] - {min, max} for dividend
 * @param {Object} [constraints.bRange] - {min, max} for divisor
 * @returns {Object} {formula: string, answer: number, remainder: number, operands: number[]}
 */
export function generateDivision(rank, constraints = {}) { ... }
```

**Implementation Notes:**
- Each generator must strictly follow Appendix A constraints from requirements.md
- Use `src/utils/random.js` for all random number generation
- Use validation utilities (`hasCarry`, `hasBorrow`, `isDivisible`) to verify constraints
- Division always returns integer quotient and remainder (no fractions)
- Performance target: < 1ms per question


### 2. QuestionBank

**Location:** `src/core/questionBank.js`

Manages pre-generation and retrieval of questions for a stage.

**Interface:**

```javascript
export class QuestionBank {
  /**
   * @param {Object} stageConfig - Stage configuration from JSON
   */
  constructor(stageConfig) { ... }

  /**
   * Pre-generate questions for the stage
   * @param {number} count - Number of questions to generate
   */
  preGenerate(count) { ... }

  /**
   * Get next question from the bank
   * @returns {Object} {id, formula, answer, remainder?, operands}
   */
  getNext() { ... }

  /**
   * Check if bank has more questions
   * @returns {boolean}
   */
  hasMore() { ... }

  /**
   * Get specific question by ID
   * @param {string} id
   * @returns {Object}
   */
  getById(id) { ... }
}
```

**Responsibilities:**
- Load stage configuration and determine which generator to use
- Pre-generate all questions at stage start (satisfies performance requirement)
- Shuffle questions if stage config specifies `shuffle: true`
- Support pre-generated questions from stage JSON (`preGenerated[]` array)
- Assign unique IDs to each question


### 3. SpawnController

**Location:** `src/core/spawnController.js`

Manages enemy spawning, movement, and lifecycle.

**Interface:**

```javascript
export class SpawnController {
  /**
   * @param {QuestionBank} questionBank
   * @param {Object} enemySetConfig - From stage JSON
   */
  constructor(questionBank, enemySetConfig) { ... }

  /**
   * Start spawning enemies
   */
  start() { ... }

  /**
   * Stop spawning
   */
  stop() { ... }

  /**
   * Update enemy positions (called each frame)
   * @param {number} deltaTime - Time since last update (ms)
   */
  update(deltaTime) { ... }

  /**
   * Get all active enemies
   * @returns {Array<Enemy>}
   */
  getActiveEnemies() { ... }

  /**
   * Remove enemy by ID
   * @param {string} enemyId
   */
  removeEnemy(enemyId) { ... }

  /**
   * Descend all enemies (on wrong answer)
   * @param {number} amount - Pixels to descend
   */
  descendAll(amount) { ... }
}
```

**Enemy Object Structure:**

```javascript
{
  id: string,
  questionId: string,
  formula: string,
  answer: number,
  remainder: number | null,
  position: {x: number, y: number},
  row: number,
  col: number,
  isAlive: boolean
}
```

**Responsibilities:**
- Spawn enemies at intervals defined by `spawnIntervalSec`
- Position enemies in formation (grid, vformation, wave, random)
- Update enemy positions based on `descendSpeed`
- Detect when enemies reach bottom boundary
- Manage enemy lifecycle (spawn → active → destroyed)


### 4. GameState

**Location:** `src/core/gameState.js`

Central state management for the game.

**State Model:**

```javascript
{
  // Current game status
  score: number,
  combo: number,
  lives: number,
  timeRemaining: number,
  
  // Current stage info
  currentStageId: string,
  currentSuit: string,  // 'hearts', 'spades', 'clubs', 'diamonds'
  currentRank: number,  // 1-13
  
  // Player interaction
  selectedEnemyId: string | null,
  lockedFormula: string | null,
  
  // Learning data
  incorrectFormulas: Array<{
    formula: string,
    correctAnswer: number,
    playerAnswer: string,
    timestamp: number,
    suit: string,
    rank: number
  }>,
  
  // Progression
  stageProgress: {
    hearts: number,    // 0-13 cards flipped
    spades: number,
    clubs: number,
    diamonds: number
  },
  unlockedStages: string[],
  
  // Settings
  audioSettings: {
    sfxEnabled: boolean,
    bgmEnabled: boolean,
    volume: number
  }
}
```

**Interface:**

```javascript
export class GameState {
  constructor() { ... }
  
  // Score & Combo
  addScore(baseScore, combo) { ... }
  incrementCombo() { ... }
  resetCombo() { ... }
  
  // Lives & Time
  decrementLife() { ... }
  updateTime(deltaTime) { ... }
  
  // Enemy Selection
  selectEnemy(enemyId, formula) { ... }
  clearSelection() { ... }
  
  // Answer Processing
  submitAnswer(answer, correctAnswer, remainder = null) { ... }
  
  // Learning
  logIncorrectAnswer(formula, correctAnswer, playerAnswer) { ... }
  getIncorrectFormulas() { ... }
  clearIncorrectFormula(formula) { ... }
  
  // Progression
  completeStage() { ... }
  flipCard(suit) { ... }
  unlockSuit(suit) { ... }
  
  // Persistence
  save() { ... }
  load() { ... }
  reset() { ... }
}
```


### 5. Utility Modules

**Location:** `src/utils/`

**random.js:**

```javascript
/**
 * Get random integer in range [min, max] inclusive
 */
export function randomInt(min, max) { ... }

/**
 * Get random element from array
 */
export function randomChoice(array) { ... }

/**
 * Shuffle array in place
 */
export function shuffle(array) { ... }
```

**validation.js:**

```javascript
/**
 * Check if addition has carry
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function hasCarry(a, b) { ... }

/**
 * Check if subtraction requires borrow
 * @param {number} a - minuend
 * @param {number} b - subtrahend
 * @returns {boolean}
 */
export function hasBorrow(a, b) { ... }

/**
 * Check if division is exact (no remainder)
 * @param {number} dividend
 * @param {number} divisor
 * @returns {boolean}
 */
export function isDivisible(dividend, divisor) { ... }

/**
 * Count digits in a number
 * @param {number} n
 * @returns {number}
 */
export function countDigits(n) { ... }
```

**accessibility.js:**

```javascript
/**
 * Convert formula to aria-label text
 * @param {string} formula - e.g., "3 + 5"
 * @returns {string} - e.g., "3 plus 5 equals"
 */
export function formulaToAriaLabel(formula) { ... }

/**
 * Get color-weak safe color for game state
 * @param {string} state - 'correct', 'incorrect', 'selected', 'normal'
 * @returns {string} - CSS color value
 */
export function getAccessibleColor(state) { ... }
```


## Data Models

### Stage JSON Schema

**Location:** `data/stages/{suit}-{rank}.json`

**Complete Schema:**

```javascript
{
  // Required fields
  "stageId": string,           // e.g., "hearts-01"
  "mark": string,              // "♡", "♠", "♣", "♦"
  "operation": string,         // "addition", "subtraction", "multiplication", "division"
  "rank": number,              // 1-13
  
  // Enemy configuration
  "enemySet": {
    "rows": number,            // 3-5
    "cols": number,            // typically 5
    "spawnIntervalSec": number, // seconds between spawns
    "descendSpeed": number     // pixels per second
  },
  
  // Game rules
  "rules": {
    "timeLimitSec": number,    // null for no limit
    "lives": number,           // starting lives
    "scorePerHit": number,     // base score per correct answer
    "comboBonus": number       // multiplier increase per combo
  },
  
  // Question generation
  "generator": {
    "pattern": string,         // "grid", "vformation", "wave", "random"
    "constraints": {
      // Addition/Subtraction
      "noCarry": boolean,
      "forceCarry": boolean,
      "noBorrow": boolean,
      "forceBorrow": boolean,
      
      // Division
      "divisibleOnly": boolean,
      "allowRemainder": boolean,
      
      // Range constraints
      "aRange": {min: number, max: number},
      "bRange": {min: number, max: number},
      
      // Alternative: specific digit counts
      "aDigits": number,
      "bDigits": number,
      
      // Multi-operand (ranks 12-13)
      "operandCount": number
    }
  },
  
  // Optional: pre-generated questions
  "preGenerated": [
    {
      "formula": string,
      "answer": number,
      "remainder": number      // for division only
    }
  ],
  
  // Optional: UI customization
  "ui": {
    "theme": string,           // "default", "space", "ocean"
    "backgroundColor": string
  },
  
  // Optional: Audio
  "audio": {
    "bgmId": string,
    "sfxSet": string
  },
  
  // Optional: Progression
  "reward": {
    "cardId": string           // which card to flip
  },
  
  // Optional: Behavior
  "shuffle": boolean,          // shuffle questions
  "allowMixedRemainderInput": boolean  // future: dual-field mode
}
```

**Validation Rules:**
- `stageId` must match filename
- `rank` must be 1-13
- `operation` must match one of the four generators
- `enemySet.rows` must be 3-5
- `generator.constraints` must align with operation type
- If `preGenerated` is provided, it must have at least `rows × cols` questions


### Example Stage JSON

**hearts-01.json:**

```json
{
  "stageId": "hearts-01",
  "mark": "♡",
  "operation": "addition",
  "rank": 1,
  "enemySet": {
    "rows": 3,
    "cols": 5,
    "spawnIntervalSec": 2,
    "descendSpeed": 10
  },
  "rules": {
    "timeLimitSec": 120,
    "lives": 3,
    "scorePerHit": 10,
    "comboBonus": 1.5
  },
  "generator": {
    "pattern": "grid",
    "constraints": {
      "noCarry": true,
      "aRange": {"min": 1, "max": 9},
      "bRange": {"min": 1, "max": 9}
    }
  },
  "reward": {
    "cardId": "hearts-01"
  },
  "shuffle": false
}
```

**diamonds-13.json (with remainder):**

```json
{
  "stageId": "diamonds-13",
  "mark": "♦",
  "operation": "division",
  "rank": 13,
  "enemySet": {
    "rows": 5,
    "cols": 5,
    "spawnIntervalSec": 1.5,
    "descendSpeed": 20
  },
  "rules": {
    "timeLimitSec": 180,
    "lives": 5,
    "scorePerHit": 50,
    "comboBonus": 2.0
  },
  "generator": {
    "pattern": "random",
    "constraints": {
      "allowRemainder": true,
      "aRange": {"min": 1000, "max": 9999},
      "bRange": {"min": 10, "max": 99}
    }
  },
  "reward": {
    "cardId": "diamonds-13"
  },
  "shuffle": true
}
```


## Input and Answer Handling

### Division with Remainder - MVP Approach

**Input Format:**
- Single text input field
- Accept formats: `"商,余り"` or `"商、余り"` (comma or Japanese comma)
- Example: For 23 ÷ 5, correct input is `"4,3"` or `"4、3"`

**Validation:**

```javascript
/**
 * Parse division answer with remainder
 * @param {string} input - User input
 * @returns {Object} {quotient: number, remainder: number} or null if invalid
 */
function parseDivisionAnswer(input) {
  const parts = input.split(/[,、]/);
  if (parts.length !== 2) return null;
  
  const quotient = parseInt(parts[0].trim(), 10);
  const remainder = parseInt(parts[1].trim(), 10);
  
  if (isNaN(quotient) || isNaN(remainder)) return null;
  if (remainder < 0) return null;
  
  return {quotient, remainder};
}

/**
 * Validate remainder is less than divisor
 * @param {number} remainder
 * @param {number} divisor
 * @returns {boolean}
 */
function isValidRemainder(remainder, divisor) {
  return remainder >= 0 && remainder < divisor;
}
```

**UI Feedback:**
- Show placeholder text: `"答え (例: 4,3)"` or `"Answer (e.g., 4,3)"`
- Display error message if format is invalid: `"形式: 商,余り"` or `"Format: quotient,remainder"`
- Highlight input field in red if remainder ≥ divisor

**Future Enhancement (documented for later):**
- Dual-field mode: separate inputs for quotient and remainder
- Interface contract: `allowMixedRemainderInput` flag in stage JSON
- Component interface: `<DivisionInput mode="single" | "dual" />`


## Sequence Diagrams

### Sequence 1: Answer Submission Flow

```
Player          InputHandler      GameState       SpawnController     Renderer
  |                  |                |                  |                |
  |--click enemy---->|                |                  |                |
  |                  |--selectEnemy-->|                  |                |
  |                  |                |                  |                |
  |                  |                |<--getEnemy-------|                |
  |                  |                |                  |                |
  |                  |----------------|------------------|--highlight---->|
  |                  |                |                  |                |
  |--type answer---->|                |                  |                |
  |--press Enter---->|                |                  |                |
  |                  |                |                  |                |
  |                  |--submitAnswer->|                  |                |
  |                  |                |--validate------->|                |
  |                  |                |                  |                |
  |                  |                |<--correct/wrong--|                |
  |                  |                |                  |                |
  |                  |   [if correct] |                  |                |
  |                  |                |--addScore------->|                |
  |                  |                |--incrementCombo->|                |
  |                  |                |                  |--removeEnemy-->|
  |                  |                |                  |                |--explosion-->|
  |                  |                |                  |                |
  |                  |   [if wrong]   |                  |                |
  |                  |                |--decrementLife-->|                |
  |                  |                |--resetCombo----->|                |
  |                  |                |--logIncorrect--->|                |
  |                  |                |                  |--descendAll--->|
  |                  |                |                  |                |--flash------->|
  |                  |                |                  |                |
  |                  |--clearInput--->|                  |                |
  |<--feedback-------|                |                  |                |
```


### Sequence 2: Stage Start and Spawn Loop

```
Main            StageLoader    QuestionBank    Generators    SpawnController    Renderer
  |                  |              |               |                |              |
  |--loadStage------>|              |               |                |              |
  |                  |--validate--->|               |                |              |
  |                  |              |               |                |              |
  |                  |<--stageConfig|               |                |              |
  |                  |              |               |                |              |
  |--createBank------|------------->|               |                |              |
  |                  |              |--preGenerate->|                |              |
  |                  |              |               |--generate x N->|              |
  |                  |              |               |                |              |
  |                  |              |<--questions---|                |              |
  |                  |              |               |                |              |
  |--createSpawner---|--------------|---------------|--------------->|              |
  |                  |              |               |                |              |
  |--start-----------|--------------|---------------|--------------->|              |
  |                  |              |               |                |              |
  |                  |              |               |   [spawn loop] |              |
  |                  |              |               |                |--getNext---->|
  |                  |              |<--getNext-----|                |              |
  |                  |              |               |                |              |
  |                  |              |--question---->|                |              |
  |                  |              |               |--createEnemy-->|              |
  |                  |              |               |                |              |
  |                  |              |               |                |--render----->|
  |                  |              |               |                |              |
  |                  |              |               |   [game loop]  |              |
  |--update(dt)------|--------------|---------------|--------------->|              |
  |                  |              |               |                |--updatePos-->|
  |                  |              |               |                |              |
  |                  |              |               |                |--checkBounds>|
  |                  |              |               |                |              |
  |                  |              |               |                |--render----->|
  |                  |              |               |                |              |
  |                  |              |               |   [repeat]     |              |
```


## Error Handling

### Question Generation Errors

**Scenario:** Generator cannot produce valid question within constraints

**Handling:**
1. Retry generation up to 100 attempts
2. If still failing, log error with constraints details
3. Fall back to relaxed constraints (e.g., expand range by 10%)
4. If fallback fails, throw error to prevent invalid questions

```javascript
function generateWithRetry(generatorFn, rank, constraints, maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const question = generatorFn(rank, constraints);
      if (validateQuestion(question, constraints)) {
        return question;
      }
    } catch (e) {
      // Continue to next attempt
    }
  }
  
  // Fallback: relax constraints
  const relaxedConstraints = relaxConstraints(constraints);
  const question = generatorFn(rank, relaxedConstraints);
  console.warn('Used relaxed constraints for generation', {rank, constraints});
  return question;
}
```

### Stage Loading Errors

**Scenario:** Stage JSON is invalid or missing

**Handling:**
1. Validate JSON schema on load
2. Display user-friendly error message
3. Offer to load previous/next stage
4. Log detailed error for debugging

### Input Validation Errors

**Scenario:** Player enters invalid answer format

**Handling:**
1. Show inline error message (don't submit)
2. Highlight input field in error color
3. Provide example of correct format
4. Don't penalize player (no life loss)

### Performance Degradation

**Scenario:** FPS drops below 30

**Handling:**
1. Reduce particle effects
2. Simplify rendering (switch to DOM if using Canvas)
3. Display performance warning to user
4. Log performance metrics for debugging


## Testing Strategy

### Unit Testing

**Generators (Critical):**
- Test each rank (1-13) for each operation
- Verify constraints are respected (no carry, force carry, etc.)
- Validate 100 generated questions per rank meet requirements
- Performance test: 500 questions < 500ms
- Edge cases: boundary values, maximum digits

**Validation Utilities:**
- Test `hasCarry()` with known carry/no-carry cases
- Test `hasBorrow()` with known borrow/no-borrow cases
- Test `isDivisible()` with divisible and non-divisible pairs
- Test remainder validation (remainder < divisor)

**QuestionBank:**
- Test pre-generation with various stage configs
- Test shuffle functionality
- Test question retrieval and uniqueness
- Test pre-generated question loading

### Integration Testing

**Answer Flow:**
- Test correct answer → score increase, combo increment, enemy removal
- Test incorrect answer → life decrease, combo reset, enemy descend
- Test division with remainder input parsing
- Test game over conditions (lives = 0, enemies reach bottom)

**Stage Progression:**
- Test stage completion → card flip
- Test suit completion → unlock animation
- Test stage loading and transition

**Learning Features:**
- Test incorrect answer logging
- Test review mode question generation
- Test clearing incorrect formulas on correct answer

### Accessibility Testing

**Screen Reader:**
- Verify aria-labels are present on all formulas
- Test keyboard navigation (Tab, Enter)
- Verify focus indicators are visible

**Visual:**
- Test with color-blind simulation tools
- Verify sufficient contrast ratios (WCAG AA)
- Test with different font sizes

**Audio:**
- Verify SFX/BGM toggles work independently
- Test volume controls
- Verify game is playable with audio off

### Performance Testing

**Benchmarks:**
- Question generation: < 1ms per question
- Batch generation: 500 questions < 500ms
- Frame rate: maintain 60fps with 25 active enemies
- Memory: no leaks during extended play (30+ minutes)

**Tools:**
- Chrome DevTools Performance profiler
- Memory profiler for leak detection
- FPS counter overlay during gameplay


## Performance Optimization

### Question Pre-Generation

**Strategy:** Generate all questions at stage start, not during gameplay

**Benefits:**
- Eliminates generation lag during gameplay
- Allows validation of all questions before use
- Enables shuffle without performance impact

**Implementation:**
```javascript
// At stage start
const questionCount = rows * cols * 2; // Generate extra for safety
questionBank.preGenerate(questionCount);

// During gameplay - instant retrieval
const question = questionBank.getNext(); // < 0.1ms
```

### Rendering Optimization

**Canvas Approach:**
- Use single canvas with layered rendering
- Batch draw calls (draw all enemies in one pass)
- Use sprite sheets for enemy graphics
- Implement dirty rectangle optimization

**DOM Approach:**
- Use CSS transforms for positioning (GPU-accelerated)
- Minimize reflows (batch DOM updates)
- Use `will-change` for animated elements
- Implement virtual scrolling if needed

**Hybrid Approach:**
- Canvas for game field (enemies, particles)
- DOM for UI (score, input, cards)
- Best of both worlds

### Memory Management

**Object Pooling:**
```javascript
class EnemyPool {
  constructor(size) {
    this.pool = Array(size).fill(null).map(() => new Enemy());
    this.available = [...this.pool];
  }
  
  acquire() {
    return this.available.pop() || new Enemy();
  }
  
  release(enemy) {
    enemy.reset();
    this.available.push(enemy);
  }
}
```

**Cleanup:**
- Remove event listeners on stage end
- Clear intervals/timeouts
- Release canvas contexts
- Clear localStorage periodically (keep last 100 incorrect formulas)


## Accessibility Implementation

### ARIA Labels for Formulas

**Implementation:**

```javascript
function createFormulaElement(formula, answer) {
  const element = document.createElement('div');
  element.className = 'formula';
  element.textContent = formula + ' = ?';
  element.setAttribute('aria-label', formulaToAriaLabel(formula));
  element.setAttribute('role', 'button');
  element.setAttribute('tabindex', '0');
  return element;
}

function formulaToAriaLabel(formula) {
  return formula
    .replace('+', ' plus ')
    .replace('-', ' minus ')
    .replace('×', ' times ')
    .replace('÷', ' divided by ')
    + ' equals';
}
```

### Color-Weak Safe Palette

**Design Principles:**
- Don't rely solely on color to convey state
- Use patterns, shapes, or text in addition to color
- Test with color-blind simulation

**Palette:**

```javascript
const ACCESSIBLE_COLORS = {
  normal: {
    bg: '#2C3E50',      // Dark blue-gray
    border: '#34495E',
    text: '#ECF0F1'
  },
  selected: {
    bg: '#F39C12',      // Orange (visible to all)
    border: '#E67E22',
    text: '#000000',
    pattern: 'diagonal-stripes'  // Additional indicator
  },
  correct: {
    bg: '#27AE60',      // Green
    border: '#229954',
    text: '#FFFFFF',
    icon: '✓'           // Additional indicator
  },
  incorrect: {
    bg: '#C0392B',      // Red
    border: '#A93226',
    text: '#FFFFFF',
    icon: '✗'           // Additional indicator
  }
};
```

### Keyboard Navigation

**Controls:**
- `Tab` / `Shift+Tab`: Navigate between enemies
- `Enter` / `Space`: Select focused enemy
- `Enter` in input: Submit answer
- `Escape`: Clear selection
- `1-9`: Quick number input (focus input automatically)

**Implementation:**
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Handle focus navigation
    focusNextEnemy(e.shiftKey ? -1 : 1);
    e.preventDefault();
  } else if (e.key === 'Enter' && document.activeElement.classList.contains('enemy')) {
    selectEnemy(document.activeElement.dataset.enemyId);
  }
});
```


## Build and Deployment

### Build Script: buildStages.js

**Location:** `scripts/buildStages.js`

**Purpose:** Generate all 52 stage JSON files from templates

**Usage:**
```bash
node scripts/buildStages.js
```

**Functionality:**
1. Read difficulty mapping from requirements.md Appendix A
2. Generate stage JSON for each suit × rank combination
3. Apply appropriate constraints based on rank
4. Validate generated JSON against schema
5. Write to `data/stages/` directory

**Example Implementation:**

```javascript
import fs from 'fs';
import path from 'path';

const SUITS = [
  {name: 'hearts', mark: '♡', operation: 'addition'},
  {name: 'spades', mark: '♠', operation: 'subtraction'},
  {name: 'clubs', mark: '♣', operation: 'multiplication'},
  {name: 'diamonds', mark: '♦', operation: 'division'}
];

const DIFFICULTY_MAP = {
  hearts: [
    {rank: 1, constraints: {noCarry: true, aRange: {min: 1, max: 9}, bRange: {min: 1, max: 9}}},
    {rank: 2, constraints: {forceCarry: true, aRange: {min: 1, max: 9}, bRange: {min: 1, max: 9}}},
    // ... all 13 ranks
  ],
  // ... other suits
};

function generateStageJSON(suit, rank) {
  const config = DIFFICULTY_MAP[suit.name][rank - 1];
  
  return {
    stageId: `${suit.name}-${String(rank).padStart(2, '0')}`,
    mark: suit.mark,
    operation: suit.operation,
    rank: rank,
    enemySet: {
      rows: Math.min(3 + Math.floor(rank / 5), 5),
      cols: 5,
      spawnIntervalSec: Math.max(3 - rank * 0.15, 1),
      descendSpeed: 5 + rank * 1.5
    },
    rules: {
      timeLimitSec: 120 + rank * 10,
      lives: 3,
      scorePerHit: 10 * rank,
      comboBonus: 1.5
    },
    generator: {
      pattern: rank <= 5 ? 'grid' : 'random',
      constraints: config.constraints
    },
    reward: {
      cardId: `${suit.name}-${String(rank).padStart(2, '0')}`
    },
    shuffle: rank > 8
  };
}

// Generate all stages
SUITS.forEach(suit => {
  for (let rank = 1; rank <= 13; rank++) {
    const stageJSON = generateStageJSON(suit, rank);
    const filename = `${suit.name}-${String(rank).padStart(2, '0')}.json`;
    const filepath = path.join('data', 'stages', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(stageJSON, null, 2));
    console.log(`Generated ${filename}`);
  }
});
```

### Development Setup

**Dependencies:**
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "generate-stages": "node scripts/buildStages.js"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

**Project Structure:**
```
calculation-invaders/
├── index.html
├── package.json
├── vite.config.js
├── src/
├── data/
├── scripts/
└── assets/
```


## Technology Decisions

### JavaScript (ESM) - No TypeScript

**Rationale:**
- Simpler setup and build process
- Faster iteration during development
- No type compilation overhead
- Direct browser compatibility
- Easier for educational context (students can read source)

**Best Practices:**
- Use JSDoc comments for type hints
- Strict validation at module boundaries
- Comprehensive unit tests to catch type errors
- Clear interface documentation

**Example:**
```javascript
/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} formula
 * @property {number} answer
 * @property {number} [remainder]
 * @property {number[]} operands
 */

/**
 * Generate a question
 * @param {number} rank
 * @param {Object} constraints
 * @returns {Question}
 */
export function generateQuestion(rank, constraints) {
  // Implementation
}
```

### Rendering: Canvas vs DOM

**Decision: Start with DOM, migrate to Canvas if needed**

**DOM Advantages:**
- Simpler implementation
- Built-in accessibility (focus, aria-labels)
- Easier debugging and inspection
- CSS animations and transitions
- Responsive by default

**Canvas Advantages:**
- Better performance with many entities (50+)
- Particle effects and visual polish
- Consistent cross-browser rendering
- Pixel-perfect control

**Migration Path:**
1. Implement with DOM first
2. Abstract rendering behind interface
3. If performance issues arise, implement Canvas renderer
4. Swap renderer without changing game logic

### State Management

**Decision: Single GameState class with event emitters**

**Rationale:**
- Simple, predictable state updates
- Easy to persist and restore
- Clear data flow
- No external dependencies

**Alternative Considered:** Redux/Zustand
- Rejected: Overkill for this project size
- Adds complexity and bundle size
- Not necessary for single-player game


## Future Enhancements

### Phase 2 Features (Post-MVP)

**Dual-Field Division Input:**
- Separate input fields for quotient and remainder
- Toggle between single-field and dual-field modes
- Stage JSON flag: `allowMixedRemainderInput`

**Multiplayer Mode:**
- Split-screen local multiplayer
- Race to complete stage first
- Shared enemy pool or separate pools

**Custom Stages:**
- Stage editor UI
- Save/load custom stage JSON
- Share stages via export/import

**Advanced Learning Analytics:**
- Track time per question
- Identify problem patterns (e.g., always miss carry problems)
- Adaptive difficulty (suggest appropriate rank)
- Progress charts and statistics

**Additional Accessibility:**
- High contrast mode
- Adjustable text size
- Dyslexia-friendly font option
- Audio cues for correct/incorrect answers

**Visual Polish:**
- Particle effects for explosions
- Smooth animations for enemy movement
- Card flip animations
- Victory/defeat animations
- Theme customization (space, ocean, forest)

### Technical Debt to Address

**Code Organization:**
- Consider module bundling strategy for production
- Implement proper error boundaries
- Add comprehensive logging system
- Set up automated testing pipeline

**Performance:**
- Implement object pooling for enemies
- Add FPS monitoring and adaptive quality
- Optimize rendering with dirty rectangles
- Consider Web Workers for question generation

**Accessibility:**
- Full keyboard navigation audit
- Screen reader testing with real users
- WCAG AAA compliance review
- Internationalization (i18n) support


## Summary

This design document outlines a modular, performant, and accessible implementation of Calculation Invaders. The architecture separates concerns clearly:

- **Question Generation:** Four specialized generators strictly following 52-rank difficulty mapping
- **Game Logic:** QuestionBank, SpawnController, and GameState manage core gameplay
- **UI/Rendering:** Flexible rendering approach (DOM first, Canvas if needed)
- **Data-Driven:** Stage JSON files define all gameplay parameters
- **Learning Features:** Incorrect answer logging and review mode
- **Accessibility:** ARIA labels, color-weak safe design, keyboard navigation, audio toggles

**Key Technical Constraints:**
- JavaScript (ESM) only - no TypeScript
- Performance: < 1ms per question, 60fps gameplay
- Division: integers only with remainder support, format "商,余り"
- 52 stages: 4 suits × 13 ranks

**Implementation Priority:**
1. Core generators and validation utilities
2. QuestionBank and stage loading
3. Basic game loop and state management
4. DOM-based rendering and input handling
5. Learning features (incorrect log, review mode)
6. Accessibility features
7. Polish and optimization

The design is intentionally modular to allow incremental development and testing. Each component has clear interfaces and can be developed and tested independently before integration.
