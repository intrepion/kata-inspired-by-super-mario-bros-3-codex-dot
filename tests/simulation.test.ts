import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, step } from "../src/simulation.ts";
test("Mica lands on the ground without sinking", () => {
  const g = createGame(0);
  for (let i = 0; i < 240; i++)
    step(g, { left: false, right: false, jump: false }, 1 / 120);
  assert.equal(g.player.y, 416);
  assert.equal(g.player.grounded, true);
});
test("a checkpoint retry restores a safe landing even when it is above a gap", () => {
  const g = createGame(1);
  g.level.checkpoint = 580;
  g.player.x = 660;
  g.player.y = 700;
  g.checkpoint = true;
  step(g, { left: false, right: false, jump: false });
  assert.equal(g.player.x, 620);
});
const idle = { left: false, right: false, jump: false },
  right = { ...idle, right: true, run: true };
const run = (
  g: ReturnType<typeof createGame>,
  seconds: number,
  input = idle,
) => {
  for (let i = 0; i < seconds * 120; i++) step(g, input);
};
test("acceleration and braking are bounded; opposing inputs cancel", () => {
  const g = createGame(0);
  run(g, 0.3, right);
  assert.equal(g.player.vx, 290);
  run(g, 0.15, idle);
  assert.equal(g.player.vx, 0);
  run(g, 0.2, { left: true, right: true, jump: false });
  assert.equal(g.player.vx, 0);
});
test("a released jump is lower than a held jump", () => {
  const a = createGame(0),
    b = createGame(0);
  run(a, 0.05, { ...idle, jump: true });
  run(b, 0.05, { ...idle, jump: true });
  run(a, 0.25, idle);
  run(b, 0.25, { ...idle, jump: true });
  assert.ok(a.player.y > b.player.y + 25);
});
test("coyote jump works immediately after leaving a ledge but expires", () => {
  const a = createGame(0),
    b = createGame(0);
  for (const g of [a, b]) {
    g.level.platforms = [];
    run(g, 0.04, right);
  }
  step(a, { ...right, jump: true });
  assert.ok(a.player.vy < 0);
  run(b, 0.12, right);
  step(b, { ...right, jump: true });
  assert.ok(b.player.vy > 0);
});
test("a buffered press fires on landing without requiring a second press", () => {
  const g = createGame(0);
  g.player.y = 408;
  g.player.vy = 150;
  g.player.grounded = false;
  g.player.coyote = 0;
  run(g, 0.06, { ...idle, jump: true });
  assert.ok(g.player.vy < 0);
  assert.ok(g.player.y < 416);
});
test("repeated held input does not cause automatic jumping on landing", () => {
  const g = createGame(0);
  run(g, 1.5, { ...idle, jump: true });
  assert.equal(g.player.grounded, true);
  assert.equal(g.player.y, 416);
  step(g, idle);
  step(g, { ...idle, jump: true });
  assert.ok(g.player.vy < 0);
});
test("swept substeps stop high velocity at a thin wall and ceiling", () => {
  const g = createGame(0);
  g.level.platforms = [{ x: 150, y: 0, w: 4, h: 540 }];
  g.player.vx = 20000;
  step(g, right);
  assert.equal(g.player.x, 122);
  assert.equal(g.player.vx, 0);
  g.level.platforms = [{ x: 0, y: 200, w: 500, h: 4 }];
  g.player.x = 60;
  g.player.y = 250;
  g.player.vy = -20000;
  g.player.grounded = false;
  step(g, idle);
  assert.equal(g.player.y, 204);
  assert.equal(g.player.vy, 0);
});
test("downward contact stomps but side contact costs one heart and grants protection", () => {
  const a = createGame(0);
  a.level.enemies = [
    {
      x: 60,
      y: 425,
      w: 34,
      h: 25,
      origin: 60,
      range: 55,
      speed: 0,
      alive: true,
    },
  ];
  a.player.y = 383;
  a.player.vy = 400;
  a.player.grounded = false;
  a.player.coyote = 0;
  run(a, 0.05);
  assert.equal(a.level.enemies[0].alive, false);
  assert.ok(a.player.vy < 0);
  const b = createGame(0);
  b.level.enemies = [
    {
      x: 60,
      y: 425,
      w: 34,
      h: 25,
      origin: 60,
      range: 55,
      speed: 0,
      alive: true,
    },
  ];
  step(b, idle);
  assert.equal(b.player.hearts, 2);
  run(b, 0.2);
  assert.equal(b.player.hearts, 2);
  assert.ok(b.player.invulnerable > 1);
});
test("head contact with an enemy is damage, not a stomp", () => {
  const g = createGame(0);
  g.level.platforms = [];
  g.level.enemies = [
    {
      x: 60,
      y: 380,
      w: 34,
      h: 25,
      origin: 60,
      range: 55,
      speed: 0,
      alive: true,
    },
  ];
  g.player.y = 406;
  g.player.vy = -500;
  g.player.grounded = false;
  step(g, idle);
  assert.equal(g.player.hearts, 2);
  assert.equal(g.level.enemies[0].alive, true);
});
test("timed hazard is harmless while dark, damage when active, and obeys protection expiry", () => {
  const g = createGame(4);
  g.level.enemies = [];
  g.level.hazards = [{ x: 60, y: 420, w: 34, h: 30, period: 3 }];
  step(g, idle);
  assert.equal(g.player.hearts, 3);
  g.time = 2;
  step(g, idle);
  assert.equal(g.player.hearts, 2);
  g.player.x = 60;
  g.player.y = 416;
  g.player.vx = g.player.vy = 0;
  step(g, idle);
  assert.equal(g.player.hearts, 2);
  g.player.invulnerable = 0;
  g.player.x = 60;
  g.player.y = 416;
  step(g, idle);
  assert.equal(g.player.hearts, 1);
});
test("a sail caps falling speed; hearts never exceed three and motes never duplicate", () => {
  const g = createGame(2);
  g.level.pickups = [
    { id: "f", x: 60, y: 400, w: 25, h: 26, kind: "sail" },
    { id: "m", x: 60, y: 400, w: 16, h: 22, kind: "mote" },
    { id: "h", x: 60, y: 400, w: 22, h: 22, kind: "heart" },
  ];
  step(g, idle);
  assert.equal(g.player.sail, true);
  assert.equal(g.player.hearts, 3);
  run(g, 0.2, idle);
  assert.equal(g.collected.size, 3);
  g.level.platforms = [];
  g.player.grounded = false;
  g.player.coyote = 0;
  g.player.vy = 600;
  step(g, { ...idle, jump: true });
  assert.equal(g.player.vy, 120);
});
test("fall retries at waystone, restoring hearts and keeping earned pickups and sail", () => {
  const g = createGame(2);
  g.checkpoint = true;
  g.player.sail = true;
  g.collected.add("2-m1");
  g.player.hearts = 1;
  g.player.y = 700;
  step(g, idle);
  assert.equal(g.player.x, 1080);
  assert.equal(g.player.y, 416);
  assert.equal(g.player.hearts, 3);
  assert.equal(g.player.sail, true);
  assert.ok(g.collected.has("2-m1"));
  assert.equal(g.deaths, 1);
  assert.ok(g.player.invulnerable > 1);
});
test("spring launches, conveyors carry, and crumble ledges disappear then return", () => {
  const a = createGame(1);
  a.player.x = 515;
  a.player.y = 403;
  step(a, idle);
  assert.ok(a.player.vy < -700);
  const b = createGame(3);
  b.player.x = 500;
  b.player.y = 403;
  step(b, idle);
  assert.ok(b.player.x > 500);
  const c = createGame(4);
  c.player.x = 350;
  c.player.y = 321;
  run(c, 0.7);
  assert.ok(c.level.platforms[1].broken! > 0.6);
  run(c, 2.5);
  assert.equal(c.level.platforms[1].broken, undefined);
});
test("finale stays closed until all three beacons have been restored", () => {
  const g = createGame(6);
  g.player.x = 2050;
  step(g, idle);
  assert.equal(g.status, "playing");
  for (const pickup of g.level.pickups.filter((p) => p.kind === "beacon")) {
    g.player.x = pickup.x;
    g.player.y = 416;
    step(g, idle);
  }
  assert.equal(g.beacons, 3);
  g.player.x = 2050;
  step(g, idle);
  assert.equal(g.status, "won");
});
test("spring and conveyor pads can be entered while running along the ground", () => {
  const a = createGame(1);
  a.player.x = 475;
  run(a, 0.3, right);
  assert.ok(a.player.x > 510);
  assert.ok(a.player.vy < 0);
  const b = createGame(3);
  b.player.x = 440;
  run(b, 0.3, right);
  assert.ok(b.player.x > 470);
});
test("conveyor movement respects a smaller bounded simulation step", () => {
  const g = createGame(3);
  g.player.x = 500;
  g.player.y = 403;
  step(g, idle, 1 / 240);
  assert.equal(g.player.x, 500.375);
});
test("wind does not drift a grounded courier after input is released", () => {
  const g = createGame(2);
  run(g, 10, idle);
  assert.equal(g.player.x, 60);
});
