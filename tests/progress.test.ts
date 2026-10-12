import { test } from "node:test";
import assert from "node:assert/strict";
import {
  freshProgress,
  parseProgress,
  recordWin,
  isUnlocked,
} from "../src/save.ts";
import { FixedClock } from "../src/simulation.ts";
test("invalid, corrupt, nonfinite and incompatible saves are safe", () => {
  for (const raw of [
    null,
    "{",
    "null",
    "[]",
    '{"version":2}',
    '{"version":1,"completed":[6],"best":[],"seals":[]}',
  ])
    assert.deepEqual(parseProgress(raw), freshProgress());
  const p = parseProgress(
    '{"version":1,"completed":[0,0],"best":[999,-1,"bad"],"seals":[0,0,6]}',
  );
  assert.deepEqual(p.completed, [0]);
  assert.deepEqual(p.seals, [0]);
  assert.deepEqual(p.best, [28, 0, 0, 0, 0, 0, 0]);
});
test("exits unlock only the next trail and replay preserves best rewards", () => {
  let p = freshProgress();
  assert.equal(isUnlocked(p, 1), false);
  p = recordWin(p, 0, 20, true);
  assert.equal(isUnlocked(p, 1), true);
  assert.equal(isUnlocked(p, 2), false);
  p = recordWin(p, 0, 3, false);
  assert.equal(p.best[0], 20);
  assert.deepEqual(p.completed, [0]);
  assert.deepEqual(p.seals, [0]);
  assert.deepEqual(parseProgress(JSON.stringify(p)), p);
  assert.deepEqual(recordWin(p, 6, 28, true), p);
});
test("fixed clock caps time jumps and reset discards partial elapsed time", () => {
  const c = new FixedClock();
  let ticks = 0;
  c.advance(0.05, () => ticks++);
  assert.equal(ticks, 6);
  c.advance(60, () => ticks++);
  assert.ok(ticks <= 18);
  c.advance(0.004, () => ticks++);
  c.reset();
  const before = ticks;
  c.advance(0.005, () => ticks++);
  assert.equal(ticks, before);
});
