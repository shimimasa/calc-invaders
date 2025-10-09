export class StageSession {
    constructor({ target, endless }) {
      this.target = target;
      this.cleared = 0;
      this.ended = false;
      this.endless = endless;
    }
    onCorrect() { if (!this.endless) this.cleared++; }
    get remain() { return this.endless ? Infinity : Math.max(0, this.target - this.cleared); }
    get isClear() { return !this.endless && this.cleared >= this.target; }
    end() { this.ended = true; }
  }
  
  