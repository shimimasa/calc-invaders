/* @vitest-environment jsdom */
import { describe, test, expect } from "vitest";
import { spawnController } from "../core/spawnController.js";
function makeRootWith(n) {
  const root = document.createElement("div");
  const questions = Array.from({ length: n }, (_, i) => ({ formula: `${i}+${i}`, answer: i + i }));
  const ctrl = spawnController({ rootEl: root, questions, onCorrect() {}, onWrong() {} });
  return { root, ctrl };
}

describe("UI Safety", () => {
  test("submit before any selection returns false and does not throw", () => {
    const { ctrl } = makeRootWith(3);
    expect(() => {
      const ret = ctrl.submit("");
      expect(ret).toBe(false);
    }).not.toThrow();
  });

  test("TIME UP simulated (controls disabled), submit still safe (no throw)", () => {
    // Simulate a minimal form context with disabled controls
    const answer = document.createElement("input");
    const fire = document.createElement("button");
    answer.id = "answer"; fire.id = "fire";
    answer.disabled = true; fire.disabled = true;
    document.body.appendChild(answer);
    document.body.appendChild(fire);

    const { ctrl } = makeRootWith(2);
    expect(() => {
      const ret = ctrl.submit("123");
      expect(ret === true || ret === false).toBe(true);
    }).not.toThrow();
  });

  test("select -> remove -> submit with stale ref returns false and no throw", () => {
    const { root, ctrl } = makeRootWith(1);
    const el = root.children[0];
    // Select the element, then remove it to make controller's ref stale
    ctrl.lock(el);
    el.remove();
    expect(() => {
      const ret = ctrl.submit("0");
      expect(ret).toBe(false);
    }).not.toThrow();
  });
});


